import React, { useState, useEffect } from 'react';
import { ViewId, RateReferenceType, ScrapedRates } from '../types';
import { moneyUSD, moneyVES } from '../utils/formatters';

interface InteractiveWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewId) => void;
  rates?: ScrapedRates;
  activeRate: number;
  activeRateName: string;
  activeRateType: RateReferenceType;
  onChangeRateType?: (type: RateReferenceType) => void;
  onLoadSampleData?: () => void;
  onResetToClean?: () => void;
  onOpenPackagingGuide?: () => void;
}

interface Step {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  icon: string;
  targetView: ViewId;
  viewName: string;
  tips: Array<{ icon: string; title: string; desc: string }>;
  highlight: string;
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    badge: 'Paso 1 de 8 · Bienvenida',
    title: '¡Bienvenida a LactoCost, Emprendedora!',
    subtitle: 'El sistema inteligente diseñado a la medida para tu taller de yogurt artesanal y quesillos caseros.',
    icon: '🥛',
    targetView: 'dashboard',
    viewName: 'Dashboard Principal',
    tips: [
      {
        icon: '📱',
        title: 'Hecho para tu teléfono (Redmi Note 13 Pro)',
        desc: 'Navegación cómoda con una sola mano desde la barra inferior fija y botones de toque rápido.',
      },
      {
        icon: '💵',
        title: 'Sin datos falsos ni confusiones',
        desc: 'El sistema arranca listo para que ingreses tus productos, insumos y registres tus ventas reales sin cifras infladas.',
      },
      {
        icon: '🇻🇪',
        title: 'Dólares ($) y Bolívares (VES)',
        desc: 'Tus recetas y costos se protegen en dólares, y los precios se calculan al cambio del día al instante.',
      },
    ],
    highlight: 'Tip de inicio: Puedes usar el sistema en blanco con tus propios números o cargar una plantilla modelo cuando quieras.',
  },
  {
    id: 'rates',
    badge: 'Paso 2 de 8 · Monedas y Tasas',
    title: 'Gestión de Tasas: Oficial BCV, Tasa Euro y Binance P2P',
    subtitle: 'Tres referencias financieras claras para compras en establecimientos y cobros sin confusiones.',
    icon: '⚖️',
    targetView: 'settings',
    viewName: 'Configuración de Tasas',
    tips: [
      {
        icon: '🏛️',
        title: 'Oficial BCV (USD)',
        desc: 'Para compras en establecimientos, supermercados y distribuidores en Valencia (facturas a tasa oficial con IVA 16% incluido).',
      },
      {
        icon: '💶',
        title: 'Tasa Euro',
        desc: 'Cotización oficial de cobro diario para clientes particulares y PagoMóvil.',
      },
      {
        icon: '🟡',
        title: 'Binance P2P USDT',
        desc: 'Mercado real para reposición de insumos, compras mayoristas e inversión de ganancias.',
      },
    ],
    highlight: 'En la barra superior siempre verás la tasa activa. Con 1 toque cambias entre Oficial BCV, Tasa Euro y Binance USDT.',
  },
  {
    id: 'products',
    badge: 'Paso 3 de 8 · Catálogo y Márgenes',
    title: 'Tus Productos: Yogures, Quesillos y Torta de Pan',
    subtitle: 'Precios reales de venta ($2.00 yogurt, $2.00 quesillo, $2.50 torta de pan) y margen 100% personalizable.',
    icon: '🥣',
    targetView: 'products',
    viewName: 'Catálogo de Productos',
    tips: [
      {
        icon: '🍞',
        title: 'Yogures, Quesillo y Torta de Pan',
        desc: 'Cada pote de yogurt se vende a $2.00, la porción de quesillo a $2.00 y la torta de pan casera a $2.50.',
      },
      {
        icon: '🎯',
        title: 'Margen 100% personalizado (sin límites)',
        desc: 'No estás atada al 45%. Puedes fijar 25%, 35%, 50%, 60%, 75% o el porcentaje exacto que tú decidas según tu mercado.',
      },
      {
        icon: '✨',
        title: '¿Tienes más productos? ¡Añádelos libres!',
        desc: 'Puedes crear nuevos productos en cualquier momento (donas, tortas, gelatinas, etc.), elegir su emoji adecuado y definir su receta.',
      },
    ],
    highlight: 'El sistema calcula el precio de venta exacto según costos reales para proteger tu ganancia neta.',
  },
  {
    id: 'inventory',
    badge: 'Paso 4 de 8 · Almacén e Insumos',
    title: 'Control de Leche y Potes (8oz, 12oz, 16oz, 32oz)',
    subtitle: 'Conoce cuánta leche tienes y cómo ahorrar comprando bultos a $0.12 en La Candelaria.',
    icon: '📦',
    targetView: 'inventory',
    viewName: 'Almacén de Insumos',
    tips: [
      {
        icon: '🥛',
        title: 'Leche Pasteurizada de Calidad',
        desc: 'Referencia nacional de $0.85 a $1.20/L, editable según el precio de tu lechero o proveedor local en Flor Amarillo.',
      },
      {
        icon: '🍶',
        title: 'Potes PP con tapa: 8oz, 12oz, 16oz y 32oz',
        desc: 'En La Candelaria (Valencia) o Mayorista de Tocuyito por bulto de 500u baja de $0.18 a $0.12 (8 oz), $0.15 (12 oz), $0.18 (16 oz).',
      },
      {
        icon: '💡',
        title: '¿Qué pasa si le das $0.12 al inventario?',
        desc: 'Tu costo de envase baja $0.06 por pote. En 300 yogures al mes, ¡te ahorras $18.00 limpios que van directo a tu bolsillo!',
      },
    ],
    highlight: '¡Protegemos tu dinero con Costo Promedio Ponderado (CPP) automático cada vez que compras más barato o más caro!',
  },
  {
    id: 'production',
    badge: 'Paso 5 de 8 · Producción y Lotes',
    title: 'Recetas, Lotes y Control de Mermas',
    subtitle: 'Descuenta automáticamente litros de leche y envases al elaborar cada lote.',
    icon: '🏭',
    targetView: 'production',
    viewName: 'Módulo de Producción',
    tips: [
      {
        icon: '📋',
        title: 'Fórmulas y recetas estándar',
        desc: 'Indica cuántos litros de leche, cultivo o azúcar lleva cada bulto de yogurts o quesillos.',
      },
      {
        icon: '📉',
        title: 'Monitoreo de mermas',
        desc: 'Calcula cuántos envases se rompieron o desueraron de más para saber el costo unitario verdadero.',
      },
      {
        icon: '🔄',
        title: 'Descarga automática de inventario',
        desc: 'Al registrar el lote, el sistema descuenta los insumos de tu almacén de forma inmediata.',
      },
    ],
    highlight: 'Tener trazabilidad de lotes te permite cobrar con la certeza de que cubriste todas las mermas.',
  },
  {
    id: 'pricing',
    badge: 'Paso 6 de 8 · Radar de Precios',
    title: 'Calculadora de Precios al Cambio del Día',
    subtitle: 'Consulta a cuánto vender en dólares y bolívares al instante.',
    icon: '📈',
    targetView: 'pricing',
    viewName: 'Calculadora de Precios',
    tips: [
      {
        icon: '💱',
        title: 'Conversión automática a Euro BCV y Binance',
        desc: 'Compara ambos precios para no perder dinero si cobras por transferencia o en efectivo.',
      },
      {
        icon: '🏪',
        title: 'Precios por canal de venta',
        desc: 'Configura precios diferentes para cliente directo vs ventas a cafeterías o bodegones.',
      },
      {
        icon: '👀',
        title: 'Alterna moneda en 1 toque',
        desc: 'Visualiza la lista completa en $ USD, en Bs o en ambas monedas simultáneamente.',
      },
    ],
    highlight: 'Cuando sube la tasa, tus precios en Bolívares se actualizan solos al segundo.',
  },
  {
    id: 'sales',
    badge: 'Paso 7 de 8 · Registro de Ventas',
    title: 'Registro Rápido de Cobros y Entregas',
    subtitle: 'Anota tus ventas en 5 segundos y mantén tus cuentas al día.',
    icon: '🛍️',
    targetView: 'sales',
    viewName: 'Registro de Ventas',
    tips: [
      {
        icon: '💳',
        title: 'Todos los medios de pago venezolanos',
        desc: 'Registra si te pagaron por PagoMóvil, efectivo en dólares, Binance Pay USDT o Punto de Venta.',
      },
      {
        icon: '⚡',
        title: 'Botón flotante de venta rápida (+)',
        desc: 'Desde cualquier lugar de la app, pulsa el botón verde para anotar un despacho sin perder tiempo.',
      },
      {
        icon: '🗑️',
        title: 'Control total de tus registros',
        desc: 'Puedes añadir, consultar o eliminar cualquier venta de prueba con tranquilidad.',
      },
    ],
    highlight: 'Cada venta registrada alimenta tus estadísticas reales sin datos inventados.',
  },
  {
    id: 'growth',
    badge: 'Paso 8 de 8 · Asistente de Crecimiento',
    title: 'WhatsApp, Rótulos para Potes y Calidad de Leche',
    subtitle: 'Herramientas prácticas para vender más, presentar tus productos y controlar la calidad.',
    icon: '✨',
    targetView: 'growth',
    viewName: 'Asistente de Crecimiento',
    tips: [
      {
        icon: '📲',
        title: 'Cotizaciones listas para WhatsApp',
        desc: 'Arma un pedido, genera el texto formateado con emojis y envíalo con 1 toque al WhatsApp del cliente.',
      },
      {
        icon: '🖨️',
        title: 'Rótulos y etiquetas para imprimir',
        desc: 'Genera etiquetas con fecha de elaboración, vencimiento, lote y tu contacto para pegar en tus potes.',
      },
      {
        icon: '🔬',
        title: 'Medidor de Rendimiento Lechero',
        desc: 'Calcula cuántos envases sacas por litro de leche para detectar si la leche vino aguada o de bajo rendimiento.',
      },
    ],
    highlight: '¡Todo listo para empezar a trabajar! Puedes reiniciar este tour cuando lo desees con el botón "💡 Guía".',
  },
];

