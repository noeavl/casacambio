import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../state/ThemeContext';
import { spacing, type as type_, type Palette } from '../theme';

export type TabKey = 'operar' | 'tipos' | 'historial' | 'ajustes';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'operar', label: 'Operar' },
  { key: 'tipos', label: 'Tipos' },
  { key: 'historial', label: 'Historial' },
  { key: 'ajustes', label: 'Ajustes' },
];

export function TabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            onPress={() => onChange(tab.key)}
            style={styles.tab}
          >
            <View style={[styles.dot, isActive && styles.dotActive]} />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label.toUpperCase()}
            </Text>
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
