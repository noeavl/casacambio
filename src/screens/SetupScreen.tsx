import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { Button, Card, Field, Muted, SectionLabel } from '../components/ui';
import { useApp } from '../state/AppContext';
import { useLanguage } from '../state/LanguageContext';
import { useTheme } from '../state/ThemeContext';
import { spacing, type as type_, type Palette } from '../theme';
import { parseAmount, sanitizeAmountInput } from '../utils/format';

/** Configuración inicial: se muestra una sola vez, antes de operar. */
export function SetupScreen() {
  const { settings, completeSetup, createFirstAdmin } = useApp();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [branch, setBranch] = useState(settings.branch);
  const [baseCurrency, setBaseCurrency] = useState(settings.baseCurrency);
  const [receiptPrefix, setReceiptPrefix] = useState(settings.receiptPrefix);
  const [commission, setCommission] = useState(String(settings.commissionPercent));

  const [adminName, setAdminName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canContinue =
    businessName.trim().length > 0 &&
    baseCurrency.trim().length >= 3 &&
    adminName.trim().length > 0 &&
    username.trim().length > 0 &&
    password.length > 0;

  const handleStart = async () => {
    if (password !== confirmPassword) {
      Alert.alert(t('setup.adminSection'), t('setup.alertPasswordMismatch'));
      return;
    }
    if (password.length < 4) {
      Alert.alert(t('setup.adminSection'), t('setup.alertPasswordTooShort'));
      return;
    }

    setSubmitting(true);
    await createFirstAdmin({ username, password, name: adminName.trim(), role: 'admin' });
    completeSetup({
      businessName: businessName.trim(),
      branch: branch.trim(),
      baseCurrency: baseCurrency.trim().toUpperCase(),
      receiptPrefix: receiptPrefix.trim().toUpperCase() || 'REC',
      commissionPercent: parseAmount(commission),
    });
    setSubmitting(false);
  };

  return (
    <Screen title={t('setup.title')} subtitle={t('setup.subtitle')}>
      <View style={styles.intro}>
        <Text style={styles.introText}>{t('setup.intro')}</Text>
      </View>

      <Card>
        <SectionLabel>{t('setup.identitySection')}</SectionLabel>
        <View style={styles.group}>
          <Field
            label={t('setup.businessNameLabel')}
            value={businessName}
            onChangeText={setBusinessName}
            placeholder={t('setup.businessNamePlaceholder')}
          />
          <Field
            label={t('setup.branchLabel')}
            value={branch}
            onChangeText={setBranch}
            placeholder={t('setup.branchPlaceholder')}
          />
        </View>
      </Card>

      <Card>
        <SectionLabel>{t('setup.operationSection')}</SectionLabel>
        <View style={styles.group}>
          <Field
            label={t('setup.baseCurrencyLabel')}
            value={baseCurrency}
            onChangeText={(text) => setBaseCurrency(text.toUpperCase().slice(0, 4))}
            placeholder={t('setup.baseCurrencyPlaceholder')}
            autoCapitalize="characters"
            maxLength={4}
            hint={t('setup.baseCurrencyHint')}
          />
          <Field
            label={t('setup.commissionLabel')}
            value={commission}
            onChangeText={(text) => setCommission(sanitizeAmountInput(text))}
            keyboardType="decimal-pad"
            placeholder={t('setup.commissionPlaceholder')}
            hint={t('setup.commissionHint')}
          />
          <Field
            label={t('setup.receiptPrefixLabel')}
            value={receiptPrefix}
            onChangeText={(text) => setReceiptPrefix(text.toUpperCase().slice(0, 6))}
            autoCapitalize="characters"
            maxLength={6}
            placeholder={t('setup.receiptPrefixPlaceholder')}
            hint={t('setup.receiptPrefixHint')}
          />
        </View>
      </Card>

      <Card>
        <SectionLabel>{t('setup.adminSection')}</SectionLabel>
        <Muted style={styles.adminIntro}>{t('setup.adminIntro')}</Muted>
        <View style={styles.group}>
          <Field
            label={t('setup.adminNameLabel')}
            value={adminName}
            onChangeText={setAdminName}
            placeholder={t('setup.adminNamePlaceholder')}
          />
          <Field
            label={t('setup.usernameLabel')}
            value={username}
            onChangeText={setUsername}
            placeholder={t('setup.usernamePlaceholder')}
            autoCapitalize="none"
          />
          <Field
            label={t('setup.passwordLabel')}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            secureTextEntry
          />
          <Field
            label={t('setup.confirmPasswordLabel')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            secureTextEntry
          />
        </View>
      </Card>

      <Button
        label={t('setup.startButton')}
        onPress={handleStart}
        disabled={!canContinue || submitting}
      />
      <Muted style={styles.note}>{t('setup.note')}</Muted>
    </Screen>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    intro: { paddingBottom: spacing.xs },
    introText: { ...type_.small, color: colors.textMuted, lineHeight: 20 },
    adminIntro: { marginBottom: spacing.lg },
    group: { gap: spacing.lg },
    note: { textAlign: 'center' },
  });
}
