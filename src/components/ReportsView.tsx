import React, { useState } from 'react';
import { InventoryMovement, InventoryItem, Product, Sale, ViewId } from '../types';
import { moneyUSD, moneyVES, downloadCSV } from '../utils/formatters';
import { calculateTargetPrice } from '../domain/pricing';

interface ReportsViewProps {
  movements: InventoryMovement[];
  inventory: InventoryItem[];
  products: Product[];
  sales: Sale[];
  activeRate: number;
  activeRateName: string;
  onNavigate: (view: ViewId) => void;
  onNotify: (msg: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  movements,
  inventory,
  products,
  sales,
  activeRate,
  activeRateName,
  onNavigate,
  onNotify,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredMovements = movements.filter((m) => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  const exportInventoryCSV = () => {
    const headers = 'Código,Nombre,Categoría,Stock Actual,Unidad,Costo Unit ($),Costo Unit (VES),Valor Total ($),Ubicación,Proveedor\n';
    const rows = inventory
      .map(
        (i) =>
          `"${i.code}","${i.name}","${i.category}",${i.currentStock},"${i.unit}",${i.unitCostUSD},${
            i.unitCostUSD * activeRate
          },${i.currentStock * i.unitCostUSD},"${i.location}","${i.supplier || ''}"`
      )
      .join('\n');
    downloadCSV(`lactocost_inventario_${new Date().toISOString().slice(0, 10)}.csv`, headers + rows);
    onNotify('Inventario exportado como CSV exitosamente.');
  };

  const exportMovementsCSV = () => {
    const headers = 'Fecha,Tipo,Referencia,Insumo,Cantidad,Unidad,Costo Unit ($),Total ($),Tasa Aplicada,Total (VES),Operador,Motivo\n';
    const rows = movements
      .map(
        (m) =>
          `"${m.date}","${m.type}","${m.reference}","${m.itemName}",${m.quantityDelta},"${m.unit}",${m.unitCostUSD},${m.totalCostUSD},${m.exchangeRateUsed},${m.totalCostVES},"${m.actor}","${m.reason}"`
      )
      .join('\n');
    downloadCSV(`lactocost_operaciones_${new Date().toISOString().slice(0, 10)}.csv`, headers + rows);
    onNotify('Historial de operaciones exportado como CSV exitosamente.');
  };

  const exportPricingCSV = () => {
    const headers = 'Producto,Formato,Costo Base ($),Margen (%),Precio Sugerido ($),Precio en Bolívares (VES),Tasa Referencia\n';
    const rows = products
      .map((p) => {
        const calc = calculateTargetPrice(p.costUSD, p.targetMargin, { exchangeRate: activeRate });
        return `"${p.name}","${p.format}",${p.costUSD},${p.targetMargin},${calc.netPriceUSD},${calc.netPriceVES},"${activeRateName}"`;
      })
      .join('\n');
    downloadCSV(`lactocost_precios_${new Date().toISOString().slice(0, 10)}.csv`, headers + rows);
    onNotify('Catálogo de precios y rentabilidad exportado como CSV.');
  };

  const exportSalesCSV = () => {
    const headers = 'ID Venta,Fecha,Cliente,Total ($),Tasa Aplicada,Tipo Tasa,Total (VES),Método de Pago,Notas\n';
    const rows = sales
      .map(
        (s) =>
          `"${s.id}","${s.date}","${s.clientName}",${s.totalUSD},${s.rateApplied},"${s.rateType}",${s.totalVES},"${s.paymentMethod}","${s.notes || ''}"`
      )
      .join('\n');
    downloadCSV(`lactocost_ventas_${new Date().toISOString().slice(0, 10)}.csv`, headers + rows);
    onNotify('Historial de ventas exportado como CSV exitosamente.');
  };

  return (
    <section className="view-state active" id="view-reports">
      <div className="card panel">
        <div className="panel-title">
          <div>
            <h2 style={{ margin: 0, fontSize: '19px' }}>Informes y Auditoría de Operaciones</h2>
            <p>
              Trazabilidad en <b>Dólares ($ USD)</b> y <b>Bolívares</b> al cambio de {activeRateName} ({moneyVES(activeRate)}).
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="ghost-btn" onClick={exportInventoryCSV}>
              ↓ CSV Inventario
            </button>
            <button className="ghost-btn" onClick={exportPricingCSV}>
              ↓ CSV Precios
            </button>
            <button className="ghost-btn" onClick={exportSalesCSV}>
              ↓ CSV Ventas
            </button>
            <button className="primary-btn" onClick={exportMovementsCSV}>
              ↓ CSV Operaciones
            </button>
          </div>
        </div>

        <div className="pricing-intro" style={{ background: '#f5faf4', borderColor: '#d0ebd5' }}>
          <div className="insight-icon" style={{ background: '#d6fb72', color: 'var(--deep)' }}>
            ▤
          </div>
          <div>
            <strong>Transparencia contable en doble moneda</strong>
            <p>
              Cada informe refleja el valor en dólares como base de reposición y su contrapartida en bolívares calculada
              según la tasa del día de la operación.
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
              Mostrando {filteredMovements.length} movimientos
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
                  <th>Costo ($)</th>
                  <th>Total ($)</th>
                  <th>Total (Bs)</th>
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
                    <td>{moneyUSD(m.unitCostUSD)}</td>
                    <td>
                      <b>{moneyUSD(m.totalCostUSD)}</b>
                    </td>
                    <td>
                      <small style={{ color: '#5b6b60' }}>{moneyVES(m.totalCostVES)}</small>
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
