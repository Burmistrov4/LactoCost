import test from "node:test";
import assert from "node:assert/strict";
import { normalizeInventoryMovementCommand } from "../src/domain/inventory-command.js";

const context = { actorId: "actor-1", valuationCurrency: "VES", now: "2026-10-09T12:00:00Z" };
const valid = {
  id: "movement-1", ingredientId: "milk", locationId: "main", movementType: "receipt",
  quantityDeltaMicros: 1000000, unitCostMicros: 1250000, totalCostMicros: 1250000,
  currencyCode: "VES", idempotencyKey: "request-0001", reason: "Compra documentada",
};

test("normaliza un comando válido y fija actor/currency sin hacer I/O", () => {
  const result = normalizeInventoryMovementCommand(valid, context);
  assert.equal(result.actorId, "actor-1");
  assert.equal(result.currencyCode, "VES");
  assert.equal(result.sourceCurrencyCode, "VES");
  assert.equal(result.occurredAt, context.now);
  assert.ok(Object.isFrozen(result));
});

test("rechaza comando nulo, tipo desconocido y cantidad cero", () => {
  assert.throws(() => normalizeInventoryMovementCommand(null, context), /command_invalid/);
  assert.throws(() => normalizeInventoryMovementCommand({ ...valid, movementType: "invented" }, context), /movement_type_invalid/);
  assert.throws(() => normalizeInventoryMovementCommand({ ...valid, quantityDeltaMicros: 0 }, context), /quantity_delta_invalid/);
});

test("rechaza cantidades con signo incompatible con la clase de movimiento", () => {
  assert.throws(() => normalizeInventoryMovementCommand({ ...valid, quantityDeltaMicros: -1 }, context), /movement_quantity_sign_invalid/);
  assert.throws(() => normalizeInventoryMovementCommand({ ...valid, movementType: "sale", quantityDeltaMicros: 1 }, context), /movement_quantity_sign_invalid/);
});

test("rechaza flotantes, enteros inseguros, costos negativos y totales inconsistentes", () => {
  assert.throws(() => normalizeInventoryMovementCommand({ ...valid, quantityDeltaMicros: 1.2 }, context), /quantity_delta_invalid/);
  assert.throws(() => normalizeInventoryMovementCommand({ ...valid, quantityDeltaMicros: Number.MAX_SAFE_INTEGER + 1 }, context), /quantity_delta_invalid/);
  assert.throws(() => normalizeInventoryMovementCommand({ ...valid, unitCostMicros: -1 }, context), /unit_cost_micros_invalid/);
  assert.throws(() => normalizeInventoryMovementCommand({ ...valid, totalCostMicros: 7 }, context), /total_cost_inconsistent/);
});

test("exige actor y motivo, y no acepta valores sin formato", () => {
  assert.throws(() => normalizeInventoryMovementCommand(valid, { ...context, actorId: " " }), /actor_id_invalid/);
  assert.throws(() => normalizeInventoryMovementCommand({ ...valid, reason: "" }, context), /reason_invalid/);
  assert.throws(() => normalizeInventoryMovementCommand({ ...valid, currencyCode: "USDT" }, context), /currency_code_invalid/);
});

test("rechaza costos de valoración en una moneda distinta de la política", () => {
  assert.throws(() => normalizeInventoryMovementCommand({ ...valid, currencyCode: "USD" }, context), /valuation_currency_mismatch/);
});

test("una recepción de origen extranjero exige aplicación de tasa registrada", () => {
  assert.throws(() => normalizeInventoryMovementCommand({ ...valid, sourceCurrencyCode: "USD" }, context), /exchange_rate_application_required/);
  const result = normalizeInventoryMovementCommand({
    ...valid, sourceCurrencyCode: "USD", exchangeRateApplicationId: "rate-app-1",
  }, context);
  assert.equal(result.sourceCurrencyCode, "USD");
  assert.equal(result.exchangeRateApplicationId, "rate-app-1");
});

test("no permite referencia de tasa innecesaria ni reverso sin original", () => {
  assert.throws(() => normalizeInventoryMovementCommand({
    ...valid, exchangeRateApplicationId: "rate-app-1",
  }, context), /unnecessary_exchange_rate_application/);
  assert.throws(() => normalizeInventoryMovementCommand({
    ...valid, movementType: "reversal", quantityDeltaMicros: -1000000,
  }, context), /reversal_reference_invalid/);
});

test("exige referencia original en pares completos", () => {
  assert.throws(() => normalizeInventoryMovementCommand({
    ...valid, referenceType: "invoice",
  }, context), /reference_pair_invalid/);
});

test("rechaza fechas inválidas y campos de idempotencia vacíos", () => {
  assert.throws(() => normalizeInventoryMovementCommand({ ...valid, occurredAt: "yesterday-ish" }, context), /occurred_at_invalid/);
  assert.throws(() => normalizeInventoryMovementCommand({ ...valid, idempotencyKey: "" }, context), /idempotency_key_invalid/);
});
