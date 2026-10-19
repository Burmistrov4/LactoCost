export type ViewId =
  | 'dashboard'
  | 'inventory'
  | 'production'
  | 'costs'
  | 'purchases'
  | 'pricing'
  | 'reports'
  | 'settings';

export interface Product {
  id: string;
  emoji: string;
  name: string;
  format: string;
  cost: number; // Unit variable cost in VES
  defaultMargin: number; // e.g. 35 for 35%
  targetMargin: number;
  variableFeeRate?: number; // e.g. 0.05 for 5% commission
  fixedVariableCost?: number; // e.g. fixed packaging/delivery per unit
  taxRate?: number; // e.g. 0.16 for 16% IVA
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
  unitCost: number; // CPP in VES
  currency: 'VES' | 'USD';
  location: string;
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
  unitCost: number;
  totalCost: number;
  currency: 'VES' | 'USD';
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
  laborAndOverheadPerBatch: number;
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
  totalBatchCost: number;
  unitCost: number;
  status: 'draft' | 'approved' | 'finalized';
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

export interface PriceCalculationResult {
  unitCost: number;
  targetMargin: number;
  variableFeeRate: number;
  fixedVariableCost: number;
  taxRate: number;
  priceQuantum: number;
  unroundedNetPrice: number;
  netPrice: number;
  variableFee: number;
  contribution: number;
  actualContributionMargin: number;
  customerPrice: number;
}
