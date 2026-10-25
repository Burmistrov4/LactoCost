import React, { useState } from 'react';
import { Sale, Product, ViewId, RateReferenceType, DisplayCurrencyMode } from '../types';
import { moneyUSD, moneyVES } from '../utils/formatters';

interface SalesViewProps {
  sales: Sale[];
  products: Product[];
  activeRate: number;
  activeRateType: RateReferenceType;
  activeRateName: string;
  currencyMode: DisplayCurrencyMode;
  onAddSale: (sale: Sale) => void;
  onDeleteSale?: (saleId: string) => void;
  onNavigate: (view: ViewId) => void;
  onNotify: (msg: string) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  sales,
  products,
  activeRate,
  activeRateType,
  activeRateName,
  currencyMode,
  onAddSale,
  onDeleteSale,
  onNavigate,
  onNotify,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(2);
  const [unitPriceUSD, setUnitPriceUSD] = useState<number>(2.00);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo $' | 'PagoMóvil (VES)' | 'Binance USDT' | 'Punto de Venta'>('PagoMóvil (VES)');
  const [notes, setNotes] = useState<string>('');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      const defaultPrice = prod.targetMargin >= 100 ? prod.costUSD * 2 : prod.costUSD / (1 - (prod.targetMargin || 50) / 100);
      setUnitPriceUSD(Math.round((defaultPrice + Number.EPSILON) * 100) / 100);
    }
  };

  const openNewSaleModal = () => {
    if (selectedProduct) {
      const defaultPrice = selectedProduct.targetMargin >= 100 ? selectedProduct.costUSD * 2 : selectedProduct.costUSD / (1 - (selectedProduct.targetMargin || 50) / 100);
      setUnitPriceUSD(Math.round((defaultPrice + Number.EPSILON) * 100) / 100);
    }
    setClientName('');
    setQuantity(2);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (quantity <= 0) {
      onNotify('La cantidad debe ser mayor que cero.');
      return;
    }

    const totalUSD = quantity * unitPriceUSD;
    const totalVES = Math.round((totalUSD * activeRate + Number.EPSILON) * 100) / 100;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      date: 'Hoy · Justo ahora',
      clientName: clientName.trim() || 'Cliente Mostrador',
      items: [
        {
          productId: selectedProduct.id,
          productName: `${selectedProduct.name} (${selectedProduct.format})`,
          quantity,
          unitPriceUSD,
          subtotalUSD: totalUSD,
        },
      ],
      totalUSD,
      rateApplied: activeRate,
      rateType: activeRateType,
      totalVES,
      paymentMethod,
      notes,
    };

    onAddSale(newSale);
    setIsModalOpen(false);
    onNotify(
      `¡Venta registrada exitosamente! ${quantity}x ${selectedProduct.name} por ${moneyUSD(totalUSD)} (${moneyVES(totalVES)}).`
    );
  };

  const totalSalesUSD = sales.reduce((sum, s) => sum + s.totalUSD, 0);
  const totalSalesVES = sales.reduce((sum, s) => sum + s.totalVES, 0);
  const estimatedProfitUSD = totalSalesUSD * 0.35; // ~35% average margin

  return (
    <section className="view-state active" id="view-sales">
      <div className="card panel">
        <div className="panel-title">
          <div>
            <h2 style={{ margin: 0, fontSize: '19px' }}>Registro de Ventas y Pedidos de Clientes</h2>
            <p>
              Registra tus despachos en <b>Dólares ($)</b> y cobra en <b>Bolívares (VES)</b> al cambio exacto según {activeRateName} ({moneyVES(activeRate)}).
            </p>
          </div>
          <button className="primary-btn" onClick={openNewSaleModal}>
            <span>＋</span> <span>Registrar Venta</span>
          </button>
        </div>

        {/* Motivational sales metric cards */}
        <div className="kpis" style={{ marginTop: '16px', marginBottom: '16px' }}>
          <article className="card kpi">
            <div className="kpi-top">Total Ventas Registradas <span className="kpi-icon">🛍</span></div>
            <div className="kpi-value">{currencyMode === 'VES' ? moneyVES(totalSalesVES) : moneyUSD(totalSalesUSD)}</div>
            <div className="kpi-foot">
              <span className="up">{sales.length} pedidos</span> despachados
            </div>
            <div className="kpi-line"><span style={{ width: '85%' }}></span></div>
          </article>

          <article className="card kpi">
            <div className="kpi-top">Equivalente en Bolívares <span className="kpi-icon">🇻🇪</span></div>
            <div className="kpi-value">{moneyVES(totalSalesVES)}</div>
            <div className="kpi-foot">
              Cobrado según tasa del día
            </div>
            <div className="kpi-line"><span style={{ width: '70%' }}></span></div>
          </article>

          <article className="card kpi">
            <div className="kpi-top">Ganancia Neta Estimada <span className="kpi-icon">✨</span></div>
            <div className="kpi-value" style={{ color: '#26785c' }}>{moneyUSD(estimatedProfitUSD)}</div>
            <div className="kpi-foot">
              <span className="up">+35% margen promedio</span> protegido
            </div>
            <div className="kpi-line"><span style={{ width: '65%' }}></span></div>
          </article>

          <article className="card kpi">
            <div className="kpi-top">Tasa Activa de Cobro <span className="kpi-icon">📊</span></div>
            <div className="kpi-value" style={{ fontSize: '21px' }}>{moneyVES(activeRate)}</div>
            <div className="kpi-foot">
              <span style={{ fontWeight: 700, color: '#346a50' }}>{activeRateName}</span>
            </div>
            <div className="kpi-line"><span style={{ width: '90%' }}></span></div>
          </article>
        </div>

        {/* Sales Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha / Hora</th>
                <th>Cliente</th>
                <th>Productos Vendidos</th>
                <th>Método de Pago</th>
                <th>Importe ($ USD)</th>
                <th>Importe (Bs. VES)</th>
                <th>Tasa Aplicada</th>
                <th>Notas</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <small style={{ color: 'var(--muted)' }}>{sale.date}</small>
                  </td>
                  <td>
                    <b>{sale.clientName}</b>
                  </td>
                  <td>
                    {sale.items.map((it, idx) => (
                      <span key={idx} style={{ display: 'block', fontSize: '12px' }}>
                        {it.quantity}x {it.productName}
                      </span>
                    ))}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 700,
                        background:
                          sale.paymentMethod.includes('PagoMóvil')
                            ? '#e9f6ed'
                            : sale.paymentMethod.includes('Efectivo')
                            ? '#fef6e7'
                            : '#eff3f8',
                        color:
                          sale.paymentMethod.includes('PagoMóvil')
                            ? '#1b6342'
                            : sale.paymentMethod.includes('Efectivo')
                            ? '#855616'
                            : '#2b5078',
                      }}
                    >
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '13px', color: '#163826' }}>{moneyUSD(sale.totalUSD)}</strong>
                  </td>
                  <td>
                    <b>{moneyVES(sale.totalVES)}</b>
                  </td>
                  <td>
                    <small style={{ color: 'var(--muted)' }}>
                      {sale.rateType === 'bcv_eur' ? 'Euro BCV' : 'Binance P2P'} ({moneyVES(sale.rateApplied)})
                    </small>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', color: '#5b6b60' }}>{sale.notes || '—'}</span>
                  </td>
                  <td>
                    {onDeleteSale && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar la venta de ${sale.clientName} (${moneyUSD(sale.totalUSD)})?`)) {
                            onDeleteSale(sale.id);
                          }
                        }}
                        style={{
                          background: '#fee2e2',
                          color: '#b91c1c',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                        title="Eliminar registro de venta"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal New Sale */}
        {isModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)} role="dialog" aria-modal="true">
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Registrar Venta o Pedido</h2>
                  <p>Calcula el cobro en dólares y bolívares al instante.</p>
                </div>
                <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-field">
                  <label>Nombre del cliente o destino *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sra. Carmen, Bodegón Norte, Venta mostrador"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Producto a despachar *</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleProductChange(e.target.value)}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.emoji} {p.name} ({p.format})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Cantidad de unidades *</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="form-field">
                    <label>Precio unitario en $ USD *</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      required
                      value={unitPriceUSD}
                      onChange={(e) => setUnitPriceUSD(parseFloat(e.target.value) || 0)}
                    />
                    <small style={{ color: 'var(--muted)', fontSize: '10px' }}>
                      En Bs: {moneyVES(unitPriceUSD * activeRate)} c/u
                    </small>
                  </div>
                </div>

                <div className="form-field">
                  <label>Método de pago utilizado *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                  >
                    <option value="PagoMóvil (VES)">PagoMóvil en Bolívares (VES)</option>
                    <option value="Efectivo $">Efectivo en Dólares ($)</option>
                    <option value="Binance USDT">Binance Pay / USDT</option>
                    <option value="Punto de Venta">Punto de Venta / Débito (VES)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Notas del pedido (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej. Entregar en la tarde, PagoMóvil confirmado"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Calculation Preview */}
                <div style={{ background: 'var(--deep)', color: 'white', padding: '14px', borderRadius: '12px' }}>
                  <small style={{ color: '#b9d4c1' }}>Total a cobrar al cliente:</small>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <strong style={{ fontSize: '24px', color: 'var(--lime)' }}>
                      {moneyUSD(quantity * unitPriceUSD)}
                    </strong>
                    <strong style={{ fontSize: '18px', color: '#fff' }}>
                      {moneyVES(quantity * unitPriceUSD * activeRate)}
                    </strong>
                  </div>
                  <small style={{ color: '#b9d4c1', marginTop: '4px', display: 'block' }}>
                    Calculado con tasa {activeRateName} ({moneyVES(activeRate)})
                  </small>
                </div>

                <div className="modal-actions">
                  <button type="button" className="ghost-btn" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="primary-btn">
                    Confirmar Venta
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
          <button className="ghost-btn" onClick={() => onNavigate('growth')}>
            Ver consejos para vender más ↗
          </button>
        </div>
      </div>
    </section>
  );
};
