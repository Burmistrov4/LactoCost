import { fetchBcvRates, fetchBinanceP2PRate } from "./exchange-rates.js";

const json = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
    },
  });

async function saveRateObservation(env, observation) {
  const id = crypto.randomUUID();
  const observedAt = observation.fetchedAt || new Date().toISOString();
  const notes = observation.notes || (observation.minObservedRate
    ? JSON.stringify({ minObservedRate: observation.minObservedRate, maxObservedRate: observation.maxObservedRate })
    : null);

  if (observation.provider === "bcv") {
    const previous = await env.DB.prepare(
      "SELECT rate_decimal, source_published_at, source_url, notes FROM exchange_rate_observations " +
      "WHERE provider = ? AND base_currency = ? AND quote_currency = ? AND quote_side = ? " +
      "ORDER BY fetched_at DESC LIMIT 1"
    ).bind(observation.provider, observation.baseCurrency, observation.quoteCurrency, observation.quoteSide).first();
    if (previous && previous.rate_decimal === observation.rate
      && previous.source_published_at === (observation.sourcePublishedAt || null)
      && previous.source_url === observation.sourceUrl
      && previous.notes === (observation.notes || null)) {
      return { saved: false, reason: "unchanged_official_observation" };
    }
  }

  await env.DB.prepare(
    "INSERT INTO exchange_rate_observations " +
    "(id,provider,base_currency,quote_currency,rate_decimal,quote_side,observation_kind," +
    "observation_count,aggregation_method,source_url,source_published_at,observed_at,fetched_at," +
    "freshness_status,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'fresh',?)"
  ).bind(
    id,
    observation.provider,
    observation.baseCurrency,
    observation.quoteCurrency,
    observation.rate,
    observation.quoteSide,
    observation.observationKind,
    observation.observationCount || 1,
    observation.aggregationMethod,
    observation.sourceUrl,
    observation.sourcePublishedAt || null,
    observedAt,
    observedAt,
    notes,
  ).run();
  return { saved: true, id };
}

export async function collectExchangeRates(env, providers = {}) {
  if (!env?.DB?.prepare) throw new Error("database_binding_missing");
  const getBcvRates = providers.fetchBcv ?? fetchBcvRates;
  const getP2PRate = providers.fetchP2P ?? fetchBinanceP2PRate;
  const tasks = [
    ["bcv", () => getBcvRates()],
    ["binance_buy", () => getP2PRate({ tradeType: "BUY" })],
    ["binance_sell", () => getP2PRate({ tradeType: "SELL" })],
  ];
  const results = await Promise.allSettled(tasks.map(([, run]) => run()));
  const summary = { saved: 0, skipped: 0, failures: [] };
  for (let index = 0; index < results.length; index += 1) {
    const result = results[index];
    const providerTask = tasks[index][0];
    if (result.status === "rejected") {
      summary.failures.push({ provider: providerTask, reason: String(result.reason?.message || "fetch_failed") });
      continue;
    }
    const observations = Array.isArray(result.value) ? result.value : [result.value];
    for (const observation of observations) {
      try {
        const persisted = await saveRateObservation(env, observation);
        if (persisted.saved) summary.saved += 1;
        else summary.skipped += 1;
      } catch (error) {
        summary.failures.push({ provider: providerTask, reason: String(error?.message || "persist_failed") });
      }
    }
  }
  return summary;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // The dashboard is a visual prototype. All figures shown in it are mock data.
    if (url.pathname === "/" || url.pathname === "/index.html") {
      if (env && env.ASSETS && typeof env.ASSETS.fetch === "function") {
        return env.ASSETS.fetch(request);
      }
      return new Response("Dashboard assets binding is not configured.", { status: 503 });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ status: "ok", component: "worker", stage: "spike-dashboard" });
    }

    if (request.method === "GET" && url.pathname === "/health/db") {
      if (!env || !env.DB || typeof env.DB.prepare !== "function") {
        return json({ status: "unavailable", reason: "database_binding_missing" }, 503);
      }

      try {
        const result = await env.DB.prepare("SELECT 1 AS ok").first();
        if (!result || Number(result.ok) !== 1) {
          return json({ status: "unavailable", reason: "database_probe_failed" }, 503);
        }
        return json({ status: "ok", component: "d1", stage: "spike-dashboard" });
      } catch {
        return json({ status: "unavailable", reason: "database_probe_failed" }, 503);
      }
    }

    if (request.method === "GET" && url.pathname === "/api/exchange-rates/latest") {
      if (!env?.DB?.prepare) return json({ status: "unavailable", reason: "database_binding_missing" }, 503);
      try {
        const result = await env.DB.prepare(
          "SELECT id,provider,base_currency,quote_currency,rate_decimal,quote_side,observation_kind," +
          "observation_count,aggregation_method,source_url,source_published_at,observed_at,fetched_at," +
          "freshness_status,notes FROM exchange_rate_observations ORDER BY fetched_at DESC LIMIT 100"
        ).all();
        const latest = new Map();
        const now = Date.now();
        for (const row of result.results || []) {
          const key = [row.provider, row.base_currency, row.quote_currency, row.quote_side].join("|");
          if (latest.has(key)) continue;
          const fetchedMs = Date.parse(row.fetched_at || "");
          let ageSeconds = Number.isFinite(fetchedMs) ? Math.max(0, Math.floor((now - fetchedMs) / 1000)) : null;
          const maxAgeSeconds = row.provider === "bcv" ? 36 * 60 * 60 : row.provider === "binance_p2p" ? 90 * 60 : null;
          let freshnessStatus = row.freshness_status || "unknown";
          let mirrorAgeSeconds = null;
          if (row.provider === "bcv" && String(row.source_url || "").includes("bcv.today")) {
            try {
              const notes = JSON.parse(row.notes || "{}");
              const mirrorUpdatedMs = Date.parse(notes.mirror_updated_at || "");
              if (Number.isFinite(mirrorUpdatedMs)) {
                mirrorAgeSeconds = Math.max(0, Math.floor((now - mirrorUpdatedMs) / 1000));
                ageSeconds = ageSeconds === null ? mirrorAgeSeconds : Math.max(ageSeconds, mirrorAgeSeconds);
                if (mirrorUpdatedMs > now + 5 * 60 * 1000) freshnessStatus = "suspect";
              } else {
                freshnessStatus = "suspect";
              }
            } catch {
              freshnessStatus = "suspect";
            }
          }
          if (ageSeconds === null) freshnessStatus = "unknown";
          else if (fetchedMs > now + 5 * 60 * 1000) freshnessStatus = "suspect";
          else if (maxAgeSeconds !== null && ageSeconds > maxAgeSeconds) freshnessStatus = "stale";
          if (mirrorAgeSeconds !== null && maxAgeSeconds !== null && mirrorAgeSeconds > maxAgeSeconds) freshnessStatus = "stale";
          latest.set(key, { ...row, age_seconds: ageSeconds, freshness_status: freshnessStatus });
        }
        return json({ status: latest.size ? "ok" : "empty", rates: [...latest.values()] });
      } catch {
        return json({ status: "unavailable", reason: "exchange_rate_query_failed" }, 503);
      }
    }

    return json({ error: "not_found" }, 404);
  },

  async scheduled(_controller, env) {
    try {
      const summary = await collectExchangeRates(env);
      if (summary.failures.length) console.error("exchange_rate_refresh_partial_failure", JSON.stringify(summary));
      else console.log("exchange_rate_refresh_complete", JSON.stringify(summary));
    } catch (error) {
      console.error("exchange_rate_refresh_failed", String(error?.message || "unknown_error"));
    }
  },
};
