import { Text, View } from 'react-native';

import type { Operation, Settings } from '../types';
import { operationLabel } from '../utils/exchange';
import { formatDate, formatMoney, formatNumber, formatTime } from '../utils/format';

function Line({ label, value }: { label: string; value: string }) {
  return (
    <Text>
      {label}: {value}
    </Text>
  );
}

/** Líneas del recibo comunes a la vista en pantalla y a la impresión. */
export function receiptLines(operation: Operation, settings: Settings) {
  const d = settings.decimals;
  const isBuy = operation.type === 'BUY';
  const foreign = formatMoney(operation.foreignAmount, operation.currencyCode, d);
  const local = formatMoney(operation.netLocal, operation.baseCurrency, d);

  return {
    isBuy,
    detail: [
      { label: 'Folio', value: operation.folio },
      { label: 'Fecha', value: formatDate(operation.createdAt) },
      { label: 'Hora', value: formatTime(operation.createdAt) },
      { label: 'Operador', value: operation.operator || '—' },
      { label: 'Cliente', value: operation.customer || 'Público en general' },
    ],
    amounts: [
      {
        label: 'Tipo de cambio',
        value: `${formatNumber(operation.rate, 4)} ${operation.baseCurrency}/${operation.currencyCode}`,
      },
      { label: 'Divisa', value: `${operation.currencyCode} · ${operation.currencyName}` },
      {
        label: 'Monto en divisa',
        value: formatMoney(operation.foreignAmount, operation.currencyCode, d),
      },
      { label: 'Subtotal', value: formatMoney(operation.grossLocal, operation.baseCurrency, d) },
      {
        label: `Comisión (${formatNumber(operation.commissionPercent, 2)}%)`,
        value: `${isBuy ? '-' : '+'} ${formatMoney(operation.commissionAmount, operation.baseCurrency, d)}`,
      },
    ],
    gives: isBuy ? foreign : local,
    gets: isBuy ? local : foreign,
    totalLabel: isBuy ? 'Total a pagar al cliente' : 'Total a cobrar al cliente',
    total: local,
  };
}

/** Recibo en pantalla. */
export function Receipt({ operation, settings }: { operation: Operation; settings: Settings }) {
  const data = receiptLines(operation, settings);

  return (
    <View>
      <Text>{settings.businessName}</Text>
      {settings.branch ? <Text>Sucursal {settings.branch}</Text> : null}
      {settings.address ? <Text>{settings.address}</Text> : null}
      {settings.phone ? <Text>Tel. {settings.phone}</Text> : null}
      {settings.taxId ? <Text>RFC {settings.taxId}</Text> : null}

      <Text>
        {operationLabel(operation.type)} de {operation.currencyCode}
      </Text>

      {data.detail.map((item) => (
        <Line key={item.label} label={item.label} value={item.value} />
      ))}

      {data.amounts.map((item) => (
        <Line key={item.label} label={item.label} value={item.value} />
      ))}

      <Line label="El cliente entrega" value={data.gives} />
      <Line label="El cliente recibe" value={data.gets} />

      <Line label={data.totalLabel} value={data.total} />

      {operation.note ? <Text>{operation.note}</Text> : null}

      <Text>Firma del cliente: _____________________________</Text>

      {settings.receiptFooter ? <Text>{settings.receiptFooter}</Text> : null}
      <Text>Comprobante interno de operación</Text>
    </View>
  );
}

/** Versión HTML del mismo recibo, para impresión física o PDF. */
export function receiptHTML(operation: Operation, settings: Settings): string {
  const data = receiptLines(operation, settings);
  const esc = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const line = (label: string, value: string) => `<p>${esc(label)}: ${esc(value)}</p>`;

  const head = [
    settings.branch ? `Sucursal ${settings.branch}` : '',
    settings.address,
    settings.phone ? `Tel. ${settings.phone}` : '',
    settings.taxId ? `RFC ${settings.taxId}` : '',
  ]
    .filter(Boolean)
    .map((text) => `<p>${esc(text)}</p>`)
    .join('');

  return `<!doctype html>
<html><head><meta charset="utf-8" /></head>
<body>
  <p>${esc(settings.businessName)}</p>
  ${head}
  <p>${esc(operationLabel(operation.type))} de ${esc(operation.currencyCode)}</p>
  ${data.detail.map((item) => line(item.label, item.value)).join('')}
  ${data.amounts.map((item) => line(item.label, item.value)).join('')}
  ${line('El cliente entrega', data.gives)}
  ${line('El cliente recibe', data.gets)}
  ${line(data.totalLabel, data.total)}
  ${operation.note ? `<p>${esc(operation.note)}</p>` : ''}
  <p>Firma del cliente: _____________________________</p>
  ${settings.receiptFooter ? `<p>${esc(settings.receiptFooter)}</p>` : ''}
  <p>Comprobante interno de operación</p>
</body></html>`;
}
