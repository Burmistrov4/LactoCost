import React, { useState, useEffect } from 'react';
import {
  ViewId,
  Product,
  InventoryItem,
  InventoryMovement,
  Recipe,
  ProductionBatch,
  Sale,
  ScrapedRates,
  RateReferenceType,
  DisplayCurrencyMode,
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_INVENTORY,
  INITIAL_MOVEMENTS,
  INITIAL_RECIPES,
  INITIAL_BATCHES,
  INITIAL_SALES,
  SAMPLE_SALES,
  CLEAN_INVENTORY_STARTER,
} from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './components/DashboardView';
import { ProductsCRUDView } from './components/ProductsCRUDView';
import { InventoryView } from './components/InventoryView';
import { ProductionView } from './components/ProductionView';
import { CostingView } from './components/CostingView';
import { PurchasesView } from './components/PurchasesView';
import { PricingView } from './components/PricingView';
import { SalesView } from './components/SalesView';
import { GrowthView } from './components/GrowthView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { NewOperationModal } from './components/NewOperationModal';
import { AlertsModal } from './components/AlertsModal';
import { BottomNav } from './components/BottomNav';
import { InteractiveWalkthrough } from './components/InteractiveWalkthrough';
import { WhatsAppOrderModal } from './components/WhatsAppOrderModal';
import { LabelGeneratorModal } from './components/LabelGeneratorModal';
import { MilkYieldModal } from './components/MilkYieldModal';
import { PackagingGuideModal } from './components/PackagingGuideModal';
import { CashRegisterModal } from './components/CashRegisterModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { AuthModal } from './components/AuthModal';
import { ColorPaletteId, UserProfile, WorkshopProfile } from './types';
import { getSavedTheme, applyTheme } from './utils/theme';
import { getStoredUsers, saveUsers, getInitialAuth, saveAuthSession, canAccessView } from './utils/auth';
import { getStoredWorkshopProfile, saveWorkshopProfile } from './utils/workshop';
import { downloadCSV, moneyVES } from './utils/formatters';

const DEFAULT_RATES: ScrapedRates = {
  bcvEur: 991.16,
  bcvUsd: 881.07,
  bcvDate: '2026-10-19',
  binanceP2PBuy: 980.54,
  binanceP2PSell: 990.20,
  binanceP2PAvg: 985.37,
  p2pOffersCount: 10,
  fetchedAt: new Date().toISOString(),
  isLive: true,
};

