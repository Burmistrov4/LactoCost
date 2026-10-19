import React, { useState } from 'react';
import { InventoryItem, ViewId } from '../types';
import { money } from '../utils/formatters';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onOpenNewOperation: () => void;
  onNavigate: (view: ViewId) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onOpenNewOperation,
  onNavigate,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredItems = inventory.filter((item) => {
    const matchesCategory = filterCategory === 'todos' || item.category === filterCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalStockValue = inventory.reduce((acc, item) => acc + item.currentStock * item.unitCost, 0);

  return (
    <section className="view-state active" id="view-inventory">
      <div className="card panel">
        <div className="panel-title">
          <div>
            <h2 style={{ margin: 0, fontSize: '19px' }}>Inventario de insumos y materiales</h2>
            <p>Control físico, stock mínimo, almacén y costo promedio ponderado (CPP) por ítem.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="primary-btn" onClick={onOpenNewOperation}>
              <span>＋</span> <span>Registrar movimiento</span>
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginTop: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div className="range">
            <button
              className={filterCategory === 'todos' ? 'active' : ''}
              onClick={() => setFilterCategory('todos')}
            >
              Todos ({inventory.length})
            </button>
            <button
              className={filterCategory === 'lácteo' ? 'active' : ''}
              onClick={() => setFilterCategory('lácteo')}
            >
              Lácteos
            </button>
            <button
              className={filterCategory === 'ingrediente' ? 'active' : ''}
              onClick={() => setFilterCategory('ingrediente')}
            >
              Ingredientes
            </button>
            <button
              className={filterCategory === 'empaque' ? 'active' : ''}
              onClick={() => setFilterCategory('empaque')}
            >
              Empaques
            </button>
            <button
              className={filterCategory === 'insumo' ? 'active' : ''}
              onClick={() => setFilterCategory('insumo')}
            >
              Insumos
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="search"
              placeholder="Buscar por código, nombre o ubicación…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="margin-input"
              style={{ width: '280px', padding: '7px 12px', fontSize: '12px' }}
            />
            <div style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
              Valor total: <b>{money(totalStockValue)}</b>
            </div>
          </div>
        </div>

        <div className="table-wrap" style={{ marginTop: '16px' }}>
          <table>
            <thead>
              <tr>
                <th>Código / Insumo</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Mínimo / Seguridad</th>
                <th>Ubicación</th>
                <th>Costo Unitario (CPP)</th>
                <th>Valor Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const itemTotal = item.currentStock * item.unitCost;
                const isUnderMin = item.currentStock <= item.minStock;
                const isUnderSafety = item.currentStock <= item.safetyStock;

                return (
                  <tr key={item.id}>
                    <td>
                      <div className="product">
                        <div className="product-icon">
                          {item.category === 'lácteo'
                            ? '🥛'
                            : item.category === 'empaque'
                            ? '📦'
                            : item.category === 'ingrediente'
                            ? '🍓'
                            : '🧪'}
                        </div>
                        <div>
                          <b>{item.name}</b>
                          <small>{item.code}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          textTransform: 'capitalize',
                          background: '#f1f5ee',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '13px' }}>
                        {item.currentStock} {item.unit}
                      </strong>
                    </td>
                    <td>
                      <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
                        Mín: {item.minStock} {item.unit} · Seg: {item.safetyStock} {item.unit}
                      </span>
                    </td>
                    <td>{item.location}</td>
                    <td>
                      <b>{money(item.unitCost, item.currency)}</b> / {item.unit}
                    </td>
                    <td>
                      <strong>{money(itemTotal, item.currency)}</strong>
                    </td>
                    <td>
                      {isUnderSafety ? (
                        <span className="status bad">Crítico</span>
                      ) : isUnderMin ? (
                        <span className="status warn">Bajo mínimo</span>
                      ) : (
                        <span className="status good">Saludable</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="primary-btn" onClick={() => onNavigate('dashboard')}>
            Volver al dashboard
          </button>
          <button className="ghost-btn" onClick={() => onNavigate('purchases')}>
            Ver compras sugeridas ↗
          </button>
        </div>
      </div>
    </section>
  );
};
