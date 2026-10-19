/**
 * Conversión segura de micro-unidades monetarias y de masa/volumen.
 * 1 unidad = 1_000_000 micro-unidades.
 * Basado en app/core/storage_units.py
 */

export const MICRO_SCALE = 1_000_000n;

export function toMicroUnits(value: number | string, allowNegative: boolean = false): bigint {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(num)) throw new TypeError('El valor debe ser un número finito.');
  if (!allowNegative && num < 0) throw new RangeError('El valor no puede ser negativo.');

  // Scale with 6 decimals safely
  const scaled = Math.round(num * 1_000_000);
  return BigInt(scaled);
}

export function fromMicroUnits(microValue: bigint | number): number {
  const big = typeof microValue === 'number' ? BigInt(microValue) : microValue;
  return Number(big) / 1_000_000;
}

export function extendedCostMicro(quantityMicro: bigint, unitCostMicro: bigint): bigint {
  if (quantityMicro < 0n || unitCostMicro < 0n) {
    throw new RangeError('Cantidad y costo no pueden ser negativos.');
  }
  // (quantityMicro * unitCostMicro + 500_000n) / 1_000_000n with round-half-up
  return (quantityMicro * unitCostMicro + 500_000n) / MICRO_SCALE;
}
