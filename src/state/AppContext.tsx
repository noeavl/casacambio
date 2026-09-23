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
import type { AppUser, Customer, ExchangeRate, Operation, Settings } from '../types';
import { hashPassword, normalizeUsername } from '../utils/auth';
import { buildFolio, uid } from '../utils/format';

type NewOperation = Omit<Operation, 'id' | 'folio' | 'createdAt'>;
type NewUser = { username: string; password: string; name: string; role: AppUser['role'] };

interface AppContextValue {
  ready: boolean;
  settings: Settings;
  rates: ExchangeRate[];
  operations: Operation[];
  customers: Customer[];
  users: AppUser[];
  currentUser: AppUser | null;
  updateSettings: (patch: Partial<Settings>) => void;
  completeSetup: (patch: Partial<Settings>) => void;
  addRate: (rate: Omit<ExchangeRate, 'id' | 'updatedAt'>) => void;
  updateRate: (id: string, patch: Partial<Omit<ExchangeRate, 'id'>>) => void;
  removeRate: (id: string) => void;
  registerOperation: (operation: NewOperation) => Operation;
  removeOperation: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, patch: Partial<Omit<Customer, 'id'>>) => void;
  removeCustomer: (id: string) => void;
  /** Crea el primer usuario (admin) al terminar la configuración inicial e inicia su sesión. */
  createFirstAdmin: (user: NewUser) => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [loadedSettings, loadedRates, loadedOperations, loadedCustomers, loadedUsers, session] =
        await Promise.all([
          storage.loadSettings(),
          storage.loadRates(),
          storage.loadOperations(),
          storage.loadCustomers(),
          storage.loadUsers(),
          storage.loadSession(),
        ]);
      if (!alive) return;
      setSettings(loadedSettings);
      setRates(loadedRates);
      setOperations(loadedOperations);
      setCustomers(loadedCustomers);
      setUsers(loadedUsers);
      const sessionUser = loadedUsers.find((u) => u.id === session && u.active);
      setCurrentUserId(sessionUser ? sessionUser.id : null);
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      void storage.saveSettings(next);
      return next;
    });
  }, []);

  const completeSetup = useCallback((patch: Partial<Settings>) => {
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
  }, []);

  const addRate = useCallback((rate: Omit<ExchangeRate, 'id' | 'updatedAt'>) => {
    setRates((current) => {
      const next = [...current, { ...rate, id: uid('rate'), updatedAt: new Date().toISOString() }];
      void storage.saveRates(next);
      return next;
    });
  }, []);

  const updateRate = useCallback((id: string, patch: Partial<Omit<ExchangeRate, 'id'>>) => {
    setRates((current) => {
      const next = current.map((rate) =>
        rate.id === id ? { ...rate, ...patch, updatedAt: new Date().toISOString() } : rate,
      );
      void storage.saveRates(next);
      return next;
    });
  }, []);

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

  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const record: Customer = { ...customer, id: uid('cus'), createdAt: new Date().toISOString() };
    setCustomers((current) => {
      const next = [...current, record];
      void storage.saveCustomers(next);
      return next;
    });
    return record;
  }, []);

  const updateCustomer = useCallback((id: string, patch: Partial<Omit<Customer, 'id'>>) => {
    setCustomers((current) => {
      const next = current.map((customer) =>
        customer.id === id ? { ...customer, ...patch } : customer,
      );
      void storage.saveCustomers(next);
      return next;
    });
  }, []);

  const removeCustomer = useCallback((id: string) => {
    setCustomers((current) => {
      const next = current.filter((customer) => customer.id !== id);
      void storage.saveCustomers(next);
      return next;
    });
  }, []);

  const persistUsers = useCallback((next: AppUser[]) => {
    setUsers(next);
    void storage.saveUsers(next);
  }, []);

  const createFirstAdmin = useCallback(
    async (user: NewUser) => {
      const record: AppUser = {
        id: uid('usr'),
        username: normalizeUsername(user.username),
        passwordHash: await hashPassword(user.password),
        name: user.name,
        role: 'admin',
        active: true,
        createdAt: new Date().toISOString(),
      };
      persistUsers([record]);
      setCurrentUserId(record.id);
      void storage.saveSession(record.id);
    },
    [persistUsers],
  );

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      const normalized = normalizeUsername(username);
      const hash = await hashPassword(password);
      const match = users.find((u) => u.username === normalized && u.active);
      if (!match || match.passwordHash !== hash) return false;
      setCurrentUserId(match.id);
      void storage.saveSession(match.id);
      return true;
    },
    [users],
  );

  const logout = useCallback(() => {
    setCurrentUserId(null);
    void storage.saveSession(null);
  }, []);

  const resetAll = useCallback(() => {
    void storage.clearAll();
    setSettings(defaultSettings);
    setRates([]);
    setOperations([]);
    setCustomers([]);
    setUsers([]);
    setCurrentUserId(null);
  }, []);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      settings,
      rates,
      operations,
      customers,
      users,
      currentUser,
      updateSettings,
      completeSetup,
      addRate,
      updateRate,
      removeRate,
      registerOperation,
      removeOperation,
      addCustomer,
      updateCustomer,
      removeCustomer,
      createFirstAdmin,
      login,
      logout,
      resetAll,
    }),
    [
      ready,
      settings,
      rates,
      operations,
      customers,
      users,
      currentUser,
      updateSettings,
      completeSetup,
      addRate,
      updateRate,
      removeRate,
      registerOperation,
      removeOperation,
      addCustomer,
      updateCustomer,
      removeCustomer,
      createFirstAdmin,
      login,
      logout,
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
