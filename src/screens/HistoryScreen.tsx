import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { ReceiptModal } from '../components/ReceiptModal';
import { Card, EmptyState, Muted, Segmented } from '../components/ui';
import { useApp } from '../state/AppContext';
import { colors, radius, spacing, type } from '../theme';
import type { Operation, OperationType } from '../types';
import { operationLabel } from '../utils/exchange';
import { formatDateTime, formatMoney, formatNumber } from '../utils/format';

type Filter = 'ALL' | OperationType;

function isToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function HistoryScreen() {
  const { settings, operations, removeOperation } = useApp();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [receipt, setReceipt] = useState<Operation | null>(null);

  const today = useMemo(() => operations.filter((op) => isToday(op.createdAt)), [operations]);

  const totals = useMemo(() => {
    const paid = today
      .filter((op) => op.type === 'BUY')
      .reduce((sum, op) => sum + op.netLocal, 0);
    const charged = today
      .filter((op) => op.type === 'SELL')
      .reduce((sum, op) => sum + op.netLocal, 0);
    return { paid, charged, count: today.length, balance: charged - paid };
  }, [today]);

  const visible = useMemo(
    () => (filter === 'ALL' ? operations : operations.filter((op) => op.type === filter)),
    [operations, filter],
  );

  const confirmDelete = (operation: Operation) => {
    Alert.alert('Eliminar operación', `¿Eliminar el recibo ${operation.folio}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeOperation(operation.id) },
    ]);
  };

  return (
    <Screen title="Historial" subtitle={`${operations.length} operaciones registradas`}>
      <Card>
        <Text style={styles.summaryTitle}>RESUMEN DE HOY</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>OPERACIONES</Text>
            <Text style={styles.summaryValue}>{totals.count}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>PAGADO</Text>
            <Text style={styles.summaryValue}>{formatNumber(totals.paid, settings.decimals)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>COBRADO</Text>
            <Text style={styles.summaryValue}>
              {formatNumber(totals.charged, settings.decimals)}
            </Text>
          </View>
        </View>
        <Muted style={styles.summaryFoot}>
          Saldo neto en caja: {formatMoney(totals.balance, settings.baseCurrency, settings.decimals)}
        </Muted>
      </Card>

      <Segmented<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'ALL', label: 'Todas' },
          { value: 'BUY', label: 'Compras' },
          { value: 'SELL', label: 'Ventas' },
        ]}
      />

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            title="Sin operaciones"
            hint="Las operaciones que registres aparecerán aquí con su recibo."
          />
        </Card>
      ) : (
        visible.map((operation) => (
          <Pressable
            key={operation.id}
            onPress={() => setReceipt(operation)}
            onLongPress={() => confirmDelete(operation)}
            accessibilityRole="button"
            accessibilityLabel={`Recibo ${operation.folio}`}
          >
            <Card style={styles.item}>
              <View style={styles.itemHead}>
                <Text
                  style={[
                    styles.itemType,
                    operation.type === 'BUY' ? styles.itemBuy : styles.itemSell,
                  ]}
                >
                  {operationLabel(operation.type).toUpperCase()}
                </Text>
                <Text style={styles.itemFolio}>{operation.folio}</Text>
              </View>

              <View style={styles.itemBody}>
                <Text style={styles.itemForeign}>
                  {formatMoney(operation.foreignAmount, operation.currencyCode, settings.decimals)}
                </Text>
                <Text style={styles.itemArrow}>{operation.type === 'BUY' ? '→' : '←'}</Text>
                <Text style={styles.itemLocal}>
                  {formatMoney(operation.netLocal, operation.baseCurrency, settings.decimals)}
                </Text>
              </View>

              <Text style={styles.itemMeta}>
                {formatDateTime(operation.createdAt)} · TC {formatNumber(operation.rate, 4)}
                {operation.customer ? ` · ${operation.customer}` : ''}
              </Text>
            </Card>
          </Pressable>
        ))
      )}

      <Muted style={styles.legend}>Toca una operación para ver su recibo. Mantén pulsado para eliminarla.</Muted>

      <ReceiptModal
        operation={receipt}
        settings={settings}
        visible={receipt !== null}
        onClose={() => setReceipt(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryTitle: { ...type.section, color: colors.textDim, marginBottom: spacing.lg },
  summaryRow: { flexDirection: 'row', gap: spacing.md },
  summaryItem: { flex: 1, gap: 4 },
  summaryLabel: { ...type.tiny, color: colors.textDim, fontSize: 9 },
  summaryValue: { fontSize: 20, fontWeight: '300', color: colors.text },
  summaryFoot: { marginTop: spacing.md },

  item: { gap: spacing.sm },
  itemHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemType: {
    ...type.tiny,
    fontSize: 9,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  itemBuy: { color: colors.onAccent, backgroundColor: colors.accent },
  itemSell: {
    color: colors.text,
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  itemFolio: { ...type.tiny, color: colors.textDim },
  itemBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemForeign: { fontSize: 16, color: colors.text, fontWeight: '400' },
  itemArrow: { fontSize: 14, color: colors.textDim },
  itemLocal: { fontSize: 16, color: colors.text, fontWeight: '500' },
  itemMeta: { ...type.small, color: colors.textDim, fontSize: 11 },
  legend: { textAlign: 'center' },
});
