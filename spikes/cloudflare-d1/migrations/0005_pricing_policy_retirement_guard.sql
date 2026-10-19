-- 0005_pricing_policy_retirement_guard.sql
-- Follow-up hardening: an active policy may be retired, but retirement cannot rewrite its fields.
-- Safe for local databases that already applied 0004 and for fresh installs.

DROP TRIGGER IF EXISTS pricing_policies_active_immutable;
DROP TRIGGER IF EXISTS pricing_policies_retire_guard;

CREATE TRIGGER pricing_policies_active_immutable
BEFORE UPDATE ON product_pricing_policies
WHEN OLD.status = 'active' AND NEW.status = 'active'
BEGIN
  SELECT RAISE(ABORT, 'active pricing policies are immutable; create a new version');
END;

CREATE TRIGGER pricing_policies_retire_guard
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
