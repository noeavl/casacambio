import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { Button, Card, Field, SectionLabel } from '../../components/ui';
import { useApp } from '../../state/AppContext';
import { useLanguage } from '../../state/LanguageContext';
import { spacing } from '../../theme';
import { parseAmount, sanitizeAmountInput } from '../../utils/format';

export function OperationSettingsScreen({ onBack }: { onBack: () => void }) {
  const { settings, updateSettings } = useApp();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    baseCurrency: settings.baseCurrency,
    commissionPercent: String(settings.commissionPercent),
    decimals: String(settings.decimals),
  });

  useEffect(() => {
    setForm({
      baseCurrency: settings.baseCurrency,
      commissionPercent: String(settings.commissionPercent),
      decimals: String(settings.decimals),
    });
  }, [settings]);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSave = () => {
    const decimals = Math.max(0, Math.min(4, Math.round(parseAmount(form.decimals))));
    updateSettings({
      baseCurrency: form.baseCurrency.trim().toUpperCase() || 'MXN',
      commissionPercent: Math.max(0, parseAmount(form.commissionPercent)),
      decimals,
    });
    Alert.alert(t('settings.saveAlertTitle'), t('settings.saveAlertMessage'));
  };

  return (
    <Screen title={t('settings.operationSection')} onBack={onBack}>
      <Card>
        <SectionLabel>{t('settings.operationSection')}</SectionLabel>
        <View style={styles.group}>
          <Field
            label={t('settings.baseCurrencyLabel')}
            value={form.baseCurrency}
            onChangeText={(text) => set('baseCurrency')(text.toUpperCase().slice(0, 4))}
            autoCapitalize="characters"
            maxLength={4}
            hint={t('settings.baseCurrencyHint')}
          />
          <Field
            label={t('settings.commissionLabel')}
            value={form.commissionPercent}
            onChangeText={(text) => set('commissionPercent')(sanitizeAmountInput(text))}
            keyboardType="decimal-pad"
          />
          <Field
            label={t('settings.decimalsLabel')}
            value={form.decimals}
            onChangeText={(text) => set('decimals')(text.replace(/[^0-9]/g, '').slice(0, 1))}
            keyboardType="number-pad"
            maxLength={1}
            hint={t('settings.decimalsHint')}
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
