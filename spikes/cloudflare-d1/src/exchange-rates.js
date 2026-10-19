const BCV_URL = "https://www.bcv.org.ve/";
const BCV_MIRROR_URL = "https://bcv.today/api/v1/rate.json";
const BINANCE_P2P_URL = "https://www.binance.com/bapi/c2c/v1/public/c2c/agent/ad-list";

function decimalFromLocalizedText(value) {
  let text = String(value ?? "").replace(/\u00a0/g, " ").trim();
  const match = text.match(/\d[\d.,\s]*/);
  if (!match) throw new Error("No se encontró una cifra numérica.");
  text = match[0].replace(/\s/g, "");
  if (text.includes(",") && text.includes(".")) {
    text = text.lastIndexOf(",") > text.lastIndexOf(".")
      ? text.replace(/\./g, "").replace(",", ".")
      : text.replace(/,/g, "");
  } else if (text.includes(",")) {
    text = text.replace(",", ".");
  }
  const number = Number(text);
  if (!Number.isFinite(number) || number <= 0) throw new Error("La tasa publicada no es válida.");
  return String(number);
}

function extractBcvCurrency(html, currencyId) {
  const pattern = '<[^>]+id="' + currencyId + '"[\\s\\S]*?(?=<[^>]+id="(?:dolar|euro|yuan|lira|rublo)"|$)';
  const block = html.match(new RegExp(pattern, "i"));
  if (!block) throw new Error("El bloque BCV " + currencyId + " no se encontró.");
  const strong = block[0].match(/<strong[^>]*>([\s\S]*?)<\/strong>/i);
  if (!strong) throw new Error("No se encontró la cifra <strong> para " + currencyId + ".");
  const text = strong[1].replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/gi, " ");
  return decimalFromLocalizedText(text);
}

