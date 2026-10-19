import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import worker, { collectExchangeRates } from "../src/index.js";

const request = (path, method = "GET") =>
  new Request("https://spike.invalid" + path, { method });

test("GET /health devuelve estado básico sin acceder a D1", async () => {
  const response = await worker.fetch(request("/health"), {});
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ok",
    component: "worker",
    stage: "spike-dashboard",
  });
});

test("respuestas JSON incluyen cabeceras básicas contra caché y MIME sniffing", async () => {
  const response = await worker.fetch(request("/health"), {});
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.ok((response.headers.get("content-type") || "").startsWith("application/json"));
});

test("ruta desconocida responde 404", async () => {
  const response = await worker.fetch(request("/no-existe"), {});
  assert.equal(response.status, 404);
});

test("health de D1 falla de forma segura si falta binding", async () => {
  const response = await worker.fetch(request("/health/db"), {});
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    status: "unavailable",
    reason: "database_binding_missing",
  });
});

test("health de D1 ejecuta consulta de prueba", async () => {
  let sqlSeen = "";
  const env = {
    DB: {
      prepare(sql) {
        sqlSeen = sql;
        return { async first() { return { ok: 1 }; } };
      },
    },
  };
  const response = await worker.fetch(request("/health/db"), env);
  assert.equal(response.status, 200);
  assert.equal(sqlSeen, "SELECT 1 AS ok");
  assert.deepEqual(await response.json(), {
    status: "ok",
    component: "d1",
    stage: "spike-dashboard",
  });
});

test("health de D1 no filtra detalles internos cuando falla la consulta", async () => {
  const env = {
    DB: {
      prepare() {
        return { async first() { throw new Error("secret SQL or connection details"); } };
      },
    },
  };
  const response = await worker.fetch(request("/health/db"), env);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    status: "unavailable",
    reason: "database_probe_failed",
  });
});

test("scheduled collector persists successful providers even if BCV fails", async () => {
  const inserts = [];
  const env = {
    DB: {
      prepare(sql) {
        return {
          args: [],
          bind(...args) { this.args = args; return this; },
          async first() { return null; },
          async run() { inserts.push({ sql, args: this.args }); return { success: true }; },
        };
      },
    },
  };
  const p2p = async ({ tradeType }) => ({
    provider: "binance_p2p", baseCurrency: "USDT", quoteCurrency: "VES",
    rate: tradeType === "BUY" ? "1018" : "1014",
    quoteSide: tradeType === "BUY" ? "usdt_buy" : "usdt_sell",
    observationKind: "p2p_offer_average", observationCount: 5,
    aggregationMethod: "arithmetic_mean", sourceUrl: "https://www.binance.com/bapi/c2c/v1/public/c2c/agent/ad-list",
    fetchedAt: new Date().toISOString(), minObservedRate: "1013", maxObservedRate: "1019",
  });
  const summary = await collectExchangeRates(env, {
    fetchBcv: async () => { throw new Error("source unavailable"); },
    fetchP2P: p2p,
  });
  assert.equal(summary.saved, 2);
  assert.equal(summary.failures.length, 1);
  assert.equal(summary.failures[0].provider, "bcv");
  assert.equal(inserts.length, 2);
});

