import React, { useState } from 'react';
import { ExchangeRateObservation, ViewId } from '../types';
import { money } from '../utils/formatters';
import { convertAmountWithRate, formatRateLabel } from '../domain/exchangeRates';

interface SettingsViewProps {
  exchangeRates: ExchangeRateObservation[];
  onRefreshRates: () => Promise<void>;
  onNavigate: (view: ViewId) => void;
  onNotify: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  exchangeRates,
  onRefreshRates,
  onNavigate,
  onNotify,
}) => {
  const [costRateId, setCostRateId] = useState<string>(
    exchangeRates.find((r) => r.provider === 'bcv' && r.base_currency === 'USD')?.id ||
      exchangeRates[0]?.id ||
      ''
  );
  const [saleRateId, setSaleRateId] = useState<string>(
    exchangeRates.find((r) => r.provider === 'binance_p2p' && r.quote_side === 'usdt_buy')?.id ||
      exchangeRates[0]?.id ||
      ''
  );

  const [costAmount, setCostAmount] = useState<number>(10);
  const [saleAmount, setSaleAmount] = useState<number>(15);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const selectedCostRate = exchangeRates.find((r) => r.id === costRateId);
  const selectedSaleRate = exchangeRates.find((r) => r.id === saleRateId);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshRates();
    setIsRefreshing(false);
    onNotify('Tasas de cambio actualizadas con fuentes oficiales y de mercado.');
  };

  const getConversion = (amount: number, rateObj?: ExchangeRateObservation) => {
    if (!rateObj) return { converted: '—', meta: 'No hay observación compatible seleccionada.' };
    const rateVal = parseFloat(rateObj.rate_decimal);
    if (!Number.isFinite(rateVal) || rateVal <= 0) {
      return { converted: '—', meta: 'Tasa no válida.' };
    }

    try {
      const converted = convertAmountWithRate(amount, rateVal);
      const ageMins =
        rateObj.age_seconds != null ? `${Math.floor(rateObj.age_seconds / 60)} min` : 'reciente';
      const published = rateObj.source_published_at
        ? ` · publicada ${rateObj.source_published_at}`
        : '';
      const staleNotice =
        rateObj.freshness_status !== 'fresh' ? ' · ADVERTENCIA: TASA NO FRESCA' : '';

      return {
        converted: money(converted),
        meta: `${formatRateLabel(rateObj)} · antigüedad: ${ageMins}${published}${staleNotice}`,
      };
    } catch (err: unknown) {
      return { converted: '—', meta: (err as Error).message };
    }
  };

  const costResult = getConversion(costAmount, selectedCostRate);
  const saleResult = getConversion(saleAmount, selectedSaleRate);

  return (
    <section className="view-state active" id="view-settings">
      <div className="card panel">
        <div className="panel-title">
          <div>
            <h2 style={{ margin: 0, fontSize: '19px' }}>Configuración de tasas de cambio</h2>
            <p>Fuentes observadas y preselección independiente para costos y precios de venta.</p>
          </div>
          <button
            className="ghost-btn"
            id="refreshRates"
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? '↻ Sincronizando…' : '↻ Actualizar tasas'}
          </button>
        </div>

        <div className="rates-warning">
          <strong>Políticas de conversión desacopladas</strong>
          <p>
            Permite definir una tasa de referencia para valoración de materias primas importadas (costos) y
            otra independiente para cotización y análisis de precios en mostrador. Ambas fuentes registran
            antigüedad, proveedor y método de recolección.
          </p>
        </div>

        <div className="rates-status" id="ratesStatus" role="status" aria-live="polite">
          {isRefreshing
            ? 'Consultando fuentes oficiales BCV y cotizaciones Binance P2P…'
            : `Tasas disponibles: ${exchangeRates.length} observaciones registradas.`}
        </div>

        <div className="rates-grid">
          <article className="rate-policy-card">
            <div className="rate-policy-title">
              <span className="rate-icon">⌁</span>
              <div>
                <h3>Conversión de costos</h3>
                <p>Selecciona qué referencia usar cuando un insumo o empaque esté expresado en moneda extranjera.</p>
              </div>
            </div>

            <label className="field-label" htmlFor="costRateSelect">
              Fuente y dirección
            </label>
            <select
              id="costRateSelect"
              className="rate-select"
              value={costRateId}
              onChange={(e) => setCostRateId(e.target.value)}
            >
              {exchangeRates.map((rate) => (
                <option key={rate.id} value={rate.id}>
                  {formatRateLabel(rate)}
                </option>
              ))}
            </select>

            <label className="field-label" htmlFor="costAmount">
              Importe de ejemplo en moneda origen ({selectedCostRate?.base_currency || 'USD'})
            </label>
            <input
              className="margin-input"
              id="costAmount"
              type="number"
              min="0"
              step="0.01"
              value={costAmount}
              onChange={(e) => setCostAmount(parseFloat(e.target.value) || 0)}
              inputMode="decimal"
            />

            <div className="rate-result">
              <small>Equivalencia estimada en VES</small>
              <strong id="costConverted">{costResult.converted}</strong>
              <span id="costRateMeta">{costResult.meta}</span>
            </div>
          </article>

          <article className="rate-policy-card">
            <div className="rate-policy-title">
              <span className="rate-icon">↗</span>
              <div>
                <h3>Precio de venta</h3>
                <p>Selecciona independientemente la referencia que deseas considerar al fijar precios en divisas.</p>
              </div>
            </div>

            <label className="field-label" htmlFor="saleRateSelect">
              Fuente y dirección
            </label>
            <select
              id="saleRateSelect"
              className="rate-select"
              value={saleRateId}
              onChange={(e) => setSaleRateId(e.target.value)}
            >
              {exchangeRates.map((rate) => (
                <option key={rate.id} value={rate.id}>
                  {formatRateLabel(rate)}
                </option>
              ))}
            </select>

            <label className="field-label" htmlFor="saleAmount">
              Precio de ejemplo en moneda origen ({selectedSaleRate?.base_currency || 'USD'})
            </label>
            <input
              className="margin-input"
              id="saleAmount"
              type="number"
              min="0"
              step="0.01"
              value={saleAmount}
              onChange={(e) => setSaleAmount(parseFloat(e.target.value) || 0)}
              inputMode="decimal"
            />

            <div className="rate-result">
              <small>Equivalencia estimada en VES</small>
              <strong id="saleConverted">{saleResult.converted}</strong>
              <span id="saleRateMeta">{saleResult.meta}</span>
            </div>
          </article>
        </div>

        <div className="rates-footer">
          <p>
            El BCV representa la referencia oficial publicada por el Banco Central de Venezuela. Binance P2P representa
            una muestra agregada de anuncios activos, con filtros de finalización mínima (&ge;90%) y disponibilidad.
          </p>
          <button className="primary-btn" onClick={() => onNavigate('dashboard')}>
            Volver al dashboard
          </button>
        </div>
      </div>
    </section>
  );
};
