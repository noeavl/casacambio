import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '../components/Screen';
import { Button, Card, EmptyState, Field, Muted, SectionLabel } from '../components/ui';
import { useApp } from '../state/AppContext';
import { colors, radius, spacing, type } from '../theme';
import type { ExchangeRate } from '../types';
import { formatDateTime, formatNumber, parseAmount, sanitizeAmountInput } from '../utils/format';

interface Draft {
  id: string | null;
  code: string;
  name: string;
  buy: string;
  sell: string;
  active: boolean;
}

const emptyDraft: Draft = { id: null, code: '', name: '', buy: '', sell: '', active: true };

function toDraft(rate: ExchangeRate): Draft {
  return {
    id: rate.id,
    code: rate.code,
    name: rate.name,
    buy: String(rate.buy),
    sell: String(rate.sell),
    active: rate.active,
  };
}

/** Módulo de tipos de cambio: alta, edición y baja de divisas. */
export function RatesScreen() {
  const { settings, rates, addRate, updateRate, removeRate } = useApp();
  const insets = useSafeAreaInsets();

  const [draft, setDraft] = useState<Draft | null>(null);

  const openNew = () => setDraft({ ...emptyDraft });
  const openEdit = (rate: ExchangeRate) => setDraft(toDraft(rate));

  const handleSave = () => {
    if (!draft) return;
    const code = draft.code.trim().toUpperCase();
    const buy = parseAmount(draft.buy);
    const sell = parseAmount(draft.sell);

    if (code.length < 3) {
      Alert.alert('Divisa', 'Captura el código ISO de la divisa, por ejemplo USD.');
      return;
    }
    if (buy <= 0 || sell <= 0) {
      Alert.alert('Tipo de cambio', 'Los precios de compra y venta deben ser mayores a cero.');
      return;
    }
    if (code === settings.baseCurrency.toUpperCase()) {
      Alert.alert('Divisa', 'La divisa no puede ser la misma que la moneda de caja.');
      return;
    }
    const duplicated = rates.some(
      (rate) => rate.code.toUpperCase() === code && rate.id !== draft.id,
    );
    if (duplicated) {
      Alert.alert('Divisa', `Ya existe un tipo de cambio para ${code}.`);
      return;
    }

    const payload = { code, name: draft.name.trim() || code, buy, sell, active: draft.active };
    if (draft.id) updateRate(draft.id, payload);
    else addRate(payload);
    setDraft(null);
  };

  const handleDelete = () => {
    if (!draft?.id) return;
    const id = draft.id;
    Alert.alert('Eliminar tipo de cambio', `¿Eliminar ${draft.code}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          removeRate(id);
          setDraft(null);
        },
      },
    ]);
  };

  return (
    <Screen
      title="Tipos de cambio"
      subtitle={`Cotizados en ${settings.baseCurrency}`}
      right={<Button label="Nuevo" onPress={openNew} variant="outline" style={styles.headerBtn} />}
    >
      {rates.length === 0 ? (
        <Card>
          <EmptyState
            title="Aún no hay divisas"
            hint="Agrega una divisa con su precio de compra y de venta."
          />
          <Button label="Agregar divisa" onPress={openNew} />
        </Card>
      ) : (
        rates.map((rate) => (
          <Pressable key={rate.id} onPress={() => openEdit(rate)} accessibilityRole="button">
            <Card style={[styles.rateCard, !rate.active && styles.rateCardOff]}>
              <View style={styles.rateHead}>
                <View>
                  <Text style={styles.rateCode}>{rate.code}</Text>
                  <Text style={styles.rateName}>{rate.name}</Text>
                </View>
                <Text style={[styles.badge, rate.active ? styles.badgeOn : styles.badgeOff]}>
                  {rate.active ? 'ACTIVO' : 'INACTIVO'}
                </Text>
              </View>

              <View style={styles.rateValues}>
                <View style={styles.rateValue}>
                  <Text style={styles.rateValueLabel}>COMPRA</Text>
                  <Text style={styles.rateValueNumber}>{formatNumber(rate.buy, 4)}</Text>
                </View>
                <View style={styles.rateSeparator} />
                <View style={styles.rateValue}>
                  <Text style={styles.rateValueLabel}>VENTA</Text>
                  <Text style={styles.rateValueNumber}>{formatNumber(rate.sell, 4)}</Text>
                </View>
              </View>

              <Muted style={styles.updated}>Actualizado {formatDateTime(rate.updatedAt)}</Muted>
            </Card>
          </Pressable>
        ))
      )}

      <Muted style={styles.legend}>
        Compra: precio al que recibes la divisa. Venta: precio al que la entregas.
      </Muted>

      <Modal
        visible={draft !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setDraft(null)}
      >
        <View style={styles.backdrop}>
          <Pressable style={styles.backdropTap} onPress={() => setDraft(null)} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
            <View style={styles.grabber} />
            <SectionLabel>{draft?.id ? 'Editar divisa' : 'Nueva divisa'}</SectionLabel>

            <View style={styles.form}>
              <Field
                label="Código"
                value={draft?.code ?? ''}
                onChangeText={(text) =>
                  setDraft((d) => (d ? { ...d, code: text.toUpperCase().slice(0, 4) } : d))
                }
                placeholder="USD"
                autoCapitalize="characters"
                maxLength={4}
              />
              <Field
                label="Nombre"
                value={draft?.name ?? ''}
                onChangeText={(text) => setDraft((d) => (d ? { ...d, name: text } : d))}
                placeholder="Dólar estadounidense"
              />
              <View style={styles.formRow}>
                <Field
                  label={`Compra (${settings.baseCurrency})`}
                  value={draft?.buy ?? ''}
                  onChangeText={(text) =>
                    setDraft((d) => (d ? { ...d, buy: sanitizeAmountInput(text) } : d))
                  }
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  style={styles.formCol}
                />
                <Field
                  label={`Venta (${settings.baseCurrency})`}
                  value={draft?.sell ?? ''}
                  onChangeText={(text) =>
                    setDraft((d) => (d ? { ...d, sell: sanitizeAmountInput(text) } : d))
                  }
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  style={styles.formCol}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Disponible para operar</Text>
                <Switch
                  value={draft?.active ?? true}
                  onValueChange={(value) => setDraft((d) => (d ? { ...d, active: value } : d))}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor={colors.bg}
                  ios_backgroundColor={colors.border}
                />
              </View>
            </View>

            <View style={styles.sheetActions}>
              <Button label="Guardar" onPress={handleSave} style={styles.action} />
              <Button
                label="Cancelar"
                onPress={() => setDraft(null)}
                variant="outline"
                style={styles.action}
              />
            </View>
            {draft?.id ? <Button label="Eliminar" onPress={handleDelete} variant="danger" /> : null}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBtn: { height: 36, paddingHorizontal: spacing.md },
  rateCard: { gap: spacing.md },
  rateCardOff: { opacity: 0.45 },
  rateHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  rateCode: { fontSize: 20, fontWeight: '500', color: colors.text, letterSpacing: 1 },
  rateName: { ...type.small, color: colors.textMuted },
  badge: {
    ...type.tiny,
    fontSize: 9,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  badgeOn: { color: colors.onAccent, backgroundColor: colors.accent },
  badgeOff: { color: colors.textDim, backgroundColor: colors.surfaceAlt },
  rateValues: { flexDirection: 'row', alignItems: 'center' },
  rateValue: { flex: 1, gap: 2 },
  rateValueLabel: { ...type.tiny, color: colors.textDim, fontSize: 9 },
  rateValueNumber: { fontSize: 22, fontWeight: '300', color: colors.text },
  rateSeparator: { width: StyleSheet.hairlineWidth, height: 32, backgroundColor: colors.border },
  updated: { ...type.tiny, color: colors.textDim, fontSize: 10 },
  legend: { textAlign: 'center' },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  backdropTap: { flex: 1 },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
  form: { gap: spacing.lg },
  formRow: { flexDirection: 'row', gap: spacing.md },
  formCol: { flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { ...type.body, color: colors.text },
  sheetActions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
