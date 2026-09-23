import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Screen } from '../components/Screen';
import { Card, Divider, MenuRow } from '../components/ui';
import { useApp } from '../state/AppContext';
import { useLanguage } from '../state/LanguageContext';
import { useTheme } from '../state/ThemeContext';
import { AboutSettingsScreen } from './settings/AboutSettingsScreen';
import { AppearanceSettingsScreen } from './settings/AppearanceSettingsScreen';
import { BusinessSettingsScreen } from './settings/BusinessSettingsScreen';
import { LanguageSettingsScreen } from './settings/LanguageSettingsScreen';
import { OperationSettingsScreen } from './settings/OperationSettingsScreen';
import { ReceiptSettingsScreen } from './settings/ReceiptSettingsScreen';

type SettingsSection = 'appearance' | 'language' | 'business' | 'operation' | 'receipt' | 'about';

/** Menú de Ajustes: cada categoría vive en su propia subpantalla. */
export function SettingsScreen() {
  const { settings } = useApp();
  const { preference: themePreference } = useTheme();
  const { preference: languagePreference, t } = useLanguage();
  const [section, setSection] = useState<SettingsSection | null>(null);

  const back = () => setSection(null);

  if (section === 'appearance') return <AppearanceSettingsScreen onBack={back} />;
  if (section === 'language') return <LanguageSettingsScreen onBack={back} />;
  if (section === 'business') return <BusinessSettingsScreen onBack={back} />;
  if (section === 'operation') return <OperationSettingsScreen onBack={back} />;
  if (section === 'receipt') return <ReceiptSettingsScreen onBack={back} />;
  if (section === 'about') return <AboutSettingsScreen onBack={back} />;

  const themeValue = { light: t('settings.themeLight'), dark: t('settings.themeDark'), system: t('settings.themeSystem') }[
    themePreference
  ];
  const languageValue = { es: 'Español', en: 'English', system: t('settings.languageSystem') }[languagePreference];

  return (
    <Screen title={t('settings.title')} subtitle={t('settings.subtitle')}>
      <Card style={styles.menuCard}>
        <MenuRow label={t('settings.appearanceSection')} value={themeValue} onPress={() => setSection('appearance')} />
        <Divider style={styles.rowDivider} />
        <MenuRow label={t('settings.languageSection')} value={languageValue} onPress={() => setSection('language')} />
      </Card>

      <Card style={styles.menuCard}>
        <MenuRow
          label={t('settings.businessSection')}
          value={settings.businessName}
          onPress={() => setSection('business')}
        />
        <Divider style={styles.rowDivider} />
        <MenuRow
          label={t('settings.operationSection')}
          value={settings.baseCurrency}
          onPress={() => setSection('operation')}
        />
        <Divider style={styles.rowDivider} />
        <MenuRow
          label={t('settings.receiptSection')}
          value={settings.receiptPrefix}
          onPress={() => setSection('receipt')}
        />
      </Card>

      <Card style={styles.menuCard}>
        <MenuRow label={t('settings.statusSection')} onPress={() => setSection('about')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  menuCard: { padding: 0 },
  rowDivider: { marginVertical: 0, marginHorizontal: 0 },
});
