import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CustomerPickerModal } from '../components/CustomerPickerModal';
import { Screen } from '../components/Screen';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  AmountInput,
  Button,
  Card,
  Divider,
  EmptyState,
  Field,
  Row,
  SectionLabel,
  Segmented,
  SelectField,
} from '../components/ui';
import { useApp } from '../state/AppContext';
import { useLanguage } from '../state/LanguageContext';
import { useTheme } from '../state/ThemeContext';
import { radius, spacing, type as type_, type Palette } from '../theme';
import type { AmountMode, Customer, ExchangeRate, Operation, OperationType } from '../types';
import { quote } from '../utils/exchange';
import { formatMoney, formatNumber, parseAmount, sanitizeAmountInput } from '../utils/format';

function RateChip({
  rate,
  active,
  baseCurrency,
  type: opType,
  onPress,
  styles,
}: {
  rate: ExchangeRate;
  active: boolean;
  baseCurrency: string;
  type: OperationType;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  const value = opType === 'BUY' ? rate.buy : rate.sell;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipCode, active && styles.chipTextActive]}>{rate.code}</Text>
      <Text style={[styles.chipRate, active && styles.chipTextActive]}>
        {formatNumber(value, 4)}
      </Text>
      <Text style={[styles.chipUnit, active && styles.chipUnitActive]}>
        {baseCurrency}/{rate.code}
      </Text>
    </Pressable>
  );
}