test("scheduled collector stores both BCV currencies and both P2P directions", async () => {
  const inserts = [];
  const env = {
    DB: {
      prepare(sql) {
        return {
          args: [],
          bind(...args) { this.args = args; return this; },
          async first() { return null; },
          async run() { inserts.push({ sql, args: this.args }); return { success: true }; },
        };
      },
    },
  };
  const bcv = async () => [
    { provider: "bcv", baseCurrency: "USD", quoteCurrency: "VES", rate: "875.65", quoteSide: "official", observationKind: "official_reference", observationCount: 1, aggregationMethod: "official", sourceUrl: "https://www.bcv.org.ve/", sourcePublishedAt: "2026-10-09", fetchedAt: new Date().toISOString() },
    { provider: "bcv", baseCurrency: "EUR", quoteCurrency: "VES", rate: "980.61", quoteSide: "official", observationKind: "official_reference", observationCount: 1, aggregationMethod: "official", sourceUrl: "https://www.bcv.org.ve/", sourcePublishedAt: "2026-10-09", fetchedAt: new Date().toISOString() },
  ];
  const p2p = async ({ tradeType }) => ({
    provider: "binance_p2p", baseCurrency: "USDT", quoteCurrency: "VES",
    rate: tradeType === "BUY" ? "1018" : "1014",
    quoteSide: tradeType === "BUY" ? "usdt_buy" : "usdt_sell",
    observationKind: "p2p_offer_average", observationCount: 5,
    aggregationMethod: "arithmetic_mean", sourceUrl: "https://www.binance.com/bapi/c2c/v1/public/c2c/agent/ad-list",
    fetchedAt: new Date().toISOString(),
  });
  const summary = await collectExchangeRates(env, { fetchBcv: bcv, fetchP2P: p2p });
  assert.equal(summary.saved, 4);
  assert.equal(summary.failures.length, 0);
  assert.equal(inserts.length, 4);
});

test("latest endpoint labels a Binance observation stale after its freshness window", async () => {
  const oldTimestamp = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const response = await worker.fetch(request("/api/exchange-rates/latest"), {
    DB: { prepare() { return { async all() { return { results: [
      { provider: "binance_p2p", base_currency: "USDT", quote_currency: "VES", quote_side: "usdt_buy", rate_decimal: "1018", fetched_at: oldTimestamp, freshness_status: "fresh" },
    ] }; } }; } },
  });
  const payload = await response.json();
  assert.equal(payload.rates[0].freshness_status, "stale");
});

test("latest endpoint marks an outdated unofficial BCV mirror stale even when fetched just now", async () => {
  const mirrorUpdatedAt = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const fetchedAt = new Date().toISOString();
  const response = await worker.fetch(request("/api/exchange-rates/latest"), {
    DB: { prepare() { return { async all() { return { results: [
      { provider: "bcv", base_currency: "EUR", quote_currency: "VES", quote_side: "official",
        rate_decimal: "980.61", source_url: "https://bcv.today/api/v1/rate.json",
        fetched_at: fetchedAt, freshness_status: "fresh",
        notes: JSON.stringify({ transport: "unofficial_bcv_mirror_fallback", mirror_updated_at: mirrorUpdatedAt }) },
    ] }; } }; } },
  });
  const payload = await response.json();
  assert.equal(payload.rates[0].freshness_status, "stale");
  assert.ok(payload.rates[0].age_seconds >= 48 * 60 * 60);
});

test("latest exchange rates returns an explicit empty state without observations", async () => {
  const response = await worker.fetch(request("/api/exchange-rates/latest"), {
    DB: { prepare() { return { async all() { return { results: [] }; } }; } },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "empty", rates: [] });
});

test("latest exchange rates returns latest row per provider and direction", async () => {
  const rows = [
    { provider: "binance_p2p", base_currency: "USDT", quote_currency: "VES", quote_side: "usdt_buy", rate_decimal: "1018", fetched_at: "2026-10-09T10:00:00Z" },
    { provider: "binance_p2p", base_currency: "USDT", quote_currency: "VES", quote_side: "usdt_buy", rate_decimal: "1017", fetched_at: "2026-10-09T09:30:00Z" },
    { provider: "binance_p2p", base_currency: "USDT", quote_currency: "VES", quote_side: "usdt_sell", rate_decimal: "1014", fetched_at: "2026-10-09T10:00:00Z" },
  ];
  const response = await worker.fetch(request("/api/exchange-rates/latest"), {
    DB: { prepare() { return { async all() { return { results: rows }; } }; } },
  });
  const payload = await response.json();
  assert.equal(payload.status, "ok");
  assert.equal(payload.rates.length, 2);
  assert.equal(payload.rates[0].rate_decimal, "1018");
  assert.equal(payload.rates[1].quote_side, "usdt_sell");
});

