/**
 * Motor de precios auditable con margen sobre ingreso neto y redondeo explícito.
 * Basado en app/core/pricing.py
 */

import { PriceCalculationResult } from '../types';

export function roundToIncrement(amount: number, increment: number): number {
  if (increment <= 0) throw new RangeError('El incremento de redondeo debe ser mayor que cero.');
  const factor = 1 / increment;
  return Math.round((amount * factor) + Number.EPSILON) / factor;
}

export function calculateTargetPrice(
  unitCost: number,
  targetMarginPercent: number,
  options: {
    variableFeeRatePercent?: number; // e.g. 5 for 5%
    fixedVariableCost?: number; // e.g. Bs. 50
    taxRatePercent?: number; // e.g. 16 for 16%
    priceQuantum?: number; // e.g. 0.01 or 0.05
  } = {}
): PriceCalculationResult {
  const {
    variableFeeRatePercent = 0,
    fixedVariableCost = 0,
    taxRatePercent = 0,
    priceQuantum = 0.01,
  } = options;

  if (unitCost < 0) throw new RangeError('Costo unitario no puede ser negativo.');
  if (targetMarginPercent < 0 || targetMarginPercent >= 100) {
    throw new RangeError('El margen objetivo debe ser >= 0% y < 100%.');
  }
  if (variableFeeRatePercent < 0 || variableFeeRatePercent >= 100) {
    throw new RangeError('La tasa de comisión debe ser >= 0% y < 100%.');
  }
  if (fixedVariableCost < 0) throw new RangeError('El costo variable fijo no puede ser negativo.');
  if (taxRatePercent < 0 || taxRatePercent > 100) {
    throw new RangeError('La tasa de impuesto debe ser >= 0% y <= 100%.');
  }
  if (priceQuantum <= 0) throw new RangeError('El incremento de redondeo debe ser mayor que cero.');

  const margin = targetMarginPercent / 100;
  const feeRate = variableFeeRatePercent / 100;
  const taxRate = taxRatePercent / 100;

  const denominator = 1 - margin - feeRate;
  if (denominator <= 0) {
    throw new RangeError('Margen objetivo más comisión porcentual debe ser menor que 100%.');
  }

  const rawPrice = (unitCost + fixedVariableCost) / denominator;
  const netPrice = roundToIncrement(rawPrice, priceQuantum);
  const variableFee = roundToIncrement(netPrice * feeRate, priceQuantum);
  const contribution = roundToIncrement(netPrice - unitCost - fixedVariableCost - variableFee, priceQuantum);
  const actualContributionMargin = netPrice > 0 ? (contribution / netPrice) * 100 : 0;
  const customerPrice = roundToIncrement(netPrice * (1 + taxRate), priceQuantum);

  return {
    unitCost,
    targetMargin: targetMarginPercent,
    variableFeeRate: variableFeeRatePercent,
    fixedVariableCost,
    taxRate: taxRatePercent,
    priceQuantum,
    unroundedNetPrice: rawPrice,
    netPrice,
    variableFee,
    contribution,
    actualContributionMargin,
    customerPrice,
  };
}
