import React, { useState } from 'react';
import { Recipe, ProductionBatch, InventoryItem, Product, ViewId, DisplayCurrencyMode } from '../types';
import { moneyUSD, moneyVES } from '../utils/formatters';
import { batchUnitCost } from '../domain/costing';

interface ProductionViewProps {
  recipes: Recipe[];
  batches: ProductionBatch[];
  inventory: InventoryItem[];
  products: Product[];
  activeRate: number;
  activeRateName: string;
  currencyMode: DisplayCurrencyMode;
  onSaveRecipe: (recipe: Recipe) => void;
  onDeleteRecipe?: (recipeId: string) => void;
  onExecuteBatch: (batch: {
    recipeId: string;
    inputUnits: number;
    saleableUnits: number;
    wasteUnits: number;
    totalBatchCostUSD: number;
    unitCostUSD: number;
  }) => void;
  onDeleteBatch?: (batchId: string) => void;
  onNavigate: (view: ViewId) => void;
  onNotify: (msg: string) => void;
}

export const ProductionView: React.FC<ProductionViewProps> = ({
  recipes,
  batches,
  inventory,
  products,
  activeRate,
  activeRateName,
  onSaveRecipe,
  onDeleteRecipe,
  onExecuteBatch,
  onDeleteBatch,
  onNavigate,
  onNotify,
}) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || '');
  const [batchMultiplier, setBatchMultiplier] = useState<number>(1);
  const [wastePercentage, setWastePercentage] = useState<number>(2.0);

  // Recipe Modal CRUD state
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState<boolean>(false);
  const [recipeName, setRecipeName] = useState<string>('');
  const [recipeProductId, setRecipeProductId] = useState<string>(products[0]?.id || '');
  const [recipeVersion, setRecipeVersion] = useState<string>('v1.0 (Aprobada)');
  const [recipeBatchSize, setRecipeBatchSize] = useState<number>(20);
  const [recipeUnit, setRecipeUnit] = useState<string>('L');
  const [recipeYieldUnits, setRecipeYieldUnits] = useState<number>(98);
  const [recipeLaborUSD, setRecipeLaborUSD] = useState<number>(15.0);
  const [recipeNotes, setRecipeNotes] = useState<string>('');

  const selectedIngredients = [
    { itemId: inventory[0]?.id || 'ing-leche', quantity: recipeBatchSize, unit: recipeUnit },
    { itemId: 'ing-cultivo', quantity: 1, unit: 'sob' },
    { itemId: 'ing-envase-200', quantity: recipeYieldUnits, unit: 'unid' },
  ];

  const currentRecipe = recipes.find((r) => r.id === selectedRecipeId) || recipes[0] || null;

  // Calculate ingredients consumption & cost for this simulated batch
  const ingredientsCostDetails = currentRecipe
    ? currentRecipe.ingredients.map((ing) => {
        const invItem = inventory.find((i) => i.id === ing.itemId);
        const requiredQty = ing.quantity * batchMultiplier;
        const unitCostUSD = invItem ? invItem.unitCostUSD : 0;
        const totalCostUSD = requiredQty * unitCostUSD;
        const stockAvailable = invItem ? invItem.currentStock : 0;
        const isSufficient = stockAvailable >= requiredQty;

        return {
          itemId: ing.itemId,
          name: invItem ? invItem.name : ing.itemId,
          unit: ing.unit,
          requiredQty,
          stockAvailable,
          isSufficient,
          unitCostUSD,
          totalCostUSD,
        };
      })
    : [];

  const totalIngredientsCostUSD = ingredientsCostDetails.reduce((sum, item) => sum + item.totalCostUSD, 0);
  const totalLaborOverheadUSD = currentRecipe ? currentRecipe.laborAndOverheadPerBatchUSD * batchMultiplier : 0;
  const totalBatchCostUSD = totalIngredientsCostUSD + totalLaborOverheadUSD;

  const expectedRawYield = currentRecipe ? currentRecipe.yieldExpectedUnits * batchMultiplier : 0;
  const wasteUnits = Math.round((expectedRawYield * wastePercentage) / 100);
  const saleableUnits = Math.max(1, expectedRawYield - wasteUnits);

  let calculatedUnitCostUSD = 0;
  try {
    calculatedUnitCostUSD = batchUnitCost(totalBatchCostUSD, saleableUnits);
  } catch {
    calculatedUnitCostUSD = 0;
  }

  const allIngredientsAvailable = ingredientsCostDetails.length > 0 && ingredientsCostDetails.every((i) => i.isSufficient);

  const handleRegisterBatch = () => {
    if (!currentRecipe) {
      onNotify('Primero crea o selecciona una receta para elaborar el lote.');
      return;
    }
    if (!allIngredientsAvailable) {
      onNotify('Advertencia: Algunos insumos no cuentan con stock suficiente en almacén.');
      return;
    }

    onExecuteBatch({
      recipeId: currentRecipe.id,
      inputUnits: expectedRawYield,
      saleableUnits,
      wasteUnits,
      totalBatchCostUSD,
      unitCostUSD: calculatedUnitCostUSD,
    });

    onNotify(
      `¡Lote de ${currentRecipe.productName} registrado! ${saleableUnits} unidades con costo de ${moneyUSD(calculatedUnitCostUSD)} (${moneyVES(calculatedUnitCostUSD * activeRate)}) c/u.`
    );
  };

  const handleSaveNewRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim()) {
      onNotify('Escribe el nombre de la receta.');
      return;
    }

    const newRecipe: Recipe = {
      id: `rec-${Date.now()}`,
      productId: recipeProductId,
      productName: recipeName.trim(),
      version: recipeVersion.trim(),
      batchSizeExpected: recipeBatchSize,
      unit: recipeUnit,
      yieldExpectedUnits: recipeYieldUnits,
      laborAndOverheadPerBatchUSD: recipeLaborUSD,
      preparationNotes: recipeNotes.trim(),
      ingredients: selectedIngredients,
    };

    onSaveRecipe(newRecipe);
    setIsRecipeModalOpen(false);
    onNotify(`¡Receta "${newRecipe.productName}" guardada con éxito!`);
    setSelectedRecipeId(newRecipe.id);
  };

  return (
    <section className="view-state active" id="view-production">
      <div className="card panel">
        <div className="panel-title">
          <div>
            <h2 style={{ margin: 0, fontSize: '19px' }}>Control de Producción y Recetas (CRUD)</h2>
            <p>
              Costeo por lote en <b>Dólares ($ USD)</b> y <b>Bolívares</b> ({activeRateName}: {moneyVES(activeRate)}). Imputa insumos a CPP, mano de obra, mermas y determina el costo exacto por envase.
            </p>
          </div>
          <button className="primary-btn" onClick={() => setIsRecipeModalOpen(true)}>
            <span>＋</span> <span>Nueva Receta</span>
          </button>
        </div>

        {/* Motivational Recipe Note */}
        <div className="pricing-intro" style={{ background: '#f5faf4', borderColor: '#d0ebd5' }}>
          <div className="insight-icon" style={{ background: '#d6fb72', color: 'var(--deep)' }}>
            🧪
          </div>
          <div>
            <strong>Estandarización para la emprendedora</strong>
            <p>
              Tener recetas exactas garantiza que cada lote de yogurt tenga la misma cremosidad y que cada quesillo
              tenga el mismo punto de caramelo. Y lo más importante: ¡sabes exactamente cuánto dinero cuesta producir cada unidad!
            </p>
          </div>
        </div>

        {/* Recipe Selection & Batch Simulator */}
        <div className="responsive-split-grid">
          <div style={{ background: '#fbfdfa', border: '1px solid var(--line)', borderRadius: '14px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Simulador de Elaboración por Lote</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div>
                <label className="field-label" style={{ marginTop: 0 }}>
                  Receta del Taller
                </label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <select
                    className="rate-select"
                    value={selectedRecipeId}
                    onChange={(e) => setSelectedRecipeId(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.productName} ({r.version})
                      </option>
                    ))}
                  </select>
                  {onDeleteRecipe && recipes.length > 1 && currentRecipe && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar la receta "${currentRecipe.productName}"?`)) {
                          onDeleteRecipe(currentRecipe.id);
                        }
                      }}
                      style={{
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                      title="Eliminar esta receta"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="field-label" style={{ marginTop: 0 }}>
                  Escala de producción
                </label>
                <select
                  className="rate-select"
                  value={batchMultiplier}
                  onChange={(e) => setBatchMultiplier(parseFloat(e.target.value))}
                >
                  <option value={0.5}>0,5x (Medio lote · {((currentRecipe?.batchSizeExpected || 20) * 0.5)} {currentRecipe?.unit || 'L'})</option>
                  <option value={1}>1,0x (Lote estándar · {currentRecipe?.batchSizeExpected || 20} {currentRecipe?.unit || 'L'})</option>
                  <option value={2}>2,0x (Doble lote · {((currentRecipe?.batchSizeExpected || 20) * 2)} {currentRecipe?.unit || 'L'})</option>
                  <option value={3}>3,0x (Triple lote · {((currentRecipe?.batchSizeExpected || 20) * 3)} {currentRecipe?.unit || 'L'})</option>
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
                  step="0.5"
                  min="0"
                  max="25"
                  className="margin-input"
                  value={wastePercentage}
                  onChange={(e) => setWastePercentage(parseFloat(e.target.value) || 0)}
                />
                <span>%</span>
              </div>
            </div>

            {currentRecipe?.preparationNotes && (
              <div style={{ background: '#fff9ea', border: '1px solid #fae3b2', borderRadius: '8px', padding: '10px', marginTop: '12px', fontSize: '11px', color: '#7a5a15' }}>
                📝 <b>Nota del maestro lácteo:</b> {currentRecipe.preparationNotes}
              </div>
            )}

            <div style={{ marginTop: '14px' }}>
              <strong style={{ fontSize: '12px', color: '#44554b' }}>
                Insumos requeridos para este lote vs. stock en almacén:
              </strong>
              <div className="table-wrap" style={{ marginTop: '6px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Insumo</th>
                      <th>Requerido</th>
                      <th>Disponible</th>
                      <th>Costo ($ / Bs)</th>
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
                            {ing.stockAvailable} {ing.unit} {ing.isSufficient ? '✓' : '✗ Falta stock'}
                          </span>
                        </td>
                        <td>
                          <div>
                            <strong>{moneyUSD(ing.totalCostUSD)}</strong>
                            <small style={{ display: 'block', color: 'var(--muted)' }}>
                              {moneyVES(ing.totalCostUSD * activeRate)}
                            </small>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Batch Financial Result Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="card panel" style={{ background: 'var(--deep)', color: 'white' }}>
              <small style={{ color: '#c4d7cb', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Resultado Financiero del Lote
              </small>
              <h3 style={{ margin: '6px 0 12px', color: 'white', fontSize: '18px' }}>
                {currentRecipe ? currentRecipe.productName : 'Selecciona o crea una receta'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '10px', marginBottom: '14px' }}>
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
                  <small style={{ color: '#b2c8ba', fontSize: '10px' }}>Costo por unidad</small>
                  <strong style={{ display: 'block', fontSize: '16px', color: 'var(--lime)', marginTop: '2px' }}>
                    {moneyUSD(calculatedUnitCostUSD)}
                  </strong>
                  <span style={{ fontSize: '10px', color: '#b2c8ba' }}>
                    {moneyVES(calculatedUnitCostUSD * activeRate)}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '11px', borderTop: '1px solid #ffffff20', paddingTop: '10px', display: 'grid', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Costo materias primas e insumos:</span>
                  <b>{moneyUSD(totalIngredientsCostUSD)}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Gas, energía y mano de obra:</span>
                  <b>{moneyUSD(totalLaborOverheadUSD)}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--lime)', marginTop: '4px' }}>
                  <strong>Costo total del lote:</strong>
                  <strong>{moneyUSD(totalBatchCostUSD)} ({moneyVES(totalBatchCostUSD * activeRate)})</strong>
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
                Registrar y Finalizar Lote
              </button>
            </div>
          </div>
        </div>

        {/* Modal New Recipe */}
        {isRecipeModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsRecipeModalOpen(false)} role="dialog" aria-modal="true">
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Crear Nueva Receta</h2>
                  <p>Estandariza los ingredientes y rendimientos de tu producto.</p>
                </div>
                <button className="modal-close" onClick={() => setIsRecipeModalOpen(false)}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveNewRecipe} className="form-grid">
                <div className="form-row">
                  <div className="form-field">
                    <label>Nombre de la receta *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Yogurt Griego Vainilla 200g"
                      value={recipeName}
                      onChange={(e) => setRecipeName(e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label>Producto vinculado *</label>
                    <select
                      value={recipeProductId}
                      onChange={(e) => setRecipeProductId(e.target.value)}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.emoji} {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Versión de la receta</label>
                    <input
                      type="text"
                      value={recipeVersion}
                      onChange={(e) => setRecipeVersion(e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label>Unidad base</label>
                    <select
                      value={recipeUnit}
                      onChange={(e) => setRecipeUnit(e.target.value)}
                    >
                      <option value="L">Litros (L)</option>
                      <option value="kg">Kilogramos (kg)</option>
                      <option value="porc">Porciones</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Tamaño base del lote</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={recipeBatchSize}
                      onChange={(e) => setRecipeBatchSize(parseFloat(e.target.value) || 1)}
                    />
                  </div>

                  <div className="form-field">
                    <label>Rendimiento esperado (unidades vendibles)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={recipeYieldUnits}
                      onChange={(e) => setRecipeYieldUnits(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Gas, energía y mano de obra por lote ($ USD)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={recipeLaborUSD}
                    onChange={(e) => setRecipeLaborUSD(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="form-field">
                  <label>Instrucciones de preparación (pH, temperatura, fermentación)</label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Inocular a 43°C y dejar 8 horas."
                    value={recipeNotes}
                    onChange={(e) => setRecipeNotes(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="ghost-btn" onClick={() => setIsRecipeModalOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="primary-btn">
                    Guardar Receta Aprobada
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Batches History */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '14px', margin: '0 0 10px' }}>Historial de Lotes Producidos</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Código Lote</th>
                  <th>Producto</th>
                  <th>Fecha</th>
                  <th>Unidades Vendibles</th>
                  <th>Merma</th>
                  <th>Costo Lote ($)</th>
                  <th>Costo Unitario ($)</th>
                  <th>Costo en Bs</th>
                  <th>Estado</th>
                  <th>Acción</th>
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
                    <td>{moneyUSD(b.totalBatchCostUSD)}</td>
                    <td>
                      <b>{moneyUSD(b.unitCostUSD)}</b>
                    </td>
                    <td>
                      <b>{moneyVES(b.unitCostUSD * activeRate)}</b>
                    </td>
                    <td>
                      <span className="status good">Finalizado</span>
                    </td>
                    <td>
                      {onDeleteBatch && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`¿Eliminar el lote ${b.code} (${b.productName})?`)) {
                              onDeleteBatch(b.id);
                            }
                          }}
                          style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          title="Eliminar registro de lote"
                        >
                          🗑️
                        </button>
                      )}
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
