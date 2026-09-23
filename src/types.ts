/** Parámetros de inicio de la casa de cambio. */
export interface Settings {
  /** Nombre comercial que encabeza los recibos. */
  businessName: string;
  /** Sucursal o punto de venta. */
  branch: string;
  /** RFC / RUC / NIT. */
  taxId: string;
  address: string;
  phone: string;
  /** Operador o cajero por defecto. */
  operator: string;
  /** Moneda de caja (moneda local con la que se liquida). */
  baseCurrency: string;
  /** Prefijo del folio de recibo, ej. "REC". */
  receiptPrefix: string;
  /** Siguiente folio consecutivo. */
  nextFolio: number;
  /** Comisión por operación, en porcentaje sobre el monto en moneda local. */
  commissionPercent: number;
  /** Decimales usados para mostrar importes. */
  decimals: number;
  /** Leyenda al pie del recibo. */
  receiptFooter: string;
  /** true cuando ya se completó la configuración inicial. */
  configured: boolean;
}

/** Tipo de cambio configurable: una divisa con su precio de compra y de venta. */
export interface ExchangeRate {
  id: string;
  /** Código ISO de la divisa, ej. "USD". */
  code: string;
  /** Nombre descriptivo, ej. "Dólar estadounidense". */
  name: string;
  /** Precio al que la casa COMPRA una unidad de la divisa. */
  buy: number;
  /** Precio al que la casa VENDE una unidad de la divisa. */
  sell: number;
  active: boolean;
  updatedAt: string;
}

/**
 * COMPRA: el cliente entrega divisa y recibe moneda local.
 * VENTA:  el cliente recibe divisa y entrega moneda local.
 */
export type OperationType = 'BUY' | 'SELL';

/** El monto capturado puede expresarse en divisa o en moneda local. */
export type AmountMode = 'FOREIGN' | 'LOCAL';

export interface Operation {
  id: string;
  folio: string;
  type: OperationType;
  rateId: string;
  currencyCode: string;
  currencyName: string;
  baseCurrency: string;
  /** Tipo de cambio aplicado (compra o venta según el tipo de operación). */
  rate: number;
  /** Monto en divisa. */
  foreignAmount: number;
  /** Monto en moneda local antes de comisión. */
  grossLocal: number;
  commissionPercent: number;
  commissionAmount: number;
  /** Monto en moneda local que efectivamente se paga o se cobra. */
  netLocal: number;
  operator: string;
  customer: string;
  note: string;
  createdAt: string;
}
