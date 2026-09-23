import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocales } from 'expo-localization';

import { dictionaries, translate, type TranslationKey, type TranslationVars } from '../i18n/dictionaries';

const LANGUAGE_KEY = '@casacambio/language-preference';

/** Idioma ya resuelto que efectivamente se pinta en pantalla. */
export type Language = 'es' | 'en';

/** Preferencia guardada por el usuario: puede seguir al idioma del dispositivo. */
export type LanguagePreference = Language | 'system';

interface LanguageContextValue {
  language: Language;
  preference: LanguagePreference;
  setPreference: (preference: LanguagePreference) => void;
  t: (key: TranslationKey, vars?: TranslationVars) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isPreference(value: unknown): value is LanguagePreference {
  return value === 'es' || value === 'en' || value === 'system';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const systemLocales = useLocales();
  const [preference, setPreferenceState] = useState<LanguagePreference>('system');

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((raw) => {
        if (alive && isPreference(raw)) setPreferenceState(raw);
      })
      .catch(() => {
        // Sin preferencia guardada: se queda siguiendo al sistema.
      });
    return () => {
      alive = false;
    };
  }, []);

  const setPreference = useCallback((next: LanguagePreference) => {
    setPreferenceState(next);
    void AsyncStorage.setItem(LANGUAGE_KEY, next).catch(() => {
      // Falla la escritura local: la sesión en memoria sigue siendo válida.
    });
  }, []);

  const systemLanguage: Language = systemLocales[0]?.languageCode === 'en' ? 'en' : 'es';
  const language: Language = preference === 'system' ? systemLanguage : preference;
  const dict = dictionaries[language];

  const t = useCallback(
    (key: TranslationKey, vars?: TranslationVars) => translate(dict, key, vars),
    [dict],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, preference, setPreference, t }),
    [language, preference, setPreference, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage debe usarse dentro de <LanguageProvider>');
  return ctx;
}
