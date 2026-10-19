import React from 'react';
import { InventoryItem, ViewId } from '../types';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onNavigate: (view: ViewId) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const criticalItems = inventory.filter((i) => i.currentStock <= i.safetyStock);
  const warningItems = inventory.filter((i) => i.currentStock > i.safetyStock && i.currentStock <= i.minStock);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Centro de alertas operativas</h2>
            <p>Atención prioritaria para evitar paradas de producción y mermas.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">
            ✕
          </button>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {criticalItems.map((item) => (
            <div className="alert" key={item.id} style={{ padding: '12px', background: '#ffebea', borderRadius: '10px' }}>
              <div className="alert-symbol red">!</div>
              <div className="alert-copy">
                <strong style={{ color: '#a84c45' }}>{item.name} · Stock crítico</strong>
                <p>
                  Existencia: {item.currentStock} {item.unit} (Stock de seguridad: {item.safetyStock} {item.unit}). Riesgo inminente de parada.
                </p>
              </div>
              <button
                className="tiny-action"
                style={{ background: '#b84d45', color: '#fff' }}
                onClick={() => {
                  onClose();
                  onNavigate('purchases');
                }}
              >
                Comprar
              </button>
            </div>
          ))}

          {warningItems.map((item) => (
            <div className="alert" key={item.id} style={{ padding: '12px', background: '#fff8e6', borderRadius: '10px' }}>
              <div className="alert-symbol">◷</div>
              <div className="alert-copy">
                <strong style={{ color: '#795a19' }}>{item.name} · Bajo stock mínimo</strong>
                <p>
                  Existencia: {item.currentStock} {item.unit} (Mínimo sugerido: {item.minStock} {item.unit}).
                </p>
              </div>
              <button
                className="tiny-action"
                onClick={() => {
                  onClose();
                  onNavigate('inventory');
                }}
              >
                Ver ítem
              </button>
            </div>
          ))}

          {criticalItems.length === 0 && warningItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)' }}>
              ✓ No hay alertas urgentes pendientes. Todo el inventario se encuentra en niveles saludables.
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: '16px' }}>
          <button className="primary-btn" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
