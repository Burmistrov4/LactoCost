import React from 'react';
import { ColorPaletteId } from '../types';
import { COLOR_PALETTES } from '../utils/theme';

interface ThemeSelectorModalProps {
  currentPalette: ColorPaletteId;
  onSelectPalette: (paletteId: ColorPaletteId) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  currentPalette,
  onSelectPalette,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="theme-modal-title">
      <div
        className="modal-container theme-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', width: '92%' }}
      >
        <div className="modal-header" style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🎨</span>
            <div>
              <h2 id="theme-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                Paletas de Colores & Estilo Visual
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: 'var(--muted)' }}>
                Personaliza la apariencia para adaptarla a los productos de tu taller
              </p>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{ fontSize: '18px', background: 'transparent', border: 'none', color: 'var(--muted)' }}
          >
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {COLOR_PALETTES.map((palette) => {
            const isSelected = currentPalette === palette.id;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => {
                  onSelectPalette(palette.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  border: isSelected ? '2px solid var(--lime)' : '1px solid var(--line)',
                  background: isSelected ? 'var(--mint)' : 'var(--white)',
                  boxShadow: isSelected ? '0 4px 16px var(--accent-glow)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s ease',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '26px' }}>{palette.emoji}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14.5px', color: 'var(--ink)', fontWeight: 700 }}>
                        {palette.name}
                      </strong>
                      {isSelected && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '99px',
                            background: 'var(--deep)',
                            color: 'var(--lime)',
                            letterSpacing: '0.5px',
                          }}
                        >
                          ACTIVA
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                      {palette.description}
                    </span>
                  </div>
                </div>

                {/* Color swatches preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px', flexShrink: 0 }}>
                  {palette.previewColors.map((color, i) => (
                    <span
                      key={i}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: color,
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

        <div
          className="modal-footer"
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--paper)',
            borderRadius: '0 0 17px 17px',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
            ✨ El tema seleccionado se guarda automáticamente en tu navegador.
          </span>
          <button
            type="button"
            className="primary-btn"
            onClick={onClose}
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