export function parseBcvHtml(html, fetchedAt = new Date().toISOString()) {
  if (typeof html !== "string" || html.length < 1000) throw new Error("Respuesta BCV vacía o demasiado corta.");
  const usd = extractBcvCurrency(html, "dolar");
  const eur = extractBcvCurrency(html, "euro");
  const dateMatch = html.match(/class=["'][^"']*date-display-single[^"']*["'][^>]*>([^<]+)</i)
    || html.match(/<time[^>]+datetime=["']([^"']+)["']/i);
  const published = dateMatch?.[1]?.trim() || null;
  return [
    { provider: "bcv", baseCurrency: "USD", quoteCurrency: "VES", rate: usd, quoteSide: "official", sourceUrl: BCV_URL, sourcePublishedAt: published, fetchedAt, observationKind: "official_reference", observationCount: 1, aggregationMethod: "official" },
    { provider: "bcv", baseCurrency: "EUR", quoteCurrency: "VES", rate: eur, quoteSide: "official", sourceUrl: BCV_URL, sourcePublishedAt: published, fetchedAt, observationKind: "official_reference", observationCount: 1, aggregationMethod: "official" },
  ];
}

function offerListFromPayload(payload) {
  const rows = Array.isArray(payload?.data?.items) ? payload.data.items : Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.data?.data) ? payload.data.data : null;
  if (!rows) throw new Error("Formato de respuesta P2P no reconocido.");
  return rows.map((row) => {
    const adv = row?.adv ?? row;
    const advertiser = row?.advertiser ?? {};
    const price = Number(adv?.price ?? row?.price);
    const available = Number(adv?.tradableAmount ?? adv?.tradableQuantity ?? adv?.surplusAmount ?? row?.availableAmount ?? 0);
    const completionRaw = advertiser?.monthFinishRate ?? advertiser?.completionRate ?? row?.completionRate;
    const completion = completionRaw == null ? null : Number(completionRaw);
    const ordersRaw = advertiser?.monthOrderCount ?? advertiser?.orderCount ?? row?.orderCount;
    const orders = ordersRaw == null ? null : Number(ordersRaw);
    return { price, availableAmount: available, completionRate: completion, orders };
  });
}

export function aggregateP2PAds(payload, { tradeType, minAvailable = 100, minCompletionRate = 0.9, minOrders = 20, maxOffers = 10 } = {}) {
  if (!["BUY", "SELL"].includes(tradeType)) throw new Error("tradeType debe ser BUY o SELL.");
  const offers = offerListFromPayload(payload).filter((offer) =>
    Number.isFinite(offer.price) && offer.price > 0
    && Number.isFinite(offer.availableAmount) && offer.availableAmount >= minAvailable
    && (offer.completionRate == null || (Number.isFinite(offer.completionRate) && offer.completionRate >= minCompletionRate))
    && (offer.orders == null || (Number.isFinite(offer.orders) && offer.orders >= minOrders))
  ).slice(0, maxOffers);
  if (!offers.length) throw new Error("Binance P2P no devolvió anuncios elegibles.");
  const average = offers.reduce((sum, offer) => sum + offer.price, 0) / offers.length;
  return {
    provider: "binance_p2p",
    baseCurrency: "USDT",
    quoteCurrency: "VES",
    rate: String(Number(average.toFixed(8))),
    quoteSide: tradeType === "BUY" ? "usdt_buy" : "usdt_sell",
    sourceUrl: BINANCE_P2P_URL,
    observationKind: "p2p_offer_average",
    observationCount: offers.length,
    aggregationMethod: "arithmetic_mean",
    minObservedRate: String(Math.min(...offers.map((offer) => offer.price))),
    maxObservedRate: String(Math.max(...offers.map((offer) => offer.price))),
  };
}

async function readResponse(response, providerName) {
  if (!response?.ok) throw new Error(providerName + " respondió HTTP no exitoso.");
  return response;
}

export async function fetchBcvRates({ fetchImpl = fetch, now = () => new Date().toISOString() } = {}) {
  let directError;
  try {
    const response = await readResponse(await fetchImpl(BCV_URL, {
      headers: { Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
    }), "BCV");
    const html = await response.text();
    return parseBcvHtml(html, now());
  } catch (error) {
    directError = error;
  }

  // Fallback is explicitly an unofficial mirror of BCV-published data, never represented as the BCV website.
  try {
    const response = await readResponse(await fetchImpl(BCV_MIRROR_URL, {
      headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      redirect: "follow",
    }), "BCV mirror");
    const payload = await response.json();
    const effectiveDate = payload?.effective_date || payload?.date;
    const updatedAt = payload?.updated_at || payload?.generated_at || null;
    const usd = Number(payload?.USD);
    const eur = Number(payload?.EUR);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(effectiveDate || ""))
      || !Number.isFinite(usd) || usd <= 0
      || !Number.isFinite(eur) || eur <= 0
      || (updatedAt !== null && !Number.isFinite(Date.parse(updatedAt)))) {
      throw new Error("El esquema de tasas del espejo BCV no es válido.");
    }
    const fetchedAt = now();
    const notes = JSON.stringify({
      transport: "unofficial_bcv_mirror_fallback",
      underlying_source: BCV_URL,
      mirror_updated_at: updatedAt,
      direct_fetch_error: "direct_fetch_failed; unofficial mirror fallback used",
    });
    return [
      { provider: "bcv", baseCurrency: "USD", quoteCurrency: "VES", rate: String(usd), quoteSide: "official", sourceUrl: BCV_MIRROR_URL, sourcePublishedAt: effectiveDate, fetchedAt, observationKind: "official_reference", observationCount: 1, aggregationMethod: "official", notes },
      { provider: "bcv", baseCurrency: "EUR", quoteCurrency: "VES", rate: String(eur), quoteSide: "official", sourceUrl: BCV_MIRROR_URL, sourcePublishedAt: effectiveDate, fetchedAt, observationKind: "official_reference", observationCount: 1, aggregationMethod: "official", notes },
    ];
  } catch (mirrorError) {
    throw new Error("BCV directo y espejo no disponibles. Directo: "
      + String(directError?.message || "fetch_failed").slice(0, 180)
      + "; espejo: " + String(mirrorError?.message || "fetch_failed").slice(0, 180));
  }
}

export async function fetchBinanceP2PRate({ tradeType, fetchImpl = fetch, now = () => new Date().toISOString(), ...filters } = {}) {
  const url = new URL(BINANCE_P2P_URL);
  url.searchParams.set("fiat", "VES");
  url.searchParams.set("asset", "USDT");
  url.searchParams.set("tradeType", tradeType);
  url.searchParams.set("limit", String(Math.min(20, Math.max(1, filters.maxOffers ?? 10))));
  url.searchParams.set("order", tradeType === "BUY" ? "1" : "0");
  const response = await readResponse(await fetchImpl(url, {
    headers: { Accept: "application/json", "User-Agent": "CuajadaStudio-ExchangeRates/0.1" },
    redirect: "follow",
  }), "Binance P2P");
  const payload = await response.json();
  return { ...aggregateP2PAds(payload, { ...filters, tradeType }), fetchedAt: now() };
}
