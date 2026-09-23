import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ExchangeRate, Operation, Settings } from './types';
import { uid } from './utils/format';

const KEYS = {
  settings: '@casacambio/settings',
  rates: '@casacambio/rates',
  operations: '@casacambio/operations',
} as const;

export const defaultSettings: Settings = {
  businessName: 'Casa de Cambio',
  branch: 'Matriz',
  taxId: '',
  address: '',
  phone: '',
  operator: '',
  baseCurrency: 'MXN',
  receiptPrefix: 'REC',
  nextFolio: 1,
  commissionPercent: 0,
  decimals: 2,
  receiptFooter: 'Gracias por su preferencia.',
  configured: false,
};

export function defaultRates(): ExchangeRate[] {
  const now = new Date().toISOString();
  return [
    { id: uid('rate'), code: 'USD', name: 'Dólar estadounidense', buy: 17.1, sell: 17.9, active: true, updatedAt: now },
    { id: uid('rate'), code: 'EUR', name: 'Euro', buy: 18.4, sell: 19.3, active: true, updatedAt: now },
  ];
}

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Escritura local sin red: si falla, la sesión en memoria sigue siendo válida.
  }
}

export const storage = {
  loadSettings: () => readJSON<Settings>(KEYS.settings, defaultSettings).then((s) => ({ ...defaultSettings, ...s })),
  saveSettings: (settings: Settings) => writeJSON(KEYS.settings, settings),

  loadRates: () => readJSON<ExchangeRate[]>(KEYS.rates, []),
  saveRates: (rates: ExchangeRate[]) => writeJSON(KEYS.rates, rates),

  loadOperations: () => readJSON<Operation[]>(KEYS.operations, []),
  saveOperations: (operations: Operation[]) => writeJSON(KEYS.operations, operations),

  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove([KEYS.settings, KEYS.rates, KEYS.operations]);
    } catch {
      // ignorado a propósito
    }
  },
};
