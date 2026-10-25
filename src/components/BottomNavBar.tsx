import React from 'react';
import { ViewId } from '../types';

interface BottomNavBarProps {
  currentView: ViewId;
  onSelectView: (view: ViewId) => void;
  onOpenMobileMenu: () => void;
  onOpenCashRegister: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentView,
  onSelectView,
  onOpenMobileMenu,
  onOpenCashRegister,
}) => {
  return (
    <nav className="bottom-nav-bar" aria-label="Navegación móvil inferior">
      <button
        type="button"
        className={`bottom-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
        onClick={() => onSelectView('dashboard')}
      >
        <span className="bottom-nav-icon">◫</span>
        <span className="bottom-nav-label">Dashboard</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${currentView === 'pricing' ? 'active' : ''}`}
        onClick={() => onSelectView('pricing')}
      >
        <span className="bottom-nav-icon">↗</span>
        <span className="bottom-nav-label">Precios</span>
      </button>

      {/* Floating Center Action Button for fast sale / cash register */}
      <button
        type="button"
        className="bottom-nav-fab"
        onClick={onOpenCashRegister}
        title="Caja Rápida y Calculadora de Vuelto"
        aria-label="Abrir caja rápida"
      >
        <span style={{ fontSize: '20px', lineHeight: 1 }}>💵</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${currentView === 'sales' ? 'active' : ''}`}
        onClick={() => onSelectView('sales')}
      >
        <span className="bottom-nav-icon">🛍</span>
        <span className="bottom-nav-label">Ventas</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${currentView === 'growth' ? 'active' : ''}`}
        onClick={() => onSelectView('growth')}
      >
        <span className="bottom-nav-icon">💡</span>
        <span className="bottom-nav-label">Asistente</span>
      </button>

      <button
        type="button"
        className="bottom-nav-item"
        onClick={onOpenMobileMenu}
        aria-label="Abrir menú completo"
      >
        <span className="bottom-nav-icon">☰</span>
        <span className="bottom-nav-label">Menú</span>
      </button>
    </nav>
  );
};
