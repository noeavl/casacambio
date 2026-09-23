import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useLanguage } from '../state/LanguageContext';
import { useTheme } from '../state/ThemeContext';
import { spacing, type Palette } from '../theme';
import type { Operation, Settings } from '../types';
import { operationLabel } from '../utils/exchange';
import { formatDate, formatMoney, formatNumber, formatTime, monoFont } from '../utils/format';

type T = (key: Parameters<ReturnType<typeof useLanguage>['t']>[0], vars?: Record<string, string | number>) => string;

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

/** Líneas del recibo comunes a la vista en pantalla y a la impresión. Función pura: recibe `t` como parámetro. */
export function receiptLines(operation: Operation, settings: Settings, t: T) {
  const d = settings.decimals;
  const isBuy = operation.type === 'BUY';
  const foreign = formatMoney(operation.foreignAmount, operation.currencyCode, d);
  const local = formatMoney(operation.netLocal, operation.baseCurrency, d);

  return {
    isBuy,
    heading: t('receipt.operationHeading', {
      type: operationLabel(operation.type, t).toUpperCase(),
      code: operation.currencyCode,
    }),
    head: [
      settings.branch ? t('receipt.branchPrefix', { branch: settings.branch }) : '',
      settings.address,
      settings.phone ? t('receipt.phonePrefix', { phone: settings.phone }) : '',
      settings.taxId ? t('receipt.taxIdPrefix', { taxId: settings.taxId }) : '',
    ].filter(Boolean),
    detail: [
      { label: t('receipt.folioLabel'), value: operation.folio },
      { label: t('receipt.dateLabel'), value: formatDate(operation.createdAt) },
      { label: t('receipt.timeLabel'), value: formatTime(operation.createdAt) },
      { label: t('receipt.operatorLabel'), value: operation.operator || '—' },
      {
        label: t('receipt.customerLabel'),
        value: operation.customer || t('receipt.customerFallback'),
      },
    ],
    amounts: [
      {
        label: t('receipt.exchangeRateLabel'),
        value: `${formatNumber(operation.rate, 4)} ${operation.baseCurrency}/${operation.currencyCode}`,
      },
      {
        label: t('receipt.currencyLabel'),
        value: `${operation.currencyCode} · ${operation.currencyName}`,
      },
      {
        label: t('receipt.foreignAmountLabel'),
        value: formatMoney(operation.foreignAmount, operation.currencyCode, d),
      },
      {
        label: t('receipt.subtotalLabel'),
        value: formatMoney(operation.grossLocal, operation.baseCurrency, d),
      },
      {
        label: t('receipt.commissionLabel', { percent: formatNumber(operation.commissionPercent, 2) }),
        value: `${isBuy ? '-' : '+'} ${formatMoney(operation.commissionAmount, operation.baseCurrency, d)}`,
      },
    ],
    gives: isBuy ? foreign : local,
    gets: isBuy ? local : foreign,
    totalLabel: isBuy ? t('receipt.totalPay') : t('receipt.totalCharge'),
    total: local,
  };
}

/** Recibo tal como se imprime en pantalla: papel blanco, siempre, con o sin tema oscuro. */
export function Receipt({ operation, settings }: { operation: Operation; settings: Settings }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const data = receiptLines(operation, settings, t);

  return (
    <View style={styles.paper}>
      <Text style={styles.business}>{settings.businessName.toUpperCase()}</Text>
      {data.head.map((line) => (
        <Text key={line} style={styles.centered}>
          {line}
        </Text>
      ))}

      <Dashed styles={styles} />
      <Text style={styles.operation}>{data.heading}</Text>
      <Dashed styles={styles} />

      {data.detail.map((item) => (
        <Line key={item.label} label={item.label} value={item.value} styles={styles} />
      ))}

      <Dashed styles={styles} />

      {data.amounts.map((item) => (
        <Line key={item.label} label={item.label} value={item.value} styles={styles} />
      ))}

      <Dashed styles={styles} />

      <Line label={t('receipt.givesLabel')} value={data.gives} styles={styles} />
      <Line label={t('receipt.getsLabel')} value={data.gets} styles={styles} />

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
      <Text style={styles.centered}>{t('receipt.signature')}</Text>

      {settings.receiptFooter ? <Text style={styles.footer}>{settings.receiptFooter}</Text> : null}
      <Text style={styles.disclaimer}>{t('receipt.disclaimer')}</Text>
    </View>
  );
}

/** Versión HTML del mismo recibo, para impresión física o PDF. Función pura: recibe `t` como parámetro. */
export function receiptHTML(operation: Operation, settings: Settings, t: T): string {
  const data = receiptLines(operation, settings, t);
  const esc = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const line = (label: string, value: string) =>
    `<div class="line"><span>${esc(label)}</span><span>${esc(value)}</span></div>`;

  const head = data.head.map((text) => `<div class="c">${esc(text)}</div>`).join('');

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
  <div class="op">${esc(data.heading)}</div>
  <div class="dash"></div>
  ${data.detail.map((item) => line(item.label, item.value)).join('')}
  <div class="dash"></div>
  ${data.amounts.map((item) => line(item.label, item.value)).join('')}
  <div class="dash"></div>
  ${line(t('receipt.givesLabel'), data.gives)}
  ${line(t('receipt.getsLabel'), data.gets)}
  <div class="dash"></div>
  <div class="total-label">${esc(data.totalLabel)}</div>
  <div class="total">${esc(data.total)}</div>
  ${operation.note ? `<div class="dash"></div><div class="note">${esc(operation.note)}</div>` : ''}
  <div class="dash"></div>
  <div class="sign">_____________________________</div>
  <div class="c">${esc(t('receipt.signature'))}</div>
  ${settings.receiptFooter ? `<div class="foot">${esc(settings.receiptFooter)}</div>` : ''}
  <div class="small">${esc(t('receipt.disclaimer'))}</div>
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
