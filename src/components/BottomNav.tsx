import React from 'react';
import { ViewId } from '../types';

interface BottomNavProps {
  currentView: ViewId;
  onSelectView: (view: ViewId) => void;
  onOpenMenu: () => void;
  onOpenQuickSale?: () => void;
  unreadAlertsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onSelectView,
  onOpenMenu,
  onOpenQuickSale,
  unreadAlertsCount = 0,
}) => {
  return (
    <nav className="bottom-nav" aria-label="Navegación móvil inferior">
      <button
        className={`bottom-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
        onClick={() => onSelectView('dashboard')}
        aria-label="Ir a Dashboard"
      >
        <span className="bottom-nav-icon">◫</span>
        <span className="bottom-nav-label">Inicio</span>
      </button>

      <button
        className={`bottom-nav-item ${currentView === 'sales' ? 'active' : ''}`}
        onClick={() => onSelectView('sales')}
        aria-label="Ir a Ventas"
      >
        <span className="bottom-nav-icon">🛍</span>
        <span className="bottom-nav-label">Ventas</span>
      </button>

      {onOpenQuickSale && (
        <button
          className="bottom-nav-fab"
          onClick={onOpenQuickSale}
          aria-label="Nueva operación o venta"
          title="Registrar operación"
        >
          <span className="bottom-nav-fab-icon">＋</span>
        </button>
      )}

      <button
        className={`bottom-nav-item ${currentView === 'inventory' ? 'active' : ''}`}
        onClick={() => onSelectView('inventory')}
        aria-label="Ir a Stock"
      >
        <span className="bottom-nav-icon">📦</span>
        <span className="bottom-nav-label">Stock</span>
        {unreadAlertsCount > 0 && <span className="bottom-nav-dot" />}
      </button>

      <button
        className={`bottom-nav-item ${currentView === 'pricing' ? 'active' : ''}`}
        onClick={() => onSelectView('pricing')}
        aria-label="Ir a Precios"
      >
        <span className="bottom-nav-icon">↗</span>
        <span className="bottom-nav-label">Precios</span>
      </button>

      <button
        className={`bottom-nav-item ${
          ['products', 'production', 'costs', 'purchases', 'growth', 'reports', 'settings'].includes(
            currentView
          )
            ? 'active'
            : ''
        }`}
        onClick={onOpenMenu}
        aria-label="Abrir menú completo"
      >
        <span className="bottom-nav-icon">☰</span>
        <span className="bottom-nav-label">Más</span>
      </button>
    </nav>
  );
};