test("dashboard existe y advierte que las cifras son ficticias", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  assert.match(html, /Cuajada Studio/);
  assert.match(html, /Modo demostración/);
  assert.match(html, /DATOS SIMULADOS/);
  assert.match(html, /viewport/);
});

test("dashboard incluye navegación, KPI y reglas responsive", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  for (const required of ["Inventario", "Producción", "Costos & CPP", "Compras", "Precios & márgenes", "Salud del inventario", "Rendimiento del negocio", "@media(max-width:720px)", "prefers-reduced-motion"]) {
    assert.ok(html.includes(required), "Falta componente de UI: " + required);
  }
});

test("JavaScript inline del dashboard compila sintácticamente", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match, "No se encontró el script del dashboard");
  assert.doesNotThrow(() => new vm.Script(match[1]), "El JavaScript del dashboard tiene un error de sintaxis");
});


test("exchange-rate settings has independent cost and sale selectors backed by the read API", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  for (const required of [
    'id="costRateSelect"', 'id="saleRateSelect"', 'id="costAmount"', 'id="saleAmount"',
    "fetch('/api/exchange-rates/latest'", "selectedRateIds={cost:null,sale:null}",
    "source_published_at", "NO USAR EN OPERACIONES", "Vista de prueba"
  ]) assert.ok(html.includes(required), "Falta requisito del selector de tasas: " + required);
  assert.match(html, /rate\.base_currency==='EUR'/, "Debe preferir EUR cuando hay una observación BCV elegible.");
});

test("rate conversion preview validates inputs and rounds to cents", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const start = html.indexOf("<script>") + "<script>".length; const end = html.indexOf("</script>", start); const script = html.slice(start, end);
  assert.ok(script, "No se encontró el script del dashboard");
  const fnStart = script.indexOf("function convertAmountWithRate("); const fnEnd = script.indexOf("\n}", fnStart) + 2; const fn = script.slice(fnStart, fnEnd);
  assert.ok(fn, "No se encontró el conversor de tasas");
  const convert = new vm.Script("(" + fn + ")").runInNewContext();
  assert.equal(convert(10, "980.61472543"), 9806.15);
  assert.throws(() => convert(-1, 980), /importe debe ser/);
  assert.throws(() => convert(1, 0), /tasa debe ser/);
});

test("calculadora de precio usa margen sobre venta y devuelve precio/contribución", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(script, "No se encontró el script del dashboard");
  const fn = script[1].match(/function calculatePriceForMargin\([\s\S]*?\n}/);
  assert.ok(fn, "No se encontró la función de cálculo");
  const calculate = new vm.Script("(" + fn[0] + ")").runInNewContext();
  assert.deepEqual(JSON.parse(JSON.stringify(calculate(820, 35))), {
    price: 1261.54, contribution: 441.54, margin: 35
  });
  assert.equal(calculate(100, 0).price, 100);
});

test("calculadora rechaza margen de 100%, valores negativos y costos inválidos", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/);
  const fn = script[1].match(/function calculatePriceForMargin\([\s\S]*?\n}/);
  const calculate = new vm.Script("(" + fn[0] + ")").runInNewContext();
  assert.throws(() => calculate(100, 100), /margen debe estar entre 0%/);
  assert.throws(() => calculate(100, -1), /margen debe estar entre 0%/);
  assert.throws(() => calculate(-1, 35), /costo debe ser/);
});

test("vista de precios permite margen independiente por producto y actualiza radar", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  for (const required of [
    'id="pricingGrid"', 'id="resetMargins"', 'data-margin-for=',
    'radar-price-yogurt-natural', 'radar-price-yogurt-fresa',
    'radar-price-quesillo', 'precio sugerido automático',
    'margen objetivo de rentabilidad', 'type="number"', 'min="0"', 'max="99.9"'
  ]) assert.ok(html.toLowerCase().includes(required.toLowerCase()), "Falta requisito de calculadora: " + required);
});
