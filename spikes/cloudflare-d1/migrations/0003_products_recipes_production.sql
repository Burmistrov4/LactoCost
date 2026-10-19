-- 0003_products_recipes_production.sql
-- Schema only: no recipe, production or sales records are seeded.

CREATE TABLE IF NOT EXISTS finished_products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('yogurt','quesillo','other')),
  base_unit_id TEXT NOT NULL REFERENCES units(id),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS product_formats (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES finished_products(id),
  sku TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  net_quantity_micros INTEGER NOT NULL CHECK (net_quantity_micros > 0),
  net_unit_id TEXT NOT NULL REFERENCES units(id),
  packaging_ingredient_id TEXT REFERENCES ingredients(id),
  packaging_quantity_micros INTEGER NOT NULL DEFAULT 0 CHECK (packaging_quantity_micros >= 0),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (product_id, label)
);

CREATE TABLE IF NOT EXISTS recipe_versions (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES finished_products(id),
  version_number INTEGER NOT NULL CHECK (version_number > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','retired')),
  target_yield_micros INTEGER NOT NULL CHECK (target_yield_micros > 0),
  yield_unit_id TEXT NOT NULL REFERENCES units(id),
  method_notes TEXT,
  evidence_status TEXT NOT NULL DEFAULT 'declared'
    CHECK (evidence_status IN ('declared','measured','verified','hypothesis')),
  approved_by TEXT,
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (product_id, version_number),
  CHECK ((status = 'approved' AND approved_at IS NOT NULL) OR status <> 'approved')
);

CREATE TABLE IF NOT EXISTS recipe_lines (
  id TEXT PRIMARY KEY,
  recipe_version_id TEXT NOT NULL REFERENCES recipe_versions(id),
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id),
  quantity_micros INTEGER NOT NULL CHECK (quantity_micros > 0),
  unit_id TEXT NOT NULL REFERENCES units(id),
  process_loss_micros INTEGER NOT NULL DEFAULT 0 CHECK (process_loss_micros >= 0),
  notes TEXT,
  UNIQUE (recipe_version_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS production_batches (
  id TEXT PRIMARY KEY,
  batch_code TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL REFERENCES finished_products(id),
  product_format_id TEXT REFERENCES product_formats(id),
  recipe_version_id TEXT REFERENCES recipe_versions(id),
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned','in_progress','completed','cancelled','on_hold')),
  planned_start_at TEXT,
  started_at TEXT,
  completed_at TEXT,
  planned_yield_micros INTEGER CHECK (planned_yield_micros IS NULL OR planned_yield_micros > 0),
  actual_gross_yield_micros INTEGER CHECK (actual_gross_yield_micros IS NULL OR actual_gross_yield_micros >= 0),
  saleable_quantity_micros INTEGER CHECK (saleable_quantity_micros IS NULL OR saleable_quantity_micros >= 0),
  waste_quantity_micros INTEGER NOT NULL DEFAULT 0 CHECK (waste_quantity_micros >= 0),
  currency_code TEXT CHECK (currency_code IS NULL OR length(currency_code) = 3),
  total_cost_micros INTEGER CHECK (total_cost_micros IS NULL OR total_cost_micros >= 0),
  unit_cost_micros INTEGER CHECK (unit_cost_micros IS NULL OR unit_cost_micros >= 0),
  cost_completeness TEXT NOT NULL DEFAULT 'incomplete'
    CHECK (cost_completeness IN ('incomplete','partial','complete')),
  actor_id TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (completed_at IS NULL OR started_at IS NOT NULL),
  CHECK (status <> 'completed' OR (completed_at IS NOT NULL AND saleable_quantity_micros IS NOT NULL AND total_cost_micros IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS batch_consumptions (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES production_batches(id),
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id),
  lot_id TEXT REFERENCES inventory_lots(id),
  quantity_micros INTEGER NOT NULL CHECK (quantity_micros > 0),
  unit_cost_micros INTEGER NOT NULL CHECK (unit_cost_micros >= 0),
  total_cost_micros INTEGER NOT NULL CHECK (total_cost_micros >= 0),
  currency_code TEXT NOT NULL CHECK (length(currency_code) = 3),
  inventory_movement_id TEXT NOT NULL UNIQUE REFERENCES inventory_movements(id),
  idempotency_key TEXT NOT NULL UNIQUE,
  occurred_at TEXT NOT NULL,
  actor_id TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS batch_outputs (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES production_batches(id),
  product_id TEXT NOT NULL REFERENCES finished_products(id),
  product_format_id TEXT REFERENCES product_formats(id),
  quantity_micros INTEGER NOT NULL CHECK (quantity_micros > 0),
  unit_cost_micros INTEGER NOT NULL CHECK (unit_cost_micros >= 0),
  total_cost_micros INTEGER NOT NULL CHECK (total_cost_micros >= 0),
  currency_code TEXT NOT NULL CHECK (length(currency_code) = 3),
  expiry_date TEXT,
  finished_inventory_movement_id TEXT NOT NULL UNIQUE REFERENCES finished_inventory_movements(id),
  idempotency_key TEXT NOT NULL UNIQUE,
  occurred_at TEXT NOT NULL,
  actor_id TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS batch_losses (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES production_batches(id),
  loss_type TEXT NOT NULL CHECK (loss_type IN ('process','quality_rejection','expiry','spill','other')),
  quantity_micros INTEGER NOT NULL CHECK (quantity_micros > 0),
  unit_id TEXT NOT NULL REFERENCES units(id),
  reason TEXT NOT NULL,
  evidence_reference TEXT,
  actor_id TEXT,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS finished_inventory_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES finished_products(id),
  product_format_id TEXT REFERENCES product_formats(id),
  location_id TEXT NOT NULL REFERENCES stock_locations(id),
  batch_id TEXT REFERENCES production_batches(id),
  movement_type TEXT NOT NULL
    CHECK (movement_type IN ('opening_balance','production_output','sale','waste','count_adjustment','return','reversal','transfer_in','transfer_out')),
  quantity_delta_micros INTEGER NOT NULL CHECK (quantity_delta_micros <> 0),
  unit_cost_micros INTEGER NOT NULL CHECK (unit_cost_micros >= 0),
  total_cost_micros INTEGER NOT NULL CHECK (total_cost_micros >= 0),
  currency_code TEXT NOT NULL CHECK (length(currency_code) = 3),
  occurred_at TEXT NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  reverses_movement_id TEXT REFERENCES finished_inventory_movements(id),
  actor_id TEXT,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK ((movement_type IN ('production_output','return','transfer_in') AND quantity_delta_micros > 0)
      OR (movement_type IN ('sale','waste','transfer_out') AND quantity_delta_micros < 0)
      OR movement_type IN ('opening_balance','count_adjustment','reversal'))
);

CREATE TABLE IF NOT EXISTS finished_cost_snapshots (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES finished_products(id),
  product_format_id TEXT REFERENCES product_formats(id),
  currency_code TEXT NOT NULL CHECK (length(currency_code) = 3),
  quantity_on_hand_micros INTEGER NOT NULL,
  weighted_average_unit_cost_micros INTEGER NOT NULL CHECK (weighted_average_unit_cost_micros >= 0),
  effective_at TEXT NOT NULL,
  last_movement_id TEXT REFERENCES finished_inventory_movements(id),
  calculation_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_products_active_category ON finished_products(active, category);
CREATE INDEX IF NOT EXISTS idx_formats_product_active ON product_formats(product_id, active);
CREATE INDEX IF NOT EXISTS idx_recipe_versions_product_status ON recipe_versions(product_id, status, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_recipe_lines_version ON recipe_lines(recipe_version_id);
CREATE INDEX IF NOT EXISTS idx_batches_status_start ON production_batches(status, planned_start_at);
CREATE INDEX IF NOT EXISTS idx_batches_product_completed ON production_batches(product_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_consumptions_batch ON batch_consumptions(batch_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_outputs_batch ON batch_outputs(batch_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_losses_batch ON batch_losses(batch_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_finished_movements_product_time ON finished_inventory_movements(product_id, occurred_at, created_at);
CREATE INDEX IF NOT EXISTS idx_finished_movements_batch ON finished_inventory_movements(batch_id);
CREATE INDEX IF NOT EXISTS idx_finished_cost_product_time ON finished_cost_snapshots(product_id, effective_at DESC);

CREATE TRIGGER IF NOT EXISTS finished_inventory_movements_no_update
BEFORE UPDATE ON finished_inventory_movements
BEGIN
  SELECT RAISE(ABORT, 'finished inventory movements are immutable; create a reversal');
END;

CREATE TRIGGER IF NOT EXISTS finished_inventory_movements_no_delete
BEFORE DELETE ON finished_inventory_movements
BEGIN
  SELECT RAISE(ABORT, 'finished inventory movements are immutable; create a reversal');
END;

CREATE TRIGGER IF NOT EXISTS batch_consumptions_no_update
BEFORE UPDATE ON batch_consumptions
BEGIN
  SELECT RAISE(ABORT, 'batch consumptions are immutable; create a correction');
END;

CREATE TRIGGER IF NOT EXISTS batch_consumptions_no_delete
BEFORE DELETE ON batch_consumptions
BEGIN
  SELECT RAISE(ABORT, 'batch consumptions are immutable; create a correction');
END;

CREATE TRIGGER IF NOT EXISTS batch_outputs_no_update
BEFORE UPDATE ON batch_outputs
BEGIN
  SELECT RAISE(ABORT, 'batch outputs are immutable; create a correction');
END;

CREATE TRIGGER IF NOT EXISTS batch_outputs_no_delete
BEFORE DELETE ON batch_outputs
BEGIN
  SELECT RAISE(ABORT, 'batch outputs are immutable; create a correction');
END;
