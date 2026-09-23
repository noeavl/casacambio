import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { Button, Card, Field, Muted, SectionLabel } from '../components/ui';
import { useApp } from '../state/AppContext';
import { useLanguage } from '../state/LanguageContext';
import { useTheme } from '../state/ThemeContext';
import { spacing, type as type_, type Palette } from '../theme';
import { parseAmount, sanitizeAmountInput } from '../utils/format';

/** Configuración inicial: se muestra una sola vez, antes de operar. */
export function SetupScreen() {
  const { settings, completeSetup } = useApp();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [branch, setBranch] = useState(settings.branch);
  const [baseCurrency, setBaseCurrency] = useState(settings.baseCurrency);
  const [operator, setOperator] = useState(settings.operator);
  const [receiptPrefix, setReceiptPrefix] = useState(settings.receiptPrefix);
  const [commission, setCommission] = useState(String(settings.commissionPercent));

  const canContinue = businessName.trim().length > 0 && baseCurrency.trim().length >= 3;

  const handleStart = () => {
    completeSetup({
      businessName: businessName.trim(),
      branch: branch.trim(),
      baseCurrency: baseCurrency.trim().toUpperCase(),
      operator: operator.trim(),
      receiptPrefix: receiptPrefix.trim().toUpperCase() || 'REC',
      commissionPercent: parseAmount(commission),
    });
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
          <Field
            label={t('setup.operatorLabel')}
            value={operator}
            onChangeText={setOperator}
            placeholder={t('setup.operatorPlaceholder')}
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

      <Button label={t('setup.startButton')} onPress={handleStart} disabled={!canContinue} />
      <Muted style={styles.note}>{t('setup.note')}</Muted>
    </Screen>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    intro: { paddingBottom: spacing.xs },
    introText: { ...type_.small, color: colors.textMuted, lineHeight: 20 },
    group: { gap: spacing.lg },
    note: { textAlign: 'center' },
  });
}
