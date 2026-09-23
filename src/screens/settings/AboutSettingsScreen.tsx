import { Alert, StyleSheet } from 'react-native';

import { Screen } from '../../components/Screen';
import { Button, Card, Muted, Row, SectionLabel } from '../../components/ui';
import { useApp } from '../../state/AppContext';
import { useLanguage } from '../../state/LanguageContext';
import { buildFolio } from '../../utils/format';

export function AboutSettingsScreen({ onBack }: { onBack: () => void }) {
  const { settings, operations, rates, resetAll } = useApp();
  const { t } = useLanguage();

  const handleReset = () => {
    Alert.alert(t('settings.resetAlertTitle'), t('settings.resetAlertMessage'), [
      { text: t('settings.resetCancel'), style: 'cancel' },
      { text: t('settings.resetConfirm'), style: 'destructive', onPress: resetAll },
    ]);
  };

  return (
    <Screen title={t('settings.statusSection')} onBack={onBack}>
      <Card>
        <SectionLabel>{t('settings.statusSection')}</SectionLabel>
        <Row label={t('settings.ratesCountLabel')} value={String(rates.length)} />
        <Row label={t('settings.operationsCountLabel')} value={String(operations.length)} />
        <Row
          label={t('settings.nextFolioLabel')}
          value={buildFolio(settings.receiptPrefix, settings.nextFolio)}
        />
      </Card>

      <Button label={t('settings.resetButton')} onPress={handleReset} variant="danger" />
      <Muted style={styles.version}>{t('settings.version')}</Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  version: { textAlign: 'center' },
});
