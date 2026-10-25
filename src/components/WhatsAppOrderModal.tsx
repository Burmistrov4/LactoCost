import React, { useState } from 'react';
import { Product, Sale, RateReferenceType, WorkshopProfile } from '../types';
import { moneyUSD, moneyVES } from '../utils/formatters';

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  activeRate: number;
  activeRateName: string;
  activeRateType: RateReferenceType;
  workshopProfile?: WorkshopProfile;
  onAddSale: (sale: Sale) => void;
  onNotify: (msg: string) => void;
}

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  activeRate,
  activeRateName,
  activeRateType,
  workshopProfile,
  onAddSale,
  onNotify,
}) => {
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'PagoMóvil (VES)' | 'Efectivo $' | 'Binance USDT'>('PagoMóvil (VES)');
  const [deliveryNote, setDeliveryNote] = useState<string>('Entrega acordada / Retiro en taller');
  const [pagoMovilData, setPagoMovilData] = useState<string>(
    workshopProfile ? `Banesco / ${workshopProfile.phone} / V-00.000.000` : 'Banesco / 0414-0000000 / V-00.000.000'
  );
  
  // State of item quantities: map productId -> quantity
  const [orderItems, setOrderItems] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (products[0]) initial[products[0].id] = 2;
    return initial;
  });

  if (!isOpen) return null;

  const updateQuantity = (productId: string, delta: number) => {
    setOrderItems((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  // Calculate items summary
  const itemsWithPricing = products
    .filter((p) => (orderItems[p.id] || 0) > 0)
    .map((p) => {
      const qty = orderItems[p.id] || 0;
      const unitPriceUSD = p.costUSD / (1 - (p.targetMargin || 35) / 100);
      const subtotalUSD = qty * unitPriceUSD;
      return {
        product: p,
        quantity: qty,
        unitPriceUSD,
        subtotalUSD,
      };
    });

  const totalUSD = itemsWithPricing.reduce((sum, item) => sum + item.subtotalUSD, 0);
  const totalVES = totalUSD * activeRate;

  // Build formatted text for WhatsApp
  const generateWhatsAppMessage = () => {
    const brandName = (workshopProfile?.name || 'TALLER ARTESANAL').toUpperCase();
    const brandLoc = workshopProfile?.location || 'Valencia Sur';
    let msg = `${workshopProfile?.logoEmoji || '✨'} *${brandName} · DETALLE DE PEDIDO* ✨\n📍 ${workshopProfile?.name || 'Taller Artesanal'} · ${brandLoc}\n`;
    if (clientName.trim()) {
      msg += `¡Hola ${clientName.trim()}! Aquí tienes el detalle de tu pedido:\n\n`;
    } else {
      msg += `¡Hola! Aquí tienes el detalle de tu pedido:\n\n`;
    }

    if (itemsWithPricing.length === 0) {
      msg += `(Aún no has agregado productos al pedido)\n`;
    } else {
      itemsWithPricing.forEach((item) => {
        msg += `• *${item.quantity}x ${item.product.emoji} ${item.product.name}* (${item.product.format})\n`;
        msg += `   Subtotal: ${moneyUSD(item.subtotalUSD)} · Bs. ${moneyVES(item.subtotalUSD * activeRate)}\n`;
      });
    }

    msg += `\n─────────────────────\n`;
    msg += `💵 *TOTAL A PAGAR: ${moneyUSD(totalUSD)}*\n`;
    msg += `🇻🇪 *EN BOLÍVARES: ${moneyVES(totalVES)}*\n`;
    msg += `(Tasa aplicada: ${activeRateName} ${moneyVES(activeRate)})\n`;
    msg += `─────────────────────\n`;

    if (paymentMethod === 'PagoMóvil (VES)') {
      msg += `📲 *Datos para PagoMóvil:*\n${pagoMovilData}\n`;
    } else if (paymentMethod === 'Efectivo $') {
      msg += `💵 *Pago:* Divisas en efectivo (billetes en buen estado).\n`;
    } else {
      msg += `🟡 *Pago:* Binance Pay / USDT al correo o Pay ID.\n`;
    }

    if (deliveryNote.trim()) {
      msg += `🛵 *Detalle de Entrega:* ${deliveryNote.trim()}\n`;
    }

    msg += `\n✨ *¡Muchas gracias por apoyar la producción artesanal y local!*`;
    return msg;
  };

  const handleCopy = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    onNotify('¡Mensaje copiado al portapapeles! Listo para pegar en WhatsApp.');
  };

  const handleOpenWhatsApp = () => {
    const text = generateWhatsAppMessage();
    const cleanPhone = clientPhone.replace(/\D/g, '');
    let url = '';
    if (cleanPhone) {
      const fullPhone = cleanPhone.startsWith('58') ? cleanPhone : `58${cleanPhone.replace(/^0+/, '')}`;
      url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
    } else {
      url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    onNotify('Abriendo WhatsApp con el pedido generado...');
  };

  const handleSaveAsSale = () => {
    if (itemsWithPricing.length === 0) {
      onNotify('Agrega al menos un producto al pedido para guardarlo como venta.');
      return;
    }

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      date: 'Hoy · Justo ahora',
      clientName: clientName.trim() || 'Cliente WhatsApp',
      items: itemsWithPricing.map((item) => ({
        productId: item.product.id,
        productName: `${item.product.name} (${item.product.format})`,
        quantity: item.quantity,
        unitPriceUSD: item.unitPriceUSD,
        subtotalUSD: item.subtotalUSD,
      })),
      totalUSD,
      rateApplied: activeRate,
      rateType: activeRateType,
      totalVES,
      paymentMethod,
      notes: `Pedido WhatsApp - ${deliveryNote}`,
    };

    onAddSale(newSale);
    onNotify(`¡Venta registrada exitosamente en el sistema por ${moneyUSD(totalUSD)} (${moneyVES(totalVES)})!`);
    onClose();
  };

  return (
    <div className="modal show" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-dialog" style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>📲 Generador de Pedidos para WhatsApp</h3>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
              Arma cotizaciones al cambio de <b>{activeRateName}</b> ({moneyVES(activeRate)}) y envíalas en 1 toque.
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Client Details */}
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))' }}>
            <div className="field">
              <label>Nombre del Cliente</label>
              <input
                type="text"
                placeholder="Ej. María Pérez"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>WhatsApp (Opcional)</label>
              <input
                type="tel"
                placeholder="Ej. 0414-1234567"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Product Selector with Quantity Steppers */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Selecciona Productos y Cantidades
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              {products.map((prod) => {
                const qty = orderItems[prod.id] || 0;
                const unitPriceUSD = prod.costUSD / (1 - (prod.targetMargin || 35) / 100);
                return (
                  <div
                    key={prod.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: qty > 0 ? '#f3faf5' : 'var(--card)',
                      border: qty > 0 ? '1px solid #77b894' : '1px solid var(--line)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>{prod.emoji}</span>
                      <div>
                        <strong style={{ fontSize: '13px', display: 'block' }}>{prod.name}</strong>
                        <small style={{ color: 'var(--muted)', fontSize: '11px' }}>
                          {prod.format} · {moneyUSD(unitPriceUSD)} ({moneyVES(unitPriceUSD * activeRate)})
                        </small>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateQuantity(prod.id, -1)}
                        disabled={qty === 0}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: '1px solid var(--line)',
                          background: 'white',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                        }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: '22px', textAlign: 'center', fontWeight: 800, fontSize: '14px' }}>
                        {qty}
                      </span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateQuantity(prod.id, 1)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: '1px solid #3c8866',
                          background: '#e9f5ee',
                          color: '#1b4a34',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method & Delivery */}
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))' }}>
            <div className="field">
              <label>Forma de Pago del Cliente</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
              >
                <option value="PagoMóvil (VES)">PagoMóvil (VES)</option>
                <option value="Efectivo $">Efectivo en Dólares ($)</option>
                <option value="Binance USDT">Binance Pay (USDT)</option>
              </select>
            </div>
            <div className="field">
              <label>Nota de Entrega / Despacho</label>
              <input
                type="text"
                placeholder="Ej. Retiro en taller a las 4pm"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
              />
            </div>
          </div>

          {paymentMethod === 'PagoMóvil (VES)' && (
            <div className="field">
              <label>Tus Datos de PagoMóvil para el mensaje</label>
              <input
                type="text"
                value={pagoMovilData}
                onChange={(e) => setPagoMovilData(e.target.value)}
                placeholder="Banco / Teléfono / Cédula"
              />
            </div>
          )}

          {/* Total Summary Box */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#f2f8f4',
              border: '1px solid #c9e4d3',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: '#335e46', fontWeight: 600, display: 'block' }}>
                Total del Pedido:
              </span>
              <strong style={{ fontSize: '20px', color: '#133523' }}>{moneyUSD(totalUSD)}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: '#335e46', fontWeight: 600, display: 'block' }}>
                En Bolívares ({activeRateName}):
              </span>
              <strong style={{ fontSize: '18px', color: '#286f4a' }}>{moneyVES(totalVES)}</strong>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button type="button" className="ghost-btn" onClick={handleCopy}>
              📋 Copiar Texto
            </button>
            <button type="button" className="ghost-btn" style={{ background: '#25D366', color: 'white', borderColor: '#25D366' }} onClick={handleOpenWhatsApp}>
              📲 Abrir en WhatsApp
            </button>
          </div>

          <button
            type="button"
            className="primary-btn"
            onClick={handleSaveAsSale}
            disabled={itemsWithPricing.length === 0}
          >
            💾 Registrar como Venta Real
          </button>
        </div>
      </div>
    </div>
  );
};
