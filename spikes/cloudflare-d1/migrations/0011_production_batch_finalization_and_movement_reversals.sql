-- 0011_production_batch_finalization_and_movement_reversals.sql
-- Local schema hardening: terminal batch states and exact, one-to-one movement reversals.
-- Domain services must still perform stock checks, calculations, and audit atomically.

-- A movement may be reversed once only. A reversal is a new immutable row, never an edit.
CREATE UNIQUE INDEX IF NOT EXISTS uq_inventory_movement_single_reversal
ON inventory_movements(reverses_movement_id)
WHERE reverses_movement_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_finished_movement_single_reversal
ON finished_inventory_movements(reverses_movement_id)
WHERE reverses_movement_id IS NOT NULL;

CREATE TRIGGER IF NOT EXISTS inventory_movement_reversal_validate
BEFORE INSERT ON inventory_movements
WHEN
  (NEW.movement_type = 'reversal' AND NEW.reverses_movement_id IS NULL)
  OR (NEW.movement_type <> 'reversal' AND NEW.reverses_movement_id IS NOT NULL)
  OR (NEW.reverses_movement_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM inventory_movements original
    WHERE original.id = NEW.reverses_movement_id
      AND original.movement_type <> 'reversal'
      AND original.ingredient_id = NEW.ingredient_id
      AND original.lot_id IS NEW.lot_id
      AND original.location_id = NEW.location_id
      AND original.currency_code = NEW.currency_code
      AND original.quantity_delta_micros = -NEW.quantity_delta_micros
      AND original.unit_cost_micros = NEW.unit_cost_micros
      AND original.total_cost_micros = NEW.total_cost_micros
  ))
BEGIN
  SELECT RAISE(ABORT, 'invalid inventory movement reversal; exact opposite of an original movement required');
END;

CREATE TRIGGER IF NOT EXISTS finished_movement_reversal_validate
BEFORE INSERT ON finished_inventory_movements
WHEN
  (NEW.movement_type = 'reversal' AND NEW.reverses_movement_id IS NULL)
  OR (NEW.movement_type <> 'reversal' AND NEW.reverses_movement_id IS NOT NULL)
  OR (NEW.reverses_movement_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM finished_inventory_movements original
    WHERE original.id = NEW.reverses_movement_id
      AND original.movement_type <> 'reversal'
      AND original.product_id = NEW.product_id
      AND original.product_format_id IS NEW.product_format_id
      AND original.batch_id IS NEW.batch_id
      AND original.location_id = NEW.location_id
      AND original.currency_code = NEW.currency_code
      AND original.quantity_delta_micros = -NEW.quantity_delta_micros
      AND original.unit_cost_micros = NEW.unit_cost_micros
      AND original.total_cost_micros = NEW.total_cost_micros
  ))
BEGIN
  SELECT RAISE(ABORT, 'invalid finished movement reversal; exact opposite of an original movement required');
END;

-- Batch state machine. Completed/cancelled batches are terminal and immutable.
CREATE TRIGGER IF NOT EXISTS production_batch_status_transition_guard
BEFORE UPDATE OF status ON production_batches
WHEN NEW.status <> OLD.status
 AND NOT (
   (OLD.status = 'planned' AND NEW.status IN ('in_progress','cancelled','on_hold'))
   OR (OLD.status = 'in_progress' AND NEW.status IN ('completed','cancelled','on_hold'))
   OR (OLD.status = 'on_hold' AND NEW.status IN ('in_progress','cancelled'))
 )
BEGIN
  SELECT RAISE(ABORT, 'invalid production batch status transition');
END;

CREATE TRIGGER IF NOT EXISTS production_batch_terminal_immutable
BEFORE UPDATE ON production_batches
WHEN OLD.status IN ('completed','cancelled')
BEGIN
  SELECT RAISE(ABORT, 'completed or cancelled production batches are immutable');
END;

CREATE TRIGGER IF NOT EXISTS production_batch_no_delete
BEFORE DELETE ON production_batches
BEGIN
  SELECT RAISE(ABORT, 'production batches cannot be deleted; use a valid status transition');
END;

CREATE TRIGGER IF NOT EXISTS batch_consumptions_only_while_in_progress
BEFORE INSERT ON batch_consumptions
WHEN NOT EXISTS (
  SELECT 1 FROM production_batches WHERE id = NEW.batch_id AND status = 'in_progress'
)
BEGIN
  SELECT RAISE(ABORT, 'batch consumptions require an in-progress batch');
END;

CREATE TRIGGER IF NOT EXISTS batch_outputs_only_while_in_progress
BEFORE INSERT ON batch_outputs
WHEN NOT EXISTS (
  SELECT 1 FROM production_batches WHERE id = NEW.batch_id AND status = 'in_progress'
)
BEGIN
  SELECT RAISE(ABORT, 'batch outputs require an in-progress batch');
END;

CREATE TRIGGER IF NOT EXISTS batch_losses_only_while_in_progress
BEFORE INSERT ON batch_losses
WHEN NOT EXISTS (
  SELECT 1 FROM production_batches WHERE id = NEW.batch_id AND status = 'in_progress'
)
BEGIN
  SELECT RAISE(ABORT, 'batch losses require an in-progress batch');
END;
