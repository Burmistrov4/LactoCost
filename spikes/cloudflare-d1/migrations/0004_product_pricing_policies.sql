-- 0004_product_pricing_policies.sql
-- Pricing rules are versioned per sellable format. No real prices or policies seeded.
-- Amounts are INTEGER micro-units of the selected currency. Rates are decimal TEXT
-- (e.g. '0.35'); the service must parse them as Decimal and apply the configured rounding.
-- target_margin is defined on net revenue excluding separately added tax.
-- variable_fee_rate applies to net price; confirm channel/provider contracts before use.

CREATE TABLE IF NOT EXISTS product_pricing_policies (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES finished_products(id),
  product_format_id TEXT NOT NULL REFERENCES product_formats(id),
  version_number INTEGER NOT NULL CHECK (version_number > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','retired')),
  currency_code TEXT NOT NULL CHECK (length(currency_code) = 3),
  target_margin_decimal TEXT NOT NULL,
  variable_fee_rate_decimal TEXT NOT NULL DEFAULT '0',
  fixed_variable_cost_micros INTEGER NOT NULL DEFAULT 0 CHECK (fixed_variable_cost_micros >= 0),
  tax_rate_decimal TEXT NOT NULL DEFAULT '0',
  price_quantum_micros INTEGER NOT NULL CHECK (price_quantum_micros > 0),
  rounding_mode TEXT NOT NULL DEFAULT 'half_up' CHECK (rounding_mode IN ('half_up')),
  cost_basis TEXT NOT NULL CHECK (cost_basis IN ('variable','full','partial')),
  reason TEXT NOT NULL,
  created_by TEXT,
  approved_by TEXT,
  approved_at TEXT,
  effective_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(product_format_id, version_number),
  CHECK ((status = 'active' AND approved_at IS NOT NULL AND approved_by IS NOT NULL) OR status <> 'active')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_pricing_policy_per_format
ON product_pricing_policies(product_format_id) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS product_price_snapshots (
  id TEXT PRIMARY KEY,
  pricing_policy_id TEXT NOT NULL REFERENCES product_pricing_policies(id),
  product_id TEXT NOT NULL REFERENCES finished_products(id),
  product_format_id TEXT NOT NULL REFERENCES product_formats(id),
  currency_code TEXT NOT NULL CHECK (length(currency_code) = 3),
  unit_cost_micros INTEGER NOT NULL CHECK (unit_cost_micros >= 0),
  target_margin_decimal TEXT NOT NULL,
  variable_fee_rate_decimal TEXT NOT NULL,
  fixed_variable_cost_micros INTEGER NOT NULL CHECK (fixed_variable_cost_micros >= 0),
  tax_rate_decimal TEXT NOT NULL,
  net_price_micros INTEGER NOT NULL CHECK (net_price_micros >= 0),
  customer_price_micros INTEGER NOT NULL CHECK (customer_price_micros >= net_price_micros),
  contribution_micros INTEGER NOT NULL,
  cost_completeness TEXT NOT NULL CHECK (cost_completeness IN ('incomplete','partial','complete')),
  calculation_version TEXT NOT NULL,
  effective_at TEXT NOT NULL,
  actor_id TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_price_snapshots_format_time
ON product_price_snapshots(product_format_id, effective_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_snapshots_policy
ON product_price_snapshots(pricing_policy_id, created_at DESC);

CREATE TRIGGER IF NOT EXISTS pricing_policies_no_delete
BEFORE DELETE ON product_pricing_policies
BEGIN
  SELECT RAISE(ABORT, 'pricing policies are versioned; retire instead of deleting');
END;

CREATE TRIGGER IF NOT EXISTS pricing_policies_active_immutable
BEFORE UPDATE ON product_pricing_policies
WHEN OLD.status = 'active' AND NEW.status = 'active'
BEGIN
  SELECT RAISE(ABORT, 'active pricing policies are immutable; create a new version');
END;

-- Retiring an active policy is allowed only if no other field changes.
CREATE TRIGGER IF NOT EXISTS pricing_policies_retire_guard
BEFORE UPDATE ON product_pricing_policies
WHEN OLD.status = 'active' AND NEW.status = 'retired' AND (
  NEW.id IS NOT OLD.id OR
  NEW.product_id IS NOT OLD.product_id OR
  NEW.product_format_id IS NOT OLD.product_format_id OR
  NEW.version_number IS NOT OLD.version_number OR
  NEW.currency_code IS NOT OLD.currency_code OR
  NEW.target_margin_decimal IS NOT OLD.target_margin_decimal OR
  NEW.variable_fee_rate_decimal IS NOT OLD.variable_fee_rate_decimal OR
  NEW.fixed_variable_cost_micros IS NOT OLD.fixed_variable_cost_micros OR
  NEW.tax_rate_decimal IS NOT OLD.tax_rate_decimal OR
  NEW.price_quantum_micros IS NOT OLD.price_quantum_micros OR
  NEW.rounding_mode IS NOT OLD.rounding_mode OR
  NEW.cost_basis IS NOT OLD.cost_basis OR
  NEW.reason IS NOT OLD.reason OR
  NEW.created_by IS NOT OLD.created_by OR
  NEW.approved_by IS NOT OLD.approved_by OR
  NEW.approved_at IS NOT OLD.approved_at OR
  NEW.effective_at IS NOT OLD.effective_at OR
  NEW.created_at IS NOT OLD.created_at
)
BEGIN
  SELECT RAISE(ABORT, 'retiring a pricing policy cannot change its historical fields');
END;

CREATE TRIGGER IF NOT EXISTS product_price_snapshots_no_update
BEFORE UPDATE ON product_price_snapshots
BEGIN
  SELECT RAISE(ABORT, 'price snapshots are immutable');
END;

CREATE TRIGGER IF NOT EXISTS product_price_snapshots_no_delete
BEFORE DELETE ON product_price_snapshots
BEGIN
  SELECT RAISE(ABORT, 'price snapshots are immutable');
END;
