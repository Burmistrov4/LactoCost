import React, { useState } from 'react';
import { Product, ViewId, DisplayCurrencyMode, ScrapedRates } from '../types';
import { moneyUSD, moneyVES } from '../utils/formatters';
import { calculateTargetPrice } from '../domain/pricing';

interface PricingViewProps {
  products: Product[];
  rates: ScrapedRates;
  activeRate: number;
  activeRateName: string;
  currencyMode: DisplayCurrencyMode;
  onUpdateProductParams: (
    productId: string,
    params: {
      costUSD?: number;
      margin?: number;
      variableFeeRate?: number;
      fixedVariableCostUSD?: number;
      taxRate?: number;
    }
  ) => void;
  onResetMargins: () => void;
  onNavigate: (view: ViewId) => void;
  onNotify: (msg: string) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  products,
  rates,
  activeRate,
  activeRateName,
  onUpdateProductParams,
  onResetMargins,
  onNavigate,
  onNotify,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'simple' | 'channels'>('simple');

  const handleMarginChange = (productId: string, rawValue: string) => {
    const val = parseFloat(rawValue);
    if (!Number.isFinite(val) || val < 0 || val >= 100) {
      setErrors((prev) => ({
        ...prev,
        [productId]: 'El margen debe estar entre 0% y 99%.',
      }));
      return;
    }
    setErrors((prev) => ({ ...prev, [productId]: '' }));
    onUpdateProductParams(productId, { margin: val });
  };

  const handleCostUSDChange = (productId: string, rawValue: string) => {
    const val = parseFloat(rawValue);
    if (!Number.isFinite(val) || val < 0) return;
    onUpdateProductParams(productId, { costUSD: val });
  };

  const handleFeeChange = (productId: string, rawValue: string) => {
    const val = parseFloat(rawValue);
    if (!Number.isFinite(val) || val < 0 || val >= 100) return;
    onUpdateProductParams(productId, { variableFeeRate: val });
  };

