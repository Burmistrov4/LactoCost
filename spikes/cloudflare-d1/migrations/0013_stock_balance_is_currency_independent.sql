-- 0013_stock_balance_is_currency_independent.sql
-- Quantity is physical stock; cost currency must never partition the quantity balance.
-- Corrects the balance guards from 0012 while preserving append-only movement history.

DROP TRIGGER IF EXISTS inventory_movement_no_negative_balance;
DROP TRIGGER IF EXISTS inventory_lot_movement_no_negative_balance;
DROP TRIGGER IF EXISTS finished_movement_no_negative_balance;

DROP INDEX IF EXISTS idx_inventory_balance_guard;
DROP INDEX IF EXISTS idx_finished_inventory_balance_guard;

CREATE INDEX IF NOT EXISTS idx_inventory_balance_guard
ON inventory_movements(ingredient_id, location_id);

CREATE INDEX IF NOT EXISTS idx_inventory_lot_balance_guard
ON inventory_movements(ingredient_id, location_id, lot_id);

CREATE INDEX IF NOT EXISTS idx_finished_inventory_balance_guard
ON finished_inventory_movements(product_id, product_format_id, location_id);

CREATE TRIGGER inventory_movement_no_negative_balance
BEFORE INSERT ON inventory_movements
WHEN COALESCE((
  SELECT SUM(quantity_delta_micros)
  FROM inventory_movements current
  WHERE current.ingredient_id = NEW.ingredient_id
    AND current.location_id = NEW.location_id
), 0) + NEW.quantity_delta_micros < 0
BEGIN
  SELECT RAISE(ABORT, 'inventory movement would create a negative balance');
END;

CREATE TRIGGER inventory_lot_movement_no_negative_balance
BEFORE INSERT ON inventory_movements
WHEN NEW.lot_id IS NOT NULL
 AND COALESCE((
   SELECT SUM(quantity_delta_micros)
   FROM inventory_movements current
   WHERE current.ingredient_id = NEW.ingredient_id
     AND current.location_id = NEW.location_id
     AND current.lot_id = NEW.lot_id
 ), 0) + NEW.quantity_delta_micros < 0
BEGIN
  SELECT RAISE(ABORT, 'inventory lot movement would create a negative balance');
END;

CREATE TRIGGER finished_movement_no_negative_balance
BEFORE INSERT ON finished_inventory_movements
WHEN COALESCE((
  SELECT SUM(quantity_delta_micros)
  FROM finished_inventory_movements current
  WHERE current.product_id = NEW.product_id
    AND current.product_format_id IS NEW.product_format_id
    AND current.location_id = NEW.location_id
), 0) + NEW.quantity_delta_micros < 0
BEGIN
  SELECT RAISE(ABORT, 'finished inventory movement would create a negative balance');
END;
