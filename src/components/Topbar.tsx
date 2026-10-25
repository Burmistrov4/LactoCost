import { ViewId, ScrapedRates, RateReferenceType, DisplayCurrencyMode, UserProfile, WorkshopProfile } from '../types';
import { RateTickerBar } from './RateTickerBar';

interface TopbarProps {
  currentView: ViewId;
  rates: ScrapedRates;
  activeRateType: RateReferenceType;
  onChangeRateType: (type: RateReferenceType) => void;
  currencyMode: DisplayCurrencyMode;
  onChangeCurrencyMode: (mode: DisplayCurrencyMode) => void;
  onRefreshRates: () => Promise<void>;
  isRefreshingRates: boolean;
  workshopProfile?: WorkshopProfile;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (mode?: 'login' | 'register' | 'switch') => void;
  onLogout?: () => void;
  onOpenMobileMenu: () => void;
  onOpenAlerts: () => void;
  onOpenQuickOperation: () => void;
  onOpenCashRegister?: () => void;
  onOpenThemeSelector?: () => void;
  onOpenWalkthrough: () => void;
  onExport: () => void;
  unreadAlertsCount: number;
}

const VIEW_TITLES: Record<ViewId, { crumb: string; title: string }> = {
  dashboard: { crumb: 'Dashboard', title: 'Panel del Taller Artesanal ✳' },
  products: { crumb: 'Catálogo de Productos', title: 'Tus productos y presentaciones' },
  inventory: { crumb: 'Insumos & Stock', title: 'Almacén de leche y materiales' },
  production: { crumb: 'Recetas & Lotes', title: 'Control de producción y recetas' },
  costs: { crumb: 'Costos & CPP', title: 'Costos bajo control' },
  purchases: { crumb: 'Compras Sugeridas', title: 'Planificador de compras' },
  pricing: { crumb: 'Precios & Márgenes', title: 'Decisiones con margen seguro' },
  sales: { crumb: 'Ventas & Pedidos', title: 'Despachos y cobros del día' },
  growth: { crumb: 'Asistente de Ventas', title: '¡A vender más y ganar mejor! ✨' },
  reports: { crumb: 'Informes', title: 'Historial y reportes CSV' },
  settings: { crumb: 'Configuración', title: 'Identidad del Taller, Tasas BCV & Equipo' },
};

