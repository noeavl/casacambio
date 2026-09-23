import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountScreen } from '../screens/AccountScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useLanguage } from '../state/LanguageContext';
import { useTheme } from '../state/ThemeContext';
import { spacing, type as type_, type Palette } from '../theme';
import { Screen } from './Screen';
import { Card, Divider, MenuRow } from './ui';

export type TabKey = 'operar' | 'clientes' | 'tipos' | 'historial' | 'ajustes';

/**
 * Orden de todas las pestañas de la app. Para agregar una nueva, solo
 * súmala aquí (y su traducción en tabs.*): el TabBar decide solo cuáles
 * caben abajo y cuáles pasan al menú "Más".
 */
const ALL_TABS: TabKey[] = ['operar', 'clientes', 'tipos', 'historial', 'ajustes'];

/** Máximo de pestañas visibles a la vez, contando el botón "Más" si hace falta. */
const MAX_VISIBLE_TABS = 4;

type MoreSection = 'menu' | 'profile' | 'account';

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
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreSection, setMoreSection] = useState<MoreSection>('menu');

  const hasOverflow = ALL_TABS.length > MAX_VISIBLE_TABS;
  const primaryTabs = hasOverflow ? ALL_TABS.slice(0, MAX_VISIBLE_TABS - 1) : ALL_TABS;
  const overflowTabs = hasOverflow ? ALL_TABS.slice(MAX_VISIBLE_TABS - 1) : [];
  const isMoreActive = overflowTabs.includes(active);

  const select = (key: TabKey) => {
    onChange(key);
    setMoreOpen(false);
  };

  const openMore = () => {
    setMoreSection('menu');
    setMoreOpen(true);
  };

  const closeMore = () => setMoreOpen(false);
  const backToMenu = () => setMoreSection('menu');

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      {primaryTabs.map((key) => {
        const isActive = key === active;
        const label = t(`tabs.${key}`);
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
            onPress={() => select(key)}
            style={styles.tab}
          >
            <View style={[styles.dot, isActive && styles.dotActive]} />
            <Text style={[styles.label, isActive && styles.labelActive]}>{label.toUpperCase()}</Text>
          </Pressable>
        );
      })}

      {hasOverflow ? (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isMoreActive }}
          accessibilityLabel={t('common.more')}
          onPress={openMore}
          style={styles.tab}
        >
          <View style={[styles.dot, isMoreActive && styles.dotActive]} />
          <Text style={[styles.label, isMoreActive && styles.labelActive]}>
            {t('common.more').toUpperCase()}
          </Text>
        </Pressable>
      ) : null}

      <Modal
        visible={moreOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={moreSection === 'menu' ? closeMore : backToMenu}
      >
        {moreSection === 'profile' ? (
          <ProfileScreen onBack={backToMenu} />
        ) : moreSection === 'account' ? (
          <AccountScreen onBack={backToMenu} />
        ) : (
          <Screen title={t('common.more')} onBack={closeMore}>
            <Card style={styles.menuCard}>
              {overflowTabs.map((key, index) => (
                <View key={key}>
                  {index > 0 ? <Divider style={styles.rowDivider} /> : null}
                  <MenuRow label={t(`tabs.${key}`)} onPress={() => select(key)} />
                </View>
              ))}
            </Card>

            <Card style={styles.menuCard}>
              <MenuRow label={t('profile.title')} onPress={() => setMoreSection('profile')} />
              <Divider style={styles.rowDivider} />
              <MenuRow label={t('account.title')} onPress={() => setMoreSection('account')} />
            </Card>
          </Screen>
        )}
      </Modal>
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
      borderRadius: 0,
      backgroundColor: 'transparent',
    },
    dotActive: { backgroundColor: colors.accent },
    label: { ...type_.tiny, color: colors.textDim, fontSize: 10 },
    labelActive: { color: colors.text },
    menuCard: { padding: 0 },
    rowDivider: { marginVertical: 0, marginHorizontal: 0 },
  });
}
