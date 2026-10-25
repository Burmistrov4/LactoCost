import React, { useState } from 'react';
import { InventoryItem, ViewId } from '../types';
import { moneyUSD, moneyVES } from '../utils/formatters';
import { suggestedPurchaseQuantity } from '../domain/costing';

interface PurchasesViewProps {
  inventory: InventoryItem[];
  activeRate: number;
  activeRateName: string;
  onNavigate: (view: ViewId) => void;
  onOpenNewOperation: () => void;
  onNotify: (msg: string) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  inventory,
  activeRate,
  activeRateName,
  onNavigate,
  onOpenNewOperation,
  onNotify,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(
    inventory.find((i) => i.status === 'bad')?.id || inventory[0]?.id || ''
  );
  const selectedItem = inventory.find((i) => i.id === selectedItemId) || inventory[0];

  const [leadTimeDemand, setLeadTimeDemand] = useState<number>(60);
  const [safetyStock, setSafetyStock] = useState<number>(selectedItem ? selectedItem.safetyStock : 40);
  const [committedDemand, setCommittedDemand] = useState<number>(20);
  const [usableStock, setUsableStock] = useState<number>(selectedItem ? selectedItem.currentStock : 45);
  const [confirmedInbound, setConfirmedInbound] = useState<number>(0);

  const handleItemSelect = (id: string) => {
    setSelectedItemId(id);
    const item = inventory.find((i) => i.id === id);
    if (item) {
      setSafetyStock(item.safetyStock);
      setUsableStock(item.currentStock);
    }
  };

  const suggestedQty = suggestedPurchaseQuantity(
    leadTimeDemand,
    safetyStock,
    committedDemand,
    usableStock,
    confirmedInbound
  );

  const estimatedOrderCostUSD = suggestedQty * (selectedItem ? selectedItem.unitCostUSD : 0);
  const estimatedOrderCostVES = estimatedOrderCostUSD * activeRate;

  // Replenishment items
  const replenishmentItems = inventory
    .filter((i) => i.currentStock <= i.minStock)
    .map((item) => {
      const needed = Math.max(0, item.minStock * 1.5 - item.currentStock);
      const estCostUSD = needed * item.unitCostUSD;
      const estCostVES = estCostUSD * activeRate;
      return {
        ...item,
        needed,
        estCostUSD,
        estCostVES,
      };
    });

