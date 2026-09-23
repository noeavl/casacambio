import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { darkColors, lightColors, type Palette } from '../theme';

const THEME_KEY = '@casacambio/theme-preference';

/** Tema resuelto que efectivamente se pinta en pantalla. */
export type ThemeName = 'light' | 'dark';

/** Preferencia guardada por el usuario: puede seguir al sistema operativo. */
export type ThemePreference = ThemeName | 'system';

interface ThemeContextValue {
  /** Tema ya resuelto ('system' se convierte en 'light' o 'dark'). */
  scheme: ThemeName;
  /** Lo que el usuario eligió en Ajustes. */
  preference: ThemePreference;
  colors: Palette;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isPreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(THEME_KEY)
      .then((raw) => {
        if (alive && isPreference(raw)) setPreferenceState(raw);
      })
      .catch(() => {
        // Sin preferencia guardada: se queda en 'system'.
      });
    return () => {
      alive = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void AsyncStorage.setItem(THEME_KEY, next).catch(() => {
      // Falla la escritura local: la sesión en memoria sigue siendo válida.
    });
  }, []);

  const scheme: ThemeName = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  const colors = scheme === 'dark' ? darkColors : lightColors;

  const value = useMemo<ThemeContextValue>(
    () => ({ scheme, preference, colors, setPreference }),
    [scheme, preference, colors, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}
