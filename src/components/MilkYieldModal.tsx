import React, { useState } from 'react';
import { moneyUSD, moneyVES } from '../utils/formatters';

interface MilkYieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRate: number;
  activeRateName: string;
}

export const MilkYieldModal: React.FC<MilkYieldModalProps> = ({
  isOpen,
  onClose,
  activeRate,
  activeRateName,
}) => {
  const [productType, setProductType] = useState<'yogurt_firme' | 'yogurt_griego' | 'quesillo'>('yogurt_firme');
  const [milkLiters, setMilkLiters] = useState<number>(20);
  const [milkPricePerLiterUSD, setMilkPricePerLiterUSD] = useState<number>(0.95);
  const [unitsProduced, setUnitsProduced] = useState<number>(98);
  const [unitFormatGrams, setUnitFormatGrams] = useState<number>(200);

  if (!isOpen) return null;

  // Expected benchmark ratios:
  // For Yogurt Firme 200g: 1 Liter produces ~ 4.9 units (98% yield, minimal loss)
  // For Yogurt Griego 500g: requires straining, ratio is about 2.5 to 3 Liters per 1 Kg (or ~0.7 to 0.8 units of 500g per liter)
  // For Quesillo (180g portion): 1 Liter milk + eggs/condensed milk produces ~12 portions
  let benchmarkUnitsExpected = 0;
  let benchmarkYieldDesc = '';

  if (productType === 'yogurt_firme') {
    benchmarkUnitsExpected = Math.round((milkLiters * 1000) / unitFormatGrams * 0.98);
    benchmarkYieldDesc = 'Estándar artesanal: 4.8 a 5.0 envases de 200g por cada litro de leche entera (aprovechamiento ~98%).';
  } else if (productType === 'yogurt_griego') {
    // Strained Greek yogurt yields about 350-400g per liter of milk due to whey drainage
    const totalGramsYield = milkLiters * 380;
    benchmarkUnitsExpected = Math.max(1, Math.round(totalGramsYield / unitFormatGrams));
    benchmarkYieldDesc = 'Estándar griego artesanal: ~380g de yogurt espeso por litro de leche tras desuerar suero ácido.';
  } else {
    // Quesillo
    benchmarkUnitsExpected = Math.round(milkLiters * 12);
    benchmarkYieldDesc = 'Estándar quesillo: ~12 porciones individuales por cada litro de leche combinada con leche condensada y huevos.';
  }

  const yieldPercentage = benchmarkUnitsExpected > 0 ? Math.round((unitsProduced / benchmarkUnitsExpected) * 100) : 100;
  const totalMilkCostUSD = milkLiters * milkPricePerLiterUSD;
  const milkCostPerUnitUSD = unitsProduced > 0 ? totalMilkCostUSD / unitsProduced : 0;
  const milkCostPerUnitVES = milkCostPerUnitUSD * activeRate;

  // Diagnosis
  let diagnosisType: 'success' | 'warning' | 'alert' = 'success';
  let diagnosisTitle = '';
  let diagnosisText = '';

  if (yieldPercentage >= 95) {
    diagnosisType = 'success';
    diagnosisTitle = '✅ Calidad Excelente y Rendimiento Óptimo';
    diagnosisText =
      'La leche presenta un excelente contenido de sólidos totales y grasa. La fermentación y cuajado retuvieron la humedad correcta sin merma excesiva. Tu proveedor de leche cumple con altos estándares.';
  } else if (yieldPercentage >= 85) {
    diagnosisType = 'warning';
    diagnosisTitle = '⚠️ Rendimiento Regular (Merma del ' + (100 - yieldPercentage) + '%)';
    diagnosisText =
      'Se produjo un 10% a 15% menos de producto del esperado. Posibles causas: evaporación excesiva durante el calentamiento previo (más de 85°C prolongado), o leche con densidad ligeramente baja típica de época de lluvias.';
  } else {
    diagnosisType = 'alert';
    diagnosisTitle = '🚨 Alerta: Rendimiento Muy Bajo (' + (100 - yieldPercentage) + '% de pérdida)';
    diagnosisText =
      'El rendimiento está muy por debajo del estándar. Puede haber leche aguada por parte del proveedor, exceso de desuerado por cuajado a temperatura inadecuada (debe inocularse a 43°C exactos), o merma en el envasado.';
  }

  return (
    <div className="modal show" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-dialog" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>🔬 Medidor de Rendimiento de Leche & Control de Calidad</h3>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
              Calcula si tu leche rindió lo esperado y detecta a tiempo mermas o leche aguada.
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="field">
            <label>Tipo de Elaboración</label>
            <select
              value={productType}
              onChange={(e) => {
                const t = e.target.value as any;
                setProductType(t);
                if (t === 'yogurt_griego') {
                  setUnitFormatGrams(500);
                  setUnitsProduced(15);
                } else if (t === 'quesillo') {
                  setUnitFormatGrams(180);
                  setUnitsProduced(24);
                  setMilkLiters(2);
                } else {
                  setUnitFormatGrams(200);
                  setUnitsProduced(98);
                  setMilkLiters(20);
                }
              }}
            >
              <option value="yogurt_firme">Yogurt Natural Firme / Con Fruta (Envase estándar)</option>
              <option value="yogurt_griego">Yogurt Griego (Desuerado / Colado artesanal)</option>
              <option value="quesillo">Quesillo Tradicional Casero (Baño maría)</option>
            </select>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))' }}>
            <div className="field">
              <label>Litros de Leche Utilizados (L)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={milkLiters}
                onChange={(e) => setMilkLiters(Math.max(0.1, Number(e.target.value)))}
              />
            </div>
            <div className="field">
              <label>Costo de la Leche ($/Litro)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={milkPricePerLiterUSD}
                onChange={(e) => setMilkPricePerLiterUSD(Math.max(0.01, Number(e.target.value)))}
              />
              <small style={{ color: 'var(--muted)', fontSize: '11px' }}>
                Ref. Nacional: $0.85 - $1.20/L (Canilac)
              </small>
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))' }}>
            <div className="field">
              <label>Tamaño de Envase / Porción (g)</label>
              <input
                type="number"
                step="10"
                min="50"
                value={unitFormatGrams}
                onChange={(e) => setUnitFormatGrams(Math.max(10, Number(e.target.value)))}
              />
            </div>
            <div className="field">
              <label>Unidades / Potes Obtenidos</label>
              <input
                type="number"
                step="1"
                min="1"
                value={unitsProduced}
                onChange={(e) => setUnitsProduced(Math.max(1, Number(e.target.value)))}
              />
            </div>
          </div>

          {/* Results Comparison Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
              gap: '10px',
              background: '#f4f7f5',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #d3e4db',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>Rendimiento Obtenido:</span>
              <strong style={{ fontSize: '20px', color: yieldPercentage >= 95 ? '#246b45' : '#b24424' }}>
                {yieldPercentage}% de lo óptimo
              </strong>
              <small style={{ display: 'block', color: 'var(--muted)', fontSize: '11px' }}>
                {unitsProduced} envases obtenidos de {benchmarkUnitsExpected} esperados
              </small>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>Costo Leche por Envase:</span>
              <strong style={{ fontSize: '20px', color: '#143122' }}>
                {moneyUSD(milkCostPerUnitUSD)}
              </strong>
              <small style={{ display: 'block', color: '#387854', fontSize: '11px' }}>
                {moneyVES(milkCostPerUnitVES)} ({activeRateName})
              </small>
            </div>
          </div>

          {/* Smart Diagnosis Card */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              border: diagnosisType === 'success' ? '1px solid #b5e2c5' : diagnosisType === 'warning' ? '1px solid #fed7aa' : '1px solid #fecaca',
              background: diagnosisType === 'success' ? '#edf8f1' : diagnosisType === 'warning' ? '#fffbeb' : '#fef2f2',
            }}
          >
            <strong
              style={{
                display: 'block',
                fontSize: '14px',
                color: diagnosisType === 'success' ? '#185c35' : diagnosisType === 'warning' ? '#b45309' : '#b91c1c',
                marginBottom: '4px',
              }}
            >
              {diagnosisTitle}
            </strong>
            <p style={{ margin: 0, fontSize: '12px', color: '#2e4337', lineHeight: '1.45' }}>
              {diagnosisText}
            </p>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--muted)', background: 'white', padding: '8px 10px', borderRadius: '6px', border: '1px dashed #ccc' }}>
            ℹ️ <b>Referencia del sector lechero venezolano:</b> {benchmarkYieldDesc}
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="primary-btn" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
