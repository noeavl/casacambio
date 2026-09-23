import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { Screen } from '../components/Screen';
import { Button, Card, Field, Muted, Row, SectionLabel } from '../components/ui';
import { useApp } from '../state/AppContext';
import { buildFolio, parseAmount, sanitizeAmountInput } from '../utils/format';

/** Módulo de configuración: parámetros de inicio, editables en cualquier momento. */
export function SettingsScreen() {
  const { settings, operations, rates, updateSettings, resetAll } = useApp();

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
    Alert.alert('Ajustes', 'Los parámetros se guardaron correctamente.');
  };

  const handleReset = () => {
    Alert.alert(
      'Restablecer aplicación',
      'Se borrarán los ajustes, los tipos de cambio y todas las operaciones registradas. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar todo', style: 'destructive', onPress: resetAll },
      ],
    );
  };

  return (
    <Screen title="Ajustes" subtitle="Parámetros de inicio y recibo">
      <Card>
        <SectionLabel>Estado</SectionLabel>
        <Row label="Tipos de cambio" value={String(rates.length)} />
        <Row label="Operaciones registradas" value={String(operations.length)} />
        <Row
          label="Siguiente folio"
          value={buildFolio(settings.receiptPrefix, settings.nextFolio)}
        />
      </Card>

      <Card>
        <SectionLabel>Datos del negocio</SectionLabel>
        <View>
          <Field label="Nombre" value={form.businessName} onChangeText={set('businessName')} />
          <Field label="Sucursal" value={form.branch} onChangeText={set('branch')} />
          <Field label="RFC / identificación fiscal" value={form.taxId} onChangeText={set('taxId')} autoCapitalize="characters" />
          <Field label="Dirección" value={form.address} onChangeText={set('address')} />
          <Field label="Teléfono" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
          <Field label="Operador / cajero" value={form.operator} onChangeText={set('operator')} />
        </View>
      </Card>

      <Card>
        <SectionLabel>Parámetros de operación</SectionLabel>
        <View>
          <Field
            label="Moneda de caja"
            value={form.baseCurrency}
            onChangeText={(text) => set('baseCurrency')(text.toUpperCase().slice(0, 4))}
            autoCapitalize="characters"
            maxLength={4}
            hint="Cambiarla no recalcula operaciones ya registradas."
          />
          <Field
            label="Comisión por operación (%)"
            value={form.commissionPercent}
            onChangeText={(text) => set('commissionPercent')(sanitizeAmountInput(text))}
            keyboardType="decimal-pad"
          />
          <Field
            label="Decimales"
            value={form.decimals}
            onChangeText={(text) => set('decimals')(text.replace(/[^0-9]/g, '').slice(0, 1))}
            keyboardType="number-pad"
            maxLength={1}
            hint="Entre 0 y 4 decimales en los importes."
          />
        </View>
      </Card>

      <Card>
        <SectionLabel>Recibo</SectionLabel>
        <View>
          <Field
            label="Prefijo de folio"
            value={form.receiptPrefix}
            onChangeText={(text) => set('receiptPrefix')(text.toUpperCase().slice(0, 6))}
            autoCapitalize="characters"
            maxLength={6}
          />
          <Field
            label="Leyenda al pie"
            value={form.receiptFooter}
            onChangeText={set('receiptFooter')}
            multiline
          />
        </View>
      </Card>

      <Button label="Guardar ajustes" onPress={handleSave} />
      <Button label="Restablecer aplicación" onPress={handleReset} />
      <Muted>Casa de Cambio · v1.0.0</Muted>
    </Screen>
  );
}

