-- 0008_no_policy_reactivation.sql
-- Retired financial policies are terminal historical versions; create a new version instead.
-- Local schema hardening only; no data is seeded or rewritten.

CREATE TRIGGER IF NOT EXISTS pricing_policies_no_reactivation
BEFORE UPDATE ON product_pricing_policies
WHEN OLD.status = 'retired' AND NEW.status = 'active'
BEGIN
  SELECT RAISE(ABORT, 'retired pricing policies cannot be reactivated; create a new version');
END;

CREATE TRIGGER IF NOT EXISTS exchange_rate_policies_no_reactivation
BEFORE UPDATE ON exchange_rate_policies
WHEN OLD.status = 'retired' AND NEW.status = 'active'
BEGIN
  SELECT RAISE(ABORT, 'retired exchange-rate policies cannot be reactivated; create a new version');
END;
