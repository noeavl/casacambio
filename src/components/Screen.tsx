import { useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLanguage } from '../state/LanguageContext';
import { useTheme } from '../state/ThemeContext';
import { spacing, type as type_, type Palette } from '../theme';

export function Screen({
  title,
  subtitle,
  right,
  onBack,
  children,
  scroll = true,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  /** Si se pasa, muestra un botón de regreso arriba del título. */
  onBack?: () => void;
  children: ReactNode;
  scroll?: boolean;
}) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          hitSlop={8}
          style={styles.back}
        >
          <Text style={styles.backLabel}>‹ {t('common.back')}</Text>
        </Pressable>
      ) : null}
      <View style={styles.titleRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={styles.headerRight}>{right}</View> : null}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {header}
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.content]}>{children}</View>
      )}
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    flex: { flex: 1 },
    header: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.lg,
      gap: spacing.sm,
    },
    back: { alignSelf: 'flex-start', paddingVertical: 2 },
    backLabel: { ...type_.small, color: colors.textMuted },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    headerText: { flex: 1, gap: 2 },
    headerRight: { paddingBottom: 2 },
    title: { ...type_.display, color: colors.text },
    subtitle: { ...type_.small, color: colors.textMuted },
    content: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxl,
      gap: spacing.lg,
    },
  });
}