export const InteractiveWalkthrough: React.FC<InteractiveWalkthroughProps> = ({
  isOpen,
  onClose,
  onNavigate,
  rates,
  activeRate,
  activeRateName,
  activeRateType,
  onChangeRateType,
  onLoadSampleData,
  onResetToClean,
  onOpenPackagingGuide,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [demoProduct, setDemoProduct] = useState<'yogurt' | 'quesillo' | 'torta' | 'custom'>('yogurt');
  const [demoCostUSD, setDemoCostUSD] = useState<number>(1.00);
  const [demoMargin, setDemoMargin] = useState<number>(50);

  // Default rates fallback if rates object not yet loaded
  const bcvUsdRate = rates?.bcvUsd || 85.00;
  const bcvEurRate = rates?.bcvEur || 48.50;
  const binanceRate = rates?.binanceP2PAvg || 54.20;

  const currentStep = STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === STEPS.length - 1;

  // Whenever step changes, navigate the app to the step's view
  useEffect(() => {
    if (isOpen && currentStep) {
      onNavigate(currentStep.targetView);
    }
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const goToStep = (idx: number) => {
    if (idx >= 0 && idx < STEPS.length) {
      setCurrentStepIndex(idx);
      onNavigate(STEPS[idx].targetView);
    }
  };

  const handleNext = () => {
    if (!isLast) {
      goToStep(currentStepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      goToStep(currentStepIndex - 1);
    }
  };

  const handleFinish = () => {
    try {
      localStorage.setItem('lactocost_walkthrough_completed', 'true');
    } catch (e) {
      // Ignore localStorage errors
    }
    onClose();
  };

  // If minimized, display floating dock at the bottom
  if (isMinimized) {
    return (
      <aside
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '16px',
          zIndex: 9999,
          background: '#133924',
          color: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        <span style={{ fontSize: '20px' }}>{currentStep.icon}</span>
        <div>
          <div style={{ fontSize: '11px', color: '#c7e4d2' }}>
            Tour Guiado · {currentStep.badge}
          </div>
          <strong style={{ fontSize: '13px' }}>{currentStep.viewName}</strong>
        </div>
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          style={{
            background: '#d6fb72',
            color: '#133924',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Reanudar Tour ↗
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#a3c2b0',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '4px',
          }}
          title="Cerrar tour"
        >
          ✕
        </button>
      </aside>
    );
  }

  return (
    <div className="walkthrough-overlay" role="dialog" aria-modal="true" aria-labelledby="walkthrough-title">
      <div className="walkthrough-backdrop" onClick={onClose} />
      
      <div className="walkthrough-container">
        {/* Header */}
        <div className="walkthrough-header">
          <div className="walkthrough-step-badge">
            <span>{currentStep.badge} · Tasa: {activeRateName}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setIsMinimized(true)}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                color: '#2d5a3f',
                borderColor: '#cbd5e1',
                background: '#f8fafc',
              }}
              title="Minimizar para ver la pantalla completa"
            >
              👁️ Ver pantalla
            </button>
            <button
              type="button"
              className="walkthrough-close-btn"
              onClick={onClose}
              aria-label="Cerrar guía"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Step progress dots */}
        <div className="walkthrough-dots">
          {STEPS.map((step, idx) => (
            <button
              key={step.id}
              type="button"
              className={`walkthrough-dot ${idx === currentStepIndex ? 'active' : ''} ${idx < currentStepIndex ? 'done' : ''}`}
              onClick={() => goToStep(idx)}
              title={`${step.badge}: ${step.title}`}
            >
              <span>{idx + 1}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="walkthrough-body">
          <div className="walkthrough-hero">
            <div className="walkthrough-icon">{currentStep.icon}</div>
            <div>
              <h2 id="walkthrough-title" className="walkthrough-title">
                {currentStep.title}
              </h2>
              <p className="walkthrough-subtitle">{currentStep.subtitle}</p>
            </div>
          </div>

          {/* Interactive tips cards */}
          <div className="walkthrough-tips-list">
            {currentStep.tips.map((tip, idx) => (
              <div className="walkthrough-tip-card" key={idx}>
                <div className="walkthrough-tip-icon">{tip.icon}</div>
                <div>
                  <strong>{tip.title}</strong>
                  <p>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contextual Interactive Widgets */}
          {/* STEP 1: Welcome Mode Selector */}
          {currentStep.id === 'welcome' && (
            <div className="walkthrough-interactive-box">
              <span className="walkthrough-box-label">¿Cómo deseas arrancar hoy tu taller?</span>
              <div className="walkthrough-rate-selector">
                {onResetToClean && (
                  <button
                    type="button"
                    className="walkthrough-action-btn clean"
                    onClick={() => {
                      onResetToClean();
                      goToStep(1);
                    }}
                  >
                    🧹 Modo Limpio (0 ventas, ingresar mis datos reales)
                  </button>
                )}
                {onLoadSampleData && (
                  <button
                    type="button"
                    className="walkthrough-action-btn sample"
                    onClick={() => {
                      onLoadSampleData();
                      goToStep(1);
                    }}
                  >
                    🥛 Cargar Plantilla de Ejemplo (Yogurt y Quesillo)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Rates Interactive Selector */}
          {currentStep.id === 'rates' && onChangeRateType && (
            <div className="walkthrough-interactive-box">
              <span className="walkthrough-box-label">Prueba interactiva: Selecciona la tasa activa del taller</span>
              <div className="walkthrough-rate-selector" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                <button
                  type="button"
                  className={`walkthrough-rate-btn ${activeRateType === 'bcv_usd' ? 'active' : ''}`}
                  onClick={() => onChangeRateType('bcv_usd')}
                >
                  🏛️ Oficial BCV: <b>{moneyVES(bcvUsdRate)}</b>
                  {activeRateType === 'bcv_usd' ? ' ✓ ACTIVA' : ''}
                </button>
                <button
                  type="button"
                  className={`walkthrough-rate-btn ${activeRateType === 'bcv_eur' ? 'active' : ''}`}
                  onClick={() => onChangeRateType('bcv_eur')}
                >
                  💶 Tasa Euro: <b>{moneyVES(bcvEurRate)}</b>
                  {activeRateType === 'bcv_eur' ? ' ✓ ACTIVA' : ''}
                </button>
                <button
                  type="button"
                  className={`walkthrough-rate-btn ${activeRateType === 'binance_p2p' ? 'active' : ''}`}
                  onClick={() => onChangeRateType('binance_p2p')}
                >
                  🟡 Binance USDT: <b>{moneyVES(binanceRate)}</b>
                  {activeRateType === 'binance_p2p' ? ' ✓ ACTIVA' : ''}
                </button>
              </div>
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#275239', background: '#f5faf4', padding: '8px 12px', borderRadius: '8px', lineHeight: 1.5 }}>
                💡 <b>Regla en comercios de Valencia:</b> En supermercados y distribuidoras se paga en Bs. a <b>Tasa Oficial BCV + IVA 16% incluido</b>. Para venta al público, puedes cobrar en $ efectivo, en Bs a Tasa Euro o por PagoMóvil.
              </div>
            </div>
          )}

          {/* STEP 3: Products Margin Simulator - 100% PERSONALIZADO */}
          {currentStep.id === 'products' && (
            <div className="walkthrough-interactive-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <span className="walkthrough-box-label" style={{ margin: 0 }}>
                  Simulador 100% Personalizado: Margen y Ganancia Real
                </span>
                <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>
                  Tus precios actuales: Yogurt $2.00 · Quesillo $2.00 · Torta $2.50
                </span>
              </div>

              {/* Product Selector Buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setDemoProduct('yogurt');
                    setDemoCostUSD(1.00);
                    setDemoMargin(50);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: demoProduct === 'yogurt' ? '2px solid #166534' : '1px solid #cbd5e1',
                    background: demoProduct === 'yogurt' ? '#e8f5ec' : '#fff',
                    fontWeight: demoProduct === 'yogurt' ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  🥣 Yogurt ($2.00)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDemoProduct('quesillo');
                    setDemoCostUSD(1.30);
                    setDemoMargin(35);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: demoProduct === 'quesillo' ? '2px solid #166534' : '1px solid #cbd5e1',
                    background: demoProduct === 'quesillo' ? '#e8f5ec' : '#fff',
                    fontWeight: demoProduct === 'quesillo' ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  🍮 Quesillo ($2.00)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDemoProduct('torta');
                    setDemoCostUSD(1.25);
                    setDemoMargin(50);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: demoProduct === 'torta' ? '2px solid #166534' : '1px solid #cbd5e1',
                    background: demoProduct === 'torta' ? '#e8f5ec' : '#fff',
                    fontWeight: demoProduct === 'torta' ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  🍞 Torta de Pan ($2.50)
                </button>
                <button
                  type="button"
                  onClick={() => setDemoProduct('custom')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: demoProduct === 'custom' ? '2px solid #166534' : '1px solid #cbd5e1',
                    background: demoProduct === 'custom' ? '#e8f5ec' : '#fff',
                    fontWeight: demoProduct === 'custom' ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  ✨ Otro Producto
                </button>
              </div>

              {/* Inputs row: Cost & Margin */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                    Costo insumos ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.10"
                    value={demoCostUSD}
                    onChange={(e) => setDemoCostUSD(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                    Margen deseado ({demoMargin}%)
                  </label>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input
                      type="range"
                      min="15"
                      max="85"
                      step="1"
                      value={demoMargin}
                      onChange={(e) => setDemoMargin(Number(e.target.value))}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="number"
                      min="5"
                      max="95"
                      value={demoMargin}
                      onChange={(e) => setDemoMargin(Math.min(95, Math.max(5, Number(e.target.value) || 0)))}
                      style={{
                        width: '54px',
                        padding: '4px 6px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        fontWeight: 700,
                        textAlign: 'center',
                      }}
                    />
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>%</span>
                  </div>
                </div>
              </div>

              {/* Quick Margin Preset Chips */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                {[25, 35, 45, 50, 60, 70, 75].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDemoMargin(m)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: demoMargin === m ? '1.5px solid #166534' : '1px solid #e2e8f0',
                      background: demoMargin === m ? '#dcfce7' : '#f8fafc',
                      fontSize: '11px',
                      fontWeight: demoMargin === m ? 700 : 500,
                      color: demoMargin === m ? '#14532d' : '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    {m}%
                  </button>
                ))}
              </div>

              {/* Calculation Result Live Box */}
              {(() => {
                const targetPriceUSD = demoMargin < 100 ? demoCostUSD / (1 - demoMargin / 100) : demoCostUSD * 2;
                const profitUSD = targetPriceUSD - demoCostUSD;
                return (
                  <div
                    style={{
                      marginTop: '10px',
                      background: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                        Precio calculado al {demoMargin}% de margen
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#14532d' }}>
                        {moneyUSD(targetPriceUSD)}{' '}
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>
                          · {moneyVES(targetPriceUSD * activeRate)}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: '#047857', display: 'block' }}>Tu ganancia limpia</span>
                      <strong style={{ fontSize: '15px', color: '#15803d' }}>+{moneyUSD(profitUSD)} / unidad</strong>
                    </div>
                  </div>
                );
              })()}

              <div style={{ marginTop: '8px', fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>
                ℹ️ <b>¿Qué sucede si tienes más productos y decides añadirlos?</b> ¡No hay límites! En la sección <b>Catálogo de Productos</b> puedes crear tortas enteras, donas, chichas, flanes, etc., seleccionar su emoji adecuado (🍞, 🍮, 🥛, 🍰) y el sistema calculará tus costos y ganancias con precisión.
              </div>
            </div>
          )}

          {/* STEP 4: Inventory & Packaging Guide Button */}
          {currentStep.id === 'inventory' && onOpenPackagingGuide && (
            <div className="walkthrough-interactive-box">
              <span className="walkthrough-box-label">¿Buscas los potes de arroz chino para tu yogurt y postres?</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#1f4832', flex: 1, minWidth: '200px' }}>
                  Nombre comercial: <b>Tina de Polipropileno (PP) con tapa hermética</b> (8 oz, 12 oz, 16 oz, 32 oz). En La Candelaria bajan a <b>$0.12</b> comprando por bulto de 500u.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onOpenPackagingGuide();
                  }}
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🍶 Abrir Guía de Potes ↗
                </button>
              </div>
            </div>
          )}

          {/* Golden highlight */}
          <div className="walkthrough-highlight">
            <span className="star">★</span>
            <p>{currentStep.highlight}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="walkthrough-footer">
          <div className="walkthrough-footer-left">
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Mostrando vista: <b>{currentStep.viewName}</b>
            </span>
          </div>

          <div className="walkthrough-footer-right">
            {!isFirst && (
              <button
                type="button"
                className="walkthrough-btn ghost"
                onClick={handlePrev}
              >
                ← Anterior
              </button>
            )}

            <button
              type="button"
              className="walkthrough-btn primary"
              onClick={handleNext}
            >
              {isLast ? '¡Listo! Empezar a usar LactoCost 🚀' : 'Siguiente paso →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
