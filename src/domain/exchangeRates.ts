/**
 * Servicio y utilidades de tasas de cambio (BCV oficial y Binance P2P referencia).
 */
import { ExchangeRateObservation } from '../types';

export function convertAmountWithRate(amount: number, rate: number): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new RangeError('El importe debe ser un número finito no negativo.');
  }
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new RangeError('La tasa debe ser un número finito positivo.');
  }
  return Math.round((amount * rate + Number.EPSILON) * 100) / 100;
}

export function formatRateLabel(rate: ExchangeRateObservation): string {
  const provider =
    rate.provider === 'bcv'
      ? String(rate.source_url || '').includes('bcv.today')
        ? 'BCV · espejo no oficial'
        : 'BCV oficial'
      : rate.provider === 'binance_p2p'
      ? 'Binance P2P'
      : 'Manual';

  const side =
    rate.quote_side === 'usdt_buy'
      ? 'comprar USDT'
      : rate.quote_side === 'usdt_sell'
      ? 'vender USDT'
      : 'referencia oficial';

  const numVal = parseFloat(rate.rate_decimal);
  const formattedVal = Number.isFinite(numVal)
    ? new Intl.NumberFormat('es-VE', { maximumFractionDigits: 4 }).format(numVal)
    : rate.rate_decimal;

  const freshness =
    rate.freshness_status === 'stale'
      ? ' · OBSOLETA'
      : rate.freshness_status === 'suspect'
      ? ' · SOSPECHOSA'
      : '';

  return `${provider} · ${rate.base_currency}/${rate.quote_currency} · ${side} · ${formattedVal}${freshness}`;
}

export const INITIAL_EXCHANGE_RATES: ExchangeRateObservation[] = [
  {
    id: 'bcv-usd',
    provider: 'bcv',
    base_currency: 'USD',
    quote_currency: 'VES',
    rate_decimal: '875.65',
    quote_side: 'official',
    observation_kind: 'official_reference',
    observation_count: 1,
    aggregation_method: 'official',
    source_url: 'https://www.bcv.org.ve/',
    source_published_at: '2026-10-18',
    observed_at: new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    freshness_status: 'fresh',
    age_seconds: 1800,
  },
  {
    id: 'bcv-eur',
    provider: 'bcv',
    base_currency: 'EUR',
    quote_currency: 'VES',
    rate_decimal: '980.61',
    quote_side: 'official',
    observation_kind: 'official_reference',
    observation_count: 1,
    aggregation_method: 'official',
    source_url: 'https://www.bcv.org.ve/',
    source_published_at: '2026-10-18',
    observed_at: new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    freshness_status: 'fresh',
    age_seconds: 1800,
  },
  {
    id: 'binance-usdt-buy',
    provider: 'binance_p2p',
    base_currency: 'USDT',
    quote_currency: 'VES',
    rate_decimal: '1006.80',
    quote_side: 'usdt_buy',
    observation_kind: 'p2p_offer_average',
    observation_count: 10,
    aggregation_method: 'arithmetic_mean',
    source_url: 'https://www.binance.com/bapi/c2c/v1/public/c2c/agent/ad-list',
    source_published_at: null,
    observed_at: new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    freshness_status: 'fresh',
    age_seconds: 600,
    notes: JSON.stringify({ minObservedRate: '1002.50', maxObservedRate: '1012.00' }),
  },
  {
    id: 'binance-usdt-sell',
    provider: 'binance_p2p',
    base_currency: 'USDT',
    quote_currency: 'VES',
    rate_decimal: '1010.60',
    quote_side: 'usdt_sell',
    observation_kind: 'p2p_offer_average',
    observation_count: 10,
    aggregation_method: 'arithmetic_mean',
    source_url: 'https://www.binance.com/bapi/c2c/v1/public/c2c/agent/ad-list',
    source_published_at: null,
    observed_at: new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    freshness_status: 'fresh',
    age_seconds: 600,
    notes: JSON.stringify({ minObservedRate: '1008.00', maxObservedRate: '1015.00' }),
  },
];
