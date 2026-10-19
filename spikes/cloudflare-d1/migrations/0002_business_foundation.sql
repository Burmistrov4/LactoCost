-- 0002_business_foundation.sql
-- Schema foundation only. No production/user data is seeded here.
-- Monetary amounts use signed INTEGER micro-units (1 currency unit = 1,000,000).
-- Quantities use signed INTEGER micro-units of the ingredient's canonical base unit.
-- API must validate range and use decimal arithmetic; never calculate money with JS float.

CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  dimension TEXT NOT NULL CHECK (dimension IN ('mass','volume','count')),
  is_base INTEGER NOT NULL DEFAULT 0 CHECK (is_base IN (0,1)),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS unit_conversions (
  id TEXT PRIMARY KEY,
  from_unit_id TEXT NOT NULL REFERENCES units(id),
  to_unit_id TEXT NOT NULL REFERENCES units(id),
  factor_decimal TEXT NOT NULL,
  evidence_note TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (from_unit_id <> to_unit_id),
  UNIQUE (from_unit_id, to_unit_id)
);

CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('dairy','culture','fruit','sweetener','packaging','cleaning','utility','other')),
  base_unit_id TEXT NOT NULL REFERENCES units(id),
  minimum_stock_micros INTEGER NOT NULL DEFAULT 0 CHECK (minimum_stock_micros >= 0),
  reorder_lead_days INTEGER CHECK (reorder_lead_days IS NULL OR reorder_lead_days >= 0),
  safety_stock_micros INTEGER NOT NULL DEFAULT 0 CHECK (safety_stock_micros >= 0),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tax_id TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  location_text TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified','published_only','contacted','quoted','verified','inactive')),
  evidence_note TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS supplier_quotes (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  quote_reference TEXT,
  quote_date TEXT NOT NULL,
  valid_until TEXT,
  currency_code TEXT NOT NULL CHECK (length(currency_code) = 3),
  exchange_rate_decimal TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('direct_quote','published_price','invoice','estimate','user_declared')),
  source_reference TEXT,
  source_url TEXT,
  minimum_order_note TEXT,
  freight_amount_micros INTEGER NOT NULL DEFAULT 0 CHECK (freight_amount_micros >= 0),
  tax_amount_micros INTEGER NOT NULL DEFAULT 0 CHECK (tax_amount_micros >= 0),
  payment_terms TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending','verified','expired','rejected')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS supplier_quote_lines (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL REFERENCES supplier_quotes(id),
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id),
  quoted_quantity_micros INTEGER NOT NULL CHECK (quoted_quantity_micros > 0),
  quoted_unit_id TEXT NOT NULL REFERENCES units(id),
  unit_price_micros INTEGER NOT NULL CHECK (unit_price_micros >= 0),
  discount_amount_micros INTEGER NOT NULL DEFAULT 0 CHECK (discount_amount_micros >= 0),
  packaging_note TEXT,
  UNIQUE (quote_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS stock_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  location_type TEXT NOT NULL DEFAULT 'general'
    CHECK (location_type IN ('general','cold_storage','freezer','production','quarantine')),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS inventory_lots (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id),
  location_id TEXT NOT NULL REFERENCES stock_locations(id),
  supplier_quote_line_id TEXT REFERENCES supplier_quote_lines(id),
  lot_code TEXT,
  received_at TEXT NOT NULL,
  declared_expiry_date TEXT,
  opened_at TEXT,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available','quarantine','expired','depleted','discarded')),
  received_quantity_micros INTEGER NOT NULL CHECK (received_quantity_micros >= 0),
  received_unit_cost_micros INTEGER NOT NULL CHECK (received_unit_cost_micros >= 0),
  currency_code TEXT NOT NULL CHECK (length(currency_code) = 3),
  source_document TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (declared_expiry_date IS NULL OR declared_expiry_date >= substr(received_at,1,10))
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id),
  lot_id TEXT REFERENCES inventory_lots(id),
  location_id TEXT NOT NULL REFERENCES stock_locations(id),
  movement_type TEXT NOT NULL
    CHECK (movement_type IN ('opening_balance','receipt','production_consumption','production_output','sale','waste','count_adjustment','return','reversal','transfer_in','transfer_out')),
  quantity_delta_micros INTEGER NOT NULL CHECK (quantity_delta_micros <> 0),
  unit_cost_micros INTEGER NOT NULL CHECK (unit_cost_micros >= 0),
  total_cost_micros INTEGER NOT NULL CHECK (total_cost_micros >= 0),
  currency_code TEXT NOT NULL CHECK (length(currency_code) = 3),
  occurred_at TEXT NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  reverses_movement_id TEXT REFERENCES inventory_movements(id),
  actor_id TEXT,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK ((movement_type IN ('receipt','production_output','return','transfer_in') AND quantity_delta_micros > 0)
      OR (movement_type IN ('production_consumption','sale','waste','transfer_out') AND quantity_delta_micros < 0)
      OR movement_type IN ('opening_balance','count_adjustment','reversal'))
);

CREATE TABLE IF NOT EXISTS inventory_cost_snapshots (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id),
  currency_code TEXT NOT NULL CHECK (length(currency_code) = 3),
  quantity_on_hand_micros INTEGER NOT NULL,
  weighted_average_unit_cost_micros INTEGER NOT NULL CHECK (weighted_average_unit_cost_micros >= 0),
  effective_at TEXT NOT NULL,
  last_movement_id TEXT REFERENCES inventory_movements(id),
  calculation_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  occurred_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  actor_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  reason TEXT,
  correlation_id TEXT,
  before_json TEXT,
  after_json TEXT,
  request_fingerprint TEXT
);

CREATE INDEX IF NOT EXISTS idx_ingredients_active_category ON ingredients(active, category);
CREATE INDEX IF NOT EXISTS idx_quotes_supplier_date ON supplier_quotes(supplier_id, quote_date DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_validity ON supplier_quotes(verification_status, valid_until);
CREATE INDEX IF NOT EXISTS idx_quote_lines_ingredient ON supplier_quote_lines(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_lots_ingredient_status ON inventory_lots(ingredient_id, status);
CREATE INDEX IF NOT EXISTS idx_lots_expiry ON inventory_lots(declared_expiry_date, status);
CREATE INDEX IF NOT EXISTS idx_movements_ingredient_time ON inventory_movements(ingredient_id, occurred_at, created_at);
CREATE INDEX IF NOT EXISTS idx_movements_lot ON inventory_movements(lot_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_cost_snapshots_ingredient_time ON inventory_cost_snapshots(ingredient_id, effective_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity_time ON audit_events(entity_type, entity_id, occurred_at);

CREATE TRIGGER IF NOT EXISTS inventory_movements_no_update
BEFORE UPDATE ON inventory_movements
BEGIN
  SELECT RAISE(ABORT, 'inventory movements are immutable; create a reversal');
END;

CREATE TRIGGER IF NOT EXISTS inventory_movements_no_delete
BEFORE DELETE ON inventory_movements
BEGIN
  SELECT RAISE(ABORT, 'inventory movements are immutable; create a reversal');
END;

CREATE TRIGGER IF NOT EXISTS audit_events_no_update
BEFORE UPDATE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'audit events are immutable');
END;

CREATE TRIGGER IF NOT EXISTS audit_events_no_delete
BEFORE DELETE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'audit events are immutable');
END;