  return (
    <section className="view-state active" id="view-pricing">
      <div className="card panel">
        <div className="panel-title">
          <div>
            <h2 style={{ margin: 0, fontSize: '19px' }}>Calculadora de Precios, Márgenes y Tasas</h2>
            <p>
              Establece tus costos y márgenes en <b>Dólares ($ USD)</b>. El precio en <b>Bolívares</b> se recalcula al
              instante comparando la <b>Tasa Euro</b> ({moneyVES(rates.bcvEur)}) frente a <b>Binance P2P USDT</b> ({moneyVES(rates.binanceP2PAvg)}).
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="range">
              <button
                className={activeTab === 'simple' ? 'active' : ''}
                onClick={() => setActiveTab('simple')}
              >
                Vista Rápida
              </button>
              <button
                className={activeTab === 'channels' ? 'active' : ''}
                onClick={() => setActiveTab('channels')}
              >
                Comisiones por Canal
              </button>
            </div>
            <span className="status good">TASA ACTIVA: {activeRateName}</span>
          </div>
        </div>

        <div className="pricing-intro" style={{ background: '#f5faf4', borderColor: '#d3edd8' }}>
          <div className="insight-icon" style={{ background: '#d6fb72', color: 'var(--deep)' }}>
            💡
          </div>
          <div>
            <strong>Margen real sobre precio de venta: <code>(Precio − Costo) ÷ Precio</code></strong>
            <p>
              En un negocio de yogurt y quesillo, el margen objetivo sugerido es de <b>35% a 45%</b> para cubrir
              mermas, refrigeración constante y dejar una ganancia limpia para ti.
            </p>
          </div>
        </div>

        <div id="pricingGrid" className="pricing-grid">
          {products.map((product) => {
            const pricingActive = calculateTargetPrice(product.costUSD, product.targetMargin, {
              exchangeRate: activeRate,
              variableFeeRatePercent: product.variableFeeRate || 0,
              fixedVariableCostUSD: product.fixedVariableCostUSD || 0.05,
              taxRatePercent: product.taxRate || 0,
            });

            // Compare Euro BCV vs Binance P2P
            const pricingBCVEur = calculateTargetPrice(product.costUSD, product.targetMargin, {
              exchangeRate: rates.bcvEur,
            });
            const pricingBinance = calculateTargetPrice(product.costUSD, product.targetMargin, {
              exchangeRate: rates.binanceP2PAvg,
            });

            const diffVES = Math.abs(pricingBCVEur.netPriceVES - pricingBinance.netPriceVES);

            return (
              <article className="pricing-card" data-product={product.id} key={product.id}>
                <div className="pricing-card-head">
                  <div className="price-emoji">{product.emoji}</div>
                  <div>
                    <strong>{product.name}</strong>
                    <small>{product.format}</small>
                  </div>
                </div>

                <div className="price-metric">
                  <small>Costo variable unitario base ($ USD)</small>
                  {activeTab === 'channels' ? (
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      className="margin-input"
                      value={product.costUSD}
                      onChange={(e) => handleCostUSDChange(product.id, e.target.value)}
                      style={{ marginTop: '4px', padding: '6px 8px', fontSize: '12px' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                      <strong style={{ fontSize: '15px' }}>{moneyUSD(product.costUSD)}</strong>
                      <span style={{ fontSize: '11px', color: '#68786f' }}>
                        {moneyVES(product.costUSD * activeRate)}
                      </span>
                    </div>
                  )}
                </div>

                <label className="field-label" htmlFor={`margin-${product.id}`}>
                  Margen objetivo de ganancia
                </label>
                <div className="margin-input-wrap">
                  <input
                    className="margin-input"
                    id={`margin-${product.id}`}
                    type="number"
                    min="5"
                    max="90"
                    step="0.5"
                    value={product.targetMargin}
                    onChange={(e) => handleMarginChange(product.id, e.target.value)}
                  />
                  <span>%</span>
                </div>
                <div className="calc-error" id={`error-${product.id}`}>
                  {errors[product.id] || ''}
                </div>

                {activeTab === 'channels' && (
                  <div style={{ marginTop: '8px' }}>
                    <label className="field-label" style={{ margin: '4px 0 2px', fontSize: '10px' }}>
                      Comisión de canal o bodegón (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="1"
                      className="margin-input"
                      style={{ padding: '6px 8px', fontSize: '11px' }}
                      value={product.variableFeeRate || 0}
                      onChange={(e) => handleFeeChange(product.id, e.target.value)}
                    />
                  </div>
                )}

                {/* Main Suggested Price in USD & Active Rate VES */}
                <div className="price-result">
                  <small>Precio sugerido de venta</small>
                  <strong id={`price-${product.id}`}>
                    {moneyUSD(pricingActive.netPriceUSD)}
                  </strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', borderTop: '1px solid #ffffff25', paddingTop: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--lime)', fontWeight: 700 }}>
                      En Bolívares ({activeRateName}):
                    </span>
                    <strong style={{ fontSize: '14px', color: '#fff', margin: 0 }}>
                      {moneyVES(pricingActive.netPriceVES)}
                    </strong>
                  </div>
                </div>

                {/* Comparison Box: Euro BCV vs Binance P2P */}
                <div style={{ background: '#f8faf7', borderRadius: '10px', padding: '10px', marginTop: '10px', border: '1px solid #e4eae2', fontSize: '11px' }}>
                  <span style={{ fontWeight: 750, color: '#385042', display: 'block', marginBottom: '6px' }}>
                    Comparativa de tasas en mostrador:
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#55665b' }}>🇪🇺 Con Tasa Euro ({moneyVES(rates.bcvEur)}):</span>
                    <b>{moneyVES(pricingBCVEur.netPriceVES)}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#55665b' }}>🟡 Con Binance P2P ({moneyVES(rates.binanceP2PAvg)}):</span>
                    <b>{moneyVES(pricingBinance.netPriceVES)}</b>
                  </div>
                  <div style={{ borderTop: '1px solid #e5ebe4', paddingTop: '4px', fontSize: '10px', color: '#66786c' }}>
                    Diferencia entre referencias: <b>{moneyVES(diffVES)}</b> por unidad.
                  </div>
                </div>

                <div className="price-metrics" style={{ marginTop: '8px' }}>
                  <div className="price-metric">
                    <small>Ganancia por pote</small>
                    <strong style={{ color: '#26785c' }}>{moneyUSD(pricingActive.contributionUSD)}</strong>
                  </div>
                  <div className="price-metric">
                    <small>Margen real</small>
                    <strong>{pricingActive.actualContributionMargin.toFixed(1)}%</strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="formula-note">
          <b>Fórmula financiera determinista:</b> <code>Precio = (Costo en $ + Costo fijo) ÷ (1 − Margen % − Comisión %)</code>.
          Posteriormente se convierte a Bolívares multiplicando por la <b>Tasa Euro</b> o <b>Binance P2P</b> seleccionada.
        </div>

        <div className="pricing-footer">
          <p>Los precios calculados se sincronizan automáticamente con el generador de mensajes de WhatsApp.</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              id="resetMargins"
              type="button"
              onClick={() => {
                onResetMargins();
                onNotify('Márgenes restablecidos a 35% en todos los productos.');
              }}
            >
              Restablecer márgenes
            </button>
            <button
              type="button"
              className="primary-btn"
              onClick={() => onNavigate('growth')}
            >
              Generar Menú WhatsApp ↗
            </button>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <button className="primary-btn" onClick={() => onNavigate('dashboard')}>
            Volver al dashboard
          </button>
        </div>
      </div>
    </section>
  );
};
