import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { defaultRates, defaultSettings, storage } from '../storage';
import type { ExchangeRate, Operation, Settings } from '../types';
import { buildFolio, uid } from '../utils/format';

type NewOperation = Omit<Operation, 'id' | 'folio' | 'createdAt'>;

interface AppContextValue {
  ready: boolean;
  settings: Settings;
  rates: ExchangeRate[];
  operations: Operation[];
  updateSettings: (patch: Partial<Settings>) => void;
  completeSetup: (patch: Partial<Settings>) => void;
  addRate: (rate: Omit<ExchangeRate, 'id' | 'updatedAt'>) => void;
  updateRate: (id: string, patch: Partial<Omit<ExchangeRate, 'id'>>) => void;
  removeRate: (id: string) => void;
  registerOperation: (operation: NewOperation) => Operation;
  removeOperation: (id: string) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [loadedSettings, loadedRates, loadedOperations] = await Promise.all([
        storage.loadSettings(),
        storage.loadRates(),
        storage.loadOperations(),
      ]);
      if (!alive) return;
      setSettings(loadedSettings);
      setRates(loadedRates);
      setOperations(loadedOperations);
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((current) => {
        const next = { ...current, ...patch };
        void storage.saveSettings(next);
        return next;
      });
    },
    [],
  );

  const completeSetup = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((current) => {
        const next = { ...current, ...patch, configured: true };
        void storage.saveSettings(next);
        return next;
      });
      setRates((current) => {
        if (current.length > 0) return current;
        const seeded = defaultRates();
        void storage.saveRates(seeded);
        return seeded;
      });
    },
    [],
  );

  const addRate = useCallback(
    (rate: Omit<ExchangeRate, 'id' | 'updatedAt'>) => {
      setRates((current) => {
        const next = [
          ...current,
          { ...rate, id: uid('rate'), updatedAt: new Date().toISOString() },
        ];
        void storage.saveRates(next);
        return next;
      });
    },
    [],
  );

  const updateRate = useCallback(
    (id: string, patch: Partial<Omit<ExchangeRate, 'id'>>) => {
      setRates((current) => {
        const next = current.map((rate) =>
          rate.id === id ? { ...rate, ...patch, updatedAt: new Date().toISOString() } : rate,
        );
        void storage.saveRates(next);
        return next;
      });
    },
    [],
  );

  const removeRate = useCallback((id: string) => {
    setRates((current) => {
      const next = current.filter((rate) => rate.id !== id);
      void storage.saveRates(next);
      return next;
    });
  }, []);

  const registerOperation = useCallback(
    (operation: NewOperation): Operation => {
      const folio = buildFolio(settings.receiptPrefix, settings.nextFolio);
      const record: Operation = {
        ...operation,
        id: uid('op'),
        folio,
        createdAt: new Date().toISOString(),
      };
      setOperations((current) => {
        const next = [record, ...current];
        void storage.saveOperations(next);
        return next;
      });
      updateSettings({ nextFolio: settings.nextFolio + 1 });
      return record;
    },
    [settings.nextFolio, settings.receiptPrefix, updateSettings],
  );

  const removeOperation = useCallback((id: string) => {
    setOperations((current) => {
      const next = current.filter((op) => op.id !== id);
      void storage.saveOperations(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    void storage.clearAll();
    setSettings(defaultSettings);
    setRates([]);
    setOperations([]);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      settings,
      rates,
      operations,
      updateSettings,
      completeSetup,
      addRate,
      updateRate,
      removeRate,
      registerOperation,
      removeOperation,
      resetAll,
    }),
    [
      ready,
      settings,
      rates,
      operations,
      updateSettings,
      completeSetup,
      addRate,
      updateRate,
      removeRate,
      registerOperation,
      removeOperation,
      resetAll,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
