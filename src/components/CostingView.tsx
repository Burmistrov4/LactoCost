import React, { useState } from 'react';
import { ViewId, InventoryItem } from '../types';
import { moneyUSD, moneyVES } from '../utils/formatters';
import { movingAverageReceipt, usableUnitCost, valueIssue } from '../domain/costing';

interface CostingViewProps {
  inventory: InventoryItem[];
  activeRate: number;
  activeRateName: string;
  onNavigate: (view: ViewId) => void;
  onNotify: (msg: string) => void;
}

export const CostingView: React.FC<CostingViewProps> = ({
  inventory,
  activeRate,
  activeRateName,
  onNavigate,
}) => {
  // Simulator 1: Moving Average Receipt in USD
  const [selectedItemId, setSelectedItemId] = useState<string>(inventory[0]?.id || '');
  const selectedItem = inventory.find((i) => i.id === selectedItemId) || inventory[0];

  const [currentQty, setCurrentQty] = useState<number>(selectedItem ? selectedItem.currentStock : 45);
  const [currentCostUSD, setCurrentCostUSD] = useState<number>(selectedItem ? selectedItem.unitCostUSD : 0.85);
  const [receivedQty, setReceivedQty] = useState<number>(100);
  const [invoiceGrossUSD, setInvoiceGrossUSD] = useState<number>(85.0);
  const [attributableChargesUSD, setAttributableChargesUSD] = useState<number>(5.0); // e.g. flete
  const [discountUSD, setDiscountUSD] = useState<number>(0);

  const handleItemSelect = (id: string) => {
    setSelectedItemId(id);
    const item = inventory.find((i) => i.id === id);
    if (item) {
      setCurrentQty(item.currentStock);
      setCurrentCostUSD(item.unitCostUSD);
    }
  };

  let receiptResult;
  let receiptError = '';
  try {
    receiptResult = movingAverageReceipt(
      currentQty,
      currentCostUSD,
      receivedQty,
      invoiceGrossUSD,
      attributableChargesUSD,
      discountUSD
    );
  } catch (err: unknown) {
    receiptError = (err as Error).message;
    receiptResult = null;
  }

  // Simulator 2: Usable Unit Cost
  const [purchaseCostUSD, setPurchaseCostUSD] = useState<number>(68.0);
  const [purchasedQty, setPurchasedQty] = useState<number>(20); // 20 kg fresas
  const [usableQty, setUsableQty] = useState<number>(17); // 17 kg limpias

  let usableCostResult = 0;
  let usableCostError = '';
  try {
    usableCostResult = usableUnitCost(purchaseCostUSD, purchasedQty, usableQty);
  } catch (err: unknown) {
    usableCostError = (err as Error).message;
  }

  // Simulator 3: Issue valuation
  const [issueQty, setIssueQty] = useState<number>(20);
  const issueValuationUSD = valueIssue(issueQty, currentCostUSD);

  return (
    <section className="view-state active" id="view-costs">
      <div className="card panel">
        <div className="panel-title">
          <div>
            <h2 style={{ margin: 0, fontSize: '19px' }}>Costos y Costo Promedio Ponderado (CPP)</h2>
            <p>
              Motor determinista en <b>Dólares ($ USD)</b> y <b>Bolívares</b> ({activeRateName}: {moneyVES(activeRate)}) para calcular el impacto de nuevas compras, fletes atribuibles y mermas.
            </p>
          </div>
          <span className="status good">PRECISIÓN AUDITABLE</span>
        </div>

        <div className="pricing-intro" style={{ background: '#f5faf4', borderColor: '#d0ebd5' }}>
          <div className="insight-icon" style={{ background: '#d6fb72', color: 'var(--deep)' }}>
            ⌁
          </div>
          <div>
            <strong>Principio de protección financiera</strong>
            <p>
              Si compras leche más cara con un flete adicional, el CPP promedia exactamente el valor real sin
              destruir el historial. Así nunca cobras menos de lo que te costó producir.
            </p>
          </div>
        </div>

        {/* Guía Visual y Educativa: ¿Cómo sabe la app el Costo Promedio Ponderado si no sé calcularlo? */}
        <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '22px' }}>🎓</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '15.5px', color: '#0f172a', fontWeight: 800 }}>
                ¿Cómo sabe la app tu Costo Promedio Ponderado (CPP) si tú no sabes calcularlo?
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Explicación práctica para tu taller en Flor Amarillo / Valencia sin fórmulas complicadas.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginTop: '12px' }}>
            <div style={{ background: '#ffffff', borderRadius: '10px', padding: '12px', border: '1px solid #e2e8f0' }}>
              <strong style={{ fontSize: '12.5px', color: '#166534', display: 'block', marginBottom: '4px' }}>
                1. El problema común al comprar a distintos precios:
              </strong>
              <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: 1.55 }}>
                Ayer tenías <b>10 potes</b> que compraste al detal a <b>$0.18</b> cada uno (gastaste $1.80).<br />
                Hoy fuiste a La Candelaria y compraste un paquete de <b>100 potes</b> a <b>$0.12</b> cada uno (gastaste $12.00).<br />
                Si mezclas todo en tu mesa de trabajo tienes <b>110 potes</b>. ¿A cuánto te costó cada uno?
              </p>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '10px', padding: '12px', border: '1px solid #e2e8f0' }}>
              <strong style={{ fontSize: '12.5px', color: '#1e40af', display: 'block', marginBottom: '4px' }}>
                2. Lo que la aplicación calcula automáticamente por ti:
              </strong>
              <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', color: '#1e3a8a', fontFamily: 'monospace' }}>
                Dinero total invertido: $1.80 + $12.00 = $13.80<br />
                Total unidades en almacén: 10 + 100 = 110 potes<br />
                <b>Nuevo CPP Automático: $13.80 ÷ 110 = $0.1254 c/u</b>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: '#475569' }}>
                ✓ <b>¡Tú no tienes que hacer cuentas a mano!</b> La app lo calcula automáticamente cada vez que registras una compra o ajustas inventario, asegurando que tus recetas y ganancias queden blindadas.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
          {/* Simulator 1: Moving average receipt */}
          <div className="card panel" style={{ background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '15px' }}>
                1. Simulación de recepción de compra (CPP móvil)
              </h3>
            </div>

            {/* Quick Presets for User */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setCurrentQty(20);
                  setCurrentCostUSD(0.18);
                  setReceivedQty(500);
                  setInvoiceGrossUSD(60.0); // 500 * $0.12 = $60
                  setAttributableChargesUSD(0);
                  setDiscountUSD(0);
                }}
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  padding: '4px 8px',
                  background: '#ecfdf5',
                  border: '1px solid #10b981',
                  color: '#065f46',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                🍶 Probar 500 potes a $0.12 (La Candelaria)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentQty(40);
                  setCurrentCostUSD(0.95);
                  setReceivedQty(100);
                  setInvoiceGrossUSD(85.0);
                  setAttributableChargesUSD(5.0);
                  setDiscountUSD(0);
                }}
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '4px 8px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                🥛 Probar 100L Leche + Flete
              </button>
            </div>

            <label className="field-label" style={{ marginTop: 0 }}>
              Cargar datos desde insumo existente:
            </label>
            <select
              className="rate-select"
              value={selectedItemId}
              onChange={(e) => handleItemSelect(e.target.value)}
            >
              {inventory.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.code}) · Stock: {i.currentStock} {i.unit} · CPP: {moneyUSD(i.unitCostUSD)}
                </option>
              ))}
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <div>
                <label className="field-label">Existencia actual ({selectedItem?.unit || 'unid'})</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="margin-input"
                  value={currentQty}
                  onChange={(e) => setCurrentQty(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="field-label">CPP actual ($ USD / {selectedItem?.unit})</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="margin-input"
                  value={currentCostUSD}
                  onChange={(e) => setCurrentCostUSD(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="field-label">Cantidad a recibir ({selectedItem?.unit || 'unid'})</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  className="margin-input"
                  value={receivedQty}
                  onChange={(e) => setReceivedQty(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="field-label">Importe factura ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="margin-input"
                  value={invoiceGrossUSD}
                  onChange={(e) => setInvoiceGrossUSD(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="field-label">Flete / Transporte ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="margin-input"
                  value={attributableChargesUSD}
                  onChange={(e) => setAttributableChargesUSD(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="field-label">Descuentos ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="margin-input"
                  value={discountUSD}
                  onChange={(e) => setDiscountUSD(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {receiptError ? (
              <div className="calc-error" style={{ marginTop: '10px' }}>
                {receiptError}
              </div>
            ) : receiptResult ? (
              <div className="price-result" style={{ marginTop: '16px' }}>
                <small>Nuevo Costo Promedio Ponderado (CPP)</small>
                <strong>{moneyUSD(receiptResult.newAverageCost)} / {selectedItem?.unit || 'unid'}</strong>
                <span style={{ fontSize: '11px', color: '#c4e0ce', display: 'block', marginTop: '2px' }}>
                  Equivalente en Bolívares: {moneyVES(receiptResult.newAverageCost * activeRate)}
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                  <div className="price-metric" style={{ background: '#ffffff15', color: '#fff' }}>
                    <small style={{ color: '#b9d4c1' }}>Existencia final resultante</small>
                    <strong style={{ color: '#fff' }}>
                      {receiptResult.endingQuantity} {selectedItem?.unit}
                    </strong>
                  </div>
                  <div className="price-metric" style={{ background: '#ffffff15', color: '#fff' }}>
                    <small style={{ color: '#b9d4c1' }}>Valor contable total</small>
                    <strong style={{ color: '#fff' }}>{moneyUSD(receiptResult.endingValue)}</strong>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Simulator 2: Usable Unit Cost */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card panel" style={{ background: '#fff' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '15px' }}>
                2. Costo unitario aprovechable (Mermas de compra)
              </h3>
              <p style={{ margin: '0 0 10px', fontSize: '11px', color: 'var(--muted)' }}>
                Distribuye el costo total pagado únicamente sobre los kilos o litros realmente limpios y aprovechables.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="field-label">Costo total pagado ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="margin-input"
                    value={purchaseCostUSD}
                    onChange={(e) => setPurchaseCostUSD(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="field-label">Kilos comprados brutos</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    className="margin-input"
                    value={purchasedQty}
                    onChange={(e) => setPurchasedQty(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Kilos limpios / aprovechables</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  className="margin-input"
                  value={usableQty}
                  onChange={(e) => setUsableQty(parseFloat(e.target.value) || 0)}
                />
              </div>

              {usableCostError ? (
                <div className="calc-error" style={{ marginTop: '8px' }}>
                  {usableCostError}
                </div>
              ) : (
                <div className="price-result" style={{ marginTop: '14px' }}>
                  <small>Costo unitario aprovechable real</small>
                  <strong>{moneyUSD(usableCostResult)} / kg útil</strong>
                  <small style={{ color: '#c4dbcd' }}>
                    Nominal sin merma: {moneyUSD(purchaseCostUSD / (purchasedQty || 1))} / kg · {moneyVES(usableCostResult * activeRate)}
                  </small>
                </div>
              )}
            </div>

            {/* Simulator 3: Issue valuation */}
            <div className="card panel" style={{ background: '#fff' }}>
              <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>
                3. Valoración de consumo a producción
              </h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label className="field-label" style={{ marginTop: 0 }}>
                    Cantidad consumida ({selectedItem?.unit || 'unid'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="margin-input"
                    value={issueQty}
                    onChange={(e) => setIssueQty(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="field-label" style={{ marginTop: 0 }}>
                    Costo imputado al lote
                  </label>
                  <div style={{ padding: '10px', background: '#f4f7f1', borderRadius: '9px', fontWeight: 800 }}>
                    {moneyUSD(issueValuationUSD)} <span style={{ fontSize: '11px', color: 'var(--muted)' }}>({moneyVES(issueValuationUSD * activeRate)})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="primary-btn" onClick={() => onNavigate('dashboard')}>
            Volver al dashboard
          </button>
        </div>
      </div>
    </section>
  );
};
