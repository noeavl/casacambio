import type { Customer, ExchangeRate, Operation, OperationType, Settings } from '../types';
import { quote } from '../utils/exchange';
import { buildFolio, uid } from '../utils/format';

/**
 * Datos de ejemplo (mocks) para que la app no se vea vacía en una
 * instalación nueva, mientras no hay una API/backend real de donde traer
 * información. Todo lo relacionado a estos datos vive aquí, aislado de la
 * lógica real de la app, para poder quitarlo fácilmente el día que haya
 * un backend.
 */

const DEMO_CUSTOMERS: Omit<Customer, 'id' | 'createdAt'>[] = [
  { name: 'Juan Pérez García', phone: '55 1234 5678', document: 'INE', notes: '' },
  { name: 'María López Hernández', phone: '55 2345 6789', document: 'INE', notes: '' },
  { name: 'Carlos Ramírez Torres', phone: '55 3456 7890', document: 'Pasaporte', notes: '' },
  { name: 'Ana Sánchez Flores', phone: '55 4567 8901', document: 'INE', notes: '' },
  { name: 'Roberto Díaz Morales', phone: '55 5678 9012', document: '', notes: 'Cliente frecuente' },
];

export interface DemoData {
  customers: Customer[];
  operations: Operation[];
  nextFolio: number;
}

/**
 * Genera clientes y operaciones de ejemplo repartidos en los últimos 30
 * días. `operatorName` es el nombre a usar como operador de las
 * operaciones generadas (normalmente el del usuario admin por defecto).
 */
export function buildDemoData(rates: ExchangeRate[], settings: Settings, operatorName: string): DemoData {
  const activeRates = rates.filter((r) => r.active);
  if (activeRates.length === 0) {
    return { customers: [], operations: [], nextFolio: settings.nextFolio };
  }

  const customers: Customer[] = DEMO_CUSTOMERS.map((c) => ({
    ...c,
    id: uid('cus'),
    createdAt: new Date().toISOString(),
  }));

  const now = new Date();
  const operations: Operation[] = [];
  let folioSeq = settings.nextFolio;

  for (let dayOffset = 29; dayOffset >= 0; dayOffset -= 1) {
    const opsToday = dayOffset < 7 ? 1 + Math.floor(Math.random() * 3) : Math.random() < 0.5 ? 1 : 0;
    for (let i = 0; i < opsToday; i += 1) {
      const rate = activeRates[Math.floor(Math.random() * activeRates.length)];
      const type: OperationType = Math.random() < 0.5 ? 'BUY' : 'SELL';
      const foreignAmount = Math.round((50 + Math.random() * 1500) * 100) / 100;
      const result = quote({
        type,
        rate,
        amount: foreignAmount,
        mode: 'FOREIGN',
        commissionPercent: settings.commissionPercent,
        decimals: settings.decimals,
      });
      const customer = Math.random() < 0.6 ? customers[Math.floor(Math.random() * customers.length)] : null;

      const date = new Date(now);
      date.setDate(now.getDate() - dayOffset);
      date.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0, 0);

      operations.push({
        id: uid('op'),
        folio: buildFolio(settings.receiptPrefix, folioSeq),
        type,
        rateId: rate.id,
        currencyCode: rate.code,
        currencyName: rate.name,
        baseCurrency: settings.baseCurrency,
        rate: result.appliedRate,
        foreignAmount: result.foreignAmount,
        grossLocal: result.grossLocal,
        commissionPercent: settings.commissionPercent,
        commissionAmount: result.commissionAmount,
        netLocal: result.netLocal,
        operator: operatorName,
        customer: customer?.name ?? '',
        note: '',
        createdAt: date.toISOString(),
      });
      folioSeq += 1;
    }
  }

  return { customers, operations: operations.reverse(), nextFolio: folioSeq };
}
