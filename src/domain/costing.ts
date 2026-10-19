/**
 * Motor financiero determinista de costos.
 * Basado en app/core/costing.py
 */

export function roundHalfUp(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function weightedAverageCost(lots: Array<{ quantity: number; unitCost: number }>): number {
  let totalQty = 0;
  let totalValue = 0;

  for (const lot of lots) {
    if (lot.quantity < 0 || lot.unitCost < 0) {
      throw new RangeError('Cantidad y costo unitario no pueden ser negativos.');
    }
    totalQty += lot.quantity;
    totalValue += lot.quantity * lot.unitCost;
  }

  if (totalQty === 0) {
    throw new RangeError('No se puede calcular CPP con cantidad total cero.');
  }

  return totalValue / totalQty;
}

export interface MovingAverageResult {
  receiptValue: number;
  endingQuantity: number;
  endingValue: number;
  newAverageCost: number;
}

export function movingAverageReceipt(
  currentQuantity: number,
  currentUnitCost: number,
  receivedQuantity: number,
  invoiceAmount: number,
  attributableCharges: number = 0,
  discounts: number = 0
): MovingAverageResult {
  if (currentQuantity < 0) throw new RangeError('Existencia actual no puede ser negativa.');
  if (currentUnitCost < 0) throw new RangeError('CPP actual no puede ser negativo.');
  if (receivedQuantity <= 0) throw new RangeError('La cantidad recibida debe ser mayor que cero.');
  if (invoiceAmount < 0) throw new RangeError('El importe bruto no puede ser negativo.');
  if (attributableCharges < 0) throw new RangeError('Los cargos atribuibles no pueden ser negativos.');
  if (discounts < 0) throw new RangeError('El descuento no puede ser negativo.');
  if (discounts > invoiceAmount) throw new RangeError('El descuento no puede superar el importe bruto.');

  const receiptValue = invoiceAmount - discounts + attributableCharges;
  const endingQuantity = currentQuantity + receivedQuantity;
  const endingValue = currentQuantity * currentUnitCost + receiptValue;
  const newAverageCost = endingValue / endingQuantity;

  return {
    receiptValue: roundHalfUp(receiptValue, 4),
    endingQuantity: roundHalfUp(endingQuantity, 4),
    endingValue: roundHalfUp(endingValue, 4),
    newAverageCost: roundHalfUp(newAverageCost, 4),
  };
}

export function valueIssue(quantity: number, currentUnitCost: number): number {
  if (quantity < 0) throw new RangeError('Cantidad de salida no puede ser negativa.');
  if (currentUnitCost < 0) throw new RangeError('CPP vigente no puede ser negativo.');
  return roundHalfUp(quantity * currentUnitCost, 4);
}

export function usableUnitCost(
  purchaseCost: number,
  purchasedQuantity: number,
  usableQuantity: number
): number {
  if (purchaseCost < 0) throw new RangeError('Costo de compra no puede ser negativo.');
  if (purchasedQuantity <= 0) throw new RangeError('La cantidad comprada debe ser mayor que cero.');
  if (usableQuantity <= 0) throw new RangeError('La cantidad aprovechable debe ser mayor que cero.');
  if (usableQuantity > purchasedQuantity) {
    throw new RangeError('La cantidad aprovechable no puede superar la comprada.');
  }
  return roundHalfUp(purchaseCost / usableQuantity, 4);
}

export function batchUnitCost(totalBatchCost: number, saleableUnits: number): number {
  if (totalBatchCost < 0) throw new RangeError('Costo del lote no puede ser negativo.');
  if (saleableUnits <= 0) throw new RangeError('No hay unidades vendibles; no se puede dividir entre cero.');
  return roundHalfUp(totalBatchCost / saleableUnits, 4);
}

export function priceForMargin(variableUnitCost: number, targetMarginPercent: number): number {
  if (variableUnitCost < 0) throw new RangeError('Costo variable unitario no puede ser negativo.');
  if (targetMarginPercent < 0 || targetMarginPercent >= 100) {
    throw new RangeError('El margen debe ser >= 0 y < 100%.');
  }
  const marginDecimal = targetMarginPercent / 100;
  return roundHalfUp(variableUnitCost / (1 - marginDecimal), 2);
}

export function priceForMarkup(unitCost: number, markupPercent: number): number {
  if (unitCost < 0) throw new RangeError('Costo unitario no puede ser negativo.');
  if (markupPercent < 0) throw new RangeError('El markup no puede ser negativo.');
  return roundHalfUp(unitCost * (1 + markupPercent / 100), 2);
}

export function contribution(
  netUnitRevenue: number,
  variableUnitCost: number
): { contribution: number; contributionMargin: number } {
  if (netUnitRevenue < 0) throw new RangeError('Ingreso neto unitario no puede ser negativo.');
  if (variableUnitCost < 0) throw new RangeError('Costo variable unitario no puede ser negativo.');

  const amount = netUnitRevenue - variableUnitCost;
  const margin = netUnitRevenue > 0 ? (amount / netUnitRevenue) * 100 : 0;

  return {
    contribution: roundHalfUp(amount, 2),
    contributionMargin: roundHalfUp(margin, 2),
  };
}

export function suggestedPurchaseQuantity(
  demandDuringLeadTime: number,
  safetyStock: number,
  additionalCommittedDemand: number,
  usableStock: number,
  confirmedInbound: number
): number {
  const demand = Math.max(0, demandDuringLeadTime);
  const safety = Math.max(0, safetyStock);
  const committed = Math.max(0, additionalCommittedDemand);
  const stock = Math.max(0, usableStock);
  const inbound = Math.max(0, confirmedInbound);

  const needed = demand + safety + committed - stock - inbound;
  return Math.max(0, roundHalfUp(needed, 2));
}
