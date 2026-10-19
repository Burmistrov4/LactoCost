-- 0006_exchange_rates.sql
-- Exchange-rate evidence and independent policies for cost and sale-price conversion.
-- Schema only: no live rates, credentials or business data are seeded.

CREATE TABLE IF NOT EXISTS exchange_rate_observations (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('bcv','binance_p2p','manual')),
  base_currency TEXT NOT NULL CHECK (length(base_currency) BETWEEN 3 AND 5),
  quote_currency TEXT NOT NULL CHECK (length(quote_currency) = 3),
  rate_decimal TEXT NOT NULL,
  quote_side TEXT NOT NULL CHECK (quote_side IN ('official','usdt_buy','usdt_sell','p2p_mean','manual')),
  observation_kind TEXT NOT NULL CHECK (observation_kind IN ('official_reference','p2p_offer_average','manual_entry')),
  observation_count INTEGER NOT NULL DEFAULT 1 CHECK (observation_count > 0),
  aggregation_method TEXT NOT NULL CHECK (aggregation_method IN ('official','arithmetic_mean','median','manual')),
  source_url TEXT NOT NULL,
  source_published_at TEXT,
  observed_at TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  freshness_status TEXT NOT NULL DEFAULT 'fresh'
    CHECK (freshness_status IN ('fresh','stale','suspect','unavailable')),
  payload_sha256 TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (base_currency <> quote_currency)
);

CREATE INDEX IF NOT EXISTS idx_exchange_observations_lookup
ON exchange_rate_observations(provider, base_currency, quote_currency, quote_side, observed_at DESC);

CREATE TRIGGER IF NOT EXISTS exchange_rate_observations_no_update
BEFORE UPDATE ON exchange_rate_observations
BEGIN
  SELECT RAISE(ABORT, 'exchange rate observations are immutable; insert a new observation');
END;

CREATE TRIGGER IF NOT EXISTS exchange_rate_observations_no_delete
BEFORE DELETE ON exchange_rate_observations
BEGIN
  SELECT RAISE(ABORT, 'exchange rate observations are immutable');
END;

-- scope_key = 'global' or 'product:<product_id>'. One active policy per purpose/scope.
CREATE TABLE IF NOT EXISTS exchange_rate_policies (
  id TEXT PRIMARY KEY,
  purpose TEXT NOT NULL CHECK (purpose IN ('cost_conversion','sale_pricing')),
  scope_key TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('bcv','binance_p2p','manual')),
  base_currency TEXT NOT NULL CHECK (length(base_currency) BETWEEN 3 AND 5),
  quote_currency TEXT NOT NULL CHECK (length(quote_currency) = 3),
  quote_side TEXT NOT NULL CHECK (quote_side IN ('official','usdt_buy','usdt_sell','p2p_mean','manual')),
  selection_mode TEXT NOT NULL CHECK (selection_mode IN ('latest_eligible','manual_observation')),
  max_age_seconds INTEGER NOT NULL CHECK (max_age_seconds > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','retired')),
  reason TEXT NOT NULL,
  created_by TEXT,
  approved_by TEXT,
  approved_at TEXT,
  effective_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (base_currency <> quote_currency),
  CHECK ((status = 'active' AND approved_by IS NOT NULL AND approved_at IS NOT NULL) OR status <> 'active')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_exchange_rate_policy_one_active
ON exchange_rate_policies(purpose, scope_key) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_exchange_rate_policy_lookup
ON exchange_rate_policies(purpose, scope_key, status, effective_at DESC);

CREATE TRIGGER IF NOT EXISTS exchange_rate_policies_active_immutable
BEFORE UPDATE ON exchange_rate_policies
WHEN OLD.status = 'active' AND NEW.status = 'active'
BEGIN
  SELECT RAISE(ABORT, 'active exchange-rate policies are immutable; create a new version');
END;

CREATE TRIGGER IF NOT EXISTS exchange_rate_policies_no_delete
BEFORE DELETE ON exchange_rate_policies
BEGIN
  SELECT RAISE(ABORT, 'exchange-rate policies are versioned; retire instead of deleting');
END;

CREATE TABLE IF NOT EXISTS exchange_rate_applications (
  id TEXT PRIMARY KEY,
  observation_id TEXT NOT NULL REFERENCES exchange_rate_observations(id),
  policy_id TEXT REFERENCES exchange_rate_policies(id),
  purpose TEXT NOT NULL CHECK (purpose IN ('cost_conversion','sale_pricing')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('supplier_quote','inventory_receipt','product_cost','price_snapshot','manual_scenario')),
  entity_id TEXT NOT NULL,
  original_amount_micros INTEGER NOT NULL CHECK (original_amount_micros >= 0),
  original_currency TEXT NOT NULL CHECK (length(original_currency) BETWEEN 3 AND 5),
  rate_decimal TEXT NOT NULL,
  converted_amount_micros INTEGER NOT NULL CHECK (converted_amount_micros >= 0),
  converted_currency TEXT NOT NULL CHECK (length(converted_currency) BETWEEN 3 AND 5),
  rounding_rule TEXT NOT NULL,
  applied_at TEXT NOT NULL,
  actor_id TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_exchange_applications_entity
ON exchange_rate_applications(entity_type, entity_id, applied_at DESC);

CREATE TRIGGER IF NOT EXISTS exchange_rate_applications_no_update
BEFORE UPDATE ON exchange_rate_applications
BEGIN
  SELECT RAISE(ABORT, 'exchange rate applications are immutable');
END;

CREATE TRIGGER IF NOT EXISTS exchange_rate_applications_no_delete
BEFORE DELETE ON exchange_rate_applications
BEGIN
  SELECT RAISE(ABORT, 'exchange rate applications are immutable');
END;
