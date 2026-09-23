import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Screen } from '../components/Screen';
import { Button, Card, EmptyState, Field, Muted, SectionLabel } from '../components/ui';
import { useApp } from '../state/AppContext';
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
      right={<Button label="Nuevo" onPress={openNew} />}
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
            <Card>
              <Text>
                {rate.code} · {rate.name} · {rate.active ? 'Activo' : 'Inactivo'}
              </Text>
              <Text>Compra: {formatNumber(rate.buy, 4)}</Text>
              <Text>Venta: {formatNumber(rate.sell, 4)}</Text>
              <Muted>Actualizado {formatDateTime(rate.updatedAt)}</Muted>
            </Card>
          </Pressable>
        ))
      )}

      <Muted>
        Compra: precio al que recibes la divisa. Venta: precio al que la entregas.
      </Muted>

      <Modal visible={draft !== null} onRequestClose={() => setDraft(null)}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <SectionLabel>{draft?.id ? 'Editar divisa' : 'Nueva divisa'}</SectionLabel>

            <View>
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
              <View>
                <Field
                  label={`Compra (${settings.baseCurrency})`}
                  value={draft?.buy ?? ''}
                  onChangeText={(text) =>
                    setDraft((d) => (d ? { ...d, buy: sanitizeAmountInput(text) } : d))
                  }
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                />
                <Field
                  label={`Venta (${settings.baseCurrency})`}
                  value={draft?.sell ?? ''}
                  onChangeText={(text) =>
                    setDraft((d) => (d ? { ...d, sell: sanitizeAmountInput(text) } : d))
                  }
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                />
              </View>

              <View>
                <Text>Disponible para operar</Text>
                <Switch
                  value={draft?.active ?? true}
                  onValueChange={(value) => setDraft((d) => (d ? { ...d, active: value } : d))}
                />
              </View>
            </View>

            <Button label="Guardar" onPress={handleSave} />
            <Button label="Cancelar" onPress={() => setDraft(null)} />
            {draft?.id ? <Button label="Eliminar" onPress={handleDelete} /> : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}

