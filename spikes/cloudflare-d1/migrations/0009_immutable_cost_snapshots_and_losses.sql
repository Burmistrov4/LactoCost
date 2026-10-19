-- 0009_immutable_cost_snapshots_and_losses.sql
-- Historical valuation snapshots and recorded batch losses are evidence, not editable state.
-- Corrections must be represented by new snapshots/correction records.

CREATE TRIGGER IF NOT EXISTS inventory_cost_snapshots_no_update
BEFORE UPDATE ON inventory_cost_snapshots
BEGIN
  SELECT RAISE(ABORT, 'inventory cost snapshots are immutable; append a new snapshot');
END;

CREATE TRIGGER IF NOT EXISTS inventory_cost_snapshots_no_delete
BEFORE DELETE ON inventory_cost_snapshots
BEGIN
  SELECT RAISE(ABORT, 'inventory cost snapshots are immutable');
END;

CREATE TRIGGER IF NOT EXISTS finished_cost_snapshots_no_update
BEFORE UPDATE ON finished_cost_snapshots
BEGIN
  SELECT RAISE(ABORT, 'finished cost snapshots are immutable; append a new snapshot');
END;

CREATE TRIGGER IF NOT EXISTS finished_cost_snapshots_no_delete
BEFORE DELETE ON finished_cost_snapshots
BEGIN
  SELECT RAISE(ABORT, 'finished cost snapshots are immutable');
END;

CREATE TRIGGER IF NOT EXISTS batch_losses_no_update
BEFORE UPDATE ON batch_losses
BEGIN
  SELECT RAISE(ABORT, 'batch loss records are immutable; create a correction record');
END;

CREATE TRIGGER IF NOT EXISTS batch_losses_no_delete
BEFORE DELETE ON batch_losses
BEGIN
  SELECT RAISE(ABORT, 'batch loss records are immutable');
END;
