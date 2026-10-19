const POSITIVE_MOVEMENTS = new Set(["receipt", "production_output", "return", "transfer_in"]);
const NEGATIVE_MOVEMENTS = new Set(["production_consumption", "sale", "waste", "transfer_out"]);
const NEUTRAL_MOVEMENTS = new Set(["opening_balance", "count_adjustment", "reversal"]);
const ALLOWED_MOVEMENTS = new Set([...POSITIVE_MOVEMENTS, ...NEGATIVE_MOVEMENTS, ...NEUTRAL_MOVEMENTS]);

function requiredText(name, value, maxLength = 200) {
  if (typeof value !== "string" || value.trim().length === 0 || value.trim().length > maxLength) {
    throw new TypeError(`${name}_invalid`);
  }
  return value.trim();
}

function positiveSafeInteger(name, value, allowZero = false) {
  if (!Number.isSafeInteger(value) || (allowZero ? value < 0 : value <= 0)) {
    throw new TypeError(`${name}_invalid`);
  }
  return value;
}

/**
 * Validate and normalize a movement command before any database operation.
 * Cost is always expressed in the ingredient's configured valuation currency.
 * Foreign-currency source amounts require a persisted exchange-rate application.
 * This function performs no I/O and must not be treated as authorization.
 */
export function normalizeInventoryMovementCommand(input, context = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("command_invalid");
  }

  const id = requiredText("movement_id", input.id, 128);
  const ingredientId = requiredText("ingredient_id", input.ingredientId, 128);
  const locationId = requiredText("location_id", input.locationId, 128);
  const actorId = requiredText("actor_id", context.actorId, 128);
  const idempotencyKey = requiredText("idempotency_key", input.idempotencyKey, 128);
  const reason = requiredText("reason", input.reason, 1000);
  const movementType = requiredText("movement_type", input.movementType, 40);
  if (!ALLOWED_MOVEMENTS.has(movementType)) throw new TypeError("movement_type_invalid");

  const quantityDeltaMicros = input.quantityDeltaMicros;
  if (!Number.isSafeInteger(quantityDeltaMicros) || quantityDeltaMicros === 0) {
    throw new TypeError("quantity_delta_invalid");
  }
  if (POSITIVE_MOVEMENTS.has(movementType) && quantityDeltaMicros < 0) {
    throw new TypeError("movement_quantity_sign_invalid");
  }
  if (NEGATIVE_MOVEMENTS.has(movementType) && quantityDeltaMicros > 0) {
    throw new TypeError("movement_quantity_sign_invalid");
  }
  if (NEUTRAL_MOVEMENTS.has(movementType) && quantityDeltaMicros === 0) {
    throw new TypeError("movement_quantity_sign_invalid");
  }

  const unitCostMicros = positiveSafeInteger("unit_cost_micros", input.unitCostMicros, true);
  const totalCostMicros = positiveSafeInteger("total_cost_micros", input.totalCostMicros, true);
  const absoluteQuantity = BigInt(Math.abs(quantityDeltaMicros));
  const expectedTotalCost = (absoluteQuantity * BigInt(unitCostMicros) + 500000n) / 1000000n;
  if (expectedTotalCost !== BigInt(totalCostMicros)) throw new TypeError("total_cost_inconsistent");
  const currencyCode = requiredText("currency_code", input.currencyCode, 3).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currencyCode)) throw new TypeError("currency_code_invalid");
  const valuationCurrency = requiredText("valuation_currency", context.valuationCurrency, 3).toUpperCase();
  if (currencyCode !== valuationCurrency) throw new TypeError("valuation_currency_mismatch");

  const sourceCurrency = requiredText("source_currency", input.sourceCurrencyCode || currencyCode, 3).toUpperCase();
  if (!/^[A-Z]{3}$/.test(sourceCurrency)) throw new TypeError("source_currency_invalid");
  const exchangeRateApplicationId = input.exchangeRateApplicationId == null
    ? null
    : requiredText("exchange_rate_application_id", input.exchangeRateApplicationId, 128);
  if (sourceCurrency !== currencyCode && !exchangeRateApplicationId) {
    throw new TypeError("exchange_rate_application_required");
  }
  if (sourceCurrency === currencyCode && exchangeRateApplicationId) {
    throw new TypeError("unnecessary_exchange_rate_application");
  }

  const lotId = input.lotId == null ? null : requiredText("lot_id", input.lotId, 128);
  const referenceType = input.referenceType == null ? null : requiredText("reference_type", input.referenceType, 80);
  const referenceId = input.referenceId == null ? null : requiredText("reference_id", input.referenceId, 128);
  const reversesMovementId = input.reversesMovementId == null ? null : requiredText("reverses_movement_id", input.reversesMovementId, 128);
  if ((movementType === "reversal") !== Boolean(reversesMovementId)) {
    throw new TypeError("reversal_reference_invalid");
  }
  if ((referenceType == null) !== (referenceId == null)) {
    throw new TypeError("reference_pair_invalid");
  }

  const occurredAt = requiredText("occurred_at", input.occurredAt || context.now, 40);
  if (!Number.isFinite(Date.parse(occurredAt))) throw new TypeError("occurred_at_invalid");

  return Object.freeze({
    id, ingredientId, lotId, locationId, movementType, quantityDeltaMicros,
    unitCostMicros, totalCostMicros, currencyCode, occurredAt,
    referenceType, referenceId, idempotencyKey, reversesMovementId,
    actorId, reason, sourceCurrencyCode: sourceCurrency, exchangeRateApplicationId,
  });
}