export function OperationScreen({ onGoToRates }: { onGoToRates: () => void }) {
  const { settings, rates, registerOperation } = useApp();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const activeRates = useMemo(() => rates.filter((rate) => rate.active), [rates]);

  const [type, setType] = useState<OperationType>('BUY');
  const [mode, setMode] = useState<AmountMode>('FOREIGN');
  const [rateId, setRateId] = useState<string | null>(null);
  const [amountText, setAmountText] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [note, setNote] = useState('');
  const [receipt, setReceipt] = useState<Operation | null>(null);

  const selectedRate =
    activeRates.find((rate) => rate.id === rateId) ?? activeRates[0] ?? null;

  const result = useMemo(() => {
    if (!selectedRate) return null;
    return quote({
      type,
      rate: selectedRate,
      amount: parseAmount(amountText),
      mode,
      commissionPercent: settings.commissionPercent,
      decimals: settings.decimals,
    });
  }, [selectedRate, type, amountText, mode, settings.commissionPercent, settings.decimals]);

  const isBuy = type === 'BUY';
  const d = settings.decimals;

  const handleRegister = () => {
    if (!selectedRate || !result) return;
    if (result.foreignAmount <= 0 || result.netLocal <= 0) {
      Alert.alert(t('operation.invalidAmountTitle'), t('operation.invalidAmountMessage'));
      return;
    }

    const operation = registerOperation({
      type,
      rateId: selectedRate.id,
      currencyCode: selectedRate.code,
      currencyName: selectedRate.name,
      baseCurrency: settings.baseCurrency,
      rate: result.appliedRate,
      foreignAmount: result.foreignAmount,
      grossLocal: result.grossLocal,
      commissionPercent: settings.commissionPercent,
      commissionAmount: result.commissionAmount,
      netLocal: result.netLocal,
      operator: settings.operator,
      customer: selectedCustomer?.name ?? '',
      note: note.trim(),
    });

    setReceipt(operation);
    setAmountText('');
    setSelectedCustomer(null);
    setNote('');
  };

  if (activeRates.length === 0) {
    return (
      <Screen title={t('operation.title')} subtitle={settings.businessName}>
        <Card>
          <EmptyState title={t('operation.emptyTitle')} hint={t('operation.emptyHint')} />
          <Button label={t('operation.goToRates')} onPress={onGoToRates} variant="outline" />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title={t('operation.title')} subtitle={`${settings.businessName} · ${settings.branch}`}>
      <Segmented<OperationType>
        value={type}
        onChange={setType}
        options={[
          { value: 'BUY', label: t('common.buy') },
          { value: 'SELL', label: t('common.sell') },
        ]}
      />
      <Text style={styles.hint}>
        {isBuy
          ? t('operation.hintBuy', { currency: settings.baseCurrency })
          : t('operation.hintSell', { currency: settings.baseCurrency })}
      </Text>

      <View>
        <SectionLabel>{t('operation.rateSection')}</SectionLabel>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {activeRates.map((rate) => (
            <RateChip
              key={rate.id}
              rate={rate}
              baseCurrency={settings.baseCurrency}
              type={type}
              active={selectedRate?.id === rate.id}
              onPress={() => setRateId(rate.id)}
              styles={styles}
            />
          ))}
        </ScrollView>
      </View>

      <Card>
        <Segmented<AmountMode>
          value={mode}
          onChange={setMode}
          options={[
            {
              value: 'FOREIGN',
              label: t('operation.amountInForeign', {
                code: selectedRate?.code ?? t('operation.foreignFallback'),
              }),
            },
            { value: 'LOCAL', label: t('operation.amountInLocal', { currency: settings.baseCurrency }) },
          ]}
        />
        <View style={styles.amountBlock}>
          <AmountInput
            label={t('operation.amountLabel')}
            value={amountText}
            onChangeText={(text) => setAmountText(sanitizeAmountInput(text))}
            suffix={mode === 'FOREIGN' ? (selectedRate?.code ?? '') : settings.baseCurrency}
          />
        </View>

        <Divider />

        <Row
          label={t('operation.appliedRate')}
          value={`${formatNumber(result?.appliedRate ?? 0, 4)} ${settings.baseCurrency}/${selectedRate?.code ?? ''}`}
        />
        <Row
          label={t('operation.foreignAmountLabel')}
          value={formatMoney(result?.foreignAmount ?? 0, selectedRate?.code ?? '', d)}
        />
        <Row
          label={t('operation.subtotal')}
          value={formatMoney(result?.grossLocal ?? 0, settings.baseCurrency, d)}
        />
        <Row
          label={t('operation.commission', { percent: formatNumber(settings.commissionPercent, 2) })}
          value={`${isBuy ? '-' : '+'} ${formatMoney(result?.commissionAmount ?? 0, settings.baseCurrency, d)}`}
        />

        <Divider />

        <Row
          label={isBuy ? t('operation.payClient') : t('operation.chargeClient')}
          value={formatMoney(result?.netLocal ?? 0, settings.baseCurrency, d)}
          emphasis
        />
      </Card>

      <Card>
        <SectionLabel>{t('operation.receiptDataSection')}</SectionLabel>
        <View style={styles.group}>
          <SelectField
            label={t('operation.customerLabel')}
            value={selectedCustomer?.name}
            placeholder={t('operation.customerPlaceholder')}
            onPress={() => setPickerOpen(true)}
          />
          <Field
            label={t('operation.noteLabel')}
            value={note}
            onChangeText={setNote}
            placeholder={t('operation.notePlaceholder')}
            multiline
          />
        </View>
      </Card>

      <Button label={t('operation.registerButton')} onPress={handleRegister} />

      <ReceiptModal
        operation={receipt}
        settings={settings}
        visible={receipt !== null}
        onClose={() => setReceipt(null)}
      />

      <CustomerPickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={setSelectedCustomer}
      />
    </Screen>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    hint: { ...type_.small, color: colors.textMuted, marginTop: -spacing.sm },
    group: { gap: spacing.lg },
    amountBlock: { marginTop: spacing.lg },
    chipRow: { gap: spacing.sm, paddingRight: spacing.xl },
    chip: {
      minWidth: 104,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: 2,
    },
    chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
    chipCode: { ...type_.tiny, color: colors.textMuted },
    chipRate: { fontSize: 18, fontWeight: '500', color: colors.text },
    chipUnit: { ...type_.tiny, color: colors.textDim, fontSize: 9 },
    chipTextActive: { color: colors.onAccent },
    chipUnitActive: { color: colors.onAccent, opacity: 0.55 },
  });
}
