import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '../state/ThemeContext';
import { radius, spacing, type as type_, type Palette } from '../theme';

/* ------------------------------------------------------------------ texto */

export function Title({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const s = useStyles();
  return <Text style={[s.title, style]}>{children}</Text>;
}

export function Display({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const s = useStyles();
  return <Text style={[s.display, style]}>{children}</Text>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  const s = useStyles();
  return <Text style={s.sectionLabel}>{String(children).toUpperCase()}</Text>;
}

export function Muted({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const s = useStyles();
  return <Text style={[s.muted, style]}>{children}</Text>;
}

/* ---------------------------------------------------------------- bloques */

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const s = useStyles();
  return <View style={[s.card, style]}>{children}</View>;
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const s = useStyles();
  return <View style={[s.divider, style]} />;
}

export function Row({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  const s = useStyles();
  return (
    <View style={s.row}>
      <Text style={[s.rowLabel, emphasis && s.rowLabelEmphasis]}>{label}</Text>
      <Text style={[s.rowValue, emphasis && s.rowValueEmphasis]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function MenuRow({
  label,
  value,
  onPress,
  danger = false,
}: {
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const s = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.menuRow, pressed && s.menuRowPressed]}
    >
      <Text style={[s.menuRowLabel, danger && s.menuRowLabelDanger]}>{label}</Text>
      <View style={s.menuRowRight}>
        {value ? (
          <Text style={s.menuRowValue} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {danger ? null : <Text style={s.menuRowChevron}>›</Text>}
      </View>
    </Pressable>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  const s = useStyles();
  return (
    <View style={s.empty}>
      <Text style={s.emptyTitle}>{title}</Text>
      {hint ? <Text style={s.emptyHint}>{hint}</Text> : null}
    </View>
  );
}

export function Loader() {
  const { colors } = useTheme();
  const s = useStyles();
  return (
    <View style={s.loader}>
      <ActivityIndicator color={colors.text} />
    </View>
  );
}

/* --------------------------------------------------------------- entradas */

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
  hint,
  multiline = false,
  align = 'left',
  style,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  hint?: string;
  multiline?: boolean;
  align?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const s = useStyles();
  return (
    <View style={[s.field, style]}>
      <Text style={s.fieldLabel}>{label.toUpperCase()}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        maxLength={maxLength}
        multiline={multiline}
        style={[s.input, align === 'right' && s.inputRight, multiline && s.inputMultiline]}
        selectionColor={colors.text}
      />
      {hint ? <Text style={s.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export function SelectField({
  label,
  value,
  placeholder,
  onPress,
  style,
}: {
  label: string;
  value?: string;
  placeholder: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const s = useStyles();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[s.field, style]}>
      <Text style={s.fieldLabel}>{label.toUpperCase()}</Text>
      <View style={s.input}>
        <Text style={value ? s.selectValue : s.selectPlaceholder} numberOfLines={1}>
          {value || placeholder}
        </Text>
      </View>
    </Pressable>
  );
}

export function AmountInput({
  label,
  value,
  onChangeText,
  suffix,
  placeholder = '0.00',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  suffix: string;
  placeholder?: string;
}) {
  const { colors } = useTheme();
  const s = useStyles();
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label.toUpperCase()}</Text>
      <View style={s.amountWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textDim}
          keyboardType="decimal-pad"
          style={s.amountInput}
          selectionColor={colors.text}
        />
        <Text style={s.amountSuffix}>{suffix}</Text>
      </View>
    </View>
  );
}

/* --------------------------------------------------------------- botones */

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const s = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.button,
        variant === 'primary' && s.buttonPrimary,
        variant === 'outline' && s.buttonOutline,
        variant === 'ghost' && s.buttonGhost,
        variant === 'danger' && s.buttonDanger,
        pressed && s.buttonPressed,
        disabled && s.buttonDisabled,
        style,
      ]}
    >
      <Text
        style={[
          s.buttonLabel,
          variant === 'primary' && s.buttonLabelPrimary,
          variant === 'danger' && s.buttonLabelDanger,
        ]}
      >
        {label.toUpperCase()}
      </Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const s = useStyles();
  return (
    <View style={s.segmented}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={[s.segment, active && s.segmentActive]}
          >
            <Text style={[s.segmentLabel, active && s.segmentLabelActive]}>
              {option.label.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ----------------------------------------------------------------- estilos */

function createStyles(colors: Palette) {
  return StyleSheet.create({
    title: { ...type_.title, color: colors.text },
    display: { ...type_.display, color: colors.text },
    sectionLabel: {
      ...type_.section,
      color: colors.textDim,
      marginBottom: spacing.md,
    },
    muted: { ...type_.small, color: colors.textMuted },

    card: {
      backgroundColor: colors.surface,
      padding: spacing.lg,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginVertical: spacing.md,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 6,
      gap: spacing.md,
    },
    rowLabel: { ...type_.small, color: colors.textMuted, flexShrink: 1 },
    rowLabelEmphasis: { color: colors.text, fontWeight: '600' },
    rowValue: { ...type_.body, color: colors.text, textAlign: 'right', flexShrink: 1 },
    rowValueEmphasis: { fontSize: 20, fontWeight: '600' },

    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
    },
    menuRowPressed: { opacity: 0.6 },
    menuRowLabel: { ...type_.body, color: colors.text, flexShrink: 1 },
    menuRowLabelDanger: { color: colors.danger },
    menuRowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
    menuRowValue: { ...type_.small, color: colors.textMuted, flexShrink: 1, textAlign: 'right' },
    menuRowChevron: { color: colors.textDim, fontSize: 18 },

    empty: { paddingVertical: spacing.xxl, alignItems: 'center', gap: spacing.sm },
    emptyTitle: { ...type_.body, color: colors.textMuted },
    emptyHint: { ...type_.small, color: colors.textDim, textAlign: 'center' },
    loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },

    field: { gap: spacing.sm },
    fieldLabel: { ...type_.tiny, color: colors.textDim },
    input: {
      ...type_.body,
      color: colors.text,
      backgroundColor: colors.surfaceAlt,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
    },
    inputRight: { textAlign: 'right' },
    inputMultiline: { minHeight: 76, textAlignVertical: 'top' },
    fieldHint: { ...type_.small, color: colors.textDim },
    selectValue: { ...type_.body, color: colors.text },
    selectPlaceholder: { ...type_.body, color: colors.textDim },

    amountWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceAlt,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
    },
    amountInput: {
      flex: 1,
      color: colors.text,
      fontSize: 30,
      fontWeight: '300',
      paddingVertical: spacing.md,
    },
    amountSuffix: { ...type_.small, color: colors.textMuted, letterSpacing: 1 },

    button: {
      height: 50,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },
    buttonPrimary: { backgroundColor: colors.accent },
    buttonOutline: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderStrong,
      backgroundColor: 'transparent',
    },
    buttonGhost: { backgroundColor: 'transparent' },
    buttonDanger: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.danger,
      backgroundColor: 'transparent',
    },
    buttonPressed: { opacity: 0.6 },
    buttonDisabled: { opacity: 0.3 },
    buttonLabel: { ...type_.tiny, color: colors.text, fontSize: 12 },
    buttonLabelPrimary: { color: colors.onAccent, fontWeight: '700' },
    buttonLabelDanger: { color: colors.danger },

    segmented: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: 3,
      gap: 3,
    },
    segment: {
      flex: 1,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
    },
    segmentActive: { backgroundColor: colors.accent },
    segmentLabel: { ...type_.tiny, color: colors.textMuted },
    segmentLabelActive: { color: colors.onAccent, fontWeight: '700' },
  });
}

function useStyles() {
  const { colors } = useTheme();
  return useMemo(() => createStyles(colors), [colors]);
}
