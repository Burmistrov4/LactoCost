import React, { useState } from 'react';
import { Product, ViewId, DisplayCurrencyMode } from '../types';
import { moneyUSD, moneyVES, formatPercent } from '../utils/formatters';
import { calculateTargetPrice } from '../domain/pricing';

interface ProductsCRUDViewProps {
  products: Product[];
  activeRate: number;
  activeRateName: string;
  currencyMode: DisplayCurrencyMode;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onNavigate: (view: ViewId) => void;
  onNotify: (msg: string) => void;
}

const EMOJI_OPTIONS = [
  '🥛', '🥣', '🍮', '🍞', '🍰', '🧁', '🍨', '🥤',
  '🍓', '🍑', '🫐', '🥭', '🍫', '🍯', '🥥', '🥧',
  '🍪', '🧈', '🧀', '🥞', '🧇', '🍒', '🍋', '🍶'
];

const PRODUCT_PRESETS = [
  {
    name: 'Torta de Pan Tradicional (Porción)',
    emoji: '🍞',
    format: 'Porción 200 g',
    costUSD: 0.85,
    targetMargin: 40,
    category: 'reposteria' as const,
    channel: 'Directo al cliente',
    description: 'Torta de pan casera tradicional venezolana con caramelo dorado, pasas y toque de canela.',
  },
  {
    name: 'Torta de Pan Entera (Molde Grande)',
    emoji: '🍞',
    format: 'Molde 16 porciones',
    costUSD: 7.20,
    targetMargin: 40,
    category: 'reposteria' as const,
    channel: 'Pedidos semanales',
    description: 'Molde completo de torta de pan acaramelada para encargos o familias.',
  },
  {
    name: 'Quesillo Tradicional Casero',
    emoji: '🍮',
    format: 'Porción individual (180 g)',
    costUSD: 1.25,
    targetMargin: 35,
    category: 'quesillo' as const,
    channel: 'Directo al cliente',
    description: 'Quesillo venezolano con caramelo dorado y leche condensada de primera.',
  },
  {
    name: 'Yogurt Griego Familiar (500 g)',
    emoji: '🫐',
    format: 'Envase familiar de 500 g',
    costUSD: 2.10,
    targetMargin: 38,
    category: 'yogurt' as const,
    channel: 'Directo al cliente',
    description: 'Yogurt griego espeso doble filtrado sin espesantes.',
  },
  {
    name: 'Dulce de Leche / Arequipe Casero',
    emoji: '🍯',
    format: 'Frasco 250 g',
    costUSD: 1.40,
    targetMargin: 40,
    category: 'derivado' as const,
    channel: 'Directo al cliente',
    description: 'Arequipe artesanal a fuego lento con leche fresca de finca.',
  },
];

