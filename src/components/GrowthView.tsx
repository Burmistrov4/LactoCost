import React, { useState } from 'react';
import { Product, ViewId, WorkshopProfile } from '../types';
import { moneyUSD, moneyVES, formatPercent } from '../utils/formatters';
import { calculateTargetPrice } from '../domain/pricing';

interface GrowthViewProps {
  products: Product[];
  activeRate: number;
  activeRateType: string;
  activeRateName: string;
  workshopProfile?: WorkshopProfile;
  onNavigate: (view: ViewId) => void;
  onNotify: (msg: string) => void;
  onOpenWhatsAppOrder?: () => void;
  onOpenLabelGenerator?: () => void;
  onOpenMilkYield?: () => void;
  onOpenPackagingGuide?: () => void;
}

export const GrowthView: React.FC<GrowthViewProps> = ({
  products,
  activeRate,
  activeRateName,
  workshopProfile,
  onNavigate,
  onNotify,
  onOpenWhatsAppOrder,
  onOpenLabelGenerator,
  onOpenMilkYield,
  onOpenPackagingGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'combos' | 'breakeven' | 'tips'>('whatsapp');

  // WhatsApp Generator State
  const [promoMessage, setPromoMessage] = useState<string>('¡Feliz día! Tenemos productos frescos recién elaborados para consentirte 🥛✨');
  const [includeDeliveryNote, setIncludeDeliveryNote] = useState<boolean>(true);

  // Combos State
  const [comboName, setComboName] = useState<string>('Combo Merienda Feliz');
  const [item1Id, setItem1Id] = useState<string>(products[0]?.id || '');
  const [item1Qty, setItem1Qty] = useState<number>(2);
  const [item2Id, setItem2Id] = useState<string>(products[1]?.id || products[0]?.id || '');
  const [item2Qty, setItem2Qty] = useState<number>(1);
  const [discountPercent, setDiscountPercent] = useState<number>(10);

  // Break-even State
  const [monthlyFixedCosts, setMonthlyFixedCosts] = useState<number>(120); // Alquiler, servicios, etc.
  const [desiredSalaryUSD, setDesiredSalaryUSD] = useState<number>(250); // Sueldo deseado
  const [averageContributionUSD, setAverageContributionUSD] = useState<number>(0.65); // Ganancia por yogurt

  // Editable WhatsApp draft state
  const [isCustomEdited, setIsCustomEdited] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('flor_amarillo_whatsapp_draft');
    } catch (e) {
      return false;
    }
  });

  const generateBaseWhatsAppText = () => {
    const brandName = (workshopProfile?.name || 'TALLER ARTESANAL').toUpperCase();
    const brandLoc = workshopProfile?.location || 'Valencia Sur';
    let text = `${workshopProfile?.logoEmoji || '✨'} *${brandName} · MENÚ ARTESANAL* ✨\n`;
    text += `📍 ${workshopProfile?.name || 'Taller Artesanal'} · ${brandLoc}\n\n`;
    text += `${promoMessage}\n\n`;
    text += `📅 *Precios del día (Tasa ${activeRateName}: ${moneyVES(activeRate)}):*\n\n`;

    products.forEach((p) => {
      const pricing = calculateTargetPrice(p.costUSD, p.targetMargin, { exchangeRate: activeRate });
      text += `${p.emoji} *${p.name}* (${p.format})\n`;
      text += `   💵 *${moneyUSD(pricing.netPriceUSD)}* | Bs. ${new Intl.NumberFormat('es-VE', { maximumFractionDigits: 0 }).format(pricing.netPriceVES)}\n\n`;
    });

    if (includeDeliveryNote) {
      const zones = workshopProfile?.deliveryZones || 'Flor Amarillo, Los Bucares, La Isabelica y Zona Sur de Valencia';
      text += `🛵 *Entregas y delivery:* ${zones}.\n`;
      text += `💳 *Métodos de pago:* PagoMóvil, Efectivo $, Binance USDT y Transferencia.\n\n`;
    }

    text += `📲 *¡Escríbenos para apartar tu pedido antes de que se agoten!*`;
    return text;
  };

  const [editedWhatsAppText, setEditedWhatsAppText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('flor_amarillo_whatsapp_draft');
      if (saved) return saved;
    } catch (e) {}
    return generateBaseWhatsAppText();
  });

  // Keep edited text initialized if empty
  const currentWhatsAppText = editedWhatsAppText || generateBaseWhatsAppText();

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('flor_amarillo_whatsapp_draft', currentWhatsAppText);
      setIsCustomEdited(true);
      onNotify('✓ Mensaje de WhatsApp guardado. Podrás revisarlo y editarlo cuando quieras antes de enviar.');
    } catch (e) {
      onNotify('No se pudo guardar el borrador.');
    }
  };

  const handleResetToTemplate = () => {
    const base = generateBaseWhatsAppText();
    setEditedWhatsAppText(base);
    setIsCustomEdited(false);
    try {
      localStorage.removeItem('flor_amarillo_whatsapp_draft');
    } catch (e) {}
    onNotify('Plantilla de precios recalculada con los productos y tasas de hoy.');
  };

  const copyWhatsAppToClipboard = () => {
    navigator.clipboard.writeText(currentWhatsAppText);
    onNotify('¡Mensaje copiado al portapapeles! Listo para pegar en WhatsApp o compartir en tus estados.');
  };

  // Calculations for Combo
  const prod1 = products.find((p) => p.id === item1Id) || products[0];
  const prod2 = products.find((p) => p.id === item2Id) || products[1] || products[0];

  const prod1Price = prod1 ? prod1.costUSD / (1 - prod1.targetMargin / 100) : 1.5;
  const prod2Price = prod2 ? prod2.costUSD / (1 - prod2.targetMargin / 100) : 2.0;

  const rawComboCostUSD = (prod1 ? prod1.costUSD * item1Qty : 0) + (prod2 ? prod2.costUSD * item2Qty : 0);
  const rawComboNormalPriceUSD = prod1Price * item1Qty + prod2Price * item2Qty;
  const comboDiscountedPriceUSD = rawComboNormalPriceUSD * (1 - discountPercent / 100);
  const comboProfitUSD = comboDiscountedPriceUSD - rawComboCostUSD;
  const comboMargin = comboDiscountedPriceUSD > 0 ? (comboProfitUSD / comboDiscountedPriceUSD) * 100 : 0;

  // Calculations for Break-even
  const totalTargetUSD = monthlyFixedCosts + desiredSalaryUSD;
  const unitsNeededMonthly = averageContributionUSD > 0 ? Math.ceil(totalTargetUSD / averageContributionUSD) : 0;
  const unitsNeededWeekly = Math.ceil(unitsNeededMonthly / 4);
  const unitsNeededDaily = Math.ceil(unitsNeededWeekly / 6);

  return (
    <section className="view-state active" id="view-growth">
      <div className="card panel">
        <div className="panel-title">
          <div>
            <h2 style={{ margin: 0, fontSize: '19px' }}>Asistente de Ventas & Consejos para la Emprendedora</h2>
            <p>
              Herramientas comerciales prácticas para ayudarte a publicar, vender más combos y proteger tus ganancias.
            </p>
          </div>
          <span className="status good">IMPULSA TU NEGOCIO</span>
        </div>

        {/* Quick Tools Action Banner */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px', padding: '12px', background: '#f5f9f6', borderRadius: '10px', border: '1px solid #d3e9db' }}>
          <strong style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#1b4a32', marginRight: '6px' }}>
            Herramientas Rápidas:
          </strong>
          {onOpenWhatsAppOrder && (
            <button
              type="button"
              className="primary-btn"
              onClick={onOpenWhatsAppOrder}
              style={{ fontSize: '12px', padding: '6px 12px', background: '#25D366', borderColor: '#25D366' }}
            >
              📲 Cotizador y Pedido WhatsApp
            </button>
          )}
          {onOpenLabelGenerator && (
            <button
              type="button"
              className="ghost-btn"
              onClick={onOpenLabelGenerator}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              🏷️ Generar Rótulos para Potes
            </button>
          )}
          {onOpenMilkYield && (
            <button
              type="button"
              className="ghost-btn"
              onClick={onOpenMilkYield}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              🔬 Medir Rendimiento de Leche
            </button>
          )}
          {onOpenPackagingGuide && (
            <button
              type="button"
              className="ghost-btn"
              onClick={onOpenPackagingGuide}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              🍶 Guía de Potes (La Candelaria)
            </button>
          )}
        </div>

        {/* Tab switcher */}
        <div className="range" style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap' }}>
          <button
            className={activeTab === 'whatsapp' ? 'active' : ''}
            onClick={() => setActiveTab('whatsapp')}
          >
            📲 Catálogo WhatsApp
          </button>
          <button
            className={activeTab === 'combos' ? 'active' : ''}
            onClick={() => setActiveTab('combos')}
          >
            🎁 Creador de Combos
          </button>
          <button
            className={activeTab === 'breakeven' ? 'active' : ''}
            onClick={() => setActiveTab('breakeven')}
          >
            🎯 Meta y Punto de Equilibrio
          </button>
          <button
            className={activeTab === 'tips' ? 'active' : ''}
            onClick={() => setActiveTab('tips')}
          >
            💡 Consejos Prácticos
          </button>
        </div>

        {/* TAB 1: WhatsApp Generator */}
        {activeTab === 'whatsapp' && (
          <div style={{ marginTop: '16px' }}>
            <div className="pricing-intro" style={{ background: '#eaf7ef', borderColor: '#c2ebd0' }}>
              <div className="insight-icon" style={{ background: '#25d366', color: 'white' }}>
                💬
              </div>
              <div>
                <strong>Publica tus precios del día en segundos</strong>
                <p>
                  No pierdas tiempo redactando listas de precios todos los días. Este mensaje toma automáticamente
                  tus productos y calcula los precios en <b>Dólares ($)</b> y en <b>Bolívares (VES)</b> a la tasa {activeRateName} ({moneyVES(activeRate)}).
                </p>
              </div>
            </div>

            <div className="responsive-split-grid">
              <div>
                <label className="field-label" style={{ marginTop: 0 }}>
                  Mensaje o saludo de cabecera
                </label>
                <input
                  type="text"
                  className="margin-input"
                  value={promoMessage}
                  onChange={(e) => setPromoMessage(e.target.value)}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <input
                    type="checkbox"
                    id="deliveryNote"
                    checked={includeDeliveryNote}
                    onChange={(e) => setIncludeDeliveryNote(e.target.checked)}
                  />
                  <label htmlFor="deliveryNote" style={{ fontSize: '12px', fontWeight: 600 }}>
                    Incluir aviso de delivery y métodos de pago (PagoMóvil, Divisas, Binance)
                  </label>
                </div>

                <div className="whatsapp-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '13px', color: '#155724' }}>Mensaje para WhatsApp (Editable):</strong>
                      {isCustomEdited && (
                        <span style={{ fontSize: '10.5px', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          ✓ Borrador guardado
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: '#28a745', fontWeight: 600 }}>Tasa activa: {activeRateName}</span>
                  </div>

                  <p style={{ margin: '4px 0 8px', fontSize: '11px', color: '#475569' }}>
                    Puedes editar el texto libremente aquí abajo, quitar o agregar lo que quieras, guardarlo y luego copiarlo o enviarlo:
                  </p>

                  <textarea
                    rows={12}
                    value={currentWhatsAppText}
                    onChange={(e) => {
                      setEditedWhatsAppText(e.target.value);
                      setIsCustomEdited(true);
                    }}
                    style={{
                      width: '100%',
                      fontFamily: 'monospace',
                      fontSize: '12.5px',
                      lineHeight: '1.5',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #86efac',
                      background: '#ffffff',
                      color: '#0f172a',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                    placeholder="Escribe o edita aquí tu mensaje de WhatsApp..."
                  />

                  {/* Buttons Toolbar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="primary-btn"
                      style={{ background: '#25d366', borderColor: '#25d366', justifyContent: 'center' }}
                      onClick={copyWhatsAppToClipboard}
                    >
                      <span>📋</span> <span>Copiar Mensaje</span>
                    </button>

                    <button
                      type="button"
                      className="ghost-btn"
                      style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#166534', fontWeight: 700, justifyContent: 'center' }}
                      onClick={handleSaveDraft}
                      title="Guardar tus cambios para revisarlos más tarde"
                    >
                      <span>💾</span> <span>Guardar Borrador</span>
                    </button>

                    <button
                      type="button"
                      className="ghost-btn"
                      style={{ background: '#ffffff', borderColor: '#cbd5e1', color: '#475569', justifyContent: 'center' }}
                      onClick={handleResetToTemplate}
                      title="Regenerar con los precios de hoy"
                    >
                      <span>🔄</span> <span>Recargar Base</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tips for WhatsApp selling */}
              <div style={{ display: 'grid', gap: '12px', alignContent: 'start' }}>
                <div className="tip-card">
                  <div className="tip-icon">⏰</div>
                  <div>
                    <strong style={{ fontSize: '12px' }}>Mejores horarios para publicar</strong>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '4px 0 0' }}>
                      Los pedidos de yogurt y meriendas se disparan entre las <b>10:30 am y 12:30 pm</b> (para la merienda escolar y de oficina) y entre las <b>6:00 pm y 8:00 pm</b> (para el desayuno del día siguiente).
                    </p>
                  </div>
                </div>

                <div className="tip-card">
                  <div className="tip-icon">📸</div>
                  <div>
                    <strong style={{ fontSize: '12px' }}>Foto real con buena luz</strong>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '4px 0 0' }}>
                      Acompaña el mensaje de WhatsApp con una foto bien iluminada donde se vea la textura espesa del yogurt o el caramelo brillante del quesillo. ¡Eso vende más que mil palabras!
                    </p>
                  </div>
                </div>

                <div className="tip-card">
                  <div className="tip-icon">🤝</div>
                  <div>
                    <strong style={{ fontSize: '12px' }}>Cero fricción en el pago</strong>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '4px 0 0' }}>
                      Al poner claramente el monto en $ y el monto en Bolívares con PagoMóvil, el cliente no tiene que preguntarte "¿a cuánto recibes el dólar hoy?". La venta se cierra en menos mensajes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Combo Builder */}
        {activeTab === 'combos' && (
          <div style={{ marginTop: '16px' }}>
            <div className="pricing-intro">
              <div className="insight-icon" style={{ background: '#d6fb72', color: 'var(--deep)' }}>
                🎁
              </div>
              <div>
                <strong>Los combos aumentan tu ticket promedio</strong>
                <p>
                  Un cliente que venía por un yogurt de $1.80 puede llevarse un combo de $5.00 si siente que está
                  ahorrando. Diseña aquí tus promociones de fin de semana verificando tu ganancia real.
                </p>
              </div>
            </div>

            <div className="responsive-split-grid">
              <div style={{ background: '#fbfdfa', border: '1px solid var(--line)', borderRadius: '14px', padding: '16px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Configurar Combo Promocional</h3>

                <div className="form-field">
                  <label>Nombre del combo</label>
                  <input
                    type="text"
                    className="margin-input"
                    value={comboName}
                    onChange={(e) => setComboName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '10px', marginTop: '10px' }}>
                  <div className="form-field">
                    <label>Primer producto</label>
                    <select
                      className="rate-select"
                      value={item1Id}
                      onChange={(e) => setItem1Id(e.target.value)}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.emoji} {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      className="margin-input"
                      value={item1Qty}
                      onChange={(e) => setItem1Qty(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '10px', marginTop: '10px' }}>
                  <div className="form-field">
                    <label>Segundo producto</label>
                    <select
                      className="rate-select"
                      value={item2Id}
                      onChange={(e) => setItem2Id(e.target.value)}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.emoji} {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      className="margin-input"
                      value={item2Qty}
                      onChange={(e) => setItem2Qty(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label className="field-label">Descuento promocional ofrecido (%)</label>
                  <div className="margin-input-wrap">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      step="1"
                      className="margin-input"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>

              {/* Combo Result Card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="card panel" style={{ background: 'var(--deep)', color: 'white' }}>
                  <small style={{ color: '#b2c8ba', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Rentabilidad del Combo
                  </small>
                  <h3 style={{ margin: '6px 0 12px', color: 'white', fontSize: '18px' }}>
                    {comboName}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ background: '#ffffff12', padding: '10px', borderRadius: '10px' }}>
                      <small style={{ color: '#b2c8ba', fontSize: '10px' }}>Precio Normal Individual</small>
                      <strong style={{ display: 'block', fontSize: '15px', color: '#fff', textDecoration: 'line-through', marginTop: '2px' }}>
                        {moneyUSD(rawComboNormalPriceUSD)}
                      </strong>
                    </div>

                    <div style={{ background: '#ffffff12', padding: '10px', borderRadius: '10px' }}>
                      <small style={{ color: '#b2c8ba', fontSize: '10px' }}>Precio Promo Combo ({discountPercent}% off)</small>
                      <strong style={{ display: 'block', fontSize: '18px', color: 'var(--lime)', marginTop: '2px' }}>
                        {moneyUSD(comboDiscountedPriceUSD)}
                      </strong>
                      <span style={{ fontSize: '10px', color: '#b2c8ba' }}>
                        {moneyVES(comboDiscountedPriceUSD * activeRate)}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', borderTop: '1px solid #ffffff20', paddingTop: '10px', display: 'grid', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Costo de ingredientes en combo:</span>
                      <b>{moneyUSD(rawComboCostUSD)}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--lime)' }}>
                      <strong>Ganancia neta por cada combo:</strong>
                      <strong>+{moneyUSD(comboProfitUSD)} ({formatPercent(comboMargin)} margen)</strong>
                    </div>
                  </div>

                  <button
                    className="primary-btn"
                    style={{ background: 'var(--lime)', color: 'var(--deep)', width: '100%', justifyContent: 'center', marginTop: '16px', fontWeight: 800 }}
                    onClick={() => onNotify(`¡Combo "${comboName}" listo para promocionar a ${moneyUSD(comboDiscountedPriceUSD)}!`)}
                  >
                    Lanzar este Combo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Break-Even Calculator */}
        {activeTab === 'breakeven' && (
          <div style={{ marginTop: '16px' }}>
            <div className="pricing-intro">
              <div className="insight-icon" style={{ background: '#d6fb72', color: 'var(--deep)' }}>
                🎯
              </div>
              <div>
                <strong>Calcula tu meta de ventas para vivir de tu emprendimiento</strong>
                <p>
                  Saber exactamente cuántos potes de yogurt o quesillos necesitas vender a la semana te da claridad y paz mental.
                </p>
              </div>
            </div>

            <div className="responsive-split-grid">
              <div style={{ background: '#fbfdfa', border: '1px solid var(--line)', borderRadius: '14px', padding: '16px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Tus gastos fijos y meta mensual</h3>

                <div className="form-field">
                  <label>Gastos fijos del taller / mes ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    className="margin-input"
                    value={monthlyFixedCosts}
                    onChange={(e) => setMonthlyFixedCosts(parseFloat(e.target.value) || 0)}
                  />
                  <small style={{ color: 'var(--muted)', fontSize: '10px' }}>
                    Electricidad, gas para pasteurizar, internet, bolsas y delivery fijo.
                  </small>
                </div>

                <div className="form-field" style={{ marginTop: '10px' }}>
                  <label>Tu sueldo mensual deseado como emprendedora ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    className="margin-input"
                    value={desiredSalaryUSD}
                    onChange={(e) => setDesiredSalaryUSD(parseFloat(e.target.value) || 0)}
                  />
                  <small style={{ color: 'var(--muted)', fontSize: '10px' }}>
                    ¡Tu trabajo y dedicación deben tener un pago asignado en el negocio!
                  </small>
                </div>

                <div className="form-field" style={{ marginTop: '10px' }}>
                  <label>Ganancia neta promedio por producto vendido ($ USD)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.05"
                    className="margin-input"
                    value={averageContributionUSD}
                    onChange={(e) => setAverageContributionUSD(parseFloat(e.target.value) || 0.1)}
                  />
                  <small style={{ color: 'var(--muted)', fontSize: '10px' }}>
                    Diferencia entre el precio de venta y el costo del producto (ej. $0.65).
                  </small>
                </div>
              </div>

              {/* Targets Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="card panel" style={{ background: '#f2f8f0', border: '1px solid #c7e3cb' }}>
                  <small style={{ color: '#2b6540', fontSize: '10px', textTransform: 'uppercase', fontWeight: 800 }}>
                    Tu meta semanal de ventas
                  </small>
                  <h3 style={{ fontSize: '28px', color: '#1a4e2f', margin: '6px 0' }}>
                    {unitsNeededWeekly} unidades / semana
                  </h3>
                  <p style={{ fontSize: '12px', color: '#386a4b', margin: 0 }}>
                    Aproximadamente <b>{unitsNeededDaily} potes al día</b> (de lunes a sábado).
                  </p>
                </div>

                <div className="card panel">
                  <h4 style={{ margin: '0 0 6px', fontSize: '13px' }}>Meta Total Mensual</h4>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)', lineHeight: '1.5' }}>
                    Vendiendo <b>{unitsNeededMonthly} unidades al mes</b> cubres tus {moneyUSD(monthlyFixedCosts)} de gastos y cobras tu sueldo completo de <b>{moneyUSD(desiredSalaryUSD)}</b>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Practical Tips */}
        {activeTab === 'tips' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '16px' }}>
            <div className="tip-card">
              <div className="tip-icon">🥛</div>
              <div>
                <strong style={{ fontSize: '13px' }}>1. Alianzas con Cafeterías y Bodegones</strong>
                <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '5px 0 0', lineHeight: 1.5 }}>
                  Lleva 4 muestras gratis en frascos pequeños a cafeterías o bodegones cercanos. Ofréceles 20% de margen respecto al precio al público si te piden docenas fijas los días martes y viernes.
                </p>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon">🍓</div>
              <div>
                <strong style={{ fontSize: '13px' }}>2. Control estricto de mermas en frutas</strong>
                <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '5px 0 0', lineHeight: 1.5 }}>
                  Las fresas son el insumo con más riesgo de pérdida. Apenas lleguen del mercado, lávalas, desinfecta, retira los pedúnculos, haz una compota espesa y congela en porciones de 1 kg. Así mantienes costo y frescura garantizados.
                </p>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon">🔄</div>
              <div>
                <strong style={{ fontSize: '13px' }}>3. Retorno de envases de vidrio</strong>
                <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '5px 0 0', lineHeight: 1.5 }}>
                  Si usas frascos de vidrio para presentaciones especiales, ofrece $0.20 de descuento en la próxima compra si el cliente devuelve el envase limpio. Te ahorras costo de empaque y fidelizas al cliente para que vuelva a comprar.
                </p>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon">🇻🇪</div>
              <div>
                <strong style={{ fontSize: '13px' }}>4. Transparencia con la tasa de cambio</strong>
                <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '5px 0 0', lineHeight: 1.5 }}>
                  Coloca un cartelito o estado visible: "Precios referenciales en $ · Cobros en Bolívares a Tasa Euro del día". La claridad genera confianza inmediata y elimina discusiones en caja.
                </p>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="primary-btn" onClick={() => onNavigate('dashboard')}>
            Volver al dashboard
          </button>
          <button className="ghost-btn" onClick={() => onNavigate('sales')}>
            Registrar nueva venta ↗
          </button>
        </div>
      </div>
    </section>
  );
};
