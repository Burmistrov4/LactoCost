import { ViewId, UserProfile, WorkshopProfile } from '../types';
import { ROLE_LABELS } from '../utils/auth';

interface SidebarProps {
  currentView: ViewId;
  onSelectView: (view: ViewId) => void;
  isOpen: boolean;
  onClose: () => void;
  workshopProfile?: WorkshopProfile;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (mode?: 'login' | 'register' | 'switch') => void;
  onLogout?: () => void;
  onOpenWalkthrough?: () => void;
  onOpenThemeSelector?: () => void;
  onOpenCashRegister?: () => void;
  onOpenPackagingGuide?: () => void;
  onOpenMilkYield?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onClose,
  workshopProfile,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenWalkthrough,
  onOpenThemeSelector,
  onOpenCashRegister,
  onOpenPackagingGuide,
  onOpenMilkYield,
}) => {
  const handleNav = (view: ViewId) => {
    onSelectView(view);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar" aria-label="Navegación principal">
        <div className="brand" style={{ justifyContent: 'space-between', flexShrink: 0 }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '11px', cursor: 'pointer', flex: 1, minWidth: 0 }}
            onClick={() => handleNav('settings')}
            title="Clic para personalizar nombre, logo y datos de tu taller"
          >
            <div className="brand-mark" style={{ background: 'var(--lime)', color: 'var(--deep)', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
              {workshopProfile?.monogram || 'FA'}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div className="brand-name" style={{ fontSize: '15px', letterSpacing: '-0.3px', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {workshopProfile?.name || 'Flor Amarillo'}<span style={{ color: 'var(--lime)' }}>.</span>
              </div>
              <div className="brand-sub" style={{ fontSize: '10px', color: '#9bb0a4', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {workshopProfile?.tagline || 'Taller Artesanal'}
              </div>
            </div>
          </div>
          <button
            className="mobile-close-btn"
            onClick={onClose}
            aria-label="Cerrar menú"
            title="Cerrar menú"
          >
            ✕
          </button>
        </div>

        <div className="sidebar-scrollable">
          {currentUser ? (
            <div className="workspace-user-card" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div className="avatar" style={{ background: 'var(--deep2)', color: 'var(--lime)', fontSize: '20px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>
                  {currentUser.avatarEmoji || '👩‍🍳'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.name}
                  </strong>
                  <span style={{ fontSize: '10px', color: 'var(--lime)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {ROLE_LABELS[currentUser.role]?.badge || currentUser.role}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {onOpenAuthModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuthModal('switch');
                      onClose();
                    }}
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#ffffff',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                    title="Cambiar de perfil o registrar colaboradores"
                  >
                    👥 Perfiles
                  </button>
                )}
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.18)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#fca5a5',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="Cerrar sesión activa"
                  >
                    🚪 Salir
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="workspace-guest-card" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>👤</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: '12.5px', color: '#ffffff', display: 'block' }}>
                    Modo Invitado
                  </strong>
                  <span style={{ fontSize: '10.5px', color: '#9bb0a4' }}>
                    Sin sesión iniciada
                  </span>
                </div>
              </div>
              {onOpenAuthModal && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuthModal('login');
                      onClose();
                    }}
                    style={{
                      flex: 1,
                      background: 'var(--lime)',
                      border: 'none',
                      color: 'var(--deep)',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    🔑 Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuthModal('register');
                      onClose();
                    }}
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    ✨ Registro
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <div className="nav-label">Operaciones & Ventas</div>
            <nav className="nav">
              <button
                className={currentView === 'dashboard' ? 'active' : ''}
                onClick={() => handleNav('dashboard')}
              >
                <span className="ico">◫</span>Dashboard
              </button>

              <button
                className={currentView === 'pricing' ? 'active' : ''}
                onClick={() => handleNav('pricing')}
              >
                <span className="ico">↗</span>Precios & Márgenes
              </button>

              <button
                className={currentView === 'sales' ? 'active' : ''}
                onClick={() => handleNav('sales')}
              >
                <span className="ico">🛍</span>Ventas & Pedidos
              </button>

              <button
                className={currentView === 'growth' ? 'active' : ''}
                onClick={() => handleNav('growth')}
              >
                <span className="ico">💡</span>Asistente & Ventas <span className="soon">TIPS</span>
              </button>
            </nav>
          </div>

          <div>
            <div className="nav-label">Producción & Taller (CRUD)</div>
            <nav className="nav">
              <button
                className={currentView === 'products' ? 'active' : ''}
                onClick={() => handleNav('products')}
              >
                <span className="ico">🥣</span>Productos (Catálogo)
              </button>

              <button
                className={currentView === 'inventory' ? 'active' : ''}
                onClick={() => handleNav('inventory')}
              >
                <span className="ico">📦</span>Insumos & Stock
              </button>

              <button
                className={currentView === 'production' ? 'active' : ''}
                onClick={() => handleNav('production')}
              >
                <span className="ico">◉</span>Recetas & Lotes
              </button>

              <button
                className={currentView === 'costs' ? 'active' : ''}
                onClick={() => handleNav('costs')}
              >
                <span className="ico">⌁</span>Costos & CPP
              </button>

              <button
                className={currentView === 'purchases' ? 'active' : ''}
                onClick={() => handleNav('purchases')}
              >
                <span className="ico">⇣</span>Compras Sugeridas
              </button>
            </nav>
          </div>

          <div>
            <div className="nav-label">Administración</div>
            <nav className="nav">
              <button
                className={currentView === 'reports' ? 'active' : ''}
                onClick={() => handleNav('reports')}
              >
                <span className="ico">▤</span>Informes CSV
              </button>
              <button
                className={currentView === 'settings' ? 'active' : ''}
                onClick={() => handleNav('settings')}
              >
                <span className="ico">⚙</span>Tasas BCV & P2P
              </button>

              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuthModal('switch');
                    onClose();
                  }}
                  style={{ color: 'var(--lime)', fontWeight: 650 }}
                >
                  <span className="ico">👥</span>Perfiles & Login ({currentUser?.role === 'owner' ? 'Dueña' : currentUser?.role === 'sales' ? 'Ventas' : 'Taller'})
                </button>
              )}
            </nav>
          </div>

          <div>
            <div className="nav-label">Herramientas Rápidas</div>
            <nav className="nav">
              {onOpenThemeSelector && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenThemeSelector();
                    onClose();
                  }}
                  style={{ color: 'var(--lime)', fontWeight: 600 }}
                >
                  <span className="ico">🎨</span>Cambiar Paleta Visual
                </button>
              )}

              {onOpenCashRegister && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenCashRegister();
                    onClose();
                  }}
                >
                  <span className="ico">💵</span>Caja Rápida & Vuelto
                </button>
              )}

              {onOpenPackagingGuide && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenPackagingGuide();
                    onClose();
                  }}
                >
                  <span className="ico">📦</span>Guía Empaques (8-32oz)
                </button>
              )}

              {onOpenMilkYield && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenMilkYield();
                    onClose();
                  }}
                >
                  <span className="ico">🥛</span>Calculadora Rendimiento
                </button>
              )}

              {onOpenWalkthrough && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenWalkthrough();
                    onClose();
                  }}
                  style={{
                    color: 'var(--lime)',
                    fontWeight: 700,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    marginTop: '4px',
                  }}
                >
                  <span className="ico">💡</span>Tutorial / Guía Paso a Paso
                </button>
              )}
            </nav>
          </div>

          <div className="side-bottom">
            <div className="side-note" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '12px' }}>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {workshopProfile?.name || 'Flor Amarillo'} · {workshopProfile?.location || 'Valencia Sur'}
              </div>
              <div style={{ color: '#9bb0a4', fontSize: '11px', marginTop: '3px' }}>
                Costos en Divisas ($) y Facturación BCV con IVA 16%
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
