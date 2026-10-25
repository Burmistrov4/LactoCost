/**
 * Motor de precios auditable con margen sobre ingreso neto y redondeo explícito.
 * Opera en USD base y calcula conversiones en Bolívares (VES) según la tasa activa.
 * Basado en app/core/pricing.py
 */

import { PriceCalculationResult } from '../types';

export function roundToIncrement(amount: number, increment: number): number {
  if (increment <= 0) throw new RangeError('El incremento de redondeo debe ser mayor que cero.');
  const factor = 1 / increment;
  return Math.round((amount * factor) + Number.EPSILON) / factor;
}

export function calculateTargetPrice(
  unitCostUSD: number,
  targetMarginPercent: number,
  options: {
    variableFeeRatePercent?: number; // e.g. 5 for 5%
    fixedVariableCostUSD?: number; // e.g. $0.05
    taxRatePercent?: number; // e.g. 16 for 16%
    priceQuantum?: number; // e.g. 0.05 or 0.01
    exchangeRate?: number; // e.g. 991.16 for Euro BCV or 985.50 for Binance P2P
  } = {}
): PriceCalculationResult {
  const {
    variableFeeRatePercent = 0,
    fixedVariableCostUSD = 0,
    taxRatePercent = 0,
    priceQuantum = 0.05,
    exchangeRate = 991.16,
  } = options;

  if (unitCostUSD < 0) throw new RangeError('El costo unitario no puede ser negativo.');
  if (targetMarginPercent < 0 || targetMarginPercent >= 100) {
    throw new RangeError('El margen objetivo debe ser >= 0% y < 100%.');
  }
  if (variableFeeRatePercent < 0 || variableFeeRatePercent >= 100) {
    throw new RangeError('La tasa de comisión debe ser >= 0% y < 100%.');
  }
  if (fixedVariableCostUSD < 0) throw new RangeError('El costo variable fijo no puede ser negativo.');
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

  const rawPriceUSD = (unitCostUSD + fixedVariableCostUSD) / denominator;
  const netPriceUSD = roundToIncrement(rawPriceUSD, priceQuantum);
  const variableFeeUSD = roundToIncrement(netPriceUSD * feeRate, priceQuantum);
  const contributionUSD = roundToIncrement(
    netPriceUSD - unitCostUSD - fixedVariableCostUSD - variableFeeUSD,
    priceQuantum
  );
  const actualContributionMargin = netPriceUSD > 0 ? (contributionUSD / netPriceUSD) * 100 : 0;
  const customerPriceUSD = roundToIncrement(netPriceUSD * (1 + taxRate), priceQuantum);

  // Conversion to VES using active exchange rate
  const rate = exchangeRate > 0 ? exchangeRate : 1;
  const netPriceVES = Math.round((netPriceUSD * rate + Number.EPSILON) * 100) / 100;
  const customerPriceVES = Math.round((customerPriceUSD * rate + Number.EPSILON) * 100) / 100;
  const contributionVES = Math.round((contributionUSD * rate + Number.EPSILON) * 100) / 100;

  return {
    unitCostUSD,
    targetMargin: targetMarginPercent,
    variableFeeRate: variableFeeRatePercent,
    fixedVariableCostUSD,
    taxRate: taxRatePercent,
    priceQuantum,
    unroundedNetPriceUSD: rawPriceUSD,
    netPriceUSD,
    variableFeeUSD,
    contributionUSD,
    actualContributionMargin,
    customerPriceUSD,
    rateApplied: rate,
    netPriceVES,
    customerPriceVES,
    contributionVES,
  };
}
