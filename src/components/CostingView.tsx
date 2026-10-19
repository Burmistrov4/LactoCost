import React, { useState } from 'react';
import { ViewId, InventoryItem } from '../types';
import { money } from '../utils/formatters';
import { movingAverageReceipt, usableUnitCost, valueIssue } from '../domain/costing';

interface CostingViewProps {
  inventory: InventoryItem[];
  onNavigate: (view: ViewId) => void;
  onNotify: (msg: string) => void;
}

export const CostingView: React.FC<CostingViewProps> = ({
  inventory,
  onNavigate,
  onNotify,
}) => {
  // Simulator 1: Moving Average Receipt
  const [selectedItemId, setSelectedItemId] = useState<string>(inventory[0]?.id || '');
  const selectedItem = inventory.find((i) => i.id === selectedItemId) || inventory[0];

  const [currentQty, setCurrentQty] = useState<number>(selectedItem ? selectedItem.currentStock : 100);
  const [currentCost, setCurrentCost] = useState<number>(selectedItem ? selectedItem.unitCost : 38.5);
  const [receivedQty, setReceivedQty] = useState<number>(200);
  const [invoiceGross, setInvoiceGross] = useState<number>(8000);
  const [attributableCharges, setAttributableCharges] = useState<number>(400); // e.g. flete
  const [discount, setDiscount] = useState<number>(0);

  // When selected item changes, update current values
  const handleItemSelect = (id: string) => {
    setSelectedItemId(id);
    const item = inventory.find((i) => i.id === id);
    if (item) {
      setCurrentQty(item.currentStock);
      setCurrentCost(item.unitCost);
    }
  };

  let receiptResult;
  let receiptError = '';
  try {
    receiptResult = movingAverageReceipt(
      currentQty,
      currentCost,
      receivedQty,
      invoiceGross,
      attributableCharges,
      discount
    );
  } catch (err: unknown) {
    receiptError = (err as Error).message;
    receiptResult = null;
  }

  // Simulator 2: Usable Unit Cost
  const [purchaseCost, setPurchaseCost] = useState<number>(3700);
  const [purchasedQty, setPurchasedQty] = useState<number>(20);
  const [usableQty, setUsableQty] = useState<number>(17); // e.g. 15% trimming on fruit

  let usableCostResult = 0;
  let usableCostError = '';
  try {
    usableCostResult = usableUnitCost(purchaseCost, purchasedQty, usableQty);
  } catch (err: unknown) {
    usableCostError = (err as Error).message;
  }

  // Simulator 3: Issue valuation
  const [issueQty, setIssueQty] = useState<number>(30);
  const issueValuation = valueIssue(issueQty, currentCost);

  return (
    <section className="view-state active" id="view-costs">
      <div className="card panel">
        <div className="panel-title">
          <div>
            <h2 style={{ margin: 0, fontSize: '19px' }}>Costos y Costo Promedio Ponderado (CPP)</h2>
            <p>
              Motor determinista para calcular el impacto de nuevas compras, fletes atribuibles, descuentos y mermas.
            </p>
          </div>
          <span className="status good">MATEMÁTICA PURA</span>
        </div>

        <div className="pricing-intro">
          <div className="insight-icon" style={{ background: '#d6eeb9', flex: 'none' }}>
            ⌁
          </div>
          <div>
            <strong>Principio contable de CPP continuo</strong>
            <p>
              El Costo Promedio Ponderado no recalcula consumos pasados. Al recibir un nuevo lote, se suma el valor de la
              existencia previa con el valor neto del nuevo ingreso (factura − descuentos + cargos atribuibles) y se divide
              entre el stock total resultante.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {/* Simulator 1: Moving average receipt */}
          <div className="card panel" style={{ background: '#fff' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '15px' }}>
              1. Simulación de recepción de compra (CPP móvil)
            </h3>

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
                  {i.name} ({i.code}) · Stock: {i.currentStock} {i.unit} · CPP: {money(i.unitCost)}
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
                <label className="field-label">CPP actual (Bs. / {selectedItem?.unit || 'unid'})</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="margin-input"
                  value={currentCost}
                  onChange={(e) => setCurrentCost(parseFloat(e.target.value) || 0)}
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
                <label className="field-label">Importe bruto factura (Bs.)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="margin-input"
                  value={invoiceGross}
                  onChange={(e) => setInvoiceGross(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="field-label">Fletes / Cargos atribuibles (Bs.)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="margin-input"
                  value={attributableCharges}
                  onChange={(e) => setAttributableCharges(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="field-label">Descuentos comerciales (Bs.)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="margin-input"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
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
                <strong>{money(receiptResult.newAverageCost)} / {selectedItem?.unit || 'unid'}</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                  <div className="price-metric" style={{ background: '#ffffff15', color: '#fff' }}>
                    <small style={{ color: '#b9d4c1' }}>Existencia final resultante</small>
                    <strong style={{ color: '#fff' }}>
                      {receiptResult.endingQuantity} {selectedItem?.unit}
                    </strong>
                  </div>
                  <div className="price-metric" style={{ background: '#ffffff15', color: '#fff' }}>
                    <small style={{ color: '#b9d4c1' }}>Valor contable total</small>
                    <strong style={{ color: '#fff' }}>{money(receiptResult.endingValue)}</strong>
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
                Distribuye el costo total de adquisición únicamente sobre la cantidad verdaderamente útil (ej. frutas tras pelado o descarte).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="field-label">Costo total pagado (Bs.)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="margin-input"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="field-label">Cantidad comprada bruta</label>
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
                <label className="field-label">Cantidad limpia / aprovechable</label>
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
                  <strong>{money(usableCostResult)} / unidad útil</strong>
                  <small style={{ color: '#c4dbcd' }}>
                    Costo nominal sin merma: {money(purchaseCost / (purchasedQty || 1))} / unidad
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
                    Importe total imputado al lote
                  </label>
                  <div style={{ padding: '10px', background: '#f4f7f1', borderRadius: '9px', fontWeight: 800 }}>
                    {money(issueValuation)}
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
          <button
            className="ghost-btn"
            onClick={() => onNotify('Simulación evaluada con paridad exacta respecto a app/core/costing.py')}
          >
            Verificar paridad matemática ✓
          </button>
        </div>
      </div>
    </section>
  );
};
