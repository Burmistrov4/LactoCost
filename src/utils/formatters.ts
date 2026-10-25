import { DisplayCurrencyMode } from '../types';

export function moneyUSD(value: number): string {
  if (!Number.isFinite(value)) return '$ 0.00';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `$ ${formatted}`;
}

export function moneyVES(value: number): string {
  if (!Number.isFinite(value)) return 'Bs. 0,00';
  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `Bs. ${formatted}`;
}

export function moneyDual(
  valueUSD: number,
  rate: number,
  mode: DisplayCurrencyMode = 'BOTH'
): string {
  const usd = moneyUSD(valueUSD);
  const vesAmount = (valueUSD || 0) * (rate || 1);
  const ves = moneyVES(vesAmount);

  if (mode === 'USD') return usd;
  if (mode === 'VES') return ves;
  return `${usd} · ${ves}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  if (!Number.isFinite(value)) return '0.0%';
  return `${value.toFixed(decimals)}%`;
}

export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
