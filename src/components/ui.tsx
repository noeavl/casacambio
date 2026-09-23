import {
  ActivityIndicator,
  Button as NativeButton,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ texto */

export function SectionLabel({ children }: { children: ReactNode }) {
  return <Text>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text>{children}</Text>;
}

/* ---------------------------------------------------------------- bloques */

export function Card({ children }: { children: ReactNode }) {
  return <View>{children}</View>;
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text>
      {label}: {value}
    </Text>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <View>
      <Text>{title}</Text>
      {hint ? <Text>{hint}</Text> : null}
    </View>
  );
}

export function Loader() {
  return <ActivityIndicator />;
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
}) {
  return (
    <View>
      <Text>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        maxLength={maxLength}
        multiline={multiline}
      />
      {hint ? <Text>{hint}</Text> : null}
    </View>
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
  return (
    <View>
      <Text>
        {label} ({suffix})
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType="decimal-pad"
      />
    </View>
  );
}

/* --------------------------------------------------------------- botones */

export function Button({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return <NativeButton title={label} onPress={onPress} disabled={disabled} />;
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
  return (
    <View>
      {options.map((option) => (
        <NativeButton
          key={option.value}
          title={option.value === value ? `✓ ${option.label}` : option.label}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}
