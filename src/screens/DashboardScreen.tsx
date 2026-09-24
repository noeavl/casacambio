import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { Card, EmptyState, Segmented } from '../components/ui';
import { useApp } from '../state/AppContext';
import { useLanguage } from '../state/LanguageContext';
import { useTheme } from '../state/ThemeContext';
import { spacing, type as type_, type Palette } from '../theme';
import { formatMoney } from '../utils/format';

type Range = 'today' | 'week' | 'month';

function isInRange(iso: string, range: Range): boolean {
  const date = new Date(iso);
  const now = new Date();
  if (range === 'today') {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }
  if (range === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return date >= start && date <= now;
  }
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

/** Panel de indicadores financieros: volumen, compras vs. ventas, comisión, ticket promedio. */
export function DashboardScreen() {
  const { settings, operations } = useApp();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [range, setRange] = useState<Range>('today');

  const filtered = useMemo(
    () => operations.filter((op) => isInRange(op.createdAt, range)),
    [operations, range],
  );

  const stats = useMemo(() => {
    const buys = filtered.filter((op) => op.type === 'BUY');
    const sells = filtered.filter((op) => op.type === 'SELL');
    const volume = filtered.reduce((sum, op) => sum + op.netLocal, 0);
    const commission = filtered.reduce((sum, op) => sum + op.commissionAmount, 0);
    const count = filtered.length;
    return {
      count,
      volume,
      commission,
      averageTicket: count > 0 ? volume / count : 0,
      buyCount: buys.length,
      buyAmount: buys.reduce((sum, op) => sum + op.netLocal, 0),
      sellCount: sells.length,
      sellAmount: sells.reduce((sum, op) => sum + op.netLocal, 0),
    };
  }, [filtered]);

  const money = (value: number) => formatMoney(value, settings.baseCurrency, settings.decimals);

  return (
    <Screen title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
      <Segmented<Range>
        value={range}
        onChange={setRange}
        options={[
          { value: 'today', label: t('dashboard.rangeToday') },
          { value: 'week', label: t('dashboard.rangeWeek') },
          { value: 'month', label: t('dashboard.rangeMonth') },
        ]}
      />

      {stats.count === 0 ? (
        <Card>
          <EmptyState title={t('dashboard.emptyHint')} />
        </Card>
      ) : (
        <>
          <Card>
            <View style={styles.statGrid}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t('dashboard.volumeLabel').toUpperCase()}</Text>
                  <Text style={styles.statValue}>{money(stats.volume)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t('dashboard.averageTicketLabel').toUpperCase()}</Text>
                  <Text style={styles.statValue}>{money(stats.averageTicket)}</Text>
                </View>
              </View>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t('dashboard.commissionLabel').toUpperCase()}</Text>
                  <Text style={styles.statValue}>{money(stats.commission)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t('dashboard.operationsLabel').toUpperCase()}</Text>
                  <Text style={styles.statValue}>{stats.count}</Text>
                </View>
              </View>
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>{t('dashboard.buySellSection').toUpperCase()}</Text>
            <View style={styles.compareRow}>
              <View style={styles.compareItem}>
                <Text style={styles.compareLabel}>{t('dashboard.buyLabel').toUpperCase()}</Text>
                <Text style={styles.compareCount}>{stats.buyCount}</Text>
                <Text style={styles.compareAmount}>{money(stats.buyAmount)}</Text>
              </View>
              <View style={styles.compareSeparator} />
              <View style={styles.compareItem}>
                <Text style={styles.compareLabel}>{t('dashboard.sellLabel').toUpperCase()}</Text>
                <Text style={styles.compareCount}>{stats.sellCount}</Text>
                <Text style={styles.compareAmount}>{money(stats.sellAmount)}</Text>
              </View>
            </View>
          </Card>
        </>
      )}
    </Screen>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    statGrid: { gap: spacing.lg },
    statRow: { flexDirection: 'row', gap: spacing.lg },
    statItem: { flex: 1, gap: 4 },
    statLabel: { ...type_.tiny, color: colors.textDim, fontSize: 9 },
    statValue: { fontSize: 20, fontWeight: '300', color: colors.text },
    sectionTitle: { ...type_.section, color: colors.textDim, marginBottom: spacing.lg },
    compareRow: { flexDirection: 'row', alignItems: 'center' },
    compareItem: { flex: 1, gap: 2, alignItems: 'center' },
    compareLabel: { ...type_.tiny, color: colors.textDim, fontSize: 9 },
    compareCount: { fontSize: 22, fontWeight: '300', color: colors.text },
    compareAmount: { ...type_.small, color: colors.textMuted },
    compareSeparator: { width: StyleSheet.hairlineWidth, height: 48, backgroundColor: colors.border },
  });
}
