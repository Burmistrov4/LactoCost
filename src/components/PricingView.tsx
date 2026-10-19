import React, { useState } from 'react';
import { Product, ViewId } from '../types';
import { money } from '../utils/formatters';
import { calculateTargetPrice } from '../domain/pricing';

interface PricingViewProps {
  products: Product[];
  onUpdateMargin: (productId: string, margin: number) => void;
  onUpdateProductParams: (
    productId: string,
    params: {
      cost?: number;
      margin?: number;
      variableFeeRate?: number;
      fixedVariableCost?: number;
      taxRate?: number;
    }
  ) => void;
  onResetMargins: () => void;
  onNavigate: (view: ViewId) => void;
  onNotify: (msg: string) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  products,
  onUpdateProductParams,
  onResetMargins,
  onNavigate,
  onNotify,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');

  const handleMarginChange = (productId: string, rawValue: string) => {
    const trimmed = rawValue.trim();
    if (trimmed === '') {
      setErrors((prev) => ({ ...prev, [productId]: 'Introduce un porcentaje válido.' }));
      return;
    }
    const val = parseFloat(trimmed);
    if (!Number.isFinite(val) || val < 0 || val >= 100) {
      setErrors((prev) => ({
        ...prev,
        [productId]: 'El margen debe estar entre 0% y menos de 100%.',
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, [productId]: '' }));
    onUpdateProductParams(productId, { margin: val });
  };

  const handleCostChange = (productId: string, rawValue: string) => {
    const val = parseFloat(rawValue);
    if (!Number.isFinite(val) || val < 0) return;
    onUpdateProductParams(productId, { cost: val });
  };

  const handleFeeChange = (productId: string, rawValue: string) => {
    const val = parseFloat(rawValue);
    if (!Number.isFinite(val) || val < 0 || val >= 100) return;
    onUpdateProductParams(productId, { variableFeeRate: val });
  };

  const handleTaxChange = (productId: string, rawValue: string) => {
    const val = parseFloat(rawValue);
    if (!Number.isFinite(val) || val < 0 || val > 100) return;
    onUpdateProductParams(productId, { taxRate: val });
  };

  return (
    <section className="view-state active" id="view-pricing">
      <div className="card panel">
        <div className="panel-title">
          <div>
            <h2 style={{ margin: 0, fontSize: '19px' }}>Precios y márgenes por producto</h2>
            <p>
              Modifica el margen objetivo o los parámetros de canal y el precio sugerido se recalcula al instante.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="range">
              <button
                className={activeTab === 'simple' ? 'active' : ''}
                onClick={() => setActiveTab('simple')}
              >
                Modo básico
              </button>
              <button
                className={activeTab === 'advanced' ? 'active' : ''}
                onClick={() => setActiveTab('advanced')}
              >
                Canales & Impuestos
              </button>
            </div>
            <span className="status good">MOTOR ACTIVO</span>
          </div>
        </div>

        <div className="pricing-intro">
          <div className="insight-icon" style={{ background: '#d6eeb9', flex: 'none' }}>
            ↗
          </div>
          <div>
            <strong>Margen sobre precio de venta, no recargo sobre costo</strong>
            <p>
              El margen se calcula como <code>(precio − costo) ÷ precio</code>. Cada producto puede tener un objetivo
              diferente; el precio sugerido cambia automáticamente al editar su porcentaje.
            </p>
          </div>
        </div>

        <div id="pricingGrid" className="pricing-grid">
          {products.map((product) => {
            let calcResult;
            try {
              calcResult = calculateTargetPrice(product.cost, product.targetMargin, {
                variableFeeRatePercent: product.variableFeeRate || 0,
                fixedVariableCost: product.fixedVariableCost || 0,
                taxRatePercent: product.taxRate || 0,
              });
            } catch (err: unknown) {
              calcResult = null;
            }

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
                  <small>Costo variable unitario</small>
                  {activeTab === 'advanced' ? (
                    <input
                      type="number"
                      step="1"
                      min="0"
                      className="margin-input"
                      value={product.cost}
                      onChange={(e) => handleCostChange(product.id, e.target.value)}
                      style={{ marginTop: '4px', padding: '6px 8px', fontSize: '12px' }}
                    />
                  ) : (
                    <strong>{money(product.cost)}</strong>
                  )}
                </div>

                <label className="field-label" htmlFor={`margin-${product.id}`}>
                  Margen objetivo de rentabilidad
                </label>
                <div className="margin-input-wrap">
                  <input
                    className="margin-input"
                    id={`margin-${product.id}`}
                    data-margin-for={product.id}
                    type="number"
                    min="0"
                    max="99.9"
                    step="0.5"
                    inputMode="decimal"
                    value={product.targetMargin}
                    onChange={(e) => handleMarginChange(product.id, e.target.value)}
                    aria-describedby={`error-${product.id}`}
                  />
                  <span>%</span>
                </div>
                <div className="calc-error" id={`error-${product.id}`} aria-live="polite">
                  {errors[product.id] || ''}
                </div>

                {activeTab === 'advanced' && (
                  <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label className="field-label" style={{ margin: '4px 0 2px', fontSize: '10px' }}>
                        Comisión canal (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="90"
                        step="0.5"
                        className="margin-input"
                        style={{ padding: '6px 8px', fontSize: '11px' }}
                        value={product.variableFeeRate || 0}
                        onChange={(e) => handleFeeChange(product.id, e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label" style={{ margin: '4px 0 2px', fontSize: '10px' }}>
                        IVA / Impuesto (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="1"
                        className="margin-input"
                        style={{ padding: '6px 8px', fontSize: '11px' }}
                        value={product.taxRate || 0}
                        onChange={(e) => handleTaxChange(product.id, e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="price-result">
                  <small>Precio sugerido neto</small>
                  <strong id={`price-${product.id}`}>
                    {calcResult ? money(calcResult.netPrice) : '—'}
                  </strong>
                  {calcResult && (product.taxRate || 0) > 0 && (
                    <small style={{ color: '#d6fb72', marginTop: '2px' }}>
                      Precio final cliente (c/ IVA): {money(calcResult.customerPrice)}
                    </small>
                  )}
                  <small>Se recalcula al cambiar el margen</small>
                </div>

                <div className="price-metrics">
                  <div className="price-metric">
                    <small>Contribución unitaria</small>
                    <strong id={`contribution-${product.id}`}>
                      {calcResult ? money(calcResult.contribution) : '—'}
                    </strong>
                  </div>
                  <div className="price-metric">
                    <small>Margen resultante</small>
                    <strong id={`result-margin-${product.id}`}>
                      {calcResult ? `${calcResult.actualContributionMargin.toFixed(1)}%` : '—'}
                    </strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="formula-note">
          <b>Fórmula de rentabilidad neta:</b> <code>precio sugerido = (costo variable + costo fijo) ÷ (1 − margen − comisión)</code>.
          Ejemplo: costo Bs. 820 con margen 35% → Bs. 1.261,54. Toda la aritmética se computa con precisión financiera sin aproximaciones arbitrarias.
        </div>

        <div className="pricing-footer">
          <p>Los parámetros modificados se reflejan inmediatamente en el Radar de rentabilidad del Dashboard.</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              id="resetMargins"
              type="button"
              onClick={() => {
                onResetMargins();
                onNotify('Márgenes de rentabilidad restablecidos a 35%.');
              }}
            >
              Restablecer márgenes demo
            </button>
            <button
              type="button"
              style={{ background: '#eaf4eb', borderColor: '#bcd8c2', color: '#276346' }}
              onClick={() => onNotify('Configuración de precios aplicada en memoria correctamente.')}
            >
              Guardar política activa
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
