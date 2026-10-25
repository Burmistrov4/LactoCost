export type ViewId =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'production'
  | 'costs'
  | 'purchases'
  | 'pricing'
  | 'sales'
  | 'growth'
  | 'reports'
  | 'settings';

export type RateReferenceType = 'bcv_usd' | 'bcv_eur' | 'binance_p2p' | 'manual';
export type DisplayCurrencyMode = 'USD' | 'VES' | 'BOTH';
export type ColorPaletteId = 'vanilla' | 'caramel' | 'berry' | 'coffee' | 'midnight';

export interface ColorPaletteInfo {
  id: ColorPaletteId;
  name: string;
  emoji: string;
  description: string;
  previewColors: string[];
}

export type UserRole = 'owner' | 'sales' | 'production';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  avatarEmoji: string;
  pin: string;
  email?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  currentUser: UserProfile | null;
  users: UserProfile[];
  isAuthenticated: boolean;
}

export type ArtisanCategory =
  | 'dairy'
  | 'pastry'
  | 'flan'
  | 'bakery'
  | 'chocolate'
  | 'general';

export interface WorkshopProfile {
  name: string;
  tagline: string;
  category: ArtisanCategory;
  categoryLabel: string;
  location: string;
  phone: string;
  deliveryZones: string;
  monogram: string;
  logoEmoji: string;
  instagramUser?: string;
}

export interface Product {
  id: string;
  emoji: string;
  name: string;
  format: string;
  costUSD: number; // Costo variable unitario base en USD (ej. $0.95)
  defaultMargin: number; // Margen deseado ej. 35%
  targetMargin: number;
  variableFeeRate?: number; // Comisión canal (ej. 5%)
  fixedVariableCostUSD?: number; // Costo fijo por unidad en USD
  taxRate?: number; // IVA (ej. 16%)
  channel?: string; // Directo, Bodegón, Cafetería, etc.
  description?: string;
  category?: 'yogurt' | 'quesillo' | 'reposteria' | 'derivado';
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: 'lácteo' | 'ingrediente' | 'empaque' | 'insumo';
  unit: string;
  currentStock: number;
  minStock: number;
  safetyStock: number;
  unitCostUSD: number; // Costo unitario base en Dólares ($)
  location: string;
  supplier?: string;
  expiryWarningDays?: number;
  status: 'good' | 'warn' | 'bad';
}

export interface InventoryMovement {
  id: string;
  date: string;
  type: 'receipt' | 'production_consumption' | 'production_output' | 'waste' | 'count_adjustment' | 'reversal';
  reference: string;
  itemId: string;
  itemName: string;
  quantityDelta: number;
  unit: string;
  unitCostUSD: number;
  totalCostUSD: number;
  exchangeRateUsed: number;
  totalCostVES: number;
  status: 'good' | 'warn' | 'bad';
  statusText: string;
  actor: string;
  reason: string;
}

export interface RecipeIngredient {
  itemId: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  productId: string;
  productName: string;
  version: string;
  batchSizeExpected: number;
  unit: string;
  yieldExpectedUnits: number;
  ingredients: RecipeIngredient[];
  laborAndOverheadPerBatchUSD: number; // En USD
  preparationNotes?: string;
}

export interface ProductionBatch {
  id: string;
  code: string;
  recipeId: string;
  productName: string;
  date: string;
  inputUnits: number;
  saleableUnits: number;
  wasteUnits: number;
  wastePercentage: number;
  totalBatchCostUSD: number;
  unitCostUSD: number;
  status: 'draft' | 'approved' | 'finalized';
}

export interface Sale {
  id: string;
  date: string;
  clientName: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPriceUSD: number;
    subtotalUSD: number;
  }>;
  totalUSD: number;
  rateApplied: number;
  rateType: RateReferenceType;
  totalVES: number;
  paymentMethod: 'Efectivo $' | 'PagoMóvil (VES)' | 'Binance USDT' | 'Punto de Venta';
  notes?: string;
}

export interface ScrapedRates {
  bcvEur: number;
  bcvUsd: number;
  bcvDate: string;
  binanceP2PBuy: number;
  binanceP2PSell: number;
  binanceP2PAvg: number;
  p2pOffersCount: number;
  fetchedAt: string;
  isLive: boolean;
  manualRate?: number;
}

export interface PriceCalculationResult {
  unitCostUSD: number;
  targetMargin: number;
  variableFeeRate: number;
  fixedVariableCostUSD: number;
  taxRate: number;
  priceQuantum: number;
  unroundedNetPriceUSD: number;
  netPriceUSD: number;
  variableFeeUSD: number;
  contributionUSD: number;
  actualContributionMargin: number;
  customerPriceUSD: number;
  // Conversiones en VES según tasa seleccionada
  rateApplied: number;
  netPriceVES: number;
  customerPriceVES: number;
  contributionVES: number;
}

export interface ExchangeRateObservation {
  id: string;
  provider: 'bcv' | 'binance_p2p' | 'manual';
  base_currency: string;
  quote_currency: string;
  rate_decimal: string;
  quote_side: 'official' | 'usdt_buy' | 'usdt_sell';
  observation_kind: string;
  observation_count: number;
  aggregation_method: string;
  source_url: string;
  source_published_at: string | null;
  observed_at: string;
  fetched_at: string;
  freshness_status: 'fresh' | 'stale' | 'suspect' | 'unknown';
  age_seconds?: number;
  notes?: string | null;
}