export const Topbar: React.FC<TopbarProps> = ({
  currentView,
  rates,
  activeRateType,
  onChangeRateType,
  currencyMode,
  onChangeCurrencyMode,
  onRefreshRates,
  isRefreshingRates,
  workshopProfile,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenMobileMenu,
  onOpenAlerts,
  onOpenQuickOperation,
  onOpenCashRegister,
  onOpenThemeSelector,
  onOpenWalkthrough,
  onExport,
  unreadAlertsCount,
}) => {
  const baseTitleInfo = VIEW_TITLES[currentView] || VIEW_TITLES.dashboard;
  const crumb = baseTitleInfo.crumb;
  const title =
    currentView === 'dashboard' && workshopProfile
      ? `${workshopProfile.name} ✳`
      : baseTitleInfo.title;

  return (
    <>
      <RateTickerBar
        rates={rates}
        activeRateType={activeRateType}
        onChangeRateType={onChangeRateType}
        currencyMode={currencyMode}
        onChangeCurrencyMode={onChangeCurrencyMode}
        onRefreshRates={onRefreshRates}
        isRefreshing={isRefreshingRates}
      />

      <header className="topbar">
        <div className="topbar-main">
          <button
            className="icon-btn mobile-menu"
            id="menuBtn"
            aria-label="Abrir menú de navegación"
            onClick={onOpenMobileMenu}
          >
            ☰
          </button>
          <div className="topbar-titles">
            <div className="crumb">
              Workspace <span style={{ padding: '0 4px' }}>/</span>
              <b>{crumb}</b>
            </div>
            <h1 className="topbar-title">{title}</h1>
          </div>
        </div>

        <div className="top-actions">
          {currentUser ? (
            <>
              {onOpenAuthModal && (
                <button
                  type="button"
                  className="ghost-btn profile-topbar-btn"
                  id="topbarProfileBtn"
                  onClick={() => onOpenAuthModal('switch')}
                  title={`Perfil activo: ${currentUser.name} · Clic para cambiar de perfil o registrar colaboradores`}
                  style={{ gap: '6px' }}
                >
                  <span style={{ fontSize: '16px', lineHeight: 1 }}>{currentUser.avatarEmoji || '👩‍🍳'}</span>
                  <span className="desktop-label" style={{ fontWeight: 700 }}>
                    {currentUser.name.split(' ')[0]}
                  </span>
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  className="ghost-btn logout-topbar-btn"
                  id="topbarLogoutBtn"
                  onClick={onLogout}
                  title="Cerrar sesión activa (Salir)"
                  style={{
                    color: 'var(--rose)',
                    borderColor: 'rgba(220, 38, 38, 0.35)',
                    background: '#fff1f2',
                    padding: '6px 10px',
                    fontWeight: 700,
                  }}
                >
                  <span>🚪</span> <span className="desktop-label">Salir</span>
                </button>
              )}
            </>
          ) : (
            onOpenAuthModal && (
              <>
                <button
                  type="button"
                  className="primary-btn login-topbar-btn"
                  id="topbarLoginBtn"
                  onClick={() => onOpenAuthModal('login')}
                  title="Iniciar sesión con tu usuario y PIN"
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                >
                  <span>🔑</span> <span>Entrar</span>
                </button>
                <button
                  type="button"
                  className="ghost-btn register-topbar-btn"
                  id="topbarRegisterBtn"
                  onClick={() => onOpenAuthModal('register')}
                  title="Registrar nuevo perfil o colaborador"
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                >
                  <span>✨</span> <span className="desktop-label">Registro</span>
                </button>
              </>
            )
          )}

          {onOpenThemeSelector && (
            <button
              type="button"
              className="ghost-btn theme-btn"
              id="themeBtn"
              onClick={onOpenThemeSelector}
              title="Cambiar paleta de colores y diseño"
              aria-label="Cambiar tema de diseño"
            >
              <span>🎨</span> <span className="desktop-label">Tema</span>
            </button>
          )}

          {onOpenCashRegister && (
            <button
              type="button"
              className="ghost-btn cash-btn"
              id="cashRegisterBtn"
              onClick={onOpenCashRegister}
              title="Abrir Caja Rápida y Calculadora de Vuelto en Bs. y $"
            >
              <span>💵</span> <span className="desktop-label">Caja Rápida</span>
            </button>
          )}

          <button
            type="button"
            className="ghost-btn guide-btn"
            id="walkthroughBtn"
            onClick={onOpenWalkthrough}
            title="Abrir Guía y Tutorial Interactivo"
          >
            <span>💡</span> <span className="desktop-label">Guía</span>
          </button>

          <button
            className="icon-btn alert-btn"
            id="alertBtn"
            aria-label="Ver alertas"
            onClick={onOpenAlerts}
            title="Ver alertas de stock y compras"
          >
            <span style={{ fontSize: '15px' }}>🔔</span>
            {unreadAlertsCount > 0 && <span className="badge-dot"></span>}
          </button>

          <button className="ghost-btn export-btn" id="exportBtn" onClick={onExport} title="Exportar datos a CSV">
            <span>↓</span> <span className="desktop-label">Exportar</span>
          </button>

          <button
            className="primary-btn quick-op-btn"
            id="quickBtn"
            onClick={onOpenQuickOperation}
            title="Nueva operación de inventario o venta"
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>＋</span>
            <span className="desktop-label">Nueva operación</span>
          </button>
        </div>
      </header>
    </>
  );
};
