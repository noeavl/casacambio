import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Screen } from '../components/Screen';
import { Button, Card, Field, Muted, Row, SectionLabel, Segmented } from '../components/ui';
import { useApp } from '../state/AppContext';
import { useLanguage, type LanguagePreference } from '../state/LanguageContext';
import { useTheme, type ThemePreference } from '../state/ThemeContext';
import { spacing } from '../theme';
import { buildFolio, parseAmount, sanitizeAmountInput } from '../utils/format';

/** Módulo de configuración: parámetros de inicio, editables en cualquier momento. */
export function SettingsScreen() {
  const { settings, operations, rates, updateSettings, resetAll } = useApp();
  const { preference: themePreference, setPreference: setThemePreference } = useTheme();
  const { preference: languagePreference, setPreference: setLanguagePreference, t } = useLanguage();
  const styles = useMemo(() => createStyles(), []);

  const [form, setForm] = useState({
    businessName: settings.businessName,
    branch: settings.branch,
    taxId: settings.taxId,
    address: settings.address,
    phone: settings.phone,
    operator: settings.operator,
    baseCurrency: settings.baseCurrency,
    receiptPrefix: settings.receiptPrefix,
    commissionPercent: String(settings.commissionPercent),
    decimals: String(settings.decimals),
    receiptFooter: settings.receiptFooter,
  });

  // Mantiene el formulario sincronizado si los ajustes cambian fuera de esta pantalla.
  useEffect(() => {
    setForm({
      businessName: settings.businessName,
      branch: settings.branch,
      taxId: settings.taxId,
      address: settings.address,
      phone: settings.phone,
      operator: settings.operator,
      baseCurrency: settings.baseCurrency,
      receiptPrefix: settings.receiptPrefix,
      commissionPercent: String(settings.commissionPercent),
      decimals: String(settings.decimals),
      receiptFooter: settings.receiptFooter,
    });
  }, [settings]);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSave = () => {
    const decimals = Math.max(0, Math.min(4, Math.round(parseAmount(form.decimals))));
    updateSettings({
      businessName: form.businessName.trim() || 'Casa de Cambio',
      branch: form.branch.trim(),
      taxId: form.taxId.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      operator: form.operator.trim(),
      baseCurrency: form.baseCurrency.trim().toUpperCase() || 'MXN',
      receiptPrefix: form.receiptPrefix.trim().toUpperCase() || 'REC',
      commissionPercent: Math.max(0, parseAmount(form.commissionPercent)),
      decimals,
      receiptFooter: form.receiptFooter.trim(),
    });
    Alert.alert(t('settings.saveAlertTitle'), t('settings.saveAlertMessage'));
  };

  const handleReset = () => {
    Alert.alert(t('settings.resetAlertTitle'), t('settings.resetAlertMessage'), [
      { text: t('settings.resetCancel'), style: 'cancel' },
      { text: t('settings.resetConfirm'), style: 'destructive', onPress: resetAll },
    ]);
  };

  return (
    <Screen title={t('settings.title')} subtitle={t('settings.subtitle')}>
      <Card>
        <SectionLabel>{t('settings.appearanceSection')}</SectionLabel>
        <Segmented<ThemePreference>
          value={themePreference}
          onChange={setThemePreference}
          options={[
            { value: 'light', label: t('settings.themeLight') },
            { value: 'dark', label: t('settings.themeDark') },
            { value: 'system', label: t('settings.themeSystem') },
          ]}
        />
      </Card>

      <Card>
        <SectionLabel>{t('settings.languageSection')}</SectionLabel>
        <Segmented<LanguagePreference>
          value={languagePreference}
          onChange={setLanguagePreference}
          options={[
            { value: 'es', label: 'Español' },
            { value: 'en', label: 'English' },
            { value: 'system', label: t('settings.languageSystem') },
          ]}
        />
      </Card>

      <Card>
        <SectionLabel>{t('settings.statusSection')}</SectionLabel>
        <Row label={t('settings.ratesCountLabel')} value={String(rates.length)} />
        <Row label={t('settings.operationsCountLabel')} value={String(operations.length)} />
        <Row
          label={t('settings.nextFolioLabel')}
          value={buildFolio(settings.receiptPrefix, settings.nextFolio)}
        />
      </Card>

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
          <Field label={t('settings.operatorLabel')} value={form.operator} onChangeText={set('operator')} />
        </View>
      </Card>

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
      <Button label={t('settings.resetButton')} onPress={handleReset} variant="danger" />
      <Muted style={styles.version}>{t('settings.version')}</Muted>
    </Screen>
  );
}

function createStyles() {
  return StyleSheet.create({
    group: { gap: spacing.lg },
    version: { textAlign: 'center' },
  });
}
