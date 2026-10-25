import React, { useState } from 'react';
import { WorkshopProfile } from '../types';
import { moneyUSD, moneyVES } from '../utils/formatters';

interface CashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRate: number;
  activeRateName: string;
  workshopProfile?: WorkshopProfile;
  onNotify: (msg: string) => void;
}

export const CashRegisterModal: React.FC<CashRegisterModalProps> = ({
  isOpen,
  onClose,
  activeRate,
  activeRateName,
  workshopProfile,
  onNotify,
}) => {
  const [totalUSD, setTotalUSD] = useState<number>(5.40);
  const [cashReceivedUSD, setCashReceivedUSD] = useState<number>(10);
  const [pagoMovilReceivedVES, setPagoMovilReceivedVES] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');

  if (!isOpen) return null;

  const totalVES = Math.round((totalUSD * activeRate + Number.EPSILON) * 100) / 100;
  const pagoMovilInUSD = pagoMovilReceivedVES > 0 ? pagoMovilReceivedVES / activeRate : 0;
  const totalPaidUSD = cashReceivedUSD + pagoMovilInUSD;
  const differenceUSD = totalPaidUSD - totalUSD;

  const isChangeNeeded = differenceUSD > 0;
  const isPending = differenceUSD < -0.01;
  const isExact = Math.abs(differenceUSD) <= 0.01;

  const changeUSD = Math.max(0, differenceUSD);
  const changeVES = Math.round((changeUSD * activeRate + Number.EPSILON) * 100) / 100;

  const remainingUSD = Math.max(0, -differenceUSD);
  const remainingVES = Math.round((remainingUSD * activeRate + Number.EPSILON) * 100) / 100;

  const handleCopyReceipt = () => {
    const brandName = (workshopProfile?.name || 'TALLER ARTESANAL').toUpperCase();
    let receipt = `🧾 *${brandName} · COMPROBANTE DE COMPRA*\n`;
    receipt += `📍 ${workshopProfile?.name || 'Taller Artesanal'} · ${workshopProfile?.location || 'Valencia Sur'}\n`;
    if (workshopProfile?.phone) receipt += `📞 WhatsApp: ${workshopProfile.phone}\n`;
    if (customerName.trim()) receipt += `Cliente: *${customerName.trim()}*\n`;
    receipt += `Fecha: ${new Date().toLocaleDateString()} · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n`;
    receipt += `Tasa aplicada (${activeRateName}): ${moneyVES(activeRate)}\n\n`;
    receipt += `💵 *Total a pagar:* ${moneyUSD(totalUSD)} · ${moneyVES(totalVES)}\n`;

    if (cashReceivedUSD > 0) receipt += `• Efectivo recibido: ${moneyUSD(cashReceivedUSD)}\n`;
    if (pagoMovilReceivedVES > 0) receipt += `• PagoMóvil recibido: ${moneyVES(pagoMovilReceivedVES)}\n`;

    if (isChangeNeeded) {
      receipt += `\n✨ *Vuelto entregado:* ${moneyUSD(changeUSD)} (${moneyVES(changeVES)})\n`;
    }
    receipt += `\n¡Muchas gracias por apoyar nuestro emprendimiento artesanal! ${workshopProfile?.logoEmoji || '✨'}`;

    navigator.clipboard.writeText(receipt);
    onNotify('¡Comprobante de compra copiado al portapapeles! Listo para enviar por WhatsApp.');
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card cash-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>💵</span>
            <div>
              <h2 style={{ fontSize: '17px', margin: 0 }}>Caja Rápida & Calculadora de Vuelto</h2>
              <small style={{ color: 'var(--muted)', fontSize: '11px' }}>
                Tasa activa: <b>{activeRateName}</b> ({moneyVES(activeRate)})
              </small>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {/* Total amount to charge */}
          <div style={{ background: '#f5faf4', border: '1px solid #d4ebdc', borderRadius: '12px', padding: '14px' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#275239', display: 'block', marginBottom: '4px' }}>
              TOTAL DE LA COMPRA ($ USD)
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                step="0.10"
                min="0.1"
                className="margin-input"
                style={{ fontSize: '20px', fontWeight: 900, padding: '8px 12px', color: '#163826' }}
                value={totalUSD}
                onChange={(e) => setTotalUSD(parseFloat(e.target.value) || 0)}
              />
              <div style={{ textAlign: 'right', minWidth: '120px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>En Bolívares:</span>
                <strong style={{ fontSize: '16px', color: '#1b4d35' }}>{moneyVES(totalVES)}</strong>
              </div>
            </div>
          </div>

          {/* Quick cash denomination buttons */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#495a51', display: 'block', marginBottom: '6px' }}>
              ¿Con cuánto billete paga el cliente en $ Efectivo?
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[1, 2, 5, 10, 20, 50].map((bill) => (
                <button
                  type="button"
                  key={bill}
                  onClick={() => setCashReceivedUSD(bill)}
                  style={{
                    flex: '1 1 50px',
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: cashReceivedUSD === bill ? '2px solid #26785c' : '1px solid var(--line)',
                    background: cashReceivedUSD === bill ? '#e9f6ed' : 'white',
                    fontWeight: 800,
                    fontSize: '13px',
                    color: cashReceivedUSD === bill ? '#185036' : 'var(--ink)',
                  }}
                >
                  ${bill}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCashReceivedUSD(totalUSD)}
                style={{
                  flex: '1 1 70px',
                  padding: '8px 6px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  background: '#f4f6f3',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                Exacto
              </button>
            </div>
          </div>

          {/* Cash input & PagoMovil input */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '10px' }}>
            <div className="form-field">
              <label style={{ fontSize: '11px' }}>Efectivo recibido ($ USD)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                className="margin-input"
                value={cashReceivedUSD}
                onChange={(e) => setCashReceivedUSD(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11px' }}>PagoMóvil recibido (Bs.)</label>
              <input
                type="number"
                step="50"
                min="0"
                className="margin-input"
                placeholder="0,00"
                value={pagoMovilReceivedVES || ''}
                onChange={(e) => setPagoMovilReceivedVES(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Change or Pending Calculation Box */}
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: isPending ? '#fff4e5' : isChangeNeeded ? 'var(--deep)' : '#e9f6ed',
              color: isChangeNeeded ? 'white' : 'var(--ink)',
              border: isPending ? '1px solid #fed7aa' : isChangeNeeded ? '0' : '1px solid #b7dfca',
            }}
          >
            {isExact && (
              <div style={{ textAlign: 'center', fontWeight: 800, color: '#1f6543' }}>
                ✓ Pago exacto recibido. No se requiere vuelto.
              </div>
            )}

            {isChangeNeeded && (
              <div>
                <small style={{ color: '#b9d4c1', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px' }}>
                  VUELTO A ENTREGAR AL CLIENTE
                </small>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                  <strong style={{ fontSize: '26px', color: 'var(--lime)' }}>
                    {moneyUSD(changeUSD)}
                  </strong>
                  <strong style={{ fontSize: '17px', color: '#fff' }}>
                    ó {moneyVES(changeVES)}
                  </strong>
                </div>
                <small style={{ color: '#b9d4c1', fontSize: '10px', marginTop: '2px', display: 'block' }}>
                  Si no tienes sencillo físico, transfiérele {moneyVES(changeVES)} por PagoMóvil.
                </small>
              </div>
            )}

            {isPending && (
              <div>
                <small style={{ color: '#9a3412', textTransform: 'uppercase', fontSize: '10px', fontWeight: 800 }}>
                  SALDO RESTANTE POR PAGAR (PAGO MIXTO)
                </small>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                  <strong style={{ fontSize: '22px', color: '#c2410c' }}>
                    {moneyUSD(remainingUSD)}
                  </strong>
                  <strong style={{ fontSize: '16px', color: '#9a3412' }}>
                    {moneyVES(remainingVES)}
                  </strong>
                </div>
                <small style={{ color: '#7c2d12', fontSize: '10px', marginTop: '2px', display: 'block' }}>
                  Pide al cliente que complete con PagoMóvil: <b>{moneyVES(remainingVES)}</b>.
                </small>
              </div>
            )}
          </div>

          {/* Customer name for receipt */}
          <div className="form-field">
            <label style={{ fontSize: '11px' }}>Nombre del cliente (para el recibo opcional)</label>
            <input
              type="text"
              placeholder="Ej. Sra. Elena"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              className="ghost-btn"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleCopyReceipt}
            >
              📲 Enviar Recibo WhatsApp
            </button>
            <button
              type="button"
              className="primary-btn"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => {
                onNotify('Cobro registrado en caja correctamente.');
                onClose();
              }}
            >
              Listo ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