  return (
    <section className="view-state active" id="view-purchases">
      <div className="card panel">
        <div className="panel-title">
          <div>
            <h2 style={{ margin: 0, fontSize: '19px' }}>Planificación de Compras Sugeridas</h2>
            <p>
              Evita quedarte sin leche o envases un fin de semana. Costeo de órdenes en <b>Dólares ($ USD)</b> y <b>Bolívares</b> ({activeRateName}: {moneyVES(activeRate)}).
            </p>
          </div>
          <button className="primary-btn" onClick={onOpenNewOperation}>
            <span>＋</span> <span>Registrar compra / recepción</span>
          </button>
        </div>

        <div className="pricing-intro" style={{ background: '#f5faf4', borderColor: '#d0ebd5' }}>
          <div className="insight-icon" style={{ background: '#d6fb72', color: 'var(--deep)' }}>
            ⇣
          </div>
          <div>
            <strong>Compra racional para cuidar tu capital de trabajo</strong>
            <p>
              <code>Cantidad sugerida = Demanda en plazo de entrega + Stock de seguridad + Demanda comprometida − Stock actual − Pedidos en camino</code>.
            </p>
          </div>
        </div>

        <div className="responsive-split-grid">
          <div style={{ background: '#fbfdfa', border: '1px solid var(--line)', borderRadius: '14px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Calculador de Orden para la Emprendedora</h3>

            <label className="field-label" style={{ marginTop: 0 }}>
              Seleccionar materia prima
            </label>
            <select
              className="rate-select"
              value={selectedItemId}
              onChange={(e) => handleItemSelect(e.target.value)}
            >
              {inventory.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.code}) · Existencia actual: {i.currentStock} {i.unit} · Costo: {moneyUSD(i.unitCostUSD)}
                </option>
              ))}
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '10px', marginTop: '12px' }}>
              <div>
                <label className="field-label">Demanda en plazo de entrega ({selectedItem?.unit})</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="margin-input"
                  value={leadTimeDemand}
                  onChange={(e) => setLeadTimeDemand(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="field-label">Stock de seguridad ({selectedItem?.unit})</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="margin-input"
                  value={safetyStock}
                  onChange={(e) => setSafetyStock(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '10px' }}>
              <div>
                <label className="field-label">Pedidos comprometidos ({selectedItem?.unit})</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="margin-input"
                  value={committedDemand}
                  onChange={(e) => setCommittedDemand(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="field-label">Stock útil actual ({selectedItem?.unit})</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="margin-input"
                  value={usableStock}
                  onChange={(e) => setUsableStock(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <label className="field-label">Compras en tránsito / pedidas ({selectedItem?.unit})</label>
              <input
                type="number"
                min="0"
                step="1"
                className="margin-input"
                value={confirmedInbound}
                onChange={(e) => setConfirmedInbound(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Result card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="card panel" style={{ background: 'var(--deep)', color: 'white' }}>
              <small style={{ color: '#b6cdbe', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Recomendación de compra
              </small>
              <h3 style={{ margin: '6px 0 12px', color: 'white', fontSize: '18px' }}>
                {selectedItem?.name}
              </h3>

              <div className="price-result" style={{ background: '#ffffff15', marginTop: '6px' }}>
                <small style={{ color: '#b9d4c1' }}>Cantidad a comprar sugerida</small>
                <strong style={{ color: 'var(--lime)', fontSize: '26px' }}>
                  {suggestedQty} {selectedItem?.unit}
                </strong>
                <div style={{ marginTop: '4px', borderTop: '1px solid #ffffff20', paddingTop: '6px' }}>
                  <small style={{ color: '#b9d4c1' }}>
                    Presupuesto estimado: <b>{moneyUSD(estimatedOrderCostUSD)}</b>
                  </small>
                  <strong style={{ color: '#fff', fontSize: '14px', display: 'block', marginTop: '2px' }}>
                    {moneyVES(estimatedOrderCostVES)}
                  </strong>
                </div>
              </div>

              <button
                className="primary-btn"
                style={{
                  background: 'var(--lime)',
                  color: 'var(--deep)',
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: '16px',
                  fontWeight: 800,
                }}
                onClick={() => {
                  onNotify(`Orden de compra sugerida: ${suggestedQty} ${selectedItem?.unit} de ${selectedItem?.name}.`);
                }}
              >
                Generar Orden de Compra
              </button>
            </div>
          </div>
        </div>

        {/* Priority items needing replenishment */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '14px', margin: '0 0 10px' }}>
            Insumos con reposición recomendada ({replenishmentItems.length})
          </h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Insumo</th>
                  <th>Stock Actual</th>
                  <th>Mínimo Requerido</th>
                  <th>Pedido Sugerido</th>
                  <th>Presupuesto ($)</th>
                  <th>Presupuesto (Bs)</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {replenishmentItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <b>{item.name}</b>
                    </td>
                    <td>
                      <span style={{ color: '#bd5e4e', fontWeight: 700 }}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>
                    <td>
                      {item.minStock} {item.unit}
                    </td>
                    <td>
                      <strong>
                        {item.needed} {item.unit}
                      </strong>
                    </td>
                    <td>{moneyUSD(item.estCostUSD)}</td>
                    <td>
                      <b>{moneyVES(item.estCostVES)}</b>
                    </td>
                    <td>
                      <button
                        className="tiny-action"
                        style={{ background: '#26785c', color: 'white', border: 0, padding: '5px 10px' }}
                        onClick={() => handleItemSelect(item.id)}
                      >
                        Calcular
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
