import React, { useState } from 'react';
import { Recipe, ProductionBatch, InventoryItem, ViewId } from '../types';
import { money } from '../utils/formatters';
import { batchUnitCost } from '../domain/costing';

interface ProductionViewProps {
  recipes: Recipe[];
  batches: ProductionBatch[];
  inventory: InventoryItem[];
  onExecuteBatch: (batch: {
    recipeId: string;
    inputUnits: number;
    saleableUnits: number;
    wasteUnits: number;
    totalBatchCost: number;
    unitCost: number;
  }) => void;
  onNavigate: (view: ViewId) => void;
  onNotify: (msg: string) => void;
}

export const ProductionView: React.FC<ProductionViewProps> = ({
  recipes,
  batches,
  inventory,
  onExecuteBatch,
  onNavigate,
  onNotify,
}) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || '');
  const [batchMultiplier, setBatchMultiplier] = useState<number>(1);
  const [wastePercentage, setWastePercentage] = useState<number>(2.0);

  const currentRecipe = recipes.find((r) => r.id === selectedRecipeId) || recipes[0];

  // Calculate ingredients consumption & cost for this simulated batch
  const ingredientsCostDetails = currentRecipe.ingredients.map((ing) => {
    const invItem = inventory.find((i) => i.id === ing.itemId);
    const requiredQty = ing.quantity * batchMultiplier;
    const unitCost = invItem ? invItem.unitCost : 0;
    const totalCost = requiredQty * unitCost;
    const stockAvailable = invItem ? invItem.currentStock : 0;
    const isSufficient = stockAvailable >= requiredQty;

    return {
      itemId: ing.itemId,
      name: invItem ? invItem.name : ing.itemId,
      unit: ing.unit,
      requiredQty,
      stockAvailable,
      isSufficient,
      unitCost,
      totalCost,
    };
  });

  const totalIngredientsCost = ingredientsCostDetails.reduce((sum, item) => sum + item.totalCost, 0);
  const totalLaborOverhead = currentRecipe.laborAndOverheadPerBatch * batchMultiplier;
  const totalBatchCost = totalIngredientsCost + totalLaborOverhead;

  const expectedRawYield = currentRecipe.yieldExpectedUnits * batchMultiplier;
  const wasteUnits = Math.round((expectedRawYield * wastePercentage) / 100);
  const saleableUnits = Math.max(1, expectedRawYield - wasteUnits);

  let calculatedUnitCost = 0;
  try {
    calculatedUnitCost = batchUnitCost(totalBatchCost, saleableUnits);
  } catch {
    calculatedUnitCost = 0;
  }

  const allIngredientsAvailable = ingredientsCostDetails.every((i) => i.isSufficient);

  const handleRegisterBatch = () => {
    if (!allIngredientsAvailable) {
      onNotify('Advertencia: Algunos insumos no cuentan con stock suficiente en almacén.');
      return;
    }

    onExecuteBatch({
      recipeId: currentRecipe.id,
      inputUnits: expectedRawYield,
      saleableUnits,
      wasteUnits,
      totalBatchCost,
      unitCost: calculatedUnitCost,
    });

    onNotify(`Lote de ${currentRecipe.productName} registrado: ${saleableUnits} unidades a ${money(calculatedUnitCost)} c/u.`);
  };

  return (
    <section className="view-state active" id="view-production">
      <div className="card panel">
        <div className="panel-title">
          <div>
            <h2 style={{ margin: 0, fontSize: '19px' }}>Control de producción y recetas</h2>
            <p>Formulación aprobada, consumos por lote, cálculo de mermas y costo unitario resultante.</p>
          </div>
          <span className="status good">VERSIONADO DETERMINISTA</span>
        </div>

        {/* Recipe Selection & Batch Simulator */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(300px, 1fr)',
            gap: '16px',
            marginTop: '16px',
          }}
        >
          <div style={{ background: '#fbfdfa', border: '1px solid var(--line)', borderRadius: '14px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Simulador de lote de producción</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="field-label" style={{ marginTop: 0 }}>
                  Receta aprobada
                </label>
                <select
                  className="rate-select"
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                >
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.productName} ({r.version})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label" style={{ marginTop: 0 }}>
                  Factor de escala de lote
                </label>
                <select
                  className="rate-select"
                  value={batchMultiplier}
                  onChange={(e) => setBatchMultiplier(parseFloat(e.target.value))}
                >
                  <option value={0.5}>0,5x (Medio lote · {currentRecipe.batchSizeExpected * 0.5} {currentRecipe.unit})</option>
                  <option value={1}>1,0x (Lote estándar · {currentRecipe.batchSizeExpected} {currentRecipe.unit})</option>
                  <option value={2}>2,0x (Doble lote · {currentRecipe.batchSizeExpected * 2} {currentRecipe.unit})</option>
                  <option value={5}>5,0x (Gran volumen · {currentRecipe.batchSizeExpected * 5} {currentRecipe.unit})</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label className="field-label">
                Merma estimada durante el proceso (%)
              </label>
              <div className="margin-input-wrap">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="30"
                  className="margin-input"
                  value={wastePercentage}
                  onChange={(e) => setWastePercentage(parseFloat(e.target.value) || 0)}
                />
                <span>%</span>
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <strong style={{ fontSize: '12px', color: '#44554b' }}>Insumos requeridos vs. existencia en almacén:</strong>
              <div className="table-wrap" style={{ marginTop: '6px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Insumo</th>
                      <th>Requerido</th>
                      <th>Disponible</th>
                      <th>Costo Insumo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredientsCostDetails.map((ing) => (
                      <tr key={ing.itemId}>
                        <td>
                          <b>{ing.name}</b>
                        </td>
                        <td>
                          {ing.requiredQty} {ing.unit}
                        </td>
                        <td>
                          <span style={{ color: ing.isSufficient ? '#2d805d' : '#bd5e4e', fontWeight: 700 }}>
                            {ing.stockAvailable} {ing.unit} {ing.isSufficient ? '✓' : '✗ Insuficiente'}
                          </span>
                        </td>
                        <td>{money(ing.totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Batch Summary Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="card panel" style={{ background: 'var(--deep)', color: 'white' }}>
              <small style={{ color: '#c4d7cb', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Resultado financiero del lote
              </small>
              <h3 style={{ margin: '6px 0 12px', color: 'white', fontSize: '18px' }}>
                {currentRecipe.productName}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div style={{ background: '#ffffff12', padding: '10px', borderRadius: '10px' }}>
                  <small style={{ color: '#b2c8ba', fontSize: '10px' }}>Unidades vendibles</small>
                  <strong style={{ display: 'block', fontSize: '16px', color: 'var(--lime)', marginTop: '2px' }}>
                    {saleableUnits} unid
                  </strong>
                  <span style={{ fontSize: '10px', color: '#b2c8ba' }}>
                    Merma: {wasteUnits} unid ({wastePercentage}%)
                  </span>
                </div>

                <div style={{ background: '#ffffff12', padding: '10px', borderRadius: '10px' }}>
                  <small style={{ color: '#b2c8ba', fontSize: '10px' }}>Costo unitario lote</small>
                  <strong style={{ display: 'block', fontSize: '16px', color: 'var(--lime)', marginTop: '2px' }}>
                    {money(calculatedUnitCost)}
                  </strong>
                  <span style={{ fontSize: '10px', color: '#b2c8ba' }}>Costo por unidad vendible</span>
                </div>
              </div>

              <div style={{ fontSize: '11px', borderTop: '1px solid #ffffff20', paddingTop: '10px', display: 'grid', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Costo materias primas e insumos:</span>
                  <b>{money(totalIngredientsCost)}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Mano de obra directa y costos indirectos:</span>
                  <b>{money(totalLaborOverhead)}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--lime)', marginTop: '4px' }}>
                  <strong>Costo total de producción:</strong>
                  <strong>{money(totalBatchCost)}</strong>
                </div>
              </div>

              <button
                className="primary-btn"
                style={{
                  background: 'var(--lime)',
                  color: 'var(--deep)',
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: '16px',
                  fontWeight: 800,
                }}
                onClick={handleRegisterBatch}
              >
                Registrar y finalizar lote
              </button>
            </div>

            <div className="card panel">
              <h4 style={{ margin: '0 0 6px', fontSize: '13px' }}>Regla de inmutabilidad</h4>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)', lineHeight: '1.5' }}>
                Una vez finalizado el lote, su costo unitario queda congelado en el snapshot histórico.
                Las variaciones posteriores en precios de insumos no alteran los lotes ya producidos.
              </p>
            </div>
          </div>
        </div>

        {/* Historic Production Batches */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '14px', margin: '0 0 10px' }}>Historial de lotes producidos</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Código Lote</th>
                  <th>Producto</th>
                  <th>Fecha</th>
                  <th>Unidades Vendibles</th>
                  <th>Merma</th>
                  <th>Costo Total Lote</th>
                  <th>Costo Unitario</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <b>{b.code}</b>
                    </td>
                    <td>{b.productName}</td>
                    <td>{b.date}</td>
                    <td>
                      <strong>{b.saleableUnits} unid</strong>
                    </td>
                    <td>
                      <span style={{ color: b.wastePercentage > 2.5 ? '#b84d45' : '#347553' }}>
                        {b.wasteUnits} ({b.wastePercentage}%)
                      </span>
                    </td>
                    <td>{money(b.totalBatchCost)}</td>
                    <td>
                      <b>{money(b.unitCost)}</b>
                    </td>
                    <td>
                      <span className="status good">Finalizado</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <button className="primary-btn" onClick={() => onNavigate('dashboard')}>
            Volver al dashboard
          </button>
        </div>
      </div>
    </section>
  );
};
