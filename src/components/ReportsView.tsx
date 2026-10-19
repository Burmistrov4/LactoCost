import React, { useState } from 'react';
import { InventoryMovement, InventoryItem, Product, ViewId } from '../types';
import { money, downloadCSV } from '../utils/formatters';
import { calculateTargetPrice } from '../domain/pricing';

interface ReportsViewProps {
  movements: InventoryMovement[];
  inventory: InventoryItem[];
  products: Product[];
  onNavigate: (view: ViewId) => void;
  onNotify: (msg: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  movements,
  inventory,
  products,
  onNavigate,
  onNotify,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredMovements = movements.filter((m) => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  const exportInventoryCSV = () => {
    const headers = 'Código,Nombre,Categoría,Stock Actual,Unidad,CPP (VES),Valor Total (VES),Ubicación\n';
    const rows = inventory
      .map(
        (i) =>
          `"${i.code}","${i.name}","${i.category}",${i.currentStock},"${i.unit}",${i.unitCost},${
            i.currentStock * i.unitCost
          },"${i.location}"`
      )
      .join('\n');
    downloadCSV(`lactocost_inventario_${new Date().toISOString().slice(0, 10)}.csv`, headers + rows);
    onNotify('Inventario exportado como CSV exitosamente.');
  };

  const exportMovementsCSV = () => {
    const headers = 'Fecha,Tipo,Referencia,Insumo,Cantidad,Unidad,Costo Unitario,Total,Moneda,Operador,Motivo\n';
    const rows = movements
      .map(
        (m) =>
          `"${m.date}","${m.type}","${m.reference}","${m.itemName}",${m.quantityDelta},"${m.unit}",${m.unitCost},${m.totalCost},"${m.currency}","${m.actor}","${m.reason}"`
      )
      .join('\n');
    downloadCSV(`lactocost_operaciones_${new Date().toISOString().slice(0, 10)}.csv`, headers + rows);
    onNotify('Historial de operaciones exportado como CSV exitosamente.');
  };

  const exportPricingCSV = () => {
    const headers = 'Producto,Formato,Costo Variable (VES),Margen Objetivo (%),Precio Neto Sugerido (VES),IVA (%),Precio Cliente (VES)\n';
    const rows = products
      .map((p) => {
        const calc = calculateTargetPrice(p.cost, p.targetMargin, {
          taxRatePercent: p.taxRate || 0,
        });
        return `"${p.name}","${p.format}",${p.cost},${p.targetMargin},${calc.netPrice},${p.taxRate || 0},${calc.customerPrice}`;
      })
      .join('\n');
    downloadCSV(`lactocost_precios_${new Date().toISOString().slice(0, 10)}.csv`, headers + rows);
    onNotify('Catálogo de precios y rentabilidad exportado como CSV.');
  };

  return (
    <section className="view-state active" id="view-reports">
      <div className="card panel">
        <div className="panel-title">
          <div>
            <h2 style={{ margin: 0, fontSize: '19px' }}>Informes y auditoría de operaciones</h2>
            <p>
              Trazabilidad de movimientos de almacén, valoraciones a costo promedio y exportación en formatos estándar.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="ghost-btn" onClick={exportInventoryCSV}>
              ↓ CSV Inventario
            </button>
            <button className="ghost-btn" onClick={exportPricingCSV}>
              ↓ CSV Precios
            </button>
            <button className="primary-btn" onClick={exportMovementsCSV}>
              ↓ CSV Operaciones
            </button>
          </div>
        </div>

        <div className="pricing-intro">
          <div className="insight-icon" style={{ background: '#d6eeb9', flex: 'none' }}>
            ▤
          </div>
          <div>
            <strong>Pistas de auditoría inmutables</strong>
            <p>
              Cada recepción, consumo en lote o ajuste físico conserva el identificador de operación, la fecha y hora,
              el operador responsable y la moneda de valoración utilizada.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div className="range">
              <button
                className={filterType === 'all' ? 'active' : ''}
                onClick={() => setFilterType('all')}
              >
                Todos ({movements.length})
              </button>
              <button
                className={filterType === 'receipt' ? 'active' : ''}
                onClick={() => setFilterType('receipt')}
              >
                Recepciones
              </button>
              <button
                className={filterType === 'production_consumption' ? 'active' : ''}
                onClick={() => setFilterType('production_consumption')}
              >
                Consumos Lote
              </button>
              <button
                className={filterType === 'production_output' ? 'active' : ''}
                onClick={() => setFilterType('production_output')}
              >
                Salidas Lote
              </button>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Mostrando {filteredMovements.length} registros
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Referencia</th>
                  <th>Descripción / Ítem</th>
                  <th>Variación Cantidad</th>
                  <th>Costo Unit.</th>
                  <th>Importe Total</th>
                  <th>Operador</th>
                  <th>Motivo / Lote</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <small style={{ color: 'var(--muted)' }}>{m.date}</small>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '3px 6px',
                          borderRadius: '5px',
                          background:
                            m.type === 'receipt'
                              ? '#e9f6ed'
                              : m.type === 'production_output'
                              ? '#eff5e7'
                              : '#f4f6f3',
                          color:
                            m.type === 'receipt'
                              ? '#26785c'
                              : m.type === 'production_output'
                              ? '#42652e'
                              : '#495a51',
                        }}
                      >
                        {m.type === 'receipt'
                          ? 'RECEPCIÓN'
                          : m.type === 'production_consumption'
                          ? 'CONSUMO'
                          : m.type === 'production_output'
                          ? 'PRODUCCIÓN'
                          : 'AJUSTE'}
                      </span>
                    </td>
                    <td>
                      <b>{m.reference}</b>
                    </td>
                    <td>{m.itemName}</td>
                    <td>
                      <strong style={{ color: m.quantityDelta > 0 ? '#26785c' : '#bd5e4e' }}>
                        {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta} {m.unit}
                      </strong>
                    </td>
                    <td>{money(m.unitCost, m.currency)}</td>
                    <td>
                      <b>{money(m.totalCost, m.currency)}</b>
                    </td>
                    <td>
                      <small style={{ color: '#687870' }}>{m.actor}</small>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', color: '#55655c' }}>{m.reason}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button className="primary-btn" onClick={() => onNavigate('dashboard')}>
            Volver al dashboard
          </button>
        </div>
      </div>
    </section>
  );
};
