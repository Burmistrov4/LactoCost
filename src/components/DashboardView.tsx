import React, { useState } from 'react';
import { ViewId, Product, InventoryItem, InventoryMovement, Sale, DisplayCurrencyMode, UserProfile, WorkshopProfile } from '../types';
import { moneyUSD, moneyVES } from '../utils/formatters';
import { calculateTargetPrice } from '../domain/pricing';
import { VENEZUELAN_DAIRY_BENCHMARKS } from '../data/initialData';
import { ROLE_LABELS } from '../utils/auth';

interface DashboardViewProps {
  products: Product[];
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  sales: Sale[];
  activeRate: number;
  activeRateName: string;
  currencyMode: DisplayCurrencyMode;
  workshopProfile?: WorkshopProfile;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (mode?: 'login' | 'register' | 'switch') => void;
  onLogout?: () => void;
  onNavigate: (view: ViewId) => void;
  onStartWalkthrough?: () => void;
  onOpenWhatsAppOrder?: () => void;
  onOpenLabelGenerator?: () => void;
  onOpenMilkYield?: () => void;
  onOpenPackagingGuide?: () => void;
  onResetToClean?: () => void;
  onLoadSampleData?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  inventory,
  movements,
  sales,
  activeRate,
  activeRateName,
  currencyMode,
  workshopProfile,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onNavigate,
  onStartWalkthrough,
  onOpenWhatsAppOrder,
  onOpenLabelGenerator,
  onOpenMilkYield,
  onOpenPackagingGuide,
  onResetToClean,
  onLoadSampleData,
}) => {
  const [selectedRange, setSelectedRange] = useState<'7' | '30' | '90'>('30');
  const [showHelperTips, setShowHelperTips] = useState<boolean>(false);

  // Real inventory value in USD and VES
  const totalStockValueUSD = inventory.reduce(
    (sum, item) => sum + (item.currentStock || 0) * (item.unitCostUSD || 0),
    0
  );
  const totalStockValueVES = totalStockValueUSD * activeRate;

  // Real inventory status counts
  const healthyCount = inventory.filter((i) => i.status === 'good').length;
  const warningCount = inventory.filter((i) => i.status === 'warn').length;
  const criticalCount = inventory.filter((i) => i.status === 'bad').length;
  const totalRefs = inventory.length;

  const healthyPct = totalRefs ? Math.round((healthyCount / totalRefs) * 100) : 0;
  const warningPct = totalRefs ? Math.round((warningCount / totalRefs) * 100) : 0;
  const criticalPct = totalRefs ? Math.round((criticalCount / totalRefs) * 100) : 0;

  // Real sales calculations (NO hardcoded $280)
  const actualSalesUSD = sales.reduce((sum, s) => sum + (s.totalUSD || 0), 0);
  const actualSalesVES = actualSalesUSD * activeRate;

  // Dynamic average margin calculated from user products
  const avgMargin = products.length > 0
    ? (products.reduce((acc, p) => acc + (p.targetMargin || p.defaultMargin || 0), 0) / products.length).toFixed(1)
    : '0';

  // Real milk item and Venezuelan benchmark
  const milkItem = inventory.find(
    (i) => i.id === 'ing-leche' || i.name.toLowerCase().includes('leche')
  );
  const milkCostUSD = milkItem ? milkItem.unitCostUSD : VENEZUELAN_DAIRY_BENCHMARKS.milkPasteurizedAvgUSD;

  // Pending alerts from inventory
  const pendingStockAlerts = inventory.filter((i) => i.status === 'bad' || i.status === 'warn');

  return (
    <section className="view-state active overview" id="view-dashboard">
      {/* Onboarding Welcome Banner for Entrepreneur */}
      <div className="onboarding-banner" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {workshopProfile && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--paper)', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--line)' }}>
                  <span style={{ fontSize: '14px' }}>{workshopProfile.logoEmoji || '🥛'}</span>
                  <strong style={{ fontSize: '12.5px', color: 'var(--ink)' }}>{workshopProfile.name}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>· {workshopProfile.categoryLabel}</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('settings')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: '11px', fontWeight: 700, padding: '0 2px', textDecoration: 'underline' }}
                    title="Personalizar nombre, logo y datos de tu taller"
                  >
                    ✏️ Personalizar
                  </button>
                </div>
              )}

              {currentUser ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--white)', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--line)' }}>
                  <span style={{ fontSize: '14px' }}>{currentUser.avatarEmoji || '👩‍🍳'}</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>{currentUser.name}</span>
                  <span style={{ fontSize: '10.5px', background: 'var(--mint)', color: 'var(--green)', padding: '1px 7px', borderRadius: '10px', fontWeight: 700 }}>
                    {ROLE_LABELS[currentUser.role]?.badge || currentUser.role}
                  </span>
                  {onOpenAuthModal && (
                    <button
                      type="button"
                      onClick={() => onOpenAuthModal('switch')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline', padding: '0 2px', fontWeight: 600 }}
                    >
                      Cambiar
                    </button>
                  )}
                  {onLogout && (
                    <>
                      <span style={{ color: 'var(--line)' }}>·</span>
                      <button
                        type="button"
                        onClick={onLogout}
                        style={{ background: 'transparent', border: 'none', color: 'var(--rose)', cursor: 'pointer', fontSize: '11px', fontWeight: 700, padding: '0 2px' }}
                        title="Cerrar sesión activa"
                      >
                        Salir
                      </button>
                    </>
                  )}
                </div>
              ) : (
                onOpenAuthModal && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--white)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '13px' }}>👤</span>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Modo Invitado</span>
                    <button
                      type="button"
                      onClick={() => onOpenAuthModal('login')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: '0 2px', fontWeight: 800 }}
                    >
                      Iniciar Sesión
                    </button>
                    <span style={{ color: 'var(--line)' }}>·</span>
                    <button
                      type="button"
                      onClick={() => onOpenAuthModal('register')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--ink)', cursor: 'pointer', fontSize: '12px', fontWeight: 700, padding: '0 2px' }}
                    >
                      Registrarse
                    </button>
                  </div>
                )
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>👋</span>
              <strong style={{ fontSize: '16px', color: 'var(--ink)' }}>
                {currentUser
                  ? `¡Bienvenido(a), ${currentUser.name.split(' ')[0]}!`
                  : `¡Bienvenida a ${workshopProfile?.name || 'tu Taller Artesanal'}!`} Sistema listo para tus datos
              </strong>
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
                · {workshopProfile?.location || (currentUser ? ROLE_LABELS[currentUser.role]?.label : 'Cálculos Reales en Vivo')}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: '1.4' }}>
              {workshopProfile?.tagline ? `${workshopProfile.tagline}. ` : ''}
              {currentUser ? ROLE_LABELS[currentUser.role]?.desc : 'Sin datos ficticios ni ventas infladas. Ingresa tus insumos y recetas, o prueba con una plantilla de muestra.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {onStartWalkthrough && (
              <button
                type="button"
                className="primary-btn"
                onClick={onStartWalkthrough}
                style={{ fontSize: '13px', padding: '6px 12px' }}
              >
                💡 Iniciar Guía Interactiva
              </button>
            )}
            {onOpenWhatsAppOrder && (
              <button
                type="button"
                className="ghost-btn"
                onClick={onOpenWhatsAppOrder}
                style={{ fontSize: '13px', padding: '6px 12px', background: '#eaf6ef', borderColor: '#77b894' }}
              >
                📲 Pedido WhatsApp
              </button>
            )}
            {onOpenLabelGenerator && (
              <button
                type="button"
                className="ghost-btn"
                onClick={onOpenLabelGenerator}
                style={{ fontSize: '13px', padding: '6px 12px' }}
              >
                🏷️ Rótulos para Potes
              </button>
            )}
            {onOpenMilkYield && (
              <button
                type="button"
                className="ghost-btn"
                onClick={onOpenMilkYield}
                style={{ fontSize: '13px', padding: '6px 12px' }}
              >
                🔬 Calidad de Leche
              </button>
            )}
          </div>
        </div>

        {/* State selector: Clean vs Sample */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid #d1e8da',
            fontSize: '12px',
          }}
        >
          <span style={{ color: '#315541' }}>
            Estado actual: <b>{sales.length} ventas registradas</b> · <b>{products.length} productos</b> · <b>{inventory.length} insumos</b>
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onResetToClean && (
              <button
                type="button"
                onClick={onResetToClean}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6c4b27',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                🧹 Limpiar a Cero (Mis datos reales)
              </button>
            )}
            {onLoadSampleData && (
              <button
                type="button"
                onClick={onLoadSampleData}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#1b5a37',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                🥛 Cargar Ejemplo de Demostración
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section Heading */}
      <div className="section-heading">
        <div>
          <h2>Resumen Ejecutivo del Taller</h2>
          <p>
            Lectura rápida de tus ventas, costos en dólares y conversión a bolívares según <b>{activeRateName}</b> ({moneyVES(activeRate)}).
          </p>
        </div>
        <div className="range" aria-label="Periodo del dashboard">
          <button
            className={selectedRange === '7' ? 'active' : ''}
            onClick={() => setSelectedRange('7')}
          >
            7 días
          </button>
          <button
            className={selectedRange === '30' ? 'active' : ''}
            onClick={() => setSelectedRange('30')}
          >
            30 días
          </button>
          <button
            className={selectedRange === '90' ? 'active' : ''}
            onClick={() => setSelectedRange('90')}
          >
            90 días
          </button>
        </div>
      </div>

      {/* Real KPIs Grid */}
      <div className="kpis">
        {/* KPI 1: Real Sales */}
        <article className="card kpi">
          <div className="kpi-top">
            Ventas Registradas <span className="kpi-icon">↗</span>
          </div>
          <div className="kpi-value" id="kpiSales">
            {currencyMode === 'VES' ? moneyVES(actualSalesVES) : moneyUSD(actualSalesUSD)}
          </div>
          <div className="kpi-foot">
            {actualSalesUSD > 0 ? (
              <span className="up">↗ {moneyVES(actualSalesVES)} en Bolívares</span>
            ) : (
              <span style={{ color: 'var(--muted)' }}>0 ventas registradas · ¡Anota tu 1ª venta!</span>
            )}
          </div>
          <div className="kpi-line">
            <span style={{ width: actualSalesUSD > 0 ? '65%' : '0%' }}></span>
          </div>
        </article>

        {/* KPI 2: Dynamic Average Margin */}
        <article className="card kpi">
          <div className="kpi-top">
            Margen Promedio <span className="kpi-icon">◉</span>
          </div>
          <div className="kpi-value" id="kpiMargin">
            {avgMargin}%
          </div>
          <div className="kpi-foot">
            {Number(avgMargin) >= 30 ? (
              <span className="up">Margen sano sobre venta ({products.length} productos)</span>
            ) : (
              <span style={{ color: 'var(--muted)' }}>Calculado de tus productos activos</span>
            )}
          </div>
          <div className="kpi-line">
            <span style={{ width: `${Math.min(100, Math.max(0, Number(avgMargin) * 2))}%` }}></span>
          </div>
        </article>

        {/* KPI 3: Real Inventory Value */}
        <article className="card kpi">
          <div className="kpi-top">
            Valor del Inventario <span className="kpi-icon">▦</span>
          </div>
          <div className="kpi-value" id="kpiStock">
            {currencyMode === 'VES' ? moneyVES(totalStockValueVES) : moneyUSD(totalStockValueUSD)}
          </div>
          <div className="kpi-foot">
            {pendingStockAlerts.length > 0 ? (
              <span className="down">{pendingStockAlerts.length} insumos por revisar</span>
            ) : (
              <span className="up">Stock en orden ({inventory.length} insumos)</span>
            )}
          </div>
          <div className="kpi-line">
            <span style={{ width: totalStockValueUSD > 0 ? '55%' : '0%' }}></span>
          </div>
        </article>

        {/* KPI 4: Milk Cost with Explicit Venezuelan Sourcing */}
        <article className="card kpi">
          <div className="kpi-top">
            Costo Leche Pasteurizada <span className="kpi-icon">🥛</span>
          </div>
          <div className="kpi-value" id="kpiCpp">
            {moneyUSD(milkCostUSD)} / L
          </div>
          <div className="kpi-foot">
            <span style={{ display: 'block', color: '#15803d', fontWeight: 700 }}>
              {moneyVES(milkCostUSD * activeRate)} / litro ({activeRateName})
            </span>
          </div>
          <div className="kpi-line">
            <span style={{ width: '60%' }}></span>
          </div>
          <div
            style={{
              marginTop: '6px',
              fontSize: '10px',
              color: 'var(--muted)',
              lineHeight: '1.25',
              borderTop: '1px dotted var(--line)',
              paddingTop: '4px',
            }}
          >
            📌 <b>Fuente:</b> Canilac & Fedenaga ($0.85-$1.20/L en planta).{' '}
            <button
              type="button"
              onClick={() => onNavigate('inventory')}
              style={{
                background: 'none',
                border: 'none',
                color: '#34865d',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              Editar en Insumos
            </button>
          </div>
        </article>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Performance Panel */}
        <article className="card panel">
          <div className="panel-title">
            <div>
              <h3>Rendimiento del Negocio</h3>
              <p>Evolución de ingresos y ventas reales registradas</p>
            </div>
            <button className="small-link" onClick={() => onNavigate('sales')}>
              Ver Ventas ↗
            </button>
          </div>

          {sales.length === 0 ? (
            <div
              style={{
                padding: '30px 20px',
                textAlign: 'center',
                background: '#fafbfa',
                borderRadius: '8px',
                border: '1px dashed #d1e0d7',
                margin: '12px 0',
              }}
            >
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🌱</span>
              <strong style={{ fontSize: '15px', color: '#1a3c2a', display: 'block' }}>
                Tu gráfica se generará con tus ventas reales
              </strong>
              <p style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: '420px', margin: '6px auto 14px' }}>
                Aún no has registrado cobros. Cuando vendas potes de yogurt o quesillo por PagoMóvil o divisas, verás tu curva de ganancias aquí.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => onNavigate('sales')}
                >
                  ＋ Anotar Primera Venta
                </button>
                {onOpenWhatsAppOrder && (
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={onOpenWhatsAppOrder}
                  >
                    📲 Cotizar por WhatsApp
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="chart-legend">
                <span>
                  <i className="legend-dot" style={{ background: '#33795d' }}></i>Ventas netas ({moneyUSD(actualSalesUSD)})
                </span>
                <span>
                  <i className="legend-dot" style={{ background: '#d2a84c' }}></i>En Bolívares ({moneyVES(actualSalesVES)})
                </span>
              </div>
              <div className="table-wrap" style={{ marginTop: '10px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Detalle</th>
                      <th>Monto ($)</th>
                      <th>Monto (Bs)</th>
                      <th>Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.slice(0, 5).map((sale) => (
                      <tr key={sale.id}>
                        <td>
                          <b>{sale.clientName}</b>
                          <small style={{ display: 'block', color: 'var(--muted)' }}>{sale.date}</small>
                        </td>
                        <td>
                          <small>{sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}</small>
                        </td>
                        <td>
                          <strong>{moneyUSD(sale.totalUSD)}</strong>
                        </td>
                        <td>
                          <span style={{ color: '#27704b', fontWeight: 600 }}>{moneyVES(sale.totalVES)}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>{sale.paymentMethod}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div
            style={{
              background: '#f4fbf6',
              border: '1.5px solid #c2ebcf',
              borderRadius: '14px',
              padding: '16px',
              marginTop: '16px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                background: '#d6fb72',
                color: '#133924',
                display: 'grid',
                placeItems: 'center',
                fontSize: '20px',
                flexShrink: 0,
              }}
            >
              💡
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#166534' }}>
                  Consejo de Costos y Empaques
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 650,
                    color: '#065f46',
                    background: '#e1f8ea',
                    border: '1px solid #b7ebd0',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  Fuente: Distribuidores La Candelaria (Valencia) & Mayorista Carabobo
                </span>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '13px', lineHeight: 1.5, color: '#14221e' }}>
                La leche y los envases son tu mayor egreso en el taller.{' '}
                <strong style={{ color: '#15803d' }}>
                  Comprar envases por fardo cerrado de 500 unidades en La Candelaria (Valencia) o en el Mercado Mayorista baja tu costo unitario de ~$0.18 a ~$0.12 - $0.14 con tapa hermética.
                </strong>
              </p>
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#334155', lineHeight: 1.4 }}>
                  ¿Buscas los <i>"potes de arroz chino"</i> para yogurt? Nombre comercial: <strong style={{ color: '#0f172a' }}>Tina redonda traslúcida PP (8 oz / 16 oz) con tapa hermética</strong>.
                </span>
                {onOpenPackagingGuide && (
                  <button
                    type="button"
                    onClick={onOpenPackagingGuide}
                    style={{
                      background: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
                    }}
                  >
                    🍶 Ver Guía de Potes y Proveedores ↗
                  </button>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Inventory Health Panel */}
        <article className="card panel">
          <div className="panel-title">
            <div>
              <h3>Salud del Inventario</h3>
              <p>Nivel de existencias en el taller</p>
            </div>
            <button className="small-link" onClick={() => onNavigate('inventory')}>
              Ver almacén ↗
            </button>
          </div>

          <div className="health">
            <div className="donut">
              <div className="donut-center">
                <strong>{totalRefs}</strong>
                <span>insumos</span>
              </div>
            </div>
            <div className="stock-legend">
              <div className="stock-row">
                <span>
                  <i style={{ background: '#3c8866' }}></i>Saludable
                </span>
                <b>{healthyCount} · {healthyPct}%</b>
              </div>
              <div className="stock-row">
                <span>
                  <i style={{ background: '#d8e9a4' }}></i>Vigilar
                </span>
                <b>{warningCount} · {warningPct}%</b>
              </div>
              <div className="stock-row">
                <span>
                  <i style={{ background: '#f2c76c' }}></i>Bajo mínimo
                </span>
                <b>{criticalCount} · {criticalPct}%</b>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="alert-title">
            Prioridades para el taller <span>{criticalCount + warningCount} pendientes</span>
          </div>

          {pendingStockAlerts.length === 0 ? (
            <div style={{ padding: '14px', background: '#f0f8f3', borderRadius: '8px', color: '#1e5234', fontSize: '13px' }}>
              ✅ <b>Todo tu almacén está en niveles óptimos.</b> No tienes insumos por debajo del mínimo de seguridad.
            </div>
          ) : (
            pendingStockAlerts.slice(0, 3).map((item) => (
              <div className="alert" key={item.id}>
                <div className={`alert-symbol ${item.status === 'bad' ? 'red' : ''}`}>
                  {item.status === 'bad' ? '!' : '◷'}
                </div>
                <div className="alert-copy">
                  <strong>{item.name} · {item.status === 'bad' ? 'Stock crítico' : 'Stock bajo'}</strong>
                  <p>
                    Quedan {item.currentStock} {item.unit} (mínimo recomendado {item.minStock} {item.unit}).
                  </p>
                </div>
                <button className="tiny-action" onClick={() => onNavigate('purchases')}>
                  Comprar
                </button>
              </div>
            ))
          )}
        </article>
      </div>

      {/* Bottom Grid */}
      <div className="bottom-grid">
        {/* Recent Operations */}
        <article className="card panel">
          <div className="panel-title">
            <div>
              <h3>Operaciones Recientes</h3>
              <p>Trazabilidad de recepciones, producción y ventas</p>
            </div>
            <button className="small-link" onClick={() => onNavigate('reports')}>
              Ver historial ↗
            </button>
          </div>

          <div className="table-wrap">
            {movements.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                Sin movimientos recientes registrados.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Operación</th>
                    <th>Referencia</th>
                    <th>Importe ($ / Bs)</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.slice(0, 5).map((mov) => (
                    <tr key={mov.id}>
                      <td>
                        <div className="product">
                          <div className="product-icon">
                            {mov.type === 'receipt' ? '🥛' : mov.type === 'production_consumption' ? '🍓' : '🧀'}
                          </div>
                          <div>
                            <b>{mov.itemName}</b>
                            <small>{mov.date}</small>
                          </div>
                        </div>
                      </td>
                      <td>{mov.reference}</td>
                      <td>
                        <div>
                          <strong>{moneyUSD(mov.totalCostUSD)}</strong>
                          <small style={{ display: 'block', color: 'var(--muted)' }}>
                            {moneyVES(mov.totalCostVES)}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className={`status ${mov.status}`}>{mov.statusText}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </article>

        {/* Pricing Radar */}
        <article className="card panel">
          <div className="panel-title">
            <div>
              <h3>Radar de Precios y Ganancia</h3>
              <p>Precios al cambio de {activeRateName} ({moneyVES(activeRate)})</p>
            </div>
            <button className="small-link" onClick={() => onNavigate('pricing')}>
              Configurar precios ↗
            </button>
          </div>

          <div className="price-list">
            {products.slice(0, 4).map((prod) => {
              const calc = calculateTargetPrice(prod.costUSD, prod.targetMargin || 35, {
                exchangeRate: activeRate,
              });
              return (
                <div className="price-item" key={prod.id}>
                  <div className="price-emoji">{prod.emoji}</div>
                  <div className="price-info">
                    <strong>{prod.name} · {prod.format}</strong>
                    <small>Costo: {moneyUSD(prod.costUSD)} ({moneyVES(prod.costUSD * activeRate)})</small>
                  </div>
                  <div className="price-number">
                    <strong>{moneyUSD(calc.netPriceUSD)}</strong>
                    <small>{moneyVES(calc.netPriceVES)} · Margen {prod.targetMargin.toFixed(0)}%</small>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="insight" style={{ background: '#edf5e9', color: '#284634', marginTop: '12px' }}>
            <div className="insight-icon" style={{ background: '#d6eeb9' }}>↗</div>
            <div>
              <small style={{ color: '#50715a' }}>Tip comercial para vender hoy</small>
              <p style={{ color: '#3b5b45' }}>
                Comparte tu menú del día por WhatsApp usando nuestro generador automático con precios en $ y Bs actualizados.
              </p>
            </div>
          </div>
        </article>
      </div>

      {/* Collapsible Section Walkthrough Helper */}
      <div style={{ marginTop: '16px' }}>
        <button
          type="button"
          onClick={() => setShowHelperTips((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: '#285e42',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 0',
          }}
        >
          <span>💡 ¿Cómo sacarle provecho a este Dashboard?</span>
          <span>{showHelperTips ? '▲ Cerrar' : '▼ Ver consejos'}</span>
        </button>

        {showHelperTips && (
          <div
            style={{
              marginTop: '8px',
              padding: '14px 18px',
              background: '#f2f7f4',
              borderRadius: '8px',
              border: '1px solid #cce2d5',
              fontSize: '12.5px',
              lineHeight: '1.5',
              color: '#204030',
            }}
          >
            <p style={{ margin: '0 0 6px', fontWeight: 700 }}>3 Claves del Dashboard para la Emprendedora:</p>
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>
                <b>Tasa Activa:</b> Verifica en la barra superior si estás cobrando con Tasa Euro, Oficial BCV o Binance USDT. Todos los precios en Bs cambian automáticamente.
              </li>
              <li>
                <b>Salud del Inventario:</b> El semáforo amarillo y rojo te avisa si te queda poca leche o pocos envases antes de encender fogones o preparar cultivos.
              </li>
              <li>
                <b>Ventas Reales:</b> Con el botón "+" registras cada despacho en 5 segundos. Puedes emitir recibos y enviar cotizaciones directas a WhatsApp.
              </li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
