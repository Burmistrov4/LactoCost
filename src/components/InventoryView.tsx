import React, { useState } from 'react';
import { InventoryItem, ViewId, DisplayCurrencyMode } from '../types';
import { moneyUSD, moneyVES } from '../utils/formatters';

interface InventoryViewProps {
  inventory: InventoryItem[];
  activeRate: number;
  activeRateName: string;
  currencyMode: DisplayCurrencyMode;
  onSaveItem: (item: InventoryItem) => void;
  onDeleteItem: (itemId: string) => void;
  onOpenNewOperation: () => void;
  onOpenPackagingGuide?: () => void;
  onNavigate: (view: ViewId) => void;
  onNotify: (msg: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  activeRate,
  activeRateName,
  onSaveItem,
  onDeleteItem,
  onOpenNewOperation,
  onOpenPackagingGuide,
  onNavigate,
  onNotify,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form state
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [category, setCategory] = useState<'lácteo' | 'ingrediente' | 'empaque' | 'insumo'>('lácteo');
  const [unit, setUnit] = useState<string>('L');
  const [currentStock, setCurrentStock] = useState<number>(50);
  const [minStock, setMinStock] = useState<number>(30);
  const [safetyStock, setSafetyStock] = useState<number>(15);
  const [unitCostUSD, setUnitCostUSD] = useState<number>(0.85);
  const [location, setLocation] = useState<string>('Cava 1');
  const [supplier, setSupplier] = useState<string>('');

  const openCreateModal = () => {
    setEditingItem(null);
    setName('');
    setCode(`INS-00${inventory.length + 1}`);
    setCategory('lácteo');
    setUnit('L');
    setCurrentStock(50);
    setMinStock(30);
    setSafetyStock(15);
    setUnitCostUSD(1.0);
    setLocation('Cava 1 - Refrigeración');
    setSupplier('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setCode(item.code);
    setCategory(item.category);
    setUnit(item.unit);
    setCurrentStock(item.currentStock);
    setMinStock(item.minStock);
    setSafetyStock(item.safetyStock);
    setUnitCostUSD(item.unitCostUSD);
    setLocation(item.location);
    setSupplier(item.supplier || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onNotify('Por favor introduce el nombre del insumo.');
      return;
    }

    const newItem: InventoryItem = {
      id: editingItem ? editingItem.id : `ing-${Date.now()}`,
      code: code.trim() || `INS-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      category,
      unit: unit.trim(),
      currentStock,
      minStock,
      safetyStock,
      unitCostUSD,
      location: location.trim(),
      supplier: supplier.trim(),
      status:
        currentStock <= safetyStock ? 'bad' : currentStock <= minStock ? 'warn' : 'good',
    };

    onSaveItem(newItem);
    setIsModalOpen(false);
    onNotify(editingItem ? `Insumo "${newItem.name}" actualizado.` : `¡Insumo "${newItem.name}" agregado al almacén!`);
  };

  const handleDelete = (id: string, itemName: string) => {
    if (confirm(`¿Estás segura de eliminar "${itemName}" del inventario?`)) {
      onDeleteItem(id);
      onNotify(`Insumo "${itemName}" eliminado.`);
    }
  };

  const filteredItems = inventory.filter((item) => {
    const matchesCategory = filterCategory === 'todos' || item.category === filterCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalStockValueUSD = inventory.reduce((acc, item) => acc + item.currentStock * item.unitCostUSD, 0);

  return (
    <section className="view-state active" id="view-inventory">
      <div className="card panel">
        <div className="panel-title">
          <div>
            <h2 style={{ margin: 0, fontSize: '19px' }}>Almacén e Inventario de Insumos (CRUD)</h2>
            <p>
              Control físico de materias primas, leche, envases y frutas. Costos valorados en <b>Dólares ($ USD)</b> y convertidos a Bolívares con {activeRateName} ({moneyVES(activeRate)}).
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="ghost-btn" onClick={openCreateModal}>
              <span>＋</span> <span>Nuevo Insumo</span>
            </button>
            <button className="primary-btn" onClick={onOpenNewOperation}>
              <span>📦</span> <span>Registrar Entrada / Compra</span>
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
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="search"
              placeholder="Buscar por código, nombre o proveedor…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="margin-input"
              style={{ width: '260px', padding: '7px 12px', fontSize: '12px' }}
            />
            <div style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
              Valor en almacén: <b>{moneyUSD(totalStockValueUSD)}</b> ({moneyVES(totalStockValueUSD * activeRate)})
            </div>
          </div>
        </div>

        {filterCategory === 'empaque' && (
          <div
            style={{
              marginTop: '14px',
              padding: '12px 16px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '12.5px', color: '#166534', flex: 1, minWidth: '240px' }}>
              💡 <b>¿Buscando los "potes de arroz chino" para yogurt en La Candelaria?</b> Nombre comercial: <b>Tina redonda traslúcida de Polipropileno (PP Nº 5) con tapa hermética</b> (8 oz / 16 oz). Comprar en fardos de 500u baja tu costo a ~$0.12 - $0.14.
            </div>
            {onOpenPackagingGuide && (
              <button
                type="button"
                onClick={onOpenPackagingGuide}
                style={{
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                🍶 Ver Guía de Potes ↗
              </button>
            )}
          </div>
        )}

        <div className="table-wrap" style={{ marginTop: '16px' }}>
          <table>
            <thead>
              <tr>
                <th>Código / Insumo</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Mínimo / Seguridad</th>
                <th>Costo Unitario ($)</th>
                <th>En Bolívares</th>
                <th>Valor Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const totalItemUSD = item.currentStock * item.unitCostUSD;
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
                          <small>{item.code} {item.supplier ? `· ${item.supplier}` : ''}</small>
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
                        Mín: {item.minStock} {item.unit}
                      </span>
                    </td>
                    <td>
                      <b>{moneyUSD(item.unitCostUSD)}</b> / {item.unit}
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', color: '#55665b' }}>
                        {moneyVES(item.unitCostUSD * activeRate)}
                      </span>
                    </td>
                    <td>
                      <strong>{moneyUSD(totalItemUSD)}</strong>
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
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          type="button"
                          className="tiny-action"
                          onClick={() => openEditModal(item)}
                          title="Editar insumo"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="tiny-action"
                          style={{ color: '#b84d45' }}
                          onClick={() => handleDelete(item.id, item.name)}
                          title="Eliminar insumo"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal CRUD Insumo */}
        {isModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)} role="dialog" aria-modal="true">
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>{editingItem ? 'Editar Insumo' : 'Nuevo Insumo / Materia Prima'}</h2>
                  <p>Registra leche, fermentos, frutas o envases en tu almacén.</p>
                </div>
                <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-row">
                  <div className="form-field">
                    <label>Nombre del insumo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Leche entera pasteurizada"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label>Código interno</label>
                    <input
                      type="text"
                      placeholder="Ej. INS-001"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Categoría</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                    >
                      <option value="lácteo">Lácteo (leche, crema, leche condensada)</option>
                      <option value="ingrediente">Ingrediente (azúcar, frutas, huevos)</option>
                      <option value="empaque">Empaque (envases, tapas, etiquetas)</option>
                      <option value="insumo">Insumo (cultivos, cuajo, sanitizantes)</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Unidad de medida *</label>
                    <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                      <option value="L">Litros (L)</option>
                      <option value="kg">Kilogramos (kg)</option>
                      <option value="unid">Unidades (unid)</option>
                      <option value="sob">Sobres / Sachets</option>
                      <option value="cartón">Cartón (huevos)</option>
                      <option value="lata">Lata</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Stock actual en almacén *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      value={currentStock}
                      onChange={(e) => setCurrentStock(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-field">
                    <label>Costo unitario ($ USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={unitCostUSD}
                      onChange={(e) => setUnitCostUSD(parseFloat(e.target.value) || 0)}
                    />
                    <small style={{ color: 'var(--muted)', fontSize: '10px' }}>
                      En Bs: {moneyVES(unitCostUSD * activeRate)} / {unit}
                    </small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Stock mínimo de alerta</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={minStock}
                      onChange={(e) => setMinStock(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-field">
                    <label>Stock de seguridad</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={safetyStock}
                      onChange={(e) => setSafetyStock(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Ubicación física en taller</label>
                    <input
                      type="text"
                      placeholder="Ej. Cava 1, Nevera reactivos, Estante 2"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label>Proveedor habitual</label>
                    <input
                      type="text"
                      placeholder="Ej. Finca La Pradera"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="ghost-btn" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="primary-btn">
                    {editingItem ? 'Guardar Cambios' : 'Registrar Insumo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
