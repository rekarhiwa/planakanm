import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as planRepo from '../data/repositories/planRepository';
import { spacing, typography } from '../theme/colors';
import { layoutRow, rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';

interface Stats {
  todayTotal: number;
  todayCompleted: number;
  weekTotal: number;
  weekCompleted: number;
  monthTotal: number;
  monthCompleted: number;
  streak: number;
  missed: number;
  snoozed: number;
}

export function StatsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const rtl = rtlTextStyle();
  const [stats, setStats] = useState<Stats | null>(null);

  const loadStats = useCallback(async () => {
    const now = Date.now();
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const weekStart = now - 7 * 86400000;
    const monthStart = now - 30 * 86400000;

    const [today, week, month, streak] = await Promise.all([
      planRepo.getPlanStats(dayStart.getTime()),
      planRepo.getPlanStats(weekStart),
      planRepo.getPlanStats(monthStart),
      planRepo.getCompletedStreak(),
    ]);

    setStats({
      todayTotal: today.total,
      todayCompleted: today.completed,
      weekTotal: week.total,
      weekCompleted: week.completed,
      monthTotal: month.total,
      monthCompleted: month.completed,
      streak,
      missed: week.missed,
      snoozed: week.snoozed,
    });
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (!stats) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[{ color: colors.text, textAlign: 'center', marginTop: 40 }, rtl]}>
          {t('common.loading')}
        </Text>
      </SafeAreaView>
    );
  }

  const weekRate = stats.weekTotal > 0 ? Math.round((stats.weekCompleted / stats.weekTotal) * 100) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.text }, rtl]}>{t('stats.title')}</Text>

        <StatCard
          label={t('stats.thisWeek')}
          total={stats.weekTotal}
          completed={stats.weekCompleted}
          rate={weekRate}
          colors={colors}
        />

        <View style={[styles.row, { flexDirection: layoutRow() }]}>
          <MiniStat label={t('stats.streak')} value={`${stats.streak} ${t('stats.days')}`} colors={colors} />
          <MiniStat label={t('stats.missed')} value={String(stats.missed)} colors={colors} />
          <MiniStat label={t('stats.snoozed')} value={String(stats.snoozed)} colors={colors} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }, rtl]}>{t('stats.completionRate')}</Text>
        <BarChart
          data={[
            { label: t('stats.today'), rate: stats.todayTotal > 0 ? (stats.todayCompleted / stats.todayTotal) * 100 : 0 },
            { label: t('stats.thisWeek'), rate: weekRate },
            { label: t('stats.thisMonth'), rate: stats.monthTotal > 0 ? (stats.monthCompleted / stats.monthTotal) * 100 : 0 },
          ]}
          color={colors.primary}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  total,
  completed,
  rate,
  colors,
}: {
  label: string;
  total: number;
  completed: number;
  rate: number;
  colors: { surface: string; border: string; text: string; textSecondary: string; primary: string };
}) {
  const rtl = rtlTextStyle();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.cardLabel, { color: colors.textSecondary }, rtl]}>{label}</Text>
      <Text style={[styles.cardValue, { color: colors.text }, rtl]}>
        {completed} / {total}
      </Text>
      <Text style={[styles.cardRate, { color: colors.primary }, rtl]}>{rate}%</Text>
    </View>
  );
}

function MiniStat({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { surface: string; border: string; text: string; primary: string };
}) {
  const rtl = rtlTextStyle();

  return (
    <View style={[styles.miniStat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.miniLabel, { color: colors.text }, rtl]}>{value}</Text>
      <Text style={[styles.miniValue, { color: colors.primary }, rtl]}>{label}</Text>
    </View>
  );
}

function BarChart({
  data,
  color,
}: {
  data: { label: string; rate: number }[];
  color: string;
}) {
  const rtl = rtlTextStyle();
  const barWidth = 60;
  const maxHeight = 120;
  const gap = 40;

  return (
    <View style={styles.chartContainer}>
      <Svg width={data.length * (barWidth + gap)} height={maxHeight + 30}>
        {data.map((d, i) => {
          const height = Math.max((d.rate / 100) * maxHeight, 4);
          const x = i * (barWidth + gap);
          return (
            <Rect
              key={d.label}
              x={x}
              y={maxHeight - height}
              width={barWidth}
              height={height}
              fill={color}
              rx={4}
            />
          );
        })}
      </Svg>
      <View style={[styles.chartLabels, { flexDirection: layoutRow() }]}>
        {data.map((d) => (
          <Text key={d.label} style={[styles.chartLabel, rtl]}>{d.label}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 100 },
  title: { ...typography.display, fontSize: 26, marginBottom: spacing.xl },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  cardLabel: { ...typography.caption, marginBottom: spacing.sm },
  cardValue: { ...typography.display, fontSize: 36 },
  cardRate: { ...typography.title, marginTop: spacing.sm },
  row: { gap: spacing.sm, marginBottom: spacing.xl },
  miniStat: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  miniLabel: { ...typography.title, fontSize: 22 },
  miniValue: { ...typography.caption, marginTop: spacing.xs, textAlign: 'center' },
  sectionTitle: { ...typography.title, marginBottom: spacing.lg },
  chartContainer: { alignItems: 'center', marginBottom: spacing.xl },
  chartLabels: { gap: 40, marginTop: spacing.sm },
  chartLabel: { ...typography.caption, width: 60, textAlign: 'center' },
});
