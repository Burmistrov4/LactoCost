import test from "node:test";
import assert from "node:assert/strict";
import { aggregateP2PAds, fetchBinanceP2PRate, fetchBcvRates, parseBcvHtml } from "../src/exchange-rates.js";

const bcvFixture = ("<!doctype html><html><body><div class='date-display-single'>09/10/2026</div>" +
  '<div id="dolar" class="col-sm-6"><strong> 36,56850000 </strong></div>' +
  '<div id="euro" class="col-sm-6"><strong> 42,12340000 </strong></div></body></html>' + " ".repeat(1000));

test("BCV parser extracts USD and EUR and normalizes comma decimals", () => {
  const rates = parseBcvHtml(bcvFixture, "2026-10-09T10:00:00Z");
  assert.equal(rates.length, 2);
  assert.equal(rates[0].baseCurrency, "USD");
  assert.equal(rates[0].rate, "36.5685");
  assert.equal(rates[1].baseCurrency, "EUR");
  assert.equal(rates[1].rate, "42.1234");
  assert.equal(rates[1].sourcePublishedAt, "09/10/2026");
});

test("BCV parser fails closed if either required currency is absent", () => {
  const missingEuro = bcvFixture.replace('<div id="euro" class="col-sm-6"><strong> 42,12340000 </strong></div>', "");
  assert.throws(() => parseBcvHtml(missingEuro, "2026-10-09T10:00:00Z"));
});

test("P2P mean filters low-quality and low-liquidity offers", () => {
  const result = aggregateP2PAds({ data: [
    { adv: { price: "37", tradableQuantity: "500" }, advertiser: { monthFinishRate: 0.99, monthOrderCount: 300 } },
    { adv: { price: "38", tradableQuantity: "250" }, advertiser: { monthFinishRate: 0.95, monthOrderCount: 120 } },
    { adv: { price: "100", tradableQuantity: "500" }, advertiser: { monthFinishRate: 0.4, monthOrderCount: 300 } },
    { adv: { price: "39", tradableQuantity: "2" }, advertiser: { monthFinishRate: 0.99, monthOrderCount: 300 } },
  ] }, { tradeType: "BUY", minAvailable: 100, minCompletionRate: 0.9, minOrders: 20 });
  assert.equal(result.rate, "37.5");
  assert.equal(result.observationCount, 2);
  assert.equal(result.quoteSide, "usdt_buy");
});

test("P2P parser supports the current Binance data.items shape", () => {
  const result = aggregateP2PAds({ code: "000000", data: { items: [
    { price: 1018, tradableAmount: 200, advertiser: { monthFinishRate: 0.99, monthOrderCount: 500 } },
    { price: 1020, tradableAmount: 300, advertiser: { monthFinishRate: 0.98, monthOrderCount: 100 } },
  ] } }, { tradeType: "BUY", minAvailable: 100, maxOffers: 10 });
  assert.equal(result.observationCount, 2);
  assert.equal(result.rate, "1019");
});

test("P2P parser rejects empty or unrecognized response", () => {
  assert.throws(() => aggregateP2PAds({ data: [] }, { tradeType: "SELL" }));
  assert.throws(() => aggregateP2PAds({ wrong: [] }, { tradeType: "BUY" }));
});

test("Binance fetch adapter builds query and timestamps sample", async () => {
  let requestedUrl = "";
  const result = await fetchBinanceP2PRate({
    tradeType: "SELL",
    now: () => "2026-10-09T10:00:00Z",
    fetchImpl: async (url) => {
      requestedUrl = String(url);
      return { ok: true, async json() { return { data: [
        { adv: { price: "40", tradableQuantity: "200" }, advertiser: { monthFinishRate: 0.99, monthOrderCount: 200 } },
      ] }; } };
    },
  });
  assert.match(requestedUrl, /fiat=VES/);
  assert.match(requestedUrl, /asset=USDT/);
  assert.match(requestedUrl, /tradeType=SELL/);
  assert.equal(result.rate, "40");
  assert.equal(result.fetchedAt, "2026-10-09T10:00:00Z");
});

test("BCV fetch adapter uses injectable fetch and rejects HTTP errors", async () => {
  const rates = await fetchBcvRates({
    now: () => "2026-10-09T10:00:00Z",
    fetchImpl: async () => ({ ok: true, async text() { return bcvFixture; } }),
  });
  assert.equal(rates[0].rate, "36.5685");
  await assert.rejects(() => fetchBcvRates({ fetchImpl: async () => ({ ok: false, status: 502 }) }));
});

test("BCV fetch falls back to clearly labelled unofficial mirror when direct source fails", async () => {
  const requested = [];
  const rates = await fetchBcvRates({
    now: () => "2026-10-09T10:15:00Z",
    fetchImpl: async (url) => {
      requested.push(String(url));
      if (String(url).includes("bcv.org.ve")) throw new Error("local runtime fetch error");
      return { ok: true, async json() { return {
        USD: 875.65, EUR: 980.61472543,
        effective_date: "2026-10-09", updated_at: "2026-10-09T10:00:00Z",
      }; } };
    },
  });
  assert.equal(requested.length, 2);
  assert.equal(rates.length, 2);
  assert.equal(rates[0].rate, "875.65");
  assert.equal(rates[1].baseCurrency, "EUR");
  assert.match(rates[0].sourceUrl, /bcv\.today/);
  assert.match(rates[0].notes, /unofficial_bcv_mirror_fallback/);
});

test("BCV mirror fallback rejects missing currencies or invalid dates", async () => {
  await assert.rejects(() => fetchBcvRates({
    fetchImpl: async (url) => String(url).includes("bcv.org.ve")
      ? Promise.reject(new Error("direct unavailable"))
      : ({ ok: true, async json() { return { USD: 875.65, effective_date: "not-a-date" }; } }),
  }), /BCV directo y espejo no disponibles/);
});
