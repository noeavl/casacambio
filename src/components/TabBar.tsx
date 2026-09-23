import { Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  return (
    <SafeAreaView edges={['bottom']}>
      {TABS.map((tab) => (
        <Button
          key={tab.key}
          title={tab.key === active ? `✓ ${tab.label}` : tab.label}
          onPress={() => onChange(tab.key)}
        />
      ))}
    </SafeAreaView>
  );
}
