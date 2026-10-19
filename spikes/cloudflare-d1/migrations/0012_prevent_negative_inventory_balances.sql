-- 0012_prevent_negative_inventory_balances.sql
-- Enforce non-negative aggregate balances at insert time, including reversals.
-- Corrections that would make stock negative must be resolved by an explicit, approved workflow.

CREATE INDEX IF NOT EXISTS idx_inventory_balance_guard
ON inventory_movements(ingredient_id, location_id, currency_code);

CREATE INDEX IF NOT EXISTS idx_finished_inventory_balance_guard
ON finished_inventory_movements(product_id, product_format_id, location_id, currency_code);

CREATE TRIGGER IF NOT EXISTS inventory_movement_no_negative_balance
BEFORE INSERT ON inventory_movements
WHEN COALESCE((
  SELECT SUM(quantity_delta_micros)
  FROM inventory_movements current
  WHERE current.ingredient_id = NEW.ingredient_id
    AND current.location_id = NEW.location_id
    AND current.currency_code = NEW.currency_code
), 0) + NEW.quantity_delta_micros < 0
BEGIN
  SELECT RAISE(ABORT, 'inventory movement would create a negative balance');
END;

CREATE TRIGGER IF NOT EXISTS inventory_lot_movement_no_negative_balance
BEFORE INSERT ON inventory_movements
WHEN NEW.lot_id IS NOT NULL
 AND COALESCE((
   SELECT SUM(quantity_delta_micros)
   FROM inventory_movements current
   WHERE current.ingredient_id = NEW.ingredient_id
     AND current.location_id = NEW.location_id
     AND current.currency_code = NEW.currency_code
     AND current.lot_id = NEW.lot_id
 ), 0) + NEW.quantity_delta_micros < 0
BEGIN
  SELECT RAISE(ABORT, 'inventory lot movement would create a negative balance');
END;

CREATE TRIGGER IF NOT EXISTS finished_movement_no_negative_balance
BEFORE INSERT ON finished_inventory_movements
WHEN COALESCE((
  SELECT SUM(quantity_delta_micros)
  FROM finished_inventory_movements current
  WHERE current.product_id = NEW.product_id
    AND current.product_format_id IS NEW.product_format_id
    AND current.location_id = NEW.location_id
    AND current.currency_code = NEW.currency_code
), 0) + NEW.quantity_delta_micros < 0
BEGIN
  SELECT RAISE(ABORT, 'finished inventory movement would create a negative balance');
END;
