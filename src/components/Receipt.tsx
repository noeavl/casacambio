import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../state/ThemeContext';
import { spacing, type Palette } from '../theme';
import type { Operation, Settings } from '../types';
import { operationLabel } from '../utils/exchange';
import { formatDate, formatMoney, formatNumber, formatTime, monoFont } from '../utils/format';

const DASHES = '- '.repeat(40);

function Dashed({ styles }: { styles: ReturnType<typeof createStyles> }) {
  return (
    <Text numberOfLines={1} style={styles.dashed}>
      {DASHES}
    </Text>
  );
}

function Line({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.line}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={styles.lineValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
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
    totalLabel: isBuy ? 'TOTAL A PAGAR AL CLIENTE' : 'TOTAL A COBRAR AL CLIENTE',
    total: local,
  };
}

/** Recibo tal como se imprime en pantalla: papel blanco, siempre, con o sin tema oscuro. */
export function Receipt({ operation, settings }: { operation: Operation; settings: Settings }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const data = receiptLines(operation, settings);

  return (
    <View style={styles.paper}>
      <Text style={styles.business}>{settings.businessName.toUpperCase()}</Text>
      {settings.branch ? <Text style={styles.centered}>Sucursal {settings.branch}</Text> : null}
      {settings.address ? <Text style={styles.centered}>{settings.address}</Text> : null}
      {settings.phone ? <Text style={styles.centered}>Tel. {settings.phone}</Text> : null}
      {settings.taxId ? <Text style={styles.centered}>RFC {settings.taxId}</Text> : null}

      <Dashed styles={styles} />
      <Text style={styles.operation}>
        {operationLabel(operation.type).toUpperCase()} DE {operation.currencyCode}
      </Text>
      <Dashed styles={styles} />

      {data.detail.map((item) => (
        <Line key={item.label} label={item.label} value={item.value} styles={styles} />
      ))}

      <Dashed styles={styles} />

      {data.amounts.map((item) => (
        <Line key={item.label} label={item.label} value={item.value} styles={styles} />
      ))}

      <Dashed styles={styles} />

      <Line label="El cliente entrega" value={data.gives} styles={styles} />
      <Line label="El cliente recibe" value={data.gets} styles={styles} />

      <Dashed styles={styles} />

      <Text style={styles.totalLabel}>{data.totalLabel}</Text>
      <Text style={styles.total}>{data.total}</Text>

      {operation.note ? (
        <>
          <Dashed styles={styles} />
          <Text style={styles.note}>{operation.note}</Text>
        </>
      ) : null}

      <Dashed styles={styles} />
      <Text style={styles.signatureLine}>_____________________________</Text>
      <Text style={styles.centered}>Firma del cliente</Text>

      {settings.receiptFooter ? <Text style={styles.footer}>{settings.receiptFooter}</Text> : null}
      <Text style={styles.disclaimer}>Comprobante interno de operación</Text>
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

  const line = (label: string, value: string) =>
    `<div class="line"><span>${esc(label)}</span><span>${esc(value)}</span></div>`;

  const head = [
    settings.branch ? `Sucursal ${settings.branch}` : '',
    settings.address,
    settings.phone ? `Tel. ${settings.phone}` : '',
    settings.taxId ? `RFC ${settings.taxId}` : '',
  ]
    .filter(Boolean)
    .map((text) => `<div class="c">${esc(text)}</div>`)
    .join('');

  return `<!doctype html>
<html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  @page { margin: 8mm; }
  body { font-family: "Courier New", Courier, monospace; font-size: 12px; color: #000; background: #fff; }
  .ticket { max-width: 320px; margin: 0 auto; }
  .biz { text-align: center; font-size: 16px; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; }
  .c { text-align: center; }
  .dash { border-top: 1px dashed #000; margin: 8px 0; }
  .op { text-align: center; font-weight: 700; letter-spacing: 1px; }
  .line { display: flex; justify-content: space-between; gap: 12px; padding: 2px 0; }
  .line span:last-child { text-align: right; }
  .total-label { text-align: center; font-size: 10px; letter-spacing: 1px; margin-top: 6px; }
  .total { text-align: center; font-size: 20px; font-weight: 700; margin-top: 2px; }
  .note { font-style: italic; }
  .sign { text-align: center; margin-top: 18px; }
  .foot { text-align: center; margin-top: 10px; }
  .small { text-align: center; font-size: 10px; color: #555; margin-top: 4px; }
</style></head>
<body><div class="ticket">
  <div class="biz">${esc(settings.businessName.toUpperCase())}</div>
  ${head}
  <div class="dash"></div>
  <div class="op">${esc(operationLabel(operation.type).toUpperCase())} DE ${esc(operation.currencyCode)}</div>
  <div class="dash"></div>
  ${data.detail.map((item) => line(item.label, item.value)).join('')}
  <div class="dash"></div>
  ${data.amounts.map((item) => line(item.label, item.value)).join('')}
  <div class="dash"></div>
  ${line('El cliente entrega', data.gives)}
  ${line('El cliente recibe', data.gets)}
  <div class="dash"></div>
  <div class="total-label">${esc(data.totalLabel)}</div>
  <div class="total">${esc(data.total)}</div>
  ${operation.note ? `<div class="dash"></div><div class="note">${esc(operation.note)}</div>` : ''}
  <div class="dash"></div>
  <div class="sign">_____________________________</div>
  <div class="c">Firma del cliente</div>
  ${settings.receiptFooter ? `<div class="foot">${esc(settings.receiptFooter)}</div>` : ''}
  <div class="small">Comprobante interno de operación</div>
</div></body></html>`;
}

function createStyles(colors: Palette) {
  const mono = { fontFamily: monoFont };
  return StyleSheet.create({
    paper: {
      backgroundColor: colors.paper,
      borderRadius: 4,
      padding: spacing.lg,
      gap: 2,
    },
    business: {
      ...mono,
      color: colors.paperText,
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 1,
      marginBottom: 2,
    },
    centered: { ...mono, color: colors.paperText, fontSize: 11, textAlign: 'center' },
    dashed: {
      ...mono,
      color: colors.paperLine,
      fontSize: 11,
      marginVertical: 6,
      overflow: 'hidden',
    },
    operation: {
      ...mono,
      color: colors.paperText,
      fontSize: 13,
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 1,
    },
    line: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 1 },
    lineLabel: { ...mono, color: colors.paperMuted, fontSize: 11, flexShrink: 1 },
    lineValue: { ...mono, color: colors.paperText, fontSize: 11, textAlign: 'right', flexShrink: 1 },
    totalLabel: {
      ...mono,
      color: colors.paperMuted,
      fontSize: 10,
      textAlign: 'center',
      letterSpacing: 1,
      marginTop: 4,
    },
    total: {
      ...mono,
      color: colors.paperText,
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
    },
    note: { ...mono, color: colors.paperText, fontSize: 11, fontStyle: 'italic' },
    signatureLine: { ...mono, color: colors.paperText, fontSize: 11, textAlign: 'center', marginTop: spacing.lg },
    footer: { ...mono, color: colors.paperText, fontSize: 11, textAlign: 'center', marginTop: spacing.md },
    disclaimer: { ...mono, color: colors.paperMuted, fontSize: 10, textAlign: 'center', marginTop: 2 },
  });
}
