import React from 'react';
import { ViewId } from '../types';

interface TopbarProps {
  currentView: ViewId;
  onOpenMobileMenu: () => void;
  onOpenAlerts: () => void;
  onOpenQuickOperation: () => void;
  onExport: () => void;
  unreadAlertsCount: number;
}

const VIEW_TITLES: Record<ViewId, { crumb: string; title: string }> = {
  dashboard: { crumb: 'Dashboard', title: 'Buenos días, equipo ✳' },
  inventory: { crumb: 'Inventario', title: 'Inventario inteligente' },
  production: { crumb: 'Producción', title: 'Control de producción' },
  costs: { crumb: 'Costos & CPP', title: 'Costos bajo control' },
  purchases: { crumb: 'Compras', title: 'Compras con criterio' },
  pricing: { crumb: 'Precios & márgenes', title: 'Decisiones con margen' },
  reports: { crumb: 'Informes', title: 'Todo bajo control' },
  settings: { crumb: 'Configuración', title: 'Configura tu operación' },
};

export const Topbar: React.FC<TopbarProps> = ({
  currentView,
  onOpenMobileMenu,
  onOpenAlerts,
  onOpenQuickOperation,
  onExport,
  unreadAlertsCount,
}) => {
  const { crumb, title } = VIEW_TITLES[currentView];

  return (
    <header className="topbar">
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <button
          className="icon-btn mobile-menu"
          id="menuBtn"
          aria-label="Abrir menú"
          onClick={onOpenMobileMenu}
        >
          ☰
        </button>
        <div>
          <div className="crumb">
            Workspace <span style={{ padding: '0 5px' }}>/</span>
            <b>{crumb}</b>
          </div>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="top-actions">
        <button
          className="icon-btn"
          id="alertBtn"
          aria-label="Ver alertas"
          onClick={onOpenAlerts}
          title="Ver alertas de stock y costos"
        >
          ♧
          {unreadAlertsCount > 0 && <span className="badge-dot"></span>}
        </button>
        <button className="ghost-btn" id="exportBtn" onClick={onExport}>
          ↓ <span className="desktop-label">Exportar datos</span>
        </button>
        <button className="primary-btn" id="quickBtn" onClick={onOpenQuickOperation}>
          <span>＋</span> <span>Nueva operación</span>
        </button>
      </div>
    </header>
  );
};
