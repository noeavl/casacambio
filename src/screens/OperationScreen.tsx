import { useMemo, useState } from 'react';
import { Alert, Button as NativeButton, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  AmountInput,
  Button,
  Card,
  EmptyState,
  Field,
  Row,
  SectionLabel,
  Segmented,
} from '../components/ui';
import { useApp } from '../state/AppContext';
import type { AmountMode, ExchangeRate, Operation, OperationType } from '../types';
import { quote } from '../utils/exchange';
import { formatMoney, formatNumber, parseAmount, sanitizeAmountInput } from '../utils/format';

function RateChip({
  rate,
  active,
  baseCurrency,
  type: opType,
  onPress,
}: {
  rate: ExchangeRate;
  active: boolean;
  baseCurrency: string;
  type: OperationType;
  onPress: () => void;
}) {
  const value = opType === 'BUY' ? rate.buy : rate.sell;
  const label = `${rate.code} ${formatNumber(value, 4)} ${baseCurrency}/${rate.code}`;
  return <NativeButton title={active ? `✓ ${label}` : label} onPress={onPress} />;
}

export function OperationScreen({ onGoToRates }: { onGoToRates: () => void }) {
  const { settings, rates, registerOperation } = useApp();

  const activeRates = useMemo(() => rates.filter((rate) => rate.active), [rates]);

  const [type, setType] = useState<OperationType>('BUY');
  const [mode, setMode] = useState<AmountMode>('FOREIGN');
  const [rateId, setRateId] = useState<string | null>(null);
  const [amountText, setAmountText] = useState('');
  const [customer, setCustomer] = useState('');
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
      Alert.alert('Monto inválido', 'Captura un monto mayor a cero para registrar la operación.');
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
      customer: customer.trim(),
      note: note.trim(),
    });

    setReceipt(operation);
    setAmountText('');
    setCustomer('');
    setNote('');
  };

  if (activeRates.length === 0) {
    return (
      <Screen title="Operar" subtitle={settings.businessName}>
        <Card>
          <EmptyState
            title="Sin tipos de cambio activos"
            hint="Agrega al menos una divisa con su precio de compra y venta para poder operar."
          />
          <Button label="Ir a tipos de cambio" onPress={onGoToRates} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="Operar" subtitle={`${settings.businessName} · ${settings.branch}`}>
      <Segmented<OperationType>
        value={type}
        onChange={setType}
        options={[
          { value: 'BUY', label: 'Compra' },
          { value: 'SELL', label: 'Venta' },
        ]}
      />
      <Text>
        {isBuy
          ? `Recibes divisa del cliente y pagas en ${settings.baseCurrency}.`
          : `Entregas divisa al cliente y cobras en ${settings.baseCurrency}.`}
      </Text>

      <View>
        <SectionLabel>Tipo de cambio</SectionLabel>
        <View>
          {activeRates.map((rate) => (
            <RateChip
              key={rate.id}
              rate={rate}
              baseCurrency={settings.baseCurrency}
              type={type}
              active={selectedRate?.id === rate.id}
              onPress={() => setRateId(rate.id)}
            />
          ))}
        </View>
      </View>

      <Card>
        <Segmented<AmountMode>
          value={mode}
          onChange={setMode}
          options={[
            { value: 'FOREIGN', label: `Monto en ${selectedRate?.code ?? 'divisa'}` },
            { value: 'LOCAL', label: `Monto en ${settings.baseCurrency}` },
          ]}
        />
        <AmountInput
          label="Monto"
          value={amountText}
          onChangeText={(text) => setAmountText(sanitizeAmountInput(text))}
          suffix={mode === 'FOREIGN' ? (selectedRate?.code ?? '') : settings.baseCurrency}
        />

        <Row
          label="Tipo de cambio aplicado"
          value={`${formatNumber(result?.appliedRate ?? 0, 4)} ${settings.baseCurrency}/${selectedRate?.code ?? ''}`}
        />
        <Row
          label="Monto en divisa"
          value={formatMoney(result?.foreignAmount ?? 0, selectedRate?.code ?? '', d)}
        />
        <Row label="Subtotal" value={formatMoney(result?.grossLocal ?? 0, settings.baseCurrency, d)} />
        <Row
          label={`Comisión ${formatNumber(settings.commissionPercent, 2)}%`}
          value={`${isBuy ? '-' : '+'} ${formatMoney(result?.commissionAmount ?? 0, settings.baseCurrency, d)}`}
        />

        <Row
          label={isBuy ? 'Pagas al cliente' : 'Cobras al cliente'}
          value={formatMoney(result?.netLocal ?? 0, settings.baseCurrency, d)}
        />
      </Card>

      <Card>
        <SectionLabel>Datos del recibo</SectionLabel>
        <View>
          <Field
            label="Cliente"
            value={customer}
            onChangeText={setCustomer}
            placeholder="Público en general"
          />
          <Field
            label="Nota"
            value={note}
            onChangeText={setNote}
            placeholder="Referencia, documento, observaciones"
            multiline
          />
        </View>
      </Card>

      <Button label="Registrar y emitir recibo" onPress={handleRegister} />

      <ReceiptModal
        operation={receipt}
        settings={settings}
        visible={receipt !== null}
        onClose={() => setReceipt(null)}
      />
    </Screen>
  );
}