// LocalStorage safe loader
const loadSavedState = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn(`Could not load key ${key} from localStorage:`, err);
  }
  return fallback;
};

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isNewOpOpen, setIsNewOpOpen] = useState<boolean>(false);

  // New Modals
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);
  const [isWhatsAppOrderOpen, setIsWhatsAppOrderOpen] = useState<boolean>(false);
  const [isLabelGeneratorOpen, setIsLabelGeneratorOpen] = useState<boolean>(false);
  const [isMilkYieldOpen, setIsMilkYieldOpen] = useState<boolean>(false);
  const [isPackagingGuideOpen, setIsPackagingGuideOpen] = useState<boolean>(false);
  const [isCashRegisterOpen, setIsCashRegisterOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'switch'>('login');

  // Workshop Profile State (Dynamic Branding)
  const [workshopProfile, setWorkshopProfile] = useState<WorkshopProfile>(getStoredWorkshopProfile);

  useEffect(() => {
    if (workshopProfile?.name) {
      document.title = `${workshopProfile.name} · Taller Artesanal`;
    }
  }, [workshopProfile?.name]);

  const handleUpdateWorkshopProfile = (updated: WorkshopProfile) => {
    setWorkshopProfile(updated);
    saveWorkshopProfile(updated);
  };

  // User profiles & Auth state
  const [users, setUsers] = useState<UserProfile[]>(getStoredUsers);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getInitialAuth().currentUser);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    saveAuthSession(user, true);
    if (!canAccessView(user.role, currentView)) {
      setCurrentView('dashboard');
    }
  };

  const handleRegister = (newUser: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const created: UserProfile = {
      ...newUser,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...users, created];
    setUsers(updated);
    saveUsers(updated);
    setCurrentUser(created);
    saveAuthSession(created, true);
  };

  const handleDeleteUser = (userId: string) => {
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    saveUsers(updated);
    if (currentUser?.id === userId) {
      const nextUser = updated[0] || null;
      setCurrentUser(nextUser);
      saveAuthSession(nextUser, !!nextUser);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveAuthSession(null, false);
    notify('👋 Has cerrado sesión.');
  };

  const handleOpenAuthModal = (mode: 'login' | 'register' | 'switch' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Theme state & persistence
  const [currentPalette, setCurrentPalette] = useState<ColorPaletteId>(getSavedTheme);

  const handleSelectPalette = (palette: ColorPaletteId) => {
    setCurrentPalette(palette);
    applyTheme(palette);
    notify(`🎨 Paleta visual cambiada a "${palette}"`);
  };

  useEffect(() => {
    applyTheme(currentPalette);
  }, [currentPalette]);

  // Currency & Rate states
  const [scrapedRates, setScrapedRates] = useState<ScrapedRates>(DEFAULT_RATES);
  const [activeRateType, setActiveRateType] = useState<RateReferenceType>('bcv_eur');
  const [currencyMode, setCurrencyMode] = useState<DisplayCurrencyMode>('BOTH');
  const [isRefreshingRates, setIsRefreshingRates] = useState<boolean>(false);

  // Core application data states with LocalStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = loadSavedState('lactocost_products_v3', INITIAL_PRODUCTS);
    const missing = INITIAL_PRODUCTS.filter((initP) => !saved.some((p) => p.id === initP.id));
    const merged = missing.length > 0 ? [...saved, ...missing] : saved;
    return merged.map((p) => {
      // Ensure default artisan prices reflect current market: Yogurt $2.00, Quesillo $2.00, Torta de Pan $2.50
      if (p.id === 'yogurt-natural') return { ...p, costUSD: 0.95, defaultMargin: 50, fixedVariableCostUSD: 0.05 };
      if (p.id === 'yogurt-fresa') return { ...p, costUSD: 1.05, defaultMargin: 45, fixedVariableCostUSD: 0.05 };
      if (p.id === 'quesillo') return { ...p, costUSD: 1.25, defaultMargin: 35, fixedVariableCostUSD: 0.05 };
      if (p.id === 'torta-de-pan') return { ...p, costUSD: 1.20, defaultMargin: 50, fixedVariableCostUSD: 0.05 };
      return p;
    });
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = loadSavedState('lactocost_inventory_v3', INITIAL_INVENTORY);
    const missing = INITIAL_INVENTORY.filter((initI) => !saved.some((i) => i.id === initI.id));
    return missing.length > 0 ? [...saved, ...missing] : saved;
  });
  const [movements, setMovements] = useState<InventoryMovement[]>(() =>
    loadSavedState('lactocost_movements_v3', INITIAL_MOVEMENTS)
  );
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = loadSavedState('lactocost_recipes_v3', INITIAL_RECIPES);
    const missing = INITIAL_RECIPES.filter((initR) => !saved.some((r) => r.id === initR.id));
    return missing.length > 0 ? [...saved, ...missing] : saved;
  });
  const [batches, setBatches] = useState<ProductionBatch[]>(() =>
    loadSavedState('lactocost_batches_v3', INITIAL_BATCHES)
  );
  const [sales, setSales] = useState<Sale[]>(() =>
    loadSavedState('lactocost_sales_v3', INITIAL_SALES)
  );

  // Auto-save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('lactocost_products_v3', JSON.stringify(products));
    } catch (e) {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('lactocost_inventory_v3', JSON.stringify(inventory));
    } catch (e) {}
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('lactocost_movements_v3', JSON.stringify(movements));
    } catch (e) {}
  }, [movements]);

  useEffect(() => {
    try {
      localStorage.setItem('lactocost_recipes_v3', JSON.stringify(recipes));
    } catch (e) {}
  }, [recipes]);

  useEffect(() => {
    try {
      localStorage.setItem('lactocost_batches_v3', JSON.stringify(batches));
    } catch (e) {}
  }, [batches]);

  useEffect(() => {
    try {
      localStorage.setItem('lactocost_sales_v3', JSON.stringify(sales));
    } catch (e) {}
  }, [sales]);

  // Open walkthrough on first ever visit
  useEffect(() => {
    try {
      const tourCompleted = localStorage.getItem('lactocost_walkthrough_completed');
      if (!tourCompleted) {
        setIsWalkthroughOpen(true);
      }
    } catch (e) {}
  }, []);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3800);
  };

  // Active exchange rate number & display name
  const activeRate =
    activeRateType === 'bcv_usd'
      ? scrapedRates.bcvUsd
      : activeRateType === 'bcv_eur'
      ? scrapedRates.bcvEur
      : activeRateType === 'binance_p2p'
      ? scrapedRates.binanceP2PAvg
      : scrapedRates.manualRate || scrapedRates.bcvUsd;

  const activeRateName =
    activeRateType === 'bcv_usd'
      ? 'Oficial BCV'
      : activeRateType === 'bcv_eur'
      ? 'Tasa Euro'
      : activeRateType === 'binance_p2p'
      ? 'Binance P2P'
      : 'Tasa Manual';

  // Fetch exchange rates from backend /api/exchange-rates
  const fetchLiveRates = async () => {
    setIsRefreshingRates(true);
    try {
      const res = await fetch('/api/exchange-rates');
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok') {
          setScrapedRates({
            bcvEur: Number(data.bcvEur) || DEFAULT_RATES.bcvEur,
            bcvUsd: Number(data.bcvUsd) || DEFAULT_RATES.bcvUsd,
            bcvDate: data.bcvDate || DEFAULT_RATES.bcvDate,
            binanceP2PBuy: Number(data.binanceP2PBuy) || DEFAULT_RATES.binanceP2PBuy,
            binanceP2PSell: Number(data.binanceP2PSell) || DEFAULT_RATES.binanceP2PSell,
            binanceP2PAvg: Number(data.binanceP2PAvg) || DEFAULT_RATES.binanceP2PAvg,
            p2pOffersCount: data.p2pOffersCount || 10,
            fetchedAt: data.fetchedAt || new Date().toISOString(),
            isLive: true,
          });
        }
      }
    } catch (err: any) {
      console.warn('Could not fetch rates from server, using local fallback:', err.message);
    } finally {
      setIsRefreshingRates(false);
    }
  };

  useEffect(() => {
    fetchLiveRates();
  }, []);

  // Reset to clean state (0 sales)
  const handleResetToClean = () => {
    setSales([]);
    setInventory(CLEAN_INVENTORY_STARTER);
    setBatches([]);
    setMovements([]);
    notify('🧹 Sistema reiniciado a modo limpio (0 ventas registradas). ¡Listo para tus datos!');
  };

  // Load sample template (Yogurt and Quesillo)
  const handleLoadSampleData = () => {
    setSales(SAMPLE_SALES);
    setInventory(INITIAL_INVENTORY);
    setProducts(INITIAL_PRODUCTS);
    setBatches(INITIAL_BATCHES);
    setMovements(INITIAL_MOVEMENTS);
    notify('🥛 Plantilla de demostración (Yogurt y Quesillo) cargada.');
  };

  // Update packaging cost from Packaging Guide
  const handleUpdatePackagingCost = (newCostUSD: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.category === 'empaque' && item.id.includes('envase')
          ? { ...item, unitCostUSD: newCostUSD, supplier: 'Distribuidoras de Plásticos La Candelaria (Ref. Bulto 500u)' }
          : item
      )
    );
    notify(`✅ Costo de envase actualizado a $${newCostUSD.toFixed(2)} en tu inventario.`);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backup = {
      app: 'LactoCost',
      version: '1.2',
      exportedAt: new Date().toISOString(),
      products,
      inventory,
      recipes,
      batches,
      sales,
      movements,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lactocost-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('💾 Respaldo JSON descargado con éxito.');
  };

  // CRUD Products Handlers
  const handleSaveProduct = (product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [...prev, product];
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleUpdateProductParams = (
    productId: string,
    params: {
      costUSD?: number;
      margin?: number;
      variableFeeRate?: number;
      fixedVariableCostUSD?: number;
      taxRate?: number;
    }
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          costUSD: params.costUSD ?? p.costUSD,
          targetMargin: params.margin ?? p.targetMargin,
          variableFeeRate: params.variableFeeRate ?? p.variableFeeRate,
          fixedVariableCostUSD: params.fixedVariableCostUSD ?? p.fixedVariableCostUSD,
          taxRate: params.taxRate ?? p.taxRate,
        };
      })
    );
  };

  const handleResetMargins = () => {
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        targetMargin: p.defaultMargin || 35,
      }))
    );
  };

  // CRUD Inventory Handlers
  const handleSaveItem = (item: InventoryItem) => {
    setInventory((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => (i.id === item.id ? item : i));
      }
      return [...prev, item];
    });
  };

  const handleDeleteItem = (itemId: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Production Recipe & Batch Handlers
  const handleSaveRecipe = (recipe: Recipe) => {
    setRecipes((prev) => {
      const exists = prev.some((r) => r.id === recipe.id);
      if (exists) {
        return prev.map((r) => (r.id === recipe.id ? recipe : r));
      }
      return [...prev, recipe];
    });
  };

  const handleExecuteBatch = (batchData: {
    recipeId: string;
    inputUnits: number;
    saleableUnits: number;
    wasteUnits: number;
    totalBatchCostUSD: number;
    unitCostUSD: number;
  }) => {
    const targetRecipe = recipes.find((r) => r.id === batchData.recipeId);
    const code = `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${batches.length + 1}`;
    const newBatch: ProductionBatch = {
      id: `batch-${Date.now()}`,
      code,
      recipeId: batchData.recipeId,
      productName: targetRecipe ? targetRecipe.productName : 'Lote de Producción',
      date: new Date().toISOString().slice(0, 10),
      inputUnits: batchData.inputUnits,
      saleableUnits: batchData.saleableUnits,
      wasteUnits: batchData.wasteUnits,
      wastePercentage:
        batchData.inputUnits > 0 ? (batchData.wasteUnits / batchData.inputUnits) * 100 : 0,
      totalBatchCostUSD: batchData.totalBatchCostUSD,
      unitCostUSD: batchData.unitCostUSD,
      status: 'finalized',
    };
    setBatches((prev) => [newBatch, ...prev]);

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      date: 'Hoy · Justo ahora',
      type: 'production_output',
      reference: code,
      itemId: batchData.recipeId,
      itemName: `Lote ${newBatch.productName} (${newBatch.saleableUnits} unid)`,
      quantityDelta: newBatch.saleableUnits,
      unit: 'unid',
      unitCostUSD: newBatch.unitCostUSD,
      totalCostUSD: newBatch.totalBatchCostUSD,
      exchangeRateUsed: activeRate,
      totalCostVES: newBatch.totalBatchCostUSD * activeRate,
      status: 'good',
      statusText: 'Finalizado',
      actor: 'emprendedora@lactocost.local',
      reason: `Ejecución de lote ${code}`,
    };
    setMovements((prev) => [movement, ...prev]);
  };

  // Sales Handlers
  const handleAddSale = (sale: Sale) => {
    setSales((prev) => [sale, ...prev]);

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      date: 'Hoy · Justo ahora',
      type: 'receipt',
      reference: `VENTA-${sale.id.slice(-6).toUpperCase()}`,
      itemId: sale.items[0]?.productId || 'venta-directa',
      itemName: `Venta a ${sale.clientName} (${sale.items.length} productos)`,
      quantityDelta: sale.items.reduce((sum, i) => sum + i.quantity, 0),
      unit: 'unid',
      unitCostUSD: sale.totalUSD,
      totalCostUSD: sale.totalUSD,
      exchangeRateUsed: sale.rateApplied,
      totalCostVES: sale.totalVES,
      status: 'good',
      statusText: 'Cobrada',
      actor: 'emprendedora@lactocost.local',
      reason: `Despacho comercial · ${sale.paymentMethod}`,
    };
    setMovements((prev) => [movement, ...prev]);
  };

  // Delete Batch Handler
  const handleDeleteBatch = (batchId: string) => {
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
    notify('🗑️ Lote de producción eliminado.');
  };

  // Delete Recipe Handler
  const handleDeleteRecipe = (recipeId: string) => {
    if (recipes.length <= 1) {
      notify('Debes mantener al menos una receta en el taller.');
      return;
    }
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    notify('🗑️ Receta eliminada.');
  };

  // Delete Sale Handler
  const handleDeleteSale = (saleId: string) => {
    setSales((prev) => prev.filter((s) => s.id !== saleId));
    notify('🗑️ Registro de venta eliminado.');
  };

  // New Operation Modal (Receiving, Waste, Adjustment)
  const handleSaveOperation = (movement: InventoryMovement, updatedItem?: InventoryItem) => {
    setMovements((prev) => [movement, ...prev]);
    if (updatedItem) {
      setInventory((prev) =>
        prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
      );
    }
  };

  // Restore backup
  const handleImportBackup = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.products)) setProducts(data.products);
      if (Array.isArray(data.inventory)) setInventory(data.inventory);
      if (Array.isArray(data.sales)) setSales(data.sales);
      if (Array.isArray(data.movements)) setMovements(data.movements);
      if (Array.isArray(data.recipes)) setRecipes(data.recipes);
      if (Array.isArray(data.batches)) setBatches(data.batches);
      notify('¡Respaldo importado y restaurado exitosamente!');
    } catch (e) {
      notify('El archivo de respaldo no tiene un formato válido.');
    }
  };

  // Global CSV Export
  const handleExportData = () => {
    const header = 'Fecha,Tipo,Referencia,Insumo_o_Lote,Cantidad,Unidad,Costo_USD,Tasa_Cambio,Costo_VES,Estado,Motivo\n';
    const rows = movements
      .map((m) =>
        `"${m.date}","${m.type}","${m.reference}","${m.itemName}",${m.quantityDelta},"${m.unit}",${m.totalCostUSD},${m.exchangeRateUsed},${m.totalCostVES},"${m.statusText}","${m.reason}"`
      )
      .join('\n');
    downloadCSV(`lactocost-movimientos-${new Date().toISOString().slice(0, 10)}.csv`, header + rows);
    notify('Reporte CSV de movimientos descargado exitosamente.');
  };

  const criticalCount = inventory.filter((i) => i.status === 'bad').length;
  const warningCount = inventory.filter((i) => i.status === 'warn').length;

  return (
    <div className="app">
      {/* Sidebar Navigation Drawer with mobile backdrop overlay */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        workshopProfile={workshopProfile}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
        onOpenThemeSelector={() => setIsThemeModalOpen(true)}
        onOpenCashRegister={() => setIsCashRegisterOpen(true)}
        onOpenPackagingGuide={() => setIsPackagingGuideOpen(true)}
        onOpenMilkYield={() => setIsMilkYieldOpen(true)}
      />

      <main className="main" id="mainContent">
        {/* Top Header Bar */}
        <Topbar
          currentView={currentView}
          rates={scrapedRates}
          activeRateType={activeRateType}
          onChangeRateType={setActiveRateType}
          currencyMode={currencyMode}
          onChangeCurrencyMode={setCurrencyMode}
          onRefreshRates={fetchLiveRates}
          isRefreshingRates={isRefreshingRates}
          workshopProfile={workshopProfile}
          currentUser={currentUser}
          onOpenAuthModal={handleOpenAuthModal}
          onLogout={handleLogout}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          onOpenQuickOperation={() => setIsNewOpOpen(true)}
          onOpenCashRegister={() => setIsCashRegisterOpen(true)}
          onOpenThemeSelector={() => setIsThemeModalOpen(true)}
          onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
          onExport={handleExportData}
          unreadAlertsCount={criticalCount + warningCount}
        />

        {/* Dynamic Views */}
        {currentView === 'dashboard' && (
          <DashboardView
            products={products}
            inventory={inventory}
            movements={movements}
            sales={sales}
            activeRate={activeRate}
            activeRateName={activeRateName}
            currencyMode={currencyMode}
            workshopProfile={workshopProfile}
            currentUser={currentUser}
            onOpenAuthModal={handleOpenAuthModal}
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            onStartWalkthrough={() => setIsWalkthroughOpen(true)}
            onOpenWhatsAppOrder={() => setIsWhatsAppOrderOpen(true)}
            onOpenLabelGenerator={() => setIsLabelGeneratorOpen(true)}
            onOpenMilkYield={() => setIsMilkYieldOpen(true)}
            onOpenPackagingGuide={() => setIsPackagingGuideOpen(true)}
            onResetToClean={handleResetToClean}
            onLoadSampleData={handleLoadSampleData}
          />
        )}

        {currentView === 'products' && (
          <ProductsCRUDView
            products={products}
            activeRate={activeRate}
            activeRateName={activeRateName}
            currencyMode={currencyMode}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onNavigate={setCurrentView}
            onNotify={notify}
          />
        )}

        {currentView === 'pricing' && (
          <PricingView
            products={products}
            rates={scrapedRates}
            activeRate={activeRate}
            activeRateName={activeRateName}
            currencyMode={currencyMode}
            onUpdateProductParams={handleUpdateProductParams}
            onResetMargins={handleResetMargins}
            onNavigate={setCurrentView}
            onNotify={notify}
          />
        )}

        {currentView === 'sales' && (
          <SalesView
            sales={sales}
            products={products}
            activeRate={activeRate}
            activeRateType={activeRateType}
            activeRateName={activeRateName}
            currencyMode={currencyMode}
            onAddSale={handleAddSale}
            onDeleteSale={handleDeleteSale}
            onNavigate={setCurrentView}
            onNotify={notify}
          />
        )}

        {currentView === 'growth' && (
          <GrowthView
            products={products}
            activeRate={activeRate}
            activeRateType={activeRateType}
            activeRateName={activeRateName}
            workshopProfile={workshopProfile}
            onNavigate={setCurrentView}
            onNotify={notify}
            onOpenWhatsAppOrder={() => setIsWhatsAppOrderOpen(true)}
            onOpenLabelGenerator={() => setIsLabelGeneratorOpen(true)}
            onOpenMilkYield={() => setIsMilkYieldOpen(true)}
            onOpenPackagingGuide={() => setIsPackagingGuideOpen(true)}
          />
        )}

        {currentView === 'inventory' && (
          <InventoryView
            inventory={inventory}
            activeRate={activeRate}
            activeRateName={activeRateName}
            currencyMode={currencyMode}
            onSaveItem={handleSaveItem}
            onDeleteItem={handleDeleteItem}
            onOpenNewOperation={() => setIsNewOpOpen(true)}
            onOpenPackagingGuide={() => setIsPackagingGuideOpen(true)}
            onNavigate={setCurrentView}
            onNotify={notify}
          />
        )}

        {currentView === 'production' && (
          <ProductionView
            recipes={recipes}
            batches={batches}
            inventory={inventory}
            products={products}
            activeRate={activeRate}
            activeRateName={activeRateName}
            currencyMode={currencyMode}
            onSaveRecipe={handleSaveRecipe}
            onDeleteRecipe={handleDeleteRecipe}
            onExecuteBatch={handleExecuteBatch}
            onDeleteBatch={handleDeleteBatch}
            onNavigate={setCurrentView}
            onNotify={notify}
          />
        )}

        {currentView === 'costs' && (
          <CostingView
            inventory={inventory}
            activeRate={activeRate}
            activeRateName={activeRateName}
            onNavigate={setCurrentView}
            onNotify={notify}
          />
        )}

        {currentView === 'purchases' && (
          <PurchasesView
            inventory={inventory}
            activeRate={activeRate}
            activeRateName={activeRateName}
            onNavigate={setCurrentView}
            onOpenNewOperation={() => setIsNewOpOpen(true)}
            onNotify={notify}
          />
        )}

        {currentView === 'reports' && (
          <ReportsView
            movements={movements}
            inventory={inventory}
            products={products}
            sales={sales}
            activeRate={activeRate}
            activeRateName={activeRateName}
            onNavigate={setCurrentView}
            onNotify={notify}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            rates={scrapedRates}
            activeRateType={activeRateType}
            onChangeRateType={setActiveRateType}
            onRefreshRates={fetchLiveRates}
            isRefreshingRates={isRefreshingRates}
            onNavigate={setCurrentView}
            onNotify={notify}
            currentPalette={currentPalette}
            onSelectPalette={handleSelectPalette}
            workshopProfile={workshopProfile}
            onUpdateWorkshopProfile={handleUpdateWorkshopProfile}
            currentUser={currentUser}
            users={users}
            onOpenAuthModal={handleOpenAuthModal}
            onStartWalkthrough={() => setIsWalkthroughOpen(true)}
            onResetToClean={handleResetToClean}
            onLoadSampleData={handleLoadSampleData}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
          />
        )}

        <div className="bottom-note">
          <span>
            {workshopProfile.name} · Sistema para Talleres Artesanales · <b>Referencia Activa: {activeRateName} ({moneyVES(activeRate)})</b>
          </span>
          <span>Base en Dólares ($) · Conversión Oficial y P2P · Cálculos Auditables</span>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Optimized for touch & smartphones like Redmi Note 13 Pro) */}
      <BottomNav
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
        onOpenQuickSale={() => setIsNewOpOpen(true)}
        unreadAlertsCount={criticalCount + warningCount}
      />

      {/* Modals */}
      <InteractiveWalkthrough
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
        onNavigate={setCurrentView}
        rates={scrapedRates}
        activeRate={activeRate}
        activeRateName={activeRateName}
        activeRateType={activeRateType}
        onChangeRateType={setActiveRateType}
        onLoadSampleData={handleLoadSampleData}
        onResetToClean={handleResetToClean}
        onOpenPackagingGuide={() => setIsPackagingGuideOpen(true)}
      />

      <WhatsAppOrderModal
        isOpen={isWhatsAppOrderOpen}
        onClose={() => setIsWhatsAppOrderOpen(false)}
        products={products}
        activeRate={activeRate}
        activeRateName={activeRateName}
        activeRateType={activeRateType}
        workshopProfile={workshopProfile}
        onAddSale={handleAddSale}
        onNotify={notify}
      />

      <LabelGeneratorModal
        isOpen={isLabelGeneratorOpen}
        onClose={() => setIsLabelGeneratorOpen(false)}
        products={products}
        workshopProfile={workshopProfile}
      />

      <MilkYieldModal
        isOpen={isMilkYieldOpen}
        onClose={() => setIsMilkYieldOpen(false)}
        activeRate={activeRate}
        activeRateName={activeRateName}
      />

      <PackagingGuideModal
        isOpen={isPackagingGuideOpen}
        onClose={() => setIsPackagingGuideOpen(false)}
        activeRate={activeRate}
        activeRateName={activeRateName}
        onUpdatePackagingCost={handleUpdatePackagingCost}
      />

      <NewOperationModal
        isOpen={isNewOpOpen}
        onClose={() => setIsNewOpOpen(false)}
        inventory={inventory}
        activeRate={activeRate}
        onSaveOperation={handleSaveOperation}
        onNotify={notify}
      />

      <AlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        inventory={inventory}
        onNavigate={setCurrentView}
      />

      <CashRegisterModal
        isOpen={isCashRegisterOpen}
        onClose={() => setIsCashRegisterOpen(false)}
        activeRate={activeRate}
        activeRateName={activeRateName}
        workshopProfile={workshopProfile}
        onNotify={notify}
      />

      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentPalette={currentPalette}
        onSelectPalette={handleSelectPalette}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onDeleteUser={handleDeleteUser}
        onLogout={handleLogout}
        onNotify={notify}
        mode={authModalMode}
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
