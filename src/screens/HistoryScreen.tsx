import { useMemo, useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';

import { Screen } from '../components/Screen';
import { ReceiptModal } from '../components/ReceiptModal';
import { Card, EmptyState, Muted, Segmented } from '../components/ui';
import { useApp } from '../state/AppContext';
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
        <Text>Resumen de hoy</Text>
        <Text>Operaciones: {totals.count}</Text>
        <Text>Pagado: {formatNumber(totals.paid, settings.decimals)}</Text>
        <Text>Cobrado: {formatNumber(totals.charged, settings.decimals)}</Text>
        <Text>
          Saldo neto en caja: {formatMoney(totals.balance, settings.baseCurrency, settings.decimals)}
        </Text>
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
            <Card>
              <Text>
                {operationLabel(operation.type)} · {operation.folio}
              </Text>
              <Text>
                {formatMoney(operation.foreignAmount, operation.currencyCode, settings.decimals)}{' '}
                {operation.type === 'BUY' ? '→' : '←'}{' '}
                {formatMoney(operation.netLocal, operation.baseCurrency, settings.decimals)}
              </Text>
              <Text>
                {formatDateTime(operation.createdAt)} · TC {formatNumber(operation.rate, 4)}
                {operation.customer ? ` · ${operation.customer}` : ''}
              </Text>
            </Card>
          </Pressable>
        ))
      )}

      <Muted>Toca una operación para ver su recibo. Mantén pulsado para eliminarla.</Muted>

      <ReceiptModal
        operation={receipt}
        settings={settings}
        visible={receipt !== null}
        onClose={() => setReceipt(null)}
      />
    </Screen>
  );
}

