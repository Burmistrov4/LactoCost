import React, { useState } from 'react';
import { Product, WorkshopProfile } from '../types';

interface LabelGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  workshopProfile?: WorkshopProfile;
}

export const LabelGeneratorModal: React.FC<LabelGeneratorModalProps> = ({
  isOpen,
  onClose,
  products,
  workshopProfile,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [flavorSubtitle, setFlavorSubtitle] = useState<string>('Sabor Artesanal');
  const [batchCode, setBatchCode] = useState<string>(() => {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return `LOT-${ymd}-01`;
  });
  
  const todayStr = new Date().toISOString().slice(0, 10);
  const [mfgDate, setMfgDate] = useState<string>(todayStr);
  
  // Default expiry: +14 days for yogurt, +7 days for quesillo
  const calcExpiry = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };
  
  const [expDate, setExpDate] = useState<string>(calcExpiry(14));
  const [netWeight, setNetWeight] = useState<string>('200 g');
  const [ingredients, setIngredients] = useState<string>(
    'Leche entera pasteurizada, cultivos lácticos vivos (L. bulgaricus, S. thermophilus), azúcar refinada.'
  );
  const [contactInfo, setContactInfo] = useState<string>(
    workshopProfile
      ? `WhatsApp: ${workshopProfile.phone} · ${workshopProfile.location}`
      : 'WhatsApp: 0414-0000000 · Flor Amarillo, Valencia'
  );
  const [labelQuantity, setLabelQuantity] = useState<number>(6);

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleProductChange = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      if (prod.category === 'reposteria' || prod.name.toLowerCase().includes('pan') || prod.name.toLowerCase().includes('torta')) {
        setFlavorSubtitle('Tradicional con Caramelo y Pasas');
        setNetWeight('200 g (Porción)');
        setExpDate(calcExpiry(6));
        setIngredients('Pan de trigo, leche entera pasteurizada, azúcar, huevos frescos, pasas morenas, mantequilla, canela, vainilla.');
      } else if (prod.category === 'quesillo' || prod.name.toLowerCase().includes('quesillo')) {
        setFlavorSubtitle('Tradicional con Caramelo');
        setNetWeight('180 g');
        setExpDate(calcExpiry(7));
        setIngredients('Leche pasteurizada, huevos frescos, leche condensada, azúcar, vainilla natural.');
      } else if (prod.name.toLowerCase().includes('fresa')) {
        setFlavorSubtitle('Con Compota Natural de Fresa');
        setNetWeight('200 g');
        setExpDate(calcExpiry(14));
        setIngredients('Leche entera pasteurizada, cultivo láctico, reducción de fresas naturales, azúcar.');
      } else if (prod.name.toLowerCase().includes('griego')) {
        setFlavorSubtitle('Doble Filtrado Proteico');
        setNetWeight('500 g');
        setExpDate(calcExpiry(16));
        setIngredients('Leche entera pasteurizada, fermentos lácticos activos seleccionados.');
      } else {
        setFlavorSubtitle('100% Natural Firme');
        setNetWeight('200 g');
        setExpDate(calcExpiry(14));
        setIngredients('Leche entera pasteurizada, cultivos lácticos vivos, azúcar refinada.');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal show printable-modal-wrapper" role="dialog" aria-modal="true">
      <div className="modal-backdrop no-print" onClick={onClose} />
      <div className="modal-dialog" style={{ maxWidth: '780px' }}>
        <div className="modal-header no-print">
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>🏷️ Rótulos & Etiquetas para Envases</h3>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
              Genera etiquetas listas para imprimir en hojas adhesivas para potes de 200g, 500g o quesillo.
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="modal-body no-print" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))' }}>
            <div className="field">
              <label>Producto a Etiquetar</label>
              <select value={selectedProductId} onChange={(e) => handleProductChange(e.target.value)}>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.emoji} {p.name} ({p.format})
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Subtítulo o Variedad</label>
              <input
                type="text"
                value={flavorSubtitle}
                onChange={(e) => setFlavorSubtitle(e.target.value)}
                placeholder="Ej. Con fruta natural"
              />
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))' }}>
            <div className="field">
              <label>Número de Lote</label>
              <input
                type="text"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Fecha de Elaboración</label>
              <input
                type="date"
                value={mfgDate}
                onChange={(e) => setMfgDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Fecha de Vencimiento</label>
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))' }}>
            <div className="field">
              <label>Contenido Neto</label>
              <input
                type="text"
                value={netWeight}
                onChange={(e) => setNetWeight(e.target.value)}
                placeholder="Ej. 200 g"
              />
            </div>
            <div className="field">
              <label>Contacto / Redes</label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Ej. WhatsApp: 0414-XXXXXXX"
              />
            </div>
          </div>

          <div className="field">
            <label>Ingredientes</label>
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Cantidad en la hoja de muestra:</label>
            <select
              value={labelQuantity}
              onChange={(e) => setLabelQuantity(Number(e.target.value))}
              style={{ width: '100px' }}
            >
              <option value={2}>2 etiquetas</option>
              <option value={4}>4 etiquetas</option>
              <option value={6}>6 etiquetas</option>
              <option value={8}>8 etiquetas</option>
            </select>
          </div>
        </div>

        {/* Printable Sheet View */}
        <div className="print-sheet-container" style={{ padding: '12px', background: '#f5f7f5', borderRadius: '8px' }}>
          <div className="no-print" style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
            Vista previa de la hoja de impresión:
          </div>

          <div
            className="labels-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {Array.from({ length: labelQuantity }).map((_, idx) => (
              <div
                key={idx}
                className="sticker-label"
                style={{
                  border: '2px dashed #245740',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  background: 'white',
                  color: '#162b20',
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #d4e5db', paddingBottom: '6px' }}>
                  <div>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#387c5b', fontWeight: 800 }}>
                      {workshopProfile?.name ? workshopProfile.name.toUpperCase() : 'TALLER ARTESANAL'}
                    </span>
                    <h4 style={{ margin: '2px 0 0', fontSize: '15px', color: '#123022', fontWeight: 800 }}>
                      {selectedProduct?.emoji} {selectedProduct?.name}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#4a6b57', fontWeight: 600 }}>
                      {flavorSubtitle}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, background: '#eaf5ee', padding: '2px 6px', borderRadius: '4px', color: '#1d5a3b' }}>
                      {netWeight}
                    </span>
                  </div>
                </div>

                <div style={{ margin: '8px 0', fontSize: '10px', color: '#3a4e42', lineHeight: '1.3' }}>
                  <b>Ingredientes:</b> {ingredients}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '9px', background: '#f8faf8', padding: '5px 8px', borderRadius: '6px', border: '1px solid #e1ebe3' }}>
                  <div>
                    <b>Elaboración:</b> {mfgDate}
                  </div>
                  <div>
                    <b>Vence:</b> <span style={{ color: '#b93822', fontWeight: 700 }}>{expDate}</span>
                  </div>
                  <div>
                    <b>Lote:</b> {batchCode}
                  </div>
                  <div>
                    <b>Conservación:</b> 2°C a 4°C
                  </div>
                </div>

                <div style={{ marginTop: '8px', fontSize: '9px', textAlign: 'center', color: '#5b7667', borderTop: '1px dotted #ccc', paddingTop: '4px' }}>
                  {contactInfo} · <em>Hecho en Venezuela con leche fresca 🇻🇪</em>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer no-print" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px' }}>
          <button type="button" className="ghost-btn" onClick={onClose}>
            Cerrar
          </button>
          <button type="button" className="primary-btn" onClick={handlePrint}>
            🖨️ Imprimir Etiquetas
          </button>
        </div>
      </div>
    </div>
  );
};
