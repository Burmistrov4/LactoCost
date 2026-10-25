import React, { useState, useEffect } from 'react';
import { ScrapedRates, RateReferenceType, ViewId, ColorPaletteId, UserProfile, WorkshopProfile, ArtisanCategory } from '../types';
import { moneyUSD, moneyVES } from '../utils/formatters';
import { COLOR_PALETTES } from '../utils/theme';
import { ROLE_LABELS } from '../utils/auth';
import { WORKSHOP_PRESETS, WorkshopPreset, generateMonogram, DEFAULT_WORKSHOP_PROFILE } from '../utils/workshop';

interface SettingsViewProps {
  rates: ScrapedRates;
  activeRateType: RateReferenceType;
  onChangeRateType: (type: RateReferenceType) => void;
  onRefreshRates: () => Promise<void>;
  isRefreshingRates: boolean;
  onNavigate: (view: ViewId) => void;
  onNotify: (msg: string) => void;
  currentPalette?: ColorPaletteId;
  onSelectPalette?: (palette: ColorPaletteId) => void;
  workshopProfile?: WorkshopProfile;
  onUpdateWorkshopProfile?: (profile: WorkshopProfile) => void;
  currentUser?: UserProfile | null;
  users?: UserProfile[];
  onOpenAuthModal?: (mode?: 'login' | 'register' | 'switch') => void;
  onStartWalkthrough?: () => void;
  onResetToClean?: () => void;
  onLoadSampleData?: () => void;
  onExportBackup?: () => void;
  onImportBackup?: (json: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  rates,
  activeRateType,
  onChangeRateType,
  onRefreshRates,
  isRefreshingRates,
  onNavigate,
  onNotify,
  currentPalette = 'vanilla',
  onSelectPalette,
  workshopProfile,
  onUpdateWorkshopProfile,
  currentUser,
  users = [],
  onOpenAuthModal,
  onStartWalkthrough,
  onResetToClean,
  onLoadSampleData,
  onExportBackup,
  onImportBackup,
}) => {
  const [testAmountUSD, setTestAmountUSD] = useState<number>(10);
  const [testAmountVES, setTestAmountVES] = useState<number>(10000);

  // Workshop Profile Local Form State
  const [wName, setWName] = useState<string>(workshopProfile?.name || 'Delicias Flor Amarillo');
  const [wTagline, setWTagline] = useState<string>(workshopProfile?.tagline || 'Yogures, Quesillo & Torta de Pan');
  const [wCategory, setWCategory] = useState<ArtisanCategory>(workshopProfile?.category || 'dairy');
  const [wCategoryLabel, setWCategoryLabel] = useState<string>(workshopProfile?.categoryLabel || 'Lácteos & Postres Tradicionales');
  const [wLocation, setWLocation] = useState<string>(workshopProfile?.location || 'Valencia Sur, Carabobo');
  const [wPhone, setWPhone] = useState<string>(workshopProfile?.phone || '0414-0000000');
  const [wDeliveryZones, setWDeliveryZones] = useState<string>(workshopProfile?.deliveryZones || 'Flor Amarillo, Los Bucares, La Isabelica y Zona Sur');
  const [wMonogram, setWMonogram] = useState<string>(workshopProfile?.monogram || 'FA');
  const [wEmoji, setWEmoji] = useState<string>(workshopProfile?.logoEmoji || '🥛');
  const [wInstagram, setWInstagram] = useState<string>(workshopProfile?.instagramUser || '@deliciasfloramarillo');

  useEffect(() => {
    if (workshopProfile) {
      setWName(workshopProfile.name);
      setWTagline(workshopProfile.tagline);
      setWCategory(workshopProfile.category);
      setWCategoryLabel(workshopProfile.categoryLabel);
      setWLocation(workshopProfile.location);
      setWPhone(workshopProfile.phone);
      setWDeliveryZones(workshopProfile.deliveryZones);
      setWMonogram(workshopProfile.monogram);
      setWEmoji(workshopProfile.logoEmoji);
      setWInstagram(workshopProfile.instagramUser || '');
    }
  }, [workshopProfile]);

  const handleApplyPreset = (preset: WorkshopPreset) => {
    setWName(preset.name);
    setWTagline(preset.tagline);
    setWCategory(preset.category);
    setWCategoryLabel(preset.categoryLabel);
    setWEmoji(preset.emoji);
    setWMonogram(preset.monogram);
    setWLocation(preset.sampleLocation);
    onNotify(`✨ Plantilla cargada: "${preset.name}". Haz clic en "Guardar Identidad" para confirmar.`);
  };

  const handleSaveWorkshop = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!wName.trim()) {
      onNotify('⚠️ Por favor ingresa el nombre de tu taller.');
      return;
    }
    const finalMonogram = wMonogram.trim() || generateMonogram(wName);
    const updated: WorkshopProfile = {
      name: wName.trim(),
      tagline: wTagline.trim(),
      category: wCategory,
      categoryLabel: wCategoryLabel.trim(),
      location: wLocation.trim(),
      phone: wPhone.trim(),
      deliveryZones: wDeliveryZones.trim(),
      monogram: finalMonogram.toUpperCase(),
      logoEmoji: wEmoji.trim() || '✨',
      instagramUser: wInstagram.trim(),
    };
    if (onUpdateWorkshopProfile) {
      onUpdateWorkshopProfile(updated);
    }
    onNotify(`💾 ¡Identidad de "${updated.name}" guardada con éxito!`);
  };

  const handleRestoreDefault = () => {
    if (onUpdateWorkshopProfile) {
      onUpdateWorkshopProfile(DEFAULT_WORKSHOP_PROFILE);
    }
    onNotify('↺ Identidad restaurada a los valores de Delicias Flor Amarillo.');
  };

  const activeRateValue =
    activeRateType === 'bcv_eur'
      ? rates.bcvEur
      : activeRateType === 'binance_p2p'
      ? rates.binanceP2PAvg
      : rates.manualRate || rates.bcvEur;

  return (
    <section className="view-state active" id="view-settings">
      {/* 1. Tarjeta Destacada: Identidad del Taller & Propósito del Proyecto */}
      <div className="card panel" style={{ marginBottom: '24px', border: '1.5px solid var(--line)' }}>
        <div className="panel-title" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '24px' }}>🏢</span>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
                Identidad de tu Taller & Propósito del Proyecto
              </h2>
              <span style={{ fontSize: '11px', background: 'var(--mint)', color: 'var(--green)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                100% PERSONALIZABLE
              </span>
            </div>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>
              Personaliza el nombre de tu marca, eslogan, rubro y datos de contacto. Se adaptará automáticamente en el menú lateral, recibos de caja, pedidos de WhatsApp y rótulos.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="primary-btn"
              onClick={handleSaveWorkshop}
              style={{ padding: '8px 16px' }}
            >
              💾 Guardar Identidad
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={handleRestoreDefault}
              title="Restaurar a Delicias Flor Amarillo"
              style={{ fontSize: '12px' }}
            >
              ↺ Reset
            </button>
          </div>
        </div>

        {/* Propósito Útil del Proyecto */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '12px', padding: '14px 16px', marginTop: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ fontSize: '24px', lineHeight: 1 }}>🎯</span>
          <div style={{ flex: 1, fontSize: '13px', lineHeight: '1.5', color: 'var(--ink)' }}>
            <strong style={{ display: 'block', marginBottom: '2px', color: 'var(--green)' }}>
              Propósito Central de la Aplicación:
            </strong>
            Dar a los productores artesanales y reposteros control financiero total: saber con precisión científica cuánto cuesta cada ración o envase (CPP), blindar los precios contra la inflación y la devaluación mediante doble moneda ($ y Bs. con tasas oficiales y libres), y acelerar las ventas con recibos y pedidos listos para WhatsApp.
          </div>
        </div>

        {/* Plantillas Rápidas con 1 Clic */}
        <div style={{ marginTop: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
            ⚡ Plantillas Rápidas de Taller (Selecciona una para autocompletar):
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {WORKSHOP_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="ghost-btn"
                style={{
                  fontSize: '12.5px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: wName === p.name ? '2px solid var(--green)' : '1px solid var(--line)',
                  background: wName === p.name ? 'var(--mint)' : 'var(--white)',
                  color: wName === p.name ? 'var(--green)' : 'var(--ink)',
                  fontWeight: wName === p.name ? 700 : 500,
                }}
              >
                <span>{p.emoji}</span>
                <span>{p.name}</span>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>({p.categoryLabel.split(' ')[0]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Formulario de Configuración y Vista Previa en Vivo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '22px' }}>
          {/* Columna Izquierda: Campos del Taller */}
          <form onSubmit={handleSaveWorkshop} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="field">
              <label style={{ fontWeight: 700, fontSize: '13px' }}>
                Nombre del Taller o Emprendimiento <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={wName}
                  onChange={(e) => {
                    setWName(e.target.value);
                  }}
                  placeholder="Ej. Delicias Flor Amarillo, Masa Dulce..."
                  required
                  style={{ flex: 1, fontWeight: 700, fontSize: '15px' }}
                />
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setWMonogram(generateMonogram(wName))}
                  title="Autogenerar siglas según el nombre"
                  style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
                >
                  ⚡ Siglas
                </button>
              </div>
            </div>

            <div className="field">
              <label style={{ fontWeight: 700, fontSize: '13px' }}>Eslogan o Especialidad</label>
              <input
                type="text"
                value={wTagline}
                onChange={(e) => setWTagline(e.target.value)}
                placeholder="Ej. Yogures, Quesillo & Torta de Pan"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="field">
                <label style={{ fontWeight: 700, fontSize: '13px' }}>Rubro / Categoría</label>
                <select
                  value={wCategory}
                  onChange={(e) => {
                    const cat = e.target.value as ArtisanCategory;
                    setWCategory(cat);
                    const map: Record<ArtisanCategory, string> = {
                      dairy: 'Lácteos & Postres Tradicionales',
                      pastry: 'Repostería Fina & Postres Fríos',
                      flan: 'Flanes & Quesillos Tradicionales',
                      bakery: 'Panadería & Bollería Criolla',
                      chocolate: 'Chocolatería & Cacao Venezolano',
                      general: 'Alimentos Artesanales',
                    };
                    setWCategoryLabel(map[cat] || 'Alimentos Artesanales');
                  }}
                >
                  <option value="dairy">🥛 Lácteos & Yogur Griego</option>
                  <option value="flan">🍮 Quesillos & Flanes</option>
                  <option value="pastry">🧁 Repostería & Pastelería</option>
                  <option value="bakery">🍞 Panadería & Masas</option>
                  <option value="chocolate">🍫 Chocolatería & Cacao</option>
                  <option value="general">⭐ General Artesanal</option>
                </select>
              </div>

              <div className="field">
                <label style={{ fontWeight: 700, fontSize: '13px' }}>Siglas / Monograma</label>
                <input
                  type="text"
                  maxLength={4}
                  value={wMonogram}
                  onChange={(e) => setWMonogram(e.target.value.toUpperCase())}
                  placeholder="Ej. FA"
                  style={{ textTransform: 'uppercase', fontWeight: 800, textAlign: 'center' }}
                />
              </div>
            </div>

            <div className="field">
              <label style={{ fontWeight: 700, fontSize: '13px' }}>Ícono / Emoji de la Marca</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['🥛', '🍮', '🧁', '🍞', '🧀', '🍰', '🍫', '🍓', '☕', '⭐', '🍪', '🥐'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setWEmoji(emoji)}
                    style={{
                      fontSize: '18px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: wEmoji === emoji ? '2px solid var(--green)' : '1px solid var(--line)',
                      background: wEmoji === emoji ? 'var(--mint)' : 'var(--white)',
                      cursor: 'pointer',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="field">
                <label style={{ fontWeight: 700, fontSize: '13px' }}>Ubicación / Ciudad</label>
                <input
                  type="text"
                  value={wLocation}
                  onChange={(e) => setWLocation(e.target.value)}
                  placeholder="Ej. Valencia Sur, Carabobo"
                />
              </div>

              <div className="field">
                <label style={{ fontWeight: 700, fontSize: '13px' }}>WhatsApp de Clientes</label>
                <input
                  type="text"
                  value={wPhone}
                  onChange={(e) => setWPhone(e.target.value)}
                  placeholder="Ej. 0414-1234567"
                />
              </div>
            </div>

            <div className="field">
              <label style={{ fontWeight: 700, fontSize: '13px' }}>Zonas de Entrega / Delivery</label>
              <input
                type="text"
                value={wDeliveryZones}
                onChange={(e) => setWDeliveryZones(e.target.value)}
                placeholder="Ej. Flor Amarillo, Los Bucares, La Isabelica..."
              />
            </div>

            <div className="field">
              <label style={{ fontWeight: 700, fontSize: '13px' }}>Instagram / Usuario de Red Social</label>
              <input
                type="text"
                value={wInstagram}
                onChange={(e) => setWInstagram(e.target.value)}
                placeholder="Ej. @mitallerartesanal"
              />
            </div>

            <div style={{ marginTop: '8px' }}>
              <button
                type="submit"
                className="primary-btn"
                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
              >
                💾 Guardar Identidad del Taller
              </button>
            </div>
          </form>

          {/* Columna Derecha: Vista Previa en Vivo (Live Preview Card) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              👁️ Vista Previa en Vivo de tu Marca:
            </div>

            {/* Mockup 1: Cabecera en el Menú Lateral */}
            <div style={{ background: 'var(--deep)', borderRadius: '14px', padding: '16px', color: '#ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--lime)', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
                Cómo se ve en el Menú Lateral
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--lime)', color: 'var(--deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px', fontFamily: 'Outfit, sans-serif' }}>
                  {wMonogram || 'FA'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {wName || 'Tu Marca'}<span style={{ color: 'var(--lime)' }}>.</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#9bb0a4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {wTagline || 'Taller Artesanal'}
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup 2: Encabezado de Recibo de Caja */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid var(--line)', padding: '16px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--ink)' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--line)', paddingBottom: '8px', marginBottom: '8px' }}>
                <strong style={{ fontSize: '13px', display: 'block' }}>
                  🧾 {(wName || 'TALLER ARTESANAL').toUpperCase()}
                </strong>
                <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
                  📍 {wLocation || 'Valencia Sur'} · 📞 {wPhone || 'WhatsApp'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: '11px' }}>
                <span>Total a Pagar:</span>
                <strong style={{ color: 'var(--ink)' }}>$5.40 · Bs. 4,757.78</strong>
              </div>
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '10.5px', color: 'var(--green)' }}>
                ¡Muchas gracias por apoyar nuestro emprendimiento artesanal! {wEmoji}
              </div>
            </div>

            {/* Mockup 3: Rótulo de Empaque */}
            <div style={{ background: 'var(--white)', border: '2px dashed var(--green)', borderRadius: '12px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 800, color: 'var(--green)', letterSpacing: '0.5px' }}>
                    {(wName || 'TALLER ARTESANAL').toUpperCase()}
                  </span>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)', margin: '1px 0' }}>
                    {wEmoji} Yogur Griego Artesanal
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                    {wLocation} · {wInstagram}
                  </span>
                </div>
                <span style={{ background: 'var(--mint)', color: 'var(--green)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '11px' }}>
                  200 g
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card panel">
        <div className="panel-title">
          <div>
            <h2 style={{ margin: 0, fontSize: '19px' }}>Configuración de Tasas de Cambio</h2>
            <p>
              Scraping automático del <b>Euro BCV</b> y promedio actual <b>USDT Binance P2P</b>.
            </p>
          </div>
          <button
            className="primary-btn"
            id="refreshRates"
            type="button"
            onClick={async () => {
              await onRefreshRates();
              onNotify('Tasas actualizadas en vivo desde BCV y Binance P2P.');
            }}
            disabled={isRefreshingRates}
          >
            {isRefreshingRates ? '↻ Sincronizando…' : '↻ Actualizar Tasas en Vivo'}
          </button>
        </div>

        <div className="rates-warning" style={{ background: '#f5faf4', borderColor: '#cfe8d4', color: '#1a4e2f' }}>
          <strong>Las 3 Referencias Clave de Gestión en Venezuela</strong>
          <p>
            • <b>Oficial BCV USD:</b> Tasa oficial del Dólar BCV, obligatoria para compras en supermercados y distribuidoras (con IVA 16% incluido).<br />
            • <b>Tasa Euro:</b> Cotización oficial para cobro al público y facturación regular.<br />
            • <b>Binance P2P USDT:</b> Cotización libre de mercado para reposición de insumos al mayor.
          </p>
        </div>

        <div className="rates-status">
          Última actualización: <b>{new Date(rates.fetchedAt).toLocaleTimeString()}</b> ({rates.bcvDate}) · Estado: <span className="status good">{rates.isLive ? 'EN VIVO' : 'REFERENCIA'}</span>
        </div>

        <div className="rates-grid">
          {/* Card 0: Oficial BCV (USD) */}
          <article className={`rate-policy-card ${activeRateType === 'bcv_usd' ? 'active-policy' : ''}`} style={{ border: activeRateType === 'bcv_usd' ? '2px solid #26785c' : '1px solid var(--line)' }}>
            <div className="rate-policy-title">
              <span className="rate-icon">🏛️</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0 }}>Tasa Oficial BCV (USD)</h3>
                  {activeRateType === 'bcv_usd' && <span style={{ fontSize: '11px', color: 'var(--lime)', fontWeight: 700 }}>· ACTIVA EN COBROS</span>}
                </div>
                <p>Obligatoria para compras en comercios físicos y cálculo de IVA 16%.</p>
              </div>
            </div>

            <div className="rate-result" style={{ marginTop: '16px' }}>
              <small>Tasa Oficial USD / VES</small>
              <strong style={{ fontSize: '26px', color: 'var(--lime)' }}>{moneyVES(rates.bcvUsd)}</strong>
              <span>Fecha efectiva: {rates.bcvDate} · Fuente: Banco Central de Venezuela</span>
            </div>

            <div style={{ marginTop: '14px' }}>
              <button
                type="button"
                className={activeRateType === 'bcv_usd' ? 'primary-btn' : 'ghost-btn'}
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  onChangeRateType('bcv_usd');
                  onNotify('Tasa activa fijada a Oficial BCV (USD).');
                }}
              >
                {activeRateType === 'bcv_usd' ? '✓ Referencia Activa para Cobros' : 'Usar Oficial BCV para Cobrar'}
              </button>
            </div>
          </article>

          {/* Card 1: Tasa Euro */}
          <article className={`rate-policy-card ${activeRateType === 'bcv_eur' ? 'active-policy' : ''}`} style={{ border: activeRateType === 'bcv_eur' ? '2px solid #26785c' : '1px solid var(--line)' }}>
            <div className="rate-policy-title">
              <span className="rate-icon">💶</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0 }}>Euro Banco Central de Venezuela</h3>
                  {activeRateType === 'bcv_eur' && <span style={{ fontSize: '11px', color: 'var(--lime)', fontWeight: 700 }}>· ACTIVA EN COBROS</span>}
                </div>
                <p>Tasa oficial publicada por el Banco Central de Venezuela.</p>
              </div>
            </div>

            <div className="rate-result" style={{ marginTop: '16px' }}>
              <small>Tasa Oficial EUR / VES</small>
              <strong style={{ fontSize: '26px', color: 'var(--lime)' }}>{moneyVES(rates.bcvEur)}</strong>
              <span>Fecha efectiva: {rates.bcvDate} · Fuente: Banco Central de Venezuela</span>
            </div>

            <div style={{ marginTop: '14px' }}>
              <button
                type="button"
                className={activeRateType === 'bcv_eur' ? 'primary-btn' : 'ghost-btn'}
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  onChangeRateType('bcv_eur');
                  onNotify('Tasa activa fijada a Euro BCV.');
                }}
              >
                {activeRateType === 'bcv_eur' ? '✓ Referencia Activa para Cobros' : 'Usar Euro BCV para Cobrar'}
              </button>
            </div>
          </article>

          {/* Card 2: Binance P2P USDT */}
          <article className={`rate-policy-card ${activeRateType === 'binance_p2p' ? 'active-policy' : ''}`} style={{ border: activeRateType === 'binance_p2p' ? '2px solid #26785c' : '1px solid var(--line)' }}>
            <div className="rate-policy-title">
              <span className="rate-icon">🟡</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0 }}>Binance P2P USDT Promedio</h3>
                  {activeRateType === 'binance_p2p' && <span style={{ fontSize: '11px', color: 'var(--lime)', fontWeight: 700 }}>· ACTIVA EN COBROS</span>}
                </div>
                <p>Promedio ponderado de anuncios activos con finalización &ge; 85%.</p>
              </div>
            </div>

            <div className="rate-result" style={{ marginTop: '16px' }}>
              <small>Tasa Promedio Mercado P2P USDT / VES</small>
              <strong style={{ fontSize: '26px', color: 'var(--lime)' }}>{moneyVES(rates.binanceP2PAvg)}</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px', fontSize: '10px', color: '#c4d7cc' }}>
                <span>Comprar USDT: {moneyVES(rates.binanceP2PBuy)}</span>
                <span>Vender USDT: {moneyVES(rates.binanceP2PSell)}</span>
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <button
                type="button"
                className={activeRateType === 'binance_p2p' ? 'primary-btn' : 'ghost-btn'}
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  onChangeRateType('binance_p2p');
                  onNotify('Tasa activa fijada a Binance P2P USDT.');
                }}
              >
                {activeRateType === 'binance_p2p' ? '✓ Referencia Activa para Cobros' : 'Usar Binance P2P para Cobrar'}
              </button>
            </div>
          </article>
        </div>

        {/* Currency Converter for the Entrepreneur */}
        <div style={{ background: '#f8faf7', border: '1px solid var(--line)', borderRadius: '14px', padding: '16px', marginTop: '20px' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Conversor Rápido en Mostrador</h3>
          <p style={{ margin: '0 0 14px', fontSize: '11px', color: 'var(--muted)' }}>
            Calcula cuánto debe pagar un cliente en bolívares según la tasa activa ({moneyVES(activeRateValue)}).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '16px' }}>
            <div>
              <label className="field-label" style={{ marginTop: 0 }}>
                Monto en Dólares ($ USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="margin-input"
                value={testAmountUSD}
                onChange={(e) => setTestAmountUSD(parseFloat(e.target.value) || 0)}
              />
              <div style={{ marginTop: '8px', padding: '10px', background: 'white', border: '1px solid #dce4da', borderRadius: '8px', fontWeight: 800, color: '#1e4832' }}>
                Cobrar en Bolívares: {moneyVES(testAmountUSD * activeRateValue)}
              </div>
            </div>

            <div>
              <label className="field-label" style={{ marginTop: 0 }}>
                Monto recibido en Bolívares (Bs. VES)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                className="margin-input"
                value={testAmountVES}
                onChange={(e) => setTestAmountVES(parseFloat(e.target.value) || 0)}
              />
              <div style={{ marginTop: '8px', padding: '10px', background: 'white', border: '1px solid #dce4da', borderRadius: '8px', fontWeight: 800, color: '#1e4832' }}>
                Equivale en Dólares: {moneyUSD(testAmountVES / (activeRateValue || 1))}
              </div>
            </div>
          </div>
        </div>

        {/* Paletas de Colores & Diseño del Taller */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '14px', padding: '18px', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '4px' }}>
            <span style={{ fontSize: '20px' }}>🎨</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
              Paletas de Colores & Diseño Visual del Taller
            </h3>
          </div>
          <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: 'var(--muted)' }}>
            Elige la paleta que mejor represente la personalidad y los productos de tu emprendimiento:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {COLOR_PALETTES.map((p) => {
              const isSelected = currentPalette === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    if (onSelectPalette) onSelectPalette(p.id);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid var(--lime)' : '1px solid var(--line)',
                    background: isSelected ? 'var(--mint)' : 'var(--paper)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ fontSize: '18px' }}>{p.emoji}</span>
                      <strong style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{p.name}</strong>
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: '9.5px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: 'var(--deep)', color: 'var(--lime)' }}>
                        ACTIVA
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', lineHeight: 1.35 }}>
                    {p.description}
                  </span>
                  <div style={{ display: 'flex', gap: '5px', marginTop: 'auto' }}>
                    {p.previewColors.map((c, i) => (
                      <span
                        key={i}
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: c,
                          border: '1px solid rgba(0,0,0,0.1)',
                          display: 'inline-block',
                        }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Perfiles de Usuario & Control de Acceso Separado */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '14px', padding: '18px', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <span style={{ fontSize: '22px' }}>👥</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  Perfiles de Usuario & Roles Separados ({users.length})
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                  Perfiles independientes con permisos diferenciados para Dueña, Ventas y Taller
                </p>
              </div>
            </div>
            {onOpenAuthModal && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => onOpenAuthModal('register')}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  ➕ Registrar Nuevo Perfil
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => onOpenAuthModal('switch')}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  🔄 Cambiar de Perfil
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginTop: '12px' }}>
            {users.map((u) => {
              const isCurrent = currentUser?.id === u.id;
              return (
                <div
                  key={u.id}
                  style={{
                    background: isCurrent ? 'var(--mint)' : 'var(--paper)',
                    border: isCurrent ? '2px solid var(--lime)' : '1px solid var(--line)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{u.avatarEmoji}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{u.name}</strong>
                        {isCurrent && (
                          <span style={{ fontSize: '9px', fontWeight: 800, background: 'var(--deep)', color: 'var(--lime)', padding: '2px 5px', borderRadius: '4px' }}>
                            ACTIVO
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>
                        {ROLE_LABELS[u.role].label} · PIN: ••••
                      </span>
                    </div>
                  </div>
                  {onOpenAuthModal && !isCurrent && (
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => onOpenAuthModal('switch')}
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      Activar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Venezuelan Dairy Industry Benchmarks Card */}
        <div style={{ background: '#f5faf5', border: '1px solid #c8e2d1', borderRadius: '14px', padding: '16px', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px' }}>🥛</span>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#163d27' }}>
              Referencia del Sector Lácteo Nacional (Venezuela)
            </h3>
          </div>
          <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#315540' }}>
            Valores estándar para orientación de costos y rendimientos:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #dbeae0' }}>
              <small style={{ color: 'var(--muted)', display: 'block' }}>Costo Leche en Planta/Finca:</small>
              <strong style={{ fontSize: '15px', color: '#1c4d32' }}>$0.85 - $1.20 / Litro</strong>
              <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>Fuente: Canilac & Fedenaga</span>
            </div>
            <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #dbeae0' }}>
              <small style={{ color: 'var(--muted)', display: 'block' }}>Rendimiento Yogurt Firme:</small>
              <strong style={{ fontSize: '15px', color: '#1c4d32' }}>4.8 a 5 potes (200g) / Litro</strong>
              <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>Aprovechamiento ~98%</span>
            </div>
            <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #dbeae0' }}>
              <small style={{ color: 'var(--muted)', display: 'block' }}>Rendimiento Quesillo:</small>
              <strong style={{ fontSize: '15px', color: '#1c4d32' }}>~12 a 14 porciones / Litro</strong>
              <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>Con leche condensada y huevos</span>
            </div>
          </div>
        </div>

        {/* Data Management & Backup */}
        <div style={{ background: '#fcfcfc', border: '1px solid var(--line)', borderRadius: '14px', padding: '16px', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px' }}>Gestión de Datos y Respaldos</h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                Tus datos se guardan automáticamente en tu dispositivo. Puedes reiniciar o respaldar cuando quieras.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
            {onStartWalkthrough && (
              <button
                type="button"
                className="ghost-btn"
                onClick={onStartWalkthrough}
                style={{ background: '#eaf7ef', borderColor: '#77b894', color: '#1d5a3b' }}
              >
                💡 Iniciar Tutorial / Walkthrough
              </button>
            )}

            {onResetToClean && (
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  if (window.confirm('¿Segura que deseas reiniciar las ventas y movimientos a cero para empezar limpia con tus datos?')) {
                    onResetToClean();
                  }
                }}
                style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
              >
                🧹 Limpiar a Modo Limpio (0 ventas)
              </button>
            )}

            {onLoadSampleData && (
              <button
                type="button"
                className="ghost-btn"
                onClick={onLoadSampleData}
              >
                🥛 Cargar Plantilla de Ejemplo
              </button>
            )}

            {onExportBackup && (
              <button
                type="button"
                className="ghost-btn"
                onClick={onExportBackup}
              >
                💾 Descargar Respaldo JSON
              </button>
            )}

            {onImportBackup && (
              <label className="ghost-btn" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                📂 Restaurar Respaldo
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        if (content) onImportBackup(content);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>

        <div className="rates-footer" style={{ marginTop: '20px' }}>
          <p>
            Ambas referencias son consultadas mediante conexiones seguras al Banco Central de Venezuela y al mercado P2P de Binance.
          </p>
          <button className="primary-btn" onClick={() => onNavigate('dashboard')}>
            Volver al dashboard
          </button>
        </div>
      </div>
    </section>
  );
};
