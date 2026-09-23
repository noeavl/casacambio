import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { Button, Card, Field, Muted, SectionLabel } from '../components/ui';
import { useApp } from '../state/AppContext';
import { colors, spacing, type } from '../theme';
import { parseAmount, sanitizeAmountInput } from '../utils/format';

/** Configuración inicial: se muestra una sola vez, antes de operar. */
export function SetupScreen() {
  const { settings, completeSetup } = useApp();

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
    <Screen title="Configuración" subtitle="Parámetros de inicio de la casa de cambio">
      <View style={styles.intro}>
        <Text style={styles.introText}>
          Estos datos encabezan cada recibo y definen cómo se calculan las operaciones. Podrás
          cambiarlos después desde Ajustes.
        </Text>
      </View>

      <Card>
        <SectionLabel>Identidad</SectionLabel>
        <View style={styles.group}>
          <Field
            label="Nombre del negocio"
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="Casa de Cambio"
          />
          <Field label="Sucursal" value={branch} onChangeText={setBranch} placeholder="Matriz" />
          <Field
            label="Operador / cajero"
            value={operator}
            onChangeText={setOperator}
            placeholder="Nombre de quien atiende"
          />
        </View>
      </Card>

      <Card>
        <SectionLabel>Operación</SectionLabel>
        <View style={styles.group}>
          <Field
            label="Moneda de caja"
            value={baseCurrency}
            onChangeText={(text) => setBaseCurrency(text.toUpperCase().slice(0, 4))}
            placeholder="MXN"
            autoCapitalize="characters"
            maxLength={4}
            hint="Moneda local con la que se liquidan las operaciones."
          />
          <Field
            label="Comisión por operación (%)"
            value={commission}
            onChangeText={(text) => setCommission(sanitizeAmountInput(text))}
            keyboardType="decimal-pad"
            placeholder="0"
            hint="Se descuenta en compras y se suma en ventas. Usa 0 si no cobras comisión."
          />
          <Field
            label="Prefijo de folio"
            value={receiptPrefix}
            onChangeText={(text) => setReceiptPrefix(text.toUpperCase().slice(0, 6))}
            autoCapitalize="characters"
            maxLength={6}
            placeholder="REC"
            hint="Los recibos se numeran como REC-00001."
          />
        </View>
      </Card>

      <Button label="Comenzar a operar" onPress={handleStart} disabled={!canContinue} />
      <Muted style={styles.note}>
        Se crearán dos tipos de cambio de ejemplo (USD y EUR) que puedes editar o eliminar.
      </Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { paddingBottom: spacing.xs },
  introText: { ...type.small, color: colors.textMuted, lineHeight: 20 },
  group: { gap: spacing.lg },
  note: { textAlign: 'center' },
});
