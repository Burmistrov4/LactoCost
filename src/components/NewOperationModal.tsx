import React, { useState } from 'react';
import { InventoryItem, InventoryMovement } from '../types';
import { movingAverageReceipt } from '../domain/costing';

interface NewOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onSaveOperation: (movement: InventoryMovement, updatedItem?: InventoryItem) => void;
  onNotify: (msg: string) => void;
}

export const NewOperationModal: React.FC<NewOperationModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onSaveOperation,
  onNotify,
}) => {
  const [operationType, setOperationType] = useState<'receipt' | 'consumption' | 'waste' | 'adjustment'>('receipt');
  const [selectedItemId, setSelectedItemId] = useState<string>(inventory[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(100);
  const [unitCost, setUnitCost] = useState<number>(38.5);
  const [freightCharges, setFreightCharges] = useState<number>(0);
  const [reference, setReference] = useState<string>('REC-0025');
  const [reason, setReason] = useState<string>('Recepción ordinaria de proveedor');
  const [actor, setActor] = useState<string>('operador@lactocost.local');

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
    let finalUnitCost = unitCost;
    let totalCost = quantity * unitCost;
    let updatedItem: InventoryItem | undefined;

    if (operationType === 'receipt') {
      // Apply moving average receipt calculation
      try {
        const cppResult = movingAverageReceipt(
          currentItem.currentStock,
          currentItem.unitCost,
          quantity,
          quantity * unitCost,
          freightCharges,
          0
        );

        finalUnitCost = cppResult.newAverageCost;
        totalCost = cppResult.receiptValue;

        updatedItem = {
          ...currentItem,
          currentStock: cppResult.endingQuantity,
          unitCost: cppResult.newAverageCost,
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
      // Consumption or waste
      if (currentItem.currentStock < quantity) {
        onNotify('Advertencia: El stock resultante quedaría en saldo negativo.');
        return;
      }

      finalUnitCost = currentItem.unitCost;
      totalCost = quantity * finalUnitCost;
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

    const newMovement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      date: 'Hoy · Justo ahora',
      type: operationType === 'receipt' ? 'receipt' : operationType === 'waste' ? 'waste' : 'production_consumption',
      reference: reference.trim() || `OP-${Date.now().toString().slice(-4)}`,
      itemId: currentItem.id,
      itemName: `${operationType === 'receipt' ? 'Recepción' : operationType === 'waste' ? 'Merma' : 'Consumo'} ${currentItem.name}`,
      quantityDelta,
      unit: currentItem.unit,
      unitCost: finalUnitCost,
      totalCost,
      currency: currentItem.currency,
      status: 'good',
      statusText: 'Registrada',
      actor,
      reason,
    };

    onSaveOperation(newMovement, updatedItem);
    onNotify(`Operación registrada exitosamente: ${currentItem.name} (${quantityDelta > 0 ? `+${quantityDelta}` : quantityDelta} ${currentItem.unit}).`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Registrar nueva operación</h2>
            <p>Movimiento de inventario con integración automática a costos y CPP.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-field">
            <label>Tipo de operación</label>
            <select
              value={operationType}
              onChange={(e) => {
                const t = e.target.value as 'receipt' | 'consumption' | 'waste' | 'adjustment';
                setOperationType(t);
                if (t === 'receipt') setReference(`REC-${Math.floor(1000 + Math.random() * 9000)}`);
                else if (t === 'waste') setReference(`MER-${Math.floor(1000 + Math.random() * 9000)}`);
                else setReference(`CON-${Math.floor(1000 + Math.random() * 9000)}`);
              }}
            >
              <option value="receipt">Recepción de compra (+ entrada a CPP)</option>
              <option value="consumption">Consumo para producción (- salida a CPP vigente)</option>
              <option value="waste">Merma / Descarte (- salida sin valorizar)</option>
              <option value="adjustment">Ajuste de inventario físico</option>
            </select>
          </div>

          <div className="form-field">
            <label>Insumo o material</label>
            <select
              value={selectedItemId}
              onChange={(e) => {
                setSelectedItemId(e.target.value);
                const item = inventory.find((i) => i.id === e.target.value);
                if (item) setUnitCost(item.unitCost);
              }}
            >
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.code}) · Actual: {item.currentStock} {item.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Cantidad ({currentItem?.unit})</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="form-field">
              <label>
                {operationType === 'receipt' ? 'Costo unitario compra (Bs.)' : 'CPP vigente (Bs.)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                disabled={operationType !== 'receipt'}
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {operationType === 'receipt' && (
            <div className="form-field">
              <label>Cargos atribuibles adicionales (Flete / Embalaje en Bs.)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={freightCharges}
                onChange={(e) => setFreightCharges(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-field">
              <label>Código de referencia / Documento</label>
              <input
                type="text"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Operador responsable</label>
              <input
                type="text"
                required
                value={actor}
                onChange={(e) => setActor(e.target.value)}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Motivo o justificación</label>
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
              Confirmar y aplicar movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
