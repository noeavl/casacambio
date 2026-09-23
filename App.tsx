import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { TabBar, type TabKey } from './src/components/TabBar';
import { Loader } from './src/components/ui';
import { CustomersScreen } from './src/screens/CustomersScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { OperationScreen } from './src/screens/OperationScreen';
import { RatesScreen } from './src/screens/RatesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { AppProvider, useApp } from './src/state/AppContext';
import { LanguageProvider } from './src/state/LanguageContext';
import { ThemeProvider, useTheme } from './src/state/ThemeContext';

function Root() {
  const { ready, settings, currentUser } = useApp();
  const { colors } = useTheme();
  const [tab, setTab] = useState<TabKey>('operar');

  if (!ready) return <Loader />;

  if (!settings.configured) {
    return <SetupScreen />;
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1 }}>
        {tab === 'operar' ? <OperationScreen onGoToRates={() => setTab('tipos')} /> : null}
        {tab === 'clientes' ? <CustomersScreen /> : null}
        {tab === 'tipos' ? <RatesScreen /> : null}
        {tab === 'historial' ? <HistoryScreen /> : null}
        {tab === 'ajustes' ? <SettingsScreen /> : null}
      </View>
      <TabBar active={tab} onChange={setTab} />
    </View>
  );
}

function AppShell() {
  const { scheme } = useTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <AppProvider>
        <Root />
      </AppProvider>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
