-- 0007_exchange_rate_policy_retirement_guard.sql
-- Retiring an active exchange-rate policy may only change its status.

CREATE TRIGGER IF NOT EXISTS exchange_rate_policies_retire_guard
BEFORE UPDATE ON exchange_rate_policies
WHEN OLD.status = 'active' AND NEW.status = 'retired' AND (
  NEW.id IS NOT OLD.id OR
  NEW.purpose IS NOT OLD.purpose OR
  NEW.scope_key IS NOT OLD.scope_key OR
  NEW.provider IS NOT OLD.provider OR
  NEW.base_currency IS NOT OLD.base_currency OR
  NEW.quote_currency IS NOT OLD.quote_currency OR
  NEW.quote_side IS NOT OLD.quote_side OR
  NEW.selection_mode IS NOT OLD.selection_mode OR
  NEW.max_age_seconds IS NOT OLD.max_age_seconds OR
  NEW.reason IS NOT OLD.reason OR
  NEW.created_by IS NOT OLD.created_by OR
  NEW.approved_by IS NOT OLD.approved_by OR
  NEW.approved_at IS NOT OLD.approved_at OR
  NEW.effective_at IS NOT OLD.effective_at OR
  NEW.created_at IS NOT OLD.created_at
)
BEGIN
  SELECT RAISE(ABORT, 'retiring an exchange-rate policy cannot rewrite its history');
END;
