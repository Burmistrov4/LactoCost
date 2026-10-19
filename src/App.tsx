import React, { useState } from 'react';
import { ViewId, Product, InventoryItem, InventoryMovement, Recipe, ProductionBatch, ExchangeRateObservation } from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_INVENTORY,
  INITIAL_MOVEMENTS,
  INITIAL_RECIPES,
  INITIAL_BATCHES,
} from './data/initialData';
import { INITIAL_EXCHANGE_RATES } from './domain/exchangeRates';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { ProductionView } from './components/ProductionView';
import { CostingView } from './components/CostingView';
import { PurchasesView } from './components/PurchasesView';
import { PricingView } from './components/PricingView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { NewOperationModal } from './components/NewOperationModal';
import { AlertsModal } from './components/AlertsModal';
import { downloadCSV } from './utils/formatters';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isNewOpOpen, setIsNewOpOpen] = useState<boolean>(false);

  // Core application state
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [movements, setMovements] = useState<InventoryMovement[]>(INITIAL_MOVEMENTS);
  const [recipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [batches, setBatches] = useState<ProductionBatch[]>(INITIAL_BATCHES);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateObservation[]>(INITIAL_EXCHANGE_RATES);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3800);
  };

  // Product margins & pricing update
  const handleUpdateProductParams = (
    productId: string,
    params: {
      cost?: number;
      margin?: number;
      variableFeeRate?: number;
      fixedVariableCost?: number;
      taxRate?: number;
    }
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          cost: params.cost ?? p.cost,
          targetMargin: params.margin ?? p.targetMargin,
          variableFeeRate: params.variableFeeRate ?? p.variableFeeRate,
          fixedVariableCost: params.fixedVariableCost ?? p.fixedVariableCost,
          taxRate: params.taxRate ?? p.taxRate,
        };
      })
    );
  };

  const handleResetMargins = () => {
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        targetMargin: p.defaultMargin,
        variableFeeRate: 0,
        fixedVariableCost: 0,
        taxRate: 0,
      }))
    );
  };

  // Inventory & operations
  const handleSaveOperation = (movement: InventoryMovement, updatedItem?: InventoryItem) => {
    setMovements((prev) => [movement, ...prev]);
    if (updatedItem) {
      setInventory((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
    }
  };

  // Production batch execution
  const handleExecuteBatch = (batchData: {
    recipeId: string;
    inputUnits: number;
    saleableUnits: number;
    wasteUnits: number;
    totalBatchCost: number;
    unitCost: number;
  }) => {
    const recipe = recipes.find((r) => r.id === batchData.recipeId);
    if (!recipe) return;

    // 1. Deduct ingredients from inventory
    setInventory((prev) =>
      prev.map((item) => {
        const recipeIng = recipe.ingredients.find((ing) => ing.itemId === item.id);
        if (!recipeIng) return item;
        const remainingStock = Math.max(0, item.currentStock - recipeIng.quantity);
        return {
          ...item,
          currentStock: remainingStock,
          status:
            remainingStock <= item.safetyStock
              ? 'bad'
              : remainingStock <= item.minStock
              ? 'warn'
              : 'good',
        };
      })
    );

    // 2. Add batch record
    const newBatch: ProductionBatch = {
      id: `batch-${Date.now()}`,
      code: `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
      recipeId: recipe.id,
      productName: recipe.productName,
      date: new Date().toISOString().slice(0, 10),
      inputUnits: batchData.inputUnits,
      saleableUnits: batchData.saleableUnits,
      wasteUnits: batchData.wasteUnits,
      wastePercentage: Math.round((batchData.wasteUnits / batchData.inputUnits) * 1000) / 10,
      totalBatchCost: batchData.totalBatchCost,
      unitCost: batchData.unitCost,
      status: 'finalized',
    };
    setBatches((prev) => [newBatch, ...prev]);

    // 3. Update finished product cost with the new batch unit cost
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === recipe.productId) {
          return { ...p, cost: batchData.unitCost };
        }
        return p;
      })
    );

    // 4. Add movement record
    const newMovement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      date: 'Hoy · Recién finalizado',
      type: 'production_output',
      reference: newBatch.code,
      itemId: recipe.productId,
      itemName: `Lote producido de ${recipe.productName}`,
      quantityDelta: batchData.saleableUnits,
      unit: 'unid',
      unitCost: batchData.unitCost,
      totalCost: batchData.totalBatchCost,
      currency: 'VES',
      status: 'good',
      statusText: 'Lote finalizado',
      actor: 'maestro_lacteo@lactocost.local',
      reason: `Producción de receta ${recipe.version}`,
    };
    setMovements((prev) => [newMovement, ...prev]);
  };

  // Exchange rates refresh
  const handleRefreshRates = async () => {
    // Simulate fresh rate sync with slight variations to demonstrate live updates
    await new Promise((resolve) => setTimeout(resolve, 600));

    setExchangeRates((prev) =>
      prev.map((rate) => ({
        ...rate,
        fetched_at: new Date().toISOString(),
        observed_at: new Date().toISOString(),
        age_seconds: 0,
        freshness_status: 'fresh',
      }))
    );
  };

  const handleGlobalExport = () => {
    const summaryCSV =
      `# LactoCost Resumen Operativo\n` +
      `Fecha de exportación: ${new Date().toISOString()}\n\n` +
      `## Inventario\n` +
      `Código,Nombre,Stock,Unidad,CPP (VES)\n` +
      inventory.map((i) => `${i.code},"${i.name}",${i.currentStock},${i.unit},${i.unitCost}`).join('\n') +
      `\n\n## Precios y Márgenes\n` +
      `Producto,Costo (VES),Margen (%),Precio Sugerido (VES)\n` +
      products
        .map((p) => {
          const price = p.cost / (1 - p.targetMargin / 100);
          return `"${p.name}",${p.cost},${p.targetMargin},${price.toFixed(2)}`;
        })
        .join('\n');

    downloadCSV(`lactocost_resumen_${new Date().toISOString().slice(0, 10)}.csv`, summaryCSV);
    notify('Resumen operativo exportado en formato CSV.');
  };

  const criticalCount = inventory.filter((i) => i.currentStock <= i.safetyStock).length;
  const warningCount = inventory.filter(
    (i) => i.currentStock > i.safetyStock && i.currentStock <= i.minStock
  ).length;

  return (
    <div className="app">
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="main">
        <Topbar
          currentView={currentView}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          onOpenQuickOperation={() => setIsNewOpOpen(true)}
          onExport={handleGlobalExport}
          unreadAlertsCount={criticalCount + warningCount}
        />

        <div className="demo-banner">
          <span>⚑</span>
          <div>
            <b>Modo operativo activo.</b> Motor de cálculo financiero determinista con precisión de micro-unidades.
            Los datos cargados son representativos para pruebas del taller lácteo.
          </div>
          <span>LACTOCOST</span>
        </div>

        {currentView === 'dashboard' && (
          <DashboardView
            products={products}
            inventory={inventory}
            movements={movements}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'inventory' && (
          <InventoryView
            inventory={inventory}
            onOpenNewOperation={() => setIsNewOpOpen(true)}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'production' && (
          <ProductionView
            recipes={recipes}
            batches={batches}
            inventory={inventory}
            onExecuteBatch={handleExecuteBatch}
            onNavigate={setCurrentView}
            onNotify={notify}
          />
        )}

        {currentView === 'costs' && (
          <CostingView
            inventory={inventory}
            onNavigate={setCurrentView}
            onNotify={notify}
          />
        )}

        {currentView === 'purchases' && (
          <PurchasesView
            inventory={inventory}
            onNavigate={setCurrentView}
            onOpenNewOperation={() => setIsNewOpOpen(true)}
            onNotify={notify}
          />
        )}

        {currentView === 'pricing' && (
          <PricingView
            products={products}
            onUpdateMargin={(id, m) => handleUpdateProductParams(id, { margin: m })}
            onUpdateProductParams={handleUpdateProductParams}
            onResetMargins={handleResetMargins}
            onNavigate={setCurrentView}
            onNotify={notify}
          />
        )}

        {currentView === 'reports' && (
          <ReportsView
            movements={movements}
            inventory={inventory}
            products={products}
            onNavigate={setCurrentView}
            onNotify={notify}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            exchangeRates={exchangeRates}
            onRefreshRates={handleRefreshRates}
            onNavigate={setCurrentView}
            onNotify={notify}
          />
        )}

        <div className="bottom-note">
          <span>
            LactoCost · Panel operativo · <b>Versión 1.0 React</b>
          </span>
          <span>Diseñado para móvil y escritorio · Cálculos matemáticos auditables</span>
        </div>
      </main>

      {/* Modals */}
      <NewOperationModal
        isOpen={isNewOpOpen}
        onClose={() => setIsNewOpOpen(false)}
        inventory={inventory}
        onSaveOperation={handleSaveOperation}
        onNotify={notify}
      />

      <AlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        inventory={inventory}
        onNavigate={setCurrentView}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast show" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
