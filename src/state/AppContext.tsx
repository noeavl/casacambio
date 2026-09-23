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
import { hashPassword, normalizeEmail } from '../utils/auth';
import { buildFolio, uid } from '../utils/format';

type NewOperation = Omit<Operation, 'id' | 'folio' | 'createdAt'>;

/** Cuenta que se crea sola la primera vez que no hay ningún usuario. */
const DEFAULT_ADMIN = {
  email: 'admin@admin.admin',
  password: 'admin',
  firstName: 'Admin',
  lastName: '',
} as const;

/**
 * Carga lo guardado y rellena con valores por defecto lo que falte (ajustes,
 * tipos de cambio, usuario admin), sin ninguna pantalla de onboarding.
 * Se usa al arrancar la app y también tras "Restablecer aplicación".
 */
async function loadAndBootstrap() {
  const [loadedSettings, loadedRates, loadedOperations, loadedCustomers, loadedUsers, session] =
    await Promise.all([
      storage.loadSettings(),
      storage.loadRates(),
      storage.loadOperations(),
      storage.loadCustomers(),
      storage.loadUsers(),
      storage.loadSession(),
    ]);

  let settings = loadedSettings;
  if (!settings.configured) {
    settings = { ...settings, configured: true };
    void storage.saveSettings(settings);
  }

  let rates = loadedRates;
  if (rates.length === 0) {
    rates = defaultRates();
    void storage.saveRates(rates);
  }

  let users = loadedUsers;
  if (users.length === 0) {
    const admin: AppUser = {
      id: uid('usr'),
      email: normalizeEmail(DEFAULT_ADMIN.email),
      passwordHash: await hashPassword(DEFAULT_ADMIN.password),
      firstName: DEFAULT_ADMIN.firstName,
      lastName: DEFAULT_ADMIN.lastName,
      role: 'admin',
      active: true,
      createdAt: new Date().toISOString(),
    };
    users = [admin];
    void storage.saveUsers(users);
  }

  const sessionUser = users.find((u) => u.id === session && u.active);
  return {
    settings,
    rates,
    operations: loadedOperations,
    customers: loadedCustomers,
    users,
    currentUserId: sessionUser ? sessionUser.id : null,
  };
}

interface AppContextValue {
  ready: boolean;
  settings: Settings;
  rates: ExchangeRate[];
  operations: Operation[];
  customers: Customer[];
  users: AppUser[];
  currentUser: AppUser | null;
  updateSettings: (patch: Partial<Settings>) => void;
  addRate: (rate: Omit<ExchangeRate, 'id' | 'updatedAt'>) => void;
  updateRate: (id: string, patch: Partial<Omit<ExchangeRate, 'id'>>) => void;
  removeRate: (id: string) => void;
  registerOperation: (operation: NewOperation) => Operation;
  removeOperation: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, patch: Partial<Omit<Customer, 'id'>>) => void;
  removeCustomer: (id: string) => void;
  /** Cambia nombre y apellido del usuario con la sesión iniciada. */
  updateProfile: (patch: { firstName: string; lastName: string }) => void;
  /** Cambia la contraseña del usuario con la sesión iniciada. */
  changePassword: (newPassword: string) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
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
      const state = await loadAndBootstrap();
      if (!alive) return;
      setSettings(state.settings);
      setRates(state.rates);
      setOperations(state.operations);
      setCustomers(state.customers);
      setUsers(state.users);
      setCurrentUserId(state.currentUserId);
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

  const updateProfile = useCallback(
    (patch: { firstName: string; lastName: string }) => {
      setUsers((current) => {
        const next = current.map((u) => (u.id === currentUserId ? { ...u, ...patch } : u));
        void storage.saveUsers(next);
        return next;
      });
    },
    [currentUserId],
  );

  const changePassword = useCallback(
    async (newPassword: string) => {
      const passwordHash = await hashPassword(newPassword);
      setUsers((current) => {
        const next = current.map((u) => (u.id === currentUserId ? { ...u, passwordHash } : u));
        void storage.saveUsers(next);
        return next;
      });
    },
    [currentUserId],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const normalized = normalizeEmail(email);
      const hash = await hashPassword(password);
      const match = users.find((u) => u.email === normalized && u.active);
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
    void (async () => {
      await storage.clearAll();
      const state = await loadAndBootstrap();
      setSettings(state.settings);
      setRates(state.rates);
      setOperations(state.operations);
      setCustomers(state.customers);
      setUsers(state.users);
      setCurrentUserId(state.currentUserId);
    })();
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
      addRate,
      updateRate,
      removeRate,
      registerOperation,
      removeOperation,
      addCustomer,
      updateCustomer,
      removeCustomer,
      updateProfile,
      changePassword,
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
      addRate,
      updateRate,
      removeRate,
      registerOperation,
      removeOperation,
      addCustomer,
      updateCustomer,
      removeCustomer,
      updateProfile,
      changePassword,
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
