import type { AmountMode, ExchangeRate, OperationType } from '../types';

export interface QuoteInput {
  type: OperationType;
  rate: ExchangeRate;
  /** Monto capturado, interpretado según `mode`. */
  amount: number;
  mode: AmountMode;
  commissionPercent: number;
  decimals: number;
}

export interface Quote {
  /** Tipo de cambio aplicado: compra para COMPRA, venta para VENTA. */
  appliedRate: number;
  foreignAmount: number;
  grossLocal: number;
  commissionAmount: number;
  /** Local a entregar (VENTA) o a pagar (COMPRA), ya con comisión. */
  netLocal: number;
}

function round(value: number, decimals: number): number {
  const factor = 10 ** Math.max(0, Math.min(6, decimals));
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Calcula una operación de cambio.
 *
 * COMPRA: la casa compra divisa al cliente. El cliente entrega `foreignAmount`
 * y recibe `netLocal` (bruto menos comisión).
 * VENTA: la casa vende divisa al cliente. El cliente recibe `foreignAmount`
 * y paga `netLocal` (bruto más comisión).
 */
export function quote({
  type,
  rate,
  amount,
  mode,
  commissionPercent,
  decimals,
}: QuoteInput): Quote {
  const appliedRate = type === 'BUY' ? rate.buy : rate.sell;
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;

  if (!Number.isFinite(appliedRate) || appliedRate <= 0) {
    return { appliedRate: 0, foreignAmount: 0, grossLocal: 0, commissionAmount: 0, netLocal: 0 };
  }

  const foreignAmount = mode === 'FOREIGN' ? safeAmount : safeAmount / appliedRate;
  const grossLocal = mode === 'FOREIGN' ? safeAmount * appliedRate : safeAmount;

  const pct = Number.isFinite(commissionPercent) ? Math.max(0, commissionPercent) : 0;
  const commissionAmount = (grossLocal * pct) / 100;
  const netLocal = type === 'BUY' ? grossLocal - commissionAmount : grossLocal + commissionAmount;

  return {
    appliedRate,
    foreignAmount: round(foreignAmount, decimals),
    grossLocal: round(grossLocal, decimals),
    commissionAmount: round(commissionAmount, decimals),
    netLocal: round(netLocal, decimals),
  };
}

export const operationLabel = (type: OperationType): string =>
  type === 'BUY' ? 'Compra' : 'Venta';