export const ProductsCRUDView: React.FC<ProductsCRUDViewProps> = ({
  products,
  activeRate,
  activeRateName,
  currencyMode,
  onSaveProduct,
  onDeleteProduct,
  onNavigate,
  onNotify,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [name, setName] = useState<string>('');
  const [emoji, setEmoji] = useState<string>('🥣');
  const [format, setFormat] = useState<string>('Envase de 200 g');
  const [costUSD, setCostUSD] = useState<number>(1.0);
  const [targetMargin, setTargetMargin] = useState<number>(35);
  const [channel, setChannel] = useState<string>('Directo al cliente');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<'yogurt' | 'quesillo' | 'reposteria' | 'derivado'>('yogurt');

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setEmoji('🥣');
    setFormat('Envase de 200 g');
    setCostUSD(1.0);
    setTargetMargin(35);
    setChannel('Directo al cliente');
    setDescription('');
    setCategory('yogurt');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setEmoji(prod.emoji);
    setFormat(prod.format);
    setCostUSD(prod.costUSD);
    setTargetMargin(prod.targetMargin);
    setChannel(prod.channel || 'Directo al cliente');
    setDescription(prod.description || '');
    setCategory(prod.category || 'yogurt');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onNotify('Por favor escribe el nombre del producto.');
      return;
    }
    if (costUSD < 0) {
      onNotify('El costo en dólares no puede ser negativo.');
      return;
    }
    if (targetMargin < 0 || targetMargin >= 100) {
      onNotify('El margen debe estar entre 0% y 99%.');
      return;
    }

    const newProd: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      emoji,
      name: name.trim(),
      format: format.trim(),
      costUSD,
      defaultMargin: targetMargin,
      targetMargin,
      channel,
      description: description.trim(),
      category,
      variableFeeRate: editingProduct?.variableFeeRate || 0,
      fixedVariableCostUSD: editingProduct?.fixedVariableCostUSD || 0.05,
      taxRate: editingProduct?.taxRate || 0,
    };

    onSaveProduct(newProd);
    setIsModalOpen(false);
    onNotify(
      editingProduct
        ? `Producto "${newProd.name}" actualizado con éxito.`
        : `¡Producto "${newProd.name}" agregado a tu catálogo!`
    );
  };

  const handleDelete = (id: string, prodName: string) => {
    if (products.length <= 1) {
      onNotify('Debes mantener al menos un producto en tu catálogo.');
      return;
    }
    if (confirm(`¿Estás segura de eliminar "${prodName}" de tu catálogo?`)) {
      onDeleteProduct(id);
      onNotify(`Producto "${prodName}" eliminado.`);
    }
  };

  return (
    <section className="view-state active" id="view-products">
      <div className="card panel">
        <div className="panel-title">
          <div>
            <h2 style={{ margin: 0, fontSize: '19px' }}>Catálogo de Productos para la Emprendedora</h2>
            <p>
              Gestiona tus derivados lácteos. Define tus costos en <b>Dólares ($ USD)</b> y calcula
              automáticamente el precio en <b>Bolívares</b> con tu tasa preferida ({activeRateName}: {moneyVES(activeRate)}).
            </p>
          </div>
          <button className="primary-btn" onClick={openCreateModal}>
            <span>＋</span> <span>Nuevo Producto</span>
          </button>
        </div>

        {/* Motivational banner for entrepreneur */}
        <div className="pricing-intro" style={{ background: '#f5faf4', borderColor: '#d0ebd5' }}>
          <div className="insight-icon" style={{ background: '#d6fb72', color: 'var(--deep)' }}>
            ✨
          </div>
          <div>
            <strong>Consejo para emprender con rentabilidad</strong>
            <p>
              Tener tus costos bien calculados en dólares te permite no perder dinero ante la inflación.
              Si cambias la tasa de cobro en mostrador (Tasa Euro o Binance P2P), tus precios en Bolívares se adaptan
              sin que tengas que recalcular a mano.
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="crud-grid">
          {products.map((prod) => {
            const pricing = calculateTargetPrice(prod.costUSD, prod.targetMargin, {
              exchangeRate: activeRate,
              fixedVariableCostUSD: prod.fixedVariableCostUSD || 0.05,
            });

            return (
              <article className="crud-card" key={prod.id}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '28px', lineHeight: 1 }}>{prod.emoji}</span>
                      <div>
                        <strong style={{ fontSize: '14px', display: 'block' }}>{prod.name}</strong>
                        <small style={{ color: 'var(--muted)' }}>{prod.format}</small>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>{prod.channel || 'Directo'}</span>
                  </div>

                  {prod.description && (
                    <p style={{ fontSize: '11px', color: '#5b6b60', margin: '8px 0', lineHeight: 1.45 }}>
                      {prod.description}
                    </p>
                  )}

                  <div style={{ background: '#f8faf7', borderRadius: '10px', padding: '10px', marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <small style={{ color: 'var(--muted)', fontSize: '10px', display: 'block' }}>Costo Base ($)</small>
                      <strong style={{ fontSize: '13px' }}>{moneyUSD(prod.costUSD)}</strong>
                      <span style={{ fontSize: '10px', color: '#748378', display: 'block' }}>
                        {moneyVES(prod.costUSD * activeRate)}
                      </span>
                    </div>

                    <div>
                      <small style={{ color: 'var(--muted)', fontSize: '10px', display: 'block' }}>Margen Objetivo</small>
                      <strong style={{ fontSize: '13px', color: '#26785c' }}>
                        {formatPercent(prod.targetMargin)}
                      </strong>
                      <span style={{ fontSize: '10px', color: '#748378', display: 'block' }}>
                        Ganancia: {moneyUSD(pricing.contributionUSD)}
                      </span>
                    </div>
                  </div>

                  <div className="price-result" style={{ marginTop: '10px', padding: '10px 12px' }}>
                    <small style={{ fontSize: '9px', color: '#cde1d3' }}>Precio de venta sugerido al cliente</small>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '3px' }}>
                      <strong style={{ fontSize: '20px', color: 'var(--lime)', margin: 0 }}>
                        {currencyMode === 'VES' ? moneyVES(pricing.netPriceVES) : moneyUSD(pricing.netPriceUSD)}
                      </strong>
                      {currencyMode === 'BOTH' && (
                        <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                          {moneyVES(pricing.netPriceVES)}
                        </span>
                      )}
                    </div>
                    <small style={{ fontSize: '9px', color: '#cde1d3', marginTop: '2px' }}>
                      Calculado a tasa {activeRateName}
                    </small>
                  </div>
                </div>

                <div className="crud-actions">
                  <button
                    type="button"
                    className="crud-btn-edit"
                    onClick={() => openEditModal(prod)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    type="button"
                    className="crud-btn-delete"
                    onClick={() => handleDelete(prod.id, prod.name)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Modal CRUD Product */}
        {isModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)} role="dialog" aria-modal="true">
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto Lácteo'}</h2>
                  <p>Define costos en dólares y márgenes para tu negocio.</p>
                </div>
                <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-field">
                  <label>Ícono / Emoji representativo</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {EMOJI_OPTIONS.map((em) => (
                      <button
                        type="button"
                        key={em}
                        onClick={() => setEmoji(em)}
                        style={{
                          fontSize: '22px',
                          border: emoji === em ? '2px solid #26785c' : '1px solid var(--line)',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          background: emoji === em ? '#e9f6ed' : 'white',
                        }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {!editingProduct && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      ⚡ Plantillas sugeridas (haz clic para auto-llenar):
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {PRODUCT_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setName(preset.name);
                            setEmoji(preset.emoji);
                            setFormat(preset.format);
                            setCostUSD(preset.costUSD);
                            setTargetMargin(preset.targetMargin);
                            setCategory(preset.category);
                            setChannel(preset.channel);
                            setDescription(preset.description);
                          }}
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 650,
                            padding: '4px 9px',
                            background: 'white',
                            border: '1px solid #86efac',
                            borderRadius: '7px',
                            color: '#14532d',
                            cursor: 'pointer',
                          }}
                        >
                          {preset.emoji} {preset.name.split(' (')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Emoji Selector */}
                <div className="form-field" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Icono / Emoji del producto *</span>
                    <span style={{ fontSize: '11.5px', color: '#166534', fontWeight: 700 }}>
                      Toca un emoji para asignarlo
                    </span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        fontSize: '32px',
                        padding: '6px 14px',
                        background: '#f0fdf4',
                        borderRadius: '12px',
                        border: '2px solid #86efac',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '56px',
                      }}
                      title="Emoji activo"
                    >
                      {emoji}
                    </div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', flex: 1, maxHeight: '90px', overflowY: 'auto', padding: '4px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      {EMOJI_OPTIONS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setEmoji(em)}
                          style={{
                            fontSize: '18px',
                            padding: '4px 7px',
                            background: emoji === em ? '#dcfce7' : '#ffffff',
                            border: emoji === em ? '2px solid #16a34a' : '1px solid #cbd5e1',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.1s ease',
                          }}
                          title={`Elegir ${em}`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      placeholder="Otro"
                      style={{
                        width: '52px',
                        textAlign: 'center',
                        fontSize: '18px',
                        padding: '6px 4px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                      }}
                      title="O escribe/pega cualquier emoji"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Nombre del producto *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Yogurt Griego Miel"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label>Formato o tamaño *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Envase 250 g, Porción, Litro"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Costo variable base ($ USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={costUSD}
                      onChange={(e) => setCostUSD(parseFloat(e.target.value) || 0)}
                    />
                    <small style={{ color: 'var(--muted)', fontSize: '10px' }}>
                      Equivalente: {moneyVES(costUSD * activeRate)}
                    </small>
                  </div>

                  <div className="form-field">
                    <label>Margen de ganancia deseado (%) *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="5"
                      max="90"
                      required
                      value={targetMargin}
                      onChange={(e) => setTargetMargin(parseFloat(e.target.value) || 0)}
                    />
                    <small style={{ color: 'var(--muted)', fontSize: '10px' }}>
                      Recomendado artesanal: 35% a 45%
                    </small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Canal principal</label>
                    <select value={channel} onChange={(e) => setChannel(e.target.value)}>
                      <option value="Directo al cliente">Directo al cliente</option>
                      <option value="Cafeterías / Bodegones">Cafeterías / Bodegones</option>
                      <option value="Pedidos semanales">Pedidos semanales</option>
                      <option value="Mayorista">Mayorista</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Categoría</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                    >
                      <option value="yogurt">Yogurt</option>
                      <option value="quesillo">Quesillo</option>
                      <option value="reposteria">Repostería & Tortas (ej. Torta de Pan)</option>
                      <option value="derivado">Otro derivado lácteo</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>Descripción para clientes o redes sociales</label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Yogurt natural artesanal, cremoso, sin conservantes."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div style={{ background: '#f5faf4', padding: '12px', borderRadius: '10px', fontSize: '11px', color: '#275239' }}>
                  💡 <b>Vista previa del precio resultante:</b> Con costo de {moneyUSD(costUSD)} y margen de {targetMargin}%, el precio sugerido es de <b>{moneyUSD(costUSD / (1 - targetMargin / 100))}</b> (o <b>{moneyVES((costUSD / (1 - targetMargin / 100)) * activeRate)}</b> al cambio actual).
                </div>

                <div className="modal-actions">
                  <button type="button" className="ghost-btn" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="primary-btn">
                    {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
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
          <button className="ghost-btn" onClick={() => onNavigate('pricing')}>
            Ajustar márgenes finos ↗
          </button>
        </div>
      </div>
    </section>
  );
};
