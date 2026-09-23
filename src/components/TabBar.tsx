import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLanguage } from '../state/LanguageContext';
import { useTheme } from '../state/ThemeContext';
import { spacing, type as type_, type Palette } from '../theme';

export type TabKey = 'operar' | 'tipos' | 'historial' | 'ajustes';

const TAB_KEYS: TabKey[] = ['operar', 'tipos', 'historial', 'ajustes'];

export function TabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
}) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      {TAB_KEYS.map((key) => {
        const isActive = key === active;
        const label = t(`tabs.${key}`);
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
            onPress={() => onChange(key)}
            style={styles.tab}
          >
            <View style={[styles.dot, isActive && styles.dotActive]} />
            <Text style={[styles.label, isActive && styles.labelActive]}>{label.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: colors.bg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingTop: spacing.md,
      paddingHorizontal: spacing.md,
    },
    tab: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 2 },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: 'transparent',
    },
    dotActive: { backgroundColor: colors.accent },
    label: { ...type_.tiny, color: colors.textDim, fontSize: 10 },
    labelActive: { color: colors.text },
  });
}
