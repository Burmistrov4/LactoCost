import React, { useState } from 'react';
import { InventoryItem, InventoryMovement } from '../types';
import { movingAverageReceipt } from '../domain/costing';
import { moneyUSD, moneyVES } from '../utils/formatters';

interface NewOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  activeRate: number;
  onSaveOperation: (movement: InventoryMovement, updatedItem?: InventoryItem) => void;
  onNotify: (msg: string) => void;
}

export const NewOperationModal: React.FC<NewOperationModalProps> = ({
  isOpen,
  onClose,
  inventory,
  activeRate,
  onSaveOperation,
  onNotify,
}) => {
  const [operationType, setOperationType] = useState<'receipt' | 'consumption' | 'waste' | 'adjustment'>('receipt');
  const [selectedItemId, setSelectedItemId] = useState<string>(inventory[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(50);
  const [unitCostUSD, setUnitCostUSD] = useState<number>(0.85);
  const [freightUSD, setFreightUSD] = useState<number>(0);
  const [reference, setReference] = useState<string>('REC-0025');
  const [reason, setReason] = useState<string>('Compra semanal de insumo');
  const [actor, setActor] = useState<string>('emprendedora@lactocost.local');

  // Helper for Establishment Purchase (BCV + IVA 16%)
  const [isEstablishmentPurchase, setIsEstablishmentPurchase] = useState<boolean>(false);
  const [invoiceVES, setInvoiceVES] = useState<number>(0);
  const [stripIVA, setStripIVA] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentItem = inventory.find((i) => i.id === selectedItemId) || inventory[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;
    if (quantity <= 0) {
      onNotify('La cantidad debe ser mayor que cero.');
      return;
    }

    const isPositive = operationType === 'receipt';
    const quantityDelta = isPositive ? quantity : -quantity;
    let finalUnitCostUSD = unitCostUSD;
    let totalCostUSD = quantity * unitCostUSD;
    let updatedItem: InventoryItem | undefined;

    if (operationType === 'receipt') {
      try {
        const cppResult = movingAverageReceipt(
          currentItem.currentStock,
          currentItem.unitCostUSD,
          quantity,
          quantity * unitCostUSD,
          freightUSD,
          0
        );

        finalUnitCostUSD = cppResult.newAverageCost;
        totalCostUSD = cppResult.receiptValue;

        updatedItem = {
          ...currentItem,
          currentStock: cppResult.endingQuantity,
          unitCostUSD: cppResult.newAverageCost,
          status:
            cppResult.endingQuantity <= currentItem.safetyStock
              ? 'bad'
              : cppResult.endingQuantity <= currentItem.minStock
              ? 'warn'
              : 'good',
        };
      } catch (err: unknown) {
        onNotify(`Error calculando CPP: ${(err as Error).message}`);
        return;
      }
    } else {
      if (currentItem.currentStock < quantity) {
        onNotify('Advertencia: El stock en almacén quedaría negativo.');
        return;
      }

      finalUnitCostUSD = currentItem.unitCostUSD;
      totalCostUSD = quantity * finalUnitCostUSD;
      const endingStock = currentItem.currentStock - quantity;

      updatedItem = {
        ...currentItem,
        currentStock: endingStock,
        status:
          endingStock <= currentItem.safetyStock
            ? 'bad'
            : endingStock <= currentItem.minStock
            ? 'warn'
            : 'good',
      };
    }

    const totalCostVES = Math.round((totalCostUSD * activeRate + Number.EPSILON) * 100) / 100;

    const newMovement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      date: 'Hoy · Justo ahora',
      type: operationType === 'receipt' ? 'receipt' : operationType === 'waste' ? 'waste' : 'production_consumption',
      reference: reference.trim() || `OP-${Date.now().toString().slice(-4)}`,
      itemId: currentItem.id,
      itemName: `${operationType === 'receipt' ? 'Recepción' : operationType === 'waste' ? 'Merma' : 'Consumo'} ${currentItem.name}`,
      quantityDelta,
      unit: currentItem.unit,
      unitCostUSD: finalUnitCostUSD,
      totalCostUSD,
      exchangeRateUsed: activeRate,
      totalCostVES,
      status: 'good',
      statusText: 'Registrada',
      actor,
      reason,
    };

    onSaveOperation(newMovement, updatedItem);
    onNotify(
      `Operación registrada: ${currentItem.name} (${quantityDelta > 0 ? `+${quantityDelta}` : quantityDelta} ${currentItem.unit}) por ${moneyUSD(totalCostUSD)} (${moneyVES(totalCostVES)}).`
    );
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Registrar Operación de Almacén</h2>
            <p>Ingresa compras o consumos en dólares con cálculo automático de CPP.</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-field">
            <label>Tipo de movimiento</label>
            <select
              value={operationType}
              onChange={(e) => {
                const t = e.target.value as any;
                setOperationType(t);
                if (t === 'receipt') setReference(`REC-${Math.floor(1000 + Math.random() * 9000)}`);
                else if (t === 'waste') setReference(`MER-${Math.floor(1000 + Math.random() * 9000)}`);
                else setReference(`CON-${Math.floor(1000 + Math.random() * 9000)}`);
              }}
            >
              <option value="receipt">Entrada de compra (+ suma a inventario)</option>
              <option value="consumption">Consumo para lote (- deducción de stock)</option>
              <option value="waste">Merma / Descarte (- producto dañado o vencido)</option>
              <option value="adjustment">Ajuste de inventario físico</option>
            </select>
          </div>

          <div className="form-field">
            <label>Insumo o material</label>
            <select
              value={selectedItemId}
              onChange={(e) => {
                setSelectedItemId(e.target.value);
                const it = inventory.find((i) => i.id === e.target.value);
                if (it) setUnitCostUSD(it.unitCostUSD);
              }}
            >
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.code}) · Stock actual: {item.currentStock} {item.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Establishment Purchase Helper (BCV + IVA) */}
          {operationType === 'receipt' && (
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#1e293b', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={isEstablishmentPurchase}
                    onChange={(e) => setIsEstablishmentPurchase(e.target.checked)}
                  />
                  <span>🛒 Compré en establecimiento (Factura en Bs. con IVA 16% a Tasa Oficial BCV)</span>
                </label>
              </div>

              {isEstablishmentPurchase && (
                <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                      Monto total factura (Bs.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ej. 1250"
                      value={invoiceVES || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setInvoiceVES(val);
                        if (quantity > 0 && activeRate > 0) {
                          const netVES = stripIVA ? val / 1.16 : val;
                          const netUSD = netVES / activeRate / quantity;
                          setUnitCostUSD(Math.round((netUSD + Number.EPSILON) * 1000) / 1000);
                        }
                      }}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '16px' }}>
                    <input
                      type="checkbox"
                      id="stripIVA"
                      checked={stripIVA}
                      onChange={(e) => {
                        setStripIVA(e.target.checked);
                        if (invoiceVES > 0 && quantity > 0 && activeRate > 0) {
                          const netVES = e.target.checked ? invoiceVES / 1.16 : invoiceVES;
                          const netUSD = netVES / activeRate / quantity;
                          setUnitCostUSD(Math.round((netUSD + Number.EPSILON) * 1000) / 1000);
                        }
                      }}
                    />
                    <label htmlFor="stripIVA" style={{ fontSize: '11px', color: '#334155', cursor: 'pointer' }}>
                      Desglosar IVA 16% (Costo base sin impuesto)
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="form-row">
            <div className="form-field">
              <label>Cantidad ({currentItem?.unit})</label>
              <input
                type="number"
                min="0.001"
                step="any"
                required
                value={quantity}
                onChange={(e) => {
                  const q = parseFloat(e.target.value) || 0;
                  setQuantity(q);
                  if (isEstablishmentPurchase && invoiceVES > 0 && q > 0 && activeRate > 0) {
                    const netVES = stripIVA ? invoiceVES / 1.16 : invoiceVES;
                    const netUSD = netVES / activeRate / q;
                    setUnitCostUSD(Math.round((netUSD + Number.EPSILON) * 1000) / 1000);
                  }
                }}
              />
            </div>

            <div className="form-field">
              <label>{operationType === 'receipt' ? 'Costo unitario compra ($ USD)' : 'Costo actual ($ USD)'}</label>
              <input
                type="number"
                min="0"
                step="0.001"
                required
                disabled={operationType !== 'receipt'}
                value={unitCostUSD}
                onChange={(e) => setUnitCostUSD(parseFloat(e.target.value) || 0)}
              />
              <small style={{ color: 'var(--muted)', fontSize: '10px' }}>
                En Bs: {moneyVES(unitCostUSD * activeRate)} / {currentItem?.unit}
              </small>
            </div>
          </div>

          {operationType === 'receipt' && (
            <div className="form-field">
              <label>Flete / Transporte adicional ($ USD)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={freightUSD}
                onChange={(e) => setFreightUSD(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-field">
              <label>Número de factura / Referencia</label>
              <input
                type="text"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Responsable</label>
              <input
                type="text"
                required
                value={actor}
                onChange={(e) => setActor(e.target.value)}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Motivo</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-btn">
              Confirmar Operación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
