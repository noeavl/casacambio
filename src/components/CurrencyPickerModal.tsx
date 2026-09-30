import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CURRENCY_CATALOG, currencyDisplayName } from '../data/currencies';
import { useLanguage } from '../state/LanguageContext';
import { useTheme } from '../state/ThemeContext';
import { type as type_, type Palette } from '../theme';
import { Screen } from './Screen';
import { Card, Muted } from './ui';

/**
 * Selector de divisa de pantalla completa a partir del catálogo curado,
 * excluyendo la moneda de caja y las divisas que ya tienen un tipo de
 * cambio registrado (salvo la que se está editando).
 */
export function CurrencyPickerModal({
  visible,
  excludeCodes,
  onClose,
  onSelect,
}: {
  visible: boolean;
  excludeCodes: string[];
  onClose: () => void;
  onSelect: (entry: { code: string; name: string }) => void;
}) {
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const excluded = useMemo(() => new Set(excludeCodes.map((c) => c.toUpperCase())), [excludeCodes]);
  const available = useMemo(
    () => CURRENCY_CATALOG.filter((entry) => !excluded.has(entry.code)),
    [excluded],
  );

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Screen title={t('rates.selectCurrencyTitle')} onBack={onClose}>
        {available.length === 0 ? (
          <Muted style={styles.empty}>{t('rates.selectCurrencyEmpty')}</Muted>
        ) : (
          available.map((entry) => (
            <Pressable
              key={entry.code}
              onPress={() => onSelect({ code: entry.code, name: currencyDisplayName(entry, language) })}
              accessibilityRole="button"
            >
              <Card style={styles.row}>
                <Text style={styles.code}>{entry.code}</Text>
                <Text style={styles.name}>{currencyDisplayName(entry, language)}</Text>
              </Card>
            </Pressable>
          ))
        )}
      </Screen>
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    row: { gap: 2 },
    code: { fontSize: 16, fontWeight: '500', color: colors.text, letterSpacing: 1 },
    name: { ...type_.small, color: colors.textMuted },
    empty: { textAlign: 'center' },
  });
}
