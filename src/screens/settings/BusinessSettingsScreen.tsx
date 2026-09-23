import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { Button, Card, Field, SectionLabel } from '../../components/ui';
import { useApp } from '../../state/AppContext';
import { useLanguage } from '../../state/LanguageContext';
import { spacing } from '../../theme';

export function BusinessSettingsScreen({ onBack }: { onBack: () => void }) {
  const { settings, updateSettings } = useApp();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    businessName: settings.businessName,
    branch: settings.branch,
    taxId: settings.taxId,
    address: settings.address,
    phone: settings.phone,
  });

  useEffect(() => {
    setForm({
      businessName: settings.businessName,
      branch: settings.branch,
      taxId: settings.taxId,
      address: settings.address,
      phone: settings.phone,
    });
  }, [settings]);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSave = () => {
    updateSettings({
      businessName: form.businessName.trim() || 'Casa de Cambio',
      branch: form.branch.trim(),
      taxId: form.taxId.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
    });
    Alert.alert(t('settings.saveAlertTitle'), t('settings.saveAlertMessage'));
  };

  return (
    <Screen title={t('settings.businessSection')} onBack={onBack}>
      <Card>
        <SectionLabel>{t('settings.businessSection')}</SectionLabel>
        <View style={styles.group}>
          <Field label={t('settings.nameLabel')} value={form.businessName} onChangeText={set('businessName')} />
          <Field label={t('settings.branchLabel')} value={form.branch} onChangeText={set('branch')} />
          <Field
            label={t('settings.taxIdLabel')}
            value={form.taxId}
            onChangeText={set('taxId')}
            autoCapitalize="characters"
          />
          <Field label={t('settings.addressLabel')} value={form.address} onChangeText={set('address')} />
          <Field
            label={t('settings.phoneLabel')}
            value={form.phone}
            onChangeText={set('phone')}
            keyboardType="phone-pad"
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
