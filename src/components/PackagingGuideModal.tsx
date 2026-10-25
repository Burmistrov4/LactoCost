import React, { useState } from 'react';
import { moneyUSD, moneyVES } from '../utils/formatters';
import { VENEZUELAN_PACKAGING_BENCHMARKS } from '../data/initialData';

interface PackagingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRate: number;
  activeRateName: string;
  onUpdatePackagingCost?: (newCostUSD: number) => void;
}

export const PackagingGuideModal: React.FC<PackagingGuideModalProps> = ({
  isOpen,
  onClose,
  activeRate,
  activeRateName,
  onUpdatePackagingCost,
}) => {
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [customUnitsMonth, setCustomUnitsMonth] = useState(300);
  const [customRetailPrice, setCustomRetailPrice] = useState(0.18);
  const [customWholesalePrice, setCustomWholesalePrice] = useState(0.12);
  const [copiedTip, setCopiedTip] = useState(false);
  const [savedNotification, setSavedNotification] = useState('');

  if (!isOpen) return null;

  const currentSize = VENEZUELAN_PACKAGING_BENCHMARKS.sizes[selectedSizeIndex] || VENEZUELAN_PACKAGING_BENCHMARKS.sizes[0];

  // Calculations for savings
  const monthlyCostRetailUSD = customUnitsMonth * customRetailPrice;
  const monthlyCostWholesaleUSD = customUnitsMonth * customWholesalePrice;
  const monthlySavingsUSD = Math.max(0, monthlyCostRetailUSD - monthlyCostWholesaleUSD);
  const monthlySavingsVES = monthlySavingsUSD * activeRate;

  const scriptToAskSupplier = `Buenas tardes, estoy buscando tinas redondas traslúcidas de polipropileno (PP) grado alimenticio de 8 oz con tapa hermética a presión (tipo pote deli). ¿Qué precio tiene el bulto o fardo cerrado de 500 unidades con sus tapas incluidas? ¿Qué marca tienen disponible (Darnel, Caripack o similar)? Muchas gracias.`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptToAskSupplier);
    setCopiedTip(true);
    setTimeout(() => setCopiedTip(false), 2500);
  };

  const handleApplyCost = () => {
    if (onUpdatePackagingCost) {
      onUpdatePackagingCost(customWholesalePrice);
      setSavedNotification(`¡Costo de $${customWholesalePrice.toFixed(2)} aplicado a tu inventario y recetas!`);
      setTimeout(() => setSavedNotification(''), 3000);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(4px)',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #184e36 0%, #287a55 100%)',
            color: '#ffffff',
            padding: '20px 24px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '24px' }}>🍶</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: 'rgba(255,255,255,0.2)',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              Guía de Empaques y Proveedores en Valencia (Edo. Carabobo)
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, lineHeight: 1.3 }}>
            Los "Potes de Arroz Chino" para Yogurt
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#e0f2e9', lineHeight: 1.4 }}>
            Nombre comercial exacto, medidas en onzas, precios mayoristas en La Candelaria (Valencia) y cómo pedirlos.
          </p>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {savedNotification && (
            <div
              style={{
                background: '#dcfce7',
                border: '1px solid #86efac',
                color: '#166534',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              ✓ {savedNotification}
            </div>
          )}

          {/* Section 1: Exact Commercial Name */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px' }}>🏷️</span>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                ¿Cuál es su nombre comercial exacto?
              </h3>
            </div>
            
            <p style={{ margin: '0 0 10px', fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>
              Popularmente en Venezuela se les llama <i>"potes de arroz chino"</i> o <i>"envases para comida china"</i>, pero en las distribuidoras de plásticos de <b>La Candelaria (Valencia)</b>, el <b>Mercado Mayorista</b> y en las facturas fiscales su nombre oficial es:
            </p>

            <div
              style={{
                background: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '10px',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#065f46' }}>
                {VENEZUELAN_PACKAGING_BENCHMARKS.commercialName}
              </div>
              <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px' }}>
                Comúnmente categorizados como: <b>"Tinas Deli traslúcidas con tapa hermética"</b> o <b>"Contenedores PP Redondos"</b>.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '12px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Marcas líderes</span>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>
                  {VENEZUELAN_PACKAGING_BENCHMARKS.popularBrands.join(' · ')}
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Material Grado Alimentario</span>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>
                  <b>Polipropileno (PP Nº 5)</b> · Libre de BPA · Apto para refrigeración (0° a 4°C).
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Why are they great for yogurt? */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '14px',
              padding: '14px 16px',
            }}
          >
            <h4 style={{ margin: '0 0 6px', fontSize: '13.5px', fontWeight: 700, color: '#166534' }}>
              ¿Por qué son la mejor opción para tu yogurt artesanal?
            </h4>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#15803d', lineHeight: 1.6 }}>
              <li><b>Resistencia al ácido láctico:</b> El polipropileno (PP) no reacciona químicamente con el pH ácido (4.2 - 4.6) del yogurt, protegiendo el sabor natural.</li>
              <li><b>Tapa hermética a presión ("clic"):</b> No se derrama con el movimiento del bolso térmico o moto en los envíos.</li>
              <li><b>Efecto vitrina traslúcida:</b> Permite lucir el color crema del yogurt y el contraste con las capas de mermelada (fresa, melocotón, mora) en el fondo.</li>
              <li><b>Económicos y estandarizados:</b> Fáciles de apilar en nevera y con superficie plana en la tapa para colocar tu etiqueta redonda.</li>
            </ul>
          </div>

          {/* Section 3: Sizes guide in oz vs ml vs grams */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                📏 Medidas recomendadas para Yogurt
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Toca un tamaño para ver detalles</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
              {VENEZUELAN_PACKAGING_BENCHMARKS.sizes.map((s, idx) => (
                <button
                  key={s.sizeLabel}
                  onClick={() => setSelectedSizeIndex(idx)}
                  style={{
                    flex: '1 0 130px',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: selectedSizeIndex === idx ? '2px solid #287a55' : '1px solid #cbd5e1',
                    background: selectedSizeIndex === idx ? '#e8f5ee' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: selectedSizeIndex === idx ? '#184e36' : '#1e293b' }}>
                    {s.sizeLabel.split(' ')[0]} {s.sizeLabel.split(' ')[1]}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {s.sizeLabel.split('(')[1]?.replace(')', '') || ''}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#287a55', marginTop: '4px' }}>
                    ~${s.wholesalePriceUSD.toFixed(2)} bulto
                  </div>
                </button>
              ))}
            </div>

            {/* Selected size detail card */}
            <div
              style={{
                marginTop: '10px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>{currentSize.sizeLabel}</strong>
                <span
                  style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {currentSize.purpose}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '8px', marginTop: '12px', textAlign: 'center' }}>
                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Al detal (paq. 25)</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#ef4444' }}>${currentSize.retailPriceUSD.toFixed(2)}</div>
                </div>
                <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#166534' }}>Al mayor (fardo 500)</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534' }}>${currentSize.wholesalePriceUSD.toFixed(2)}</div>
                </div>
                <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#1e40af' }}>Ahorro por fardo</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1d4ed8' }}>+${currentSize.savingPer500USD.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Source explanation & Buying in La Candelaria */}
          <div
            style={{
              background: '#fefce8',
              border: '1px solid #fef08a',
              borderRadius: '14px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px' }}>📍</span>
              <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: '#854d0e' }}>
                ¿De dónde sale la sugerencia de $0.18 a $0.14 y cuál es la fuente?
              </h3>
            </div>

            <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#713f12', lineHeight: 1.5 }}>
              <b>La fuente directa son las cotizaciones de distribuidores mayoristas de descartables y empaques en Valencia (Carabobo)</b> (específicamente en la zona comercial de <b>La Candelaria</b> en Calles Plaza y Michelena, y en el <b>Mercado Mayorista de Tocuyito / Valencia</b>).
            </p>

            <div style={{ background: '#ffffff', borderRadius: '10px', padding: '12px', border: '1px solid #fde047' }}>
              <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.5 }}>
                • <b>Si compras al detal en La Candelaria (Valencia)</b> (en paquetes de 25 o 50 unidades porque tienes poco capital inicial), el pote con tapa te sale aproximadamente en <b>$0.18 a $0.20 cada uno</b> ($4.50 a $5.00 el paquete de 25).
                <br /><br />
                • <b>Si compras por bulto o fardo cerrado de 500 unidades con tapa</b> (por ejemplo en el Mayorista de Tocuyito o distribuidores mayoristas de Carabobo), el bulto te cuesta entre <b>$55 y $65</b>, lo que equivale a <b>$0.11 a $0.13 por pote completo</b>.
                <br /><br />
                • <b>El impacto en tu bolsillo:</b> En cada bulto de 500 unidades dejas de gastar <b>$25 a $35 dólares</b>, que pasan directamente a engrosar tu ganancia limpia en el taller.
              </div>
            </div>

            <div style={{ marginTop: '12px', fontSize: '12px', color: '#854d0e', lineHeight: 1.6 }}>
              <b>📌 Zonas comerciales clave en Valencia y Carabobo:</b>
              <br />
              1. <b>La Candelaria (Valencia):</b> Calles Plaza, Michelena y Casco Central (distribuidoras y reposterías).
              <br />
              2. <b>Mercado Mayorista de Tocuyito / Valencia:</b> Galpones de descartables y empaques al mayor por bulto/fardo.
              <br />
              3. <b>Centro de Valencia / Av. Lara:</b> Calle Colombia y distribuidores autorizados Darnel y Caripack.
            </div>
          </div>

          {/* Section 5: Interactive Savings Calculator */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px',
            }}
          >
            <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              🧮 Simula tu ahorro según tu compra real en La Candelaria (8 oz, 12 oz, 16 oz y 32 oz)
            </h4>
            <p style={{ margin: '0 0 12px', fontSize: '12.5px', color: '#475569' }}>
              Toca un formato para cargar sus precios promedio reales de distribuidora o compara las 4 medidas simultáneamente:
            </p>

            {/* Quick Size Preset Selector */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {VENEZUELAN_PACKAGING_BENCHMARKS.sizes.map((s, idx) => (
                <button
                  key={s.sizeLabel}
                  type="button"
                  onClick={() => {
                    setSelectedSizeIndex(idx);
                    setCustomRetailPrice(s.retailPriceUSD);
                    setCustomWholesalePrice(s.wholesalePriceUSD);
                  }}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: selectedSizeIndex === idx ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: selectedSizeIndex === idx ? '#ecfdf5' : '#ffffff',
                    fontWeight: selectedSizeIndex === idx ? 800 : 600,
                    color: selectedSizeIndex === idx ? '#065f46' : '#334155',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  🥛 {s.sizeLabel.split(' ')[0]} {s.sizeLabel.split(' ')[1]} (~${s.wholesalePriceUSD.toFixed(2)} bulto)
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                  Potes que envasas al mes ({currentSize.sizeLabel.split(' ')[0]} {currentSize.sizeLabel.split(' ')[1]})
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={customUnitsMonth}
                  onChange={(e) => setCustomUnitsMonth(Number(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                  Costo al detal ($/unidad con tapa)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={customRetailPrice}
                  onChange={(e) => setCustomRetailPrice(Number(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                  Costo mayorista fardo 500u ($/unidad)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={customWholesalePrice}
                  onChange={(e) => setCustomWholesalePrice(Number(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    fontWeight: 700,
                  }}
                />
              </div>
            </div>

            {/* Savings Result Banner */}
            <div
              style={{
                marginTop: '14px',
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                border: '1.5px solid #6ee7b7',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
                  Tu ahorro mensual en {currentSize.sizeLabel.split(' ')[0]} {currentSize.sizeLabel.split(' ')[1]}
                </span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#065f46' }}>
                  {moneyUSD(monthlySavingsUSD)}{' '}
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#047857' }}>
                    ({moneyVES(monthlySavingsVES)} con {activeRateName})
                  </span>
                </div>
              </div>

              {onUpdatePackagingCost && (
                <button
                  type="button"
                  onClick={handleApplyCost}
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 14px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  Aplicar ${customWholesalePrice.toFixed(2)} al Inventario
                </button>
              )}
            </div>

            {/* 4-Size Comparison Matrix Table */}
            <div style={{ marginTop: '16px', overflowX: 'auto' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                📊 Comparativa de ahorro en los 4 tamaños (La Candelaria vs Detal):
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#475569', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '8px 10px' }}>Medida</th>
                    <th style={{ padding: '8px 10px' }}>Al detal (paq. 25)</th>
                    <th style={{ padding: '8px 10px' }}>Al mayor (fardo)</th>
                    <th style={{ padding: '8px 10px' }}>Ahorro x pote</th>
                    <th style={{ padding: '8px 10px' }}>Ahorro x bulto 500u</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {VENEZUELAN_PACKAGING_BENCHMARKS.sizes.map((s, i) => (
                    <tr key={s.sizeLabel} style={{ borderBottom: '1px solid #f1f5f9', background: selectedSizeIndex === i ? '#f0fdf4' : '#fff' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a' }}>
                        {s.sizeLabel.split(' ')[0]} {s.sizeLabel.split(' ')[1]}
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 400 }}>{s.purpose.slice(0, 30)}…</div>
                      </td>
                      <td style={{ padding: '8px 10px', color: '#dc2626', fontWeight: 600 }}>${s.retailPriceUSD.toFixed(2)}</td>
                      <td style={{ padding: '8px 10px', color: '#16a34a', fontWeight: 700 }}>${s.wholesalePriceUSD.toFixed(2)}</td>
                      <td style={{ padding: '8px 10px', color: '#059669', fontWeight: 600 }}>+${(s.retailPriceUSD - s.wholesalePriceUSD).toFixed(2)}</td>
                      <td style={{ padding: '8px 10px', color: '#1d4ed8', fontWeight: 800 }}>
                        +${s.savingPer500USD.toFixed(2)}
                        <span style={{ fontSize: '10px', display: 'block', color: '#2563eb' }}>
                          ({moneyVES(s.savingPer500USD * activeRate)})
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        {onUpdatePackagingCost && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdatePackagingCost(s.wholesalePriceUSD);
                              setSavedNotification(`¡Costo de $${s.wholesalePriceUSD.toFixed(2)} (${s.sizeLabel.split(' ')[0]} ${s.sizeLabel.split(' ')[1]}) asignado al inventario!`);
                              setTimeout(() => setSavedNotification(''), 3000);
                            }}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #059669',
                              color: '#059669',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Usar ${s.wholesalePriceUSD.toFixed(2)}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Answer to user: ¿Qué pasa si le doy 0.12$ al inventario? */}
            <div
              style={{
                marginTop: '14px',
                background: '#eff6ff',
                border: '1.5px solid #bfdbfe',
                borderRadius: '10px',
                padding: '12px 14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '16px' }}>💡</span>
                <strong style={{ fontSize: '13px', color: '#1e40af' }}>
                  ¿Qué sucede exactamente si le das $0.12 al inventario?
                </strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#1e3a8a', lineHeight: 1.55 }}>
                <li><b>Tu costo de empaque se reduce un 33%:</b> Pasa de $0.18 a $0.12 por pote con tapa hermética.</li>
                <li><b>Ganas $0.06 extra limpios por cada yogurt:</b> Si vendes cada pote a <b>$2.00</b>, tu costo baja a ~$1.00 y tu ganancia neta es de <b>$1.00 exacto por unidad (50% margen real)</b>.</li>
                <li><b>En 300 yogures al mes:</b> Te quedan <b>+$18.00 dólares limpios</b> adicionales en el bolsillo cada mes.</li>
                <li><b>Costo Promedio Ponderado (CPP) automático:</b> Si tenías 20 potes comprados a $0.18 y compras un fardo de 500u a $0.12, la app calcula automáticamente el nuevo promedio ($0.1223) para que tu contabilidad sea 100% real.</li>
              </ul>
            </div>
          </div>

          {/* Section 6: How to ask the supplier (Script de compra) */}
          <div
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '14px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '13.5px', color: '#1e293b' }}>
                💬 Mensaje exacto para pedir cotización por WhatsApp o en mostrador
              </strong>
              <button
                type="button"
                onClick={handleCopyScript}
                style={{
                  background: copiedTip ? '#16a34a' : '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copiedTip ? '✓ ¡Copiado!' : '📋 Copiar Mensaje'}
              </button>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                color: '#475569',
                fontFamily: 'monospace',
                lineHeight: 1.5,
              }}
            >
              "{scriptToAskSupplier}"
            </div>

            <div style={{ marginTop: '10px', fontSize: '11.5px', color: '#64748b', lineHeight: 1.4 }}>
              💡 <b>Tip de oro:</b> En La Candelaria siempre aclara: <i>"¿Viene con las 500 tapas incluidas en el mismo bulto?"</i> porque algunas tiendas de descartables tienen códigos separados para el pote y para la tapa.
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Zona de compra habitual: <b>La Candelaria, Valencia (Edo. Carabobo)</b>
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#184e36',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Entendido, cerrar guía
          </button>
        </div>
      </div>
    </div>
  );
};
