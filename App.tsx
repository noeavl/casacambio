import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { TabBar, type TabKey } from './src/components/TabBar';
import { Loader } from './src/components/ui';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { OperationScreen } from './src/screens/OperationScreen';
import { RatesScreen } from './src/screens/RatesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { AppProvider, useApp } from './src/state/AppContext';
import { colors } from './src/theme';

function Root() {
  const { ready, settings } = useApp();
  const [tab, setTab] = useState<TabKey>('operar');

  if (!ready) return <Loader />;

  if (!settings.configured) {
    return (
      <View style={styles.root}>
        <SetupScreen />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {tab === 'operar' ? <OperationScreen onGoToRates={() => setTab('tipos')} /> : null}
        {tab === 'tipos' ? <RatesScreen /> : null}
        {tab === 'historial' ? <HistoryScreen /> : null}
        {tab === 'ajustes' ? <SettingsScreen /> : null}
      </View>
      <TabBar active={tab} onChange={setTab} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
});
