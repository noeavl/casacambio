import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { Button, Card, Field, SectionLabel } from '../../components/ui';
import { useApp } from '../../state/AppContext';
import { useLanguage } from '../../state/LanguageContext';
import { spacing } from '../../theme';

export function ReceiptSettingsScreen({ onBack }: { onBack: () => void }) {
  const { settings, updateSettings } = useApp();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    receiptPrefix: settings.receiptPrefix,
    receiptFooter: settings.receiptFooter,
  });

  useEffect(() => {
    setForm({
      receiptPrefix: settings.receiptPrefix,
      receiptFooter: settings.receiptFooter,
    });
  }, [settings]);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSave = () => {
    updateSettings({
      receiptPrefix: form.receiptPrefix.trim().toUpperCase() || 'REC',
      receiptFooter: form.receiptFooter.trim(),
    });
    Alert.alert(t('settings.saveAlertTitle'), t('settings.saveAlertMessage'));
  };

  return (
    <Screen title={t('settings.receiptSection')} onBack={onBack}>
      <Card>
        <SectionLabel>{t('settings.receiptSection')}</SectionLabel>
        <View style={styles.group}>
          <Field
            label={t('settings.receiptPrefixLabel')}
            value={form.receiptPrefix}
            onChangeText={(text) => set('receiptPrefix')(text.toUpperCase().slice(0, 6))}
            autoCapitalize="characters"
            maxLength={6}
          />
          <Field
            label={t('settings.receiptFooterLabel')}
            value={form.receiptFooter}
            onChangeText={set('receiptFooter')}
            multiline
          />
        </View>
      </Card>

      <Button label={t('settings.saveButton')} onPress={handleSave} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.lg },
});
