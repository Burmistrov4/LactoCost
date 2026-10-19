import React from 'react';
import { ViewId } from '../types';

interface SidebarProps {
  currentView: ViewId;
  onSelectView: (view: ViewId) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onClose,
}) => {
  const handleNav = (view: ViewId) => {
    onSelectView(view);
    onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar" aria-label="Navegación principal">
      <div className="brand">
        <div className="brand-mark">c.</div>
        <div>
          <div className="brand-name">
            cuajada<span style={{ color: 'var(--lime)' }}>.</span>
          </div>
          <div className="brand-sub">studio · operaciones</div>
        </div>
      </div>

      <div className="workspace">
        <div className="avatar">YS</div>
        <div>
          <strong>Yogur & Quesillo</strong>
          <small>Espacio de trabajo local</small>
        </div>
        <span style={{ marginLeft: 'auto', color: '#9bb0a4' }}>⌄</span>
      </div>

      <div>
        <div className="nav-label">Workspace</div>
        <nav className="nav">
          <button
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => handleNav('dashboard')}
          >
            <span className="ico">◫</span>Dashboard
          </button>
          <button
            className={currentView === 'inventory' ? 'active' : ''}
            onClick={() => handleNav('inventory')}
          >
            <span className="ico">▦</span>Inventario <span className="soon">ACTIVO</span>
          </button>
          <button
            className={currentView === 'production' ? 'active' : ''}
            onClick={() => handleNav('production')}
          >
            <span className="ico">◉</span>Producción <span className="soon">ACTIVO</span>
          </button>
          <button
            className={currentView === 'costs' ? 'active' : ''}
            onClick={() => handleNav('costs')}
          >
            <span className="ico">⌁</span>Costos & CPP <span className="soon">ACTIVO</span>
          </button>
          <button
            className={currentView === 'purchases' ? 'active' : ''}
            onClick={() => handleNav('purchases')}
          >
            <span className="ico">⇣</span>Compras <span className="soon">ACTIVO</span>
          </button>
          <button
            className={currentView === 'pricing' ? 'active' : ''}
            onClick={() => handleNav('pricing')}
          >
            <span className="ico">↗</span>Precios & márgenes <span className="soon">ACTIVO</span>
          </button>
        </nav>
      </div>

      <div>
        <div className="nav-label">Gestión</div>
        <nav className="nav">
          <button
            className={currentView === 'reports' ? 'active' : ''}
            onClick={() => handleNav('reports')}
          >
            <span className="ico">▤</span>Informes <span className="soon">ACTIVO</span>
          </button>
          <button
            className={currentView === 'settings' ? 'active' : ''}
            onClick={() => handleNav('settings')}
          >
            <span className="ico">⚙</span>Configuración <span className="soon">TASAS</span>
          </button>
        </nav>
      </div>

      <div className="side-bottom">
        <div className="side-note">
          <strong>
            <span className="dot"></span>Centro de control
          </strong>
          Motor determinista con precisión de micro-unidades y paridad económica.
          <div style={{ marginTop: '12px', color: '#839b8e', fontSize: '10px' }}>
            LACTOCOST · V1.0 REACT
          </div>
        </div>
      </div>
    </aside>
  );
};
