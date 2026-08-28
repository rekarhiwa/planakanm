import { addDays, format, startOfMonth, endOfMonth } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '../components/Chip';
import type { Plan } from '../domain/entities/types';
import * as planRepo from '../data/repositories/planRepository';
import { usePlanStore } from '../stores/planStore';
import { useSettingsStore } from '../stores/settingsStore';
import { radius, spacing, typography } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import {
  formatDateISO,
  getDayNameShort,
  getMonthDays,
  getMonthName,
  getTodayISO,
  getWeekDates,
} from '../utils/dates';

type ViewMode = 'week' | 'month' | 'year';

export function CalendarScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const weekStartsOn = useSettingsStore((s) => s.settings.weekStartsOn);
  const language = useSettingsStore((s) => s.settings.language);
  const setSelectedDate = usePlanStore((s) => s.setSelectedDate);

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plansMap, setPlansMap] = useState<Record<string, Plan[]>>({});

  const loadPlans = useCallback(async () => {
    const start = formatDateISO(startOfMonth(currentDate));
    const end = formatDateISO(endOfMonth(addDays(currentDate, 60)));
    const plans = await planRepo.getPlansInRange(start, end);
    const map: Record<string, Plan[]> = {};
    for (const plan of plans) {
      if (!map[plan.date]) map[plan.date] = [];
      map[plan.date].push(plan);
    }
    setPlansMap(map);
  }, [currentDate]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const weekDates = getWeekDates(currentDate, weekStartsOn);
  const monthWeeks = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  const today = getTodayISO();

  const handleDayPress = (date: Date) => {
    setSelectedDate(formatDateISO(date));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('tabs.calendar')}</Text>
        <View style={styles.modeRow}>
          {(['week', 'month', 'year'] as ViewMode[]).map((mode) => (
            <Chip
              key={mode}
              label={t(`calendar.${mode}`)}
              selected={viewMode === mode}
              onPress={() => setViewMode(mode)}
            />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {viewMode === 'week' && (
          <View style={styles.weekContainer}>
            {weekDates.map((date) => {
              const dateStr = formatDateISO(date);
              const dayPlans = plansMap[dateStr] ?? [];
              const isToday = dateStr === today;

              return (
                <Pressable
                  key={dateStr}
                  onPress={() => handleDayPress(date)}
                  style={[
                    styles.weekDay,
                    {
                      backgroundColor: isToday ? colors.nowHighlight : colors.surface,
                      borderColor: isToday ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.weekDayName, { color: colors.textSecondary }]}>
                    {getDayNameShort(date, language)}
                  </Text>
                  <Text style={[styles.weekDayNum, { color: colors.text }]}>{date.getDate()}</Text>
                  {dayPlans.length > 0 && (
                    <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                      <Text style={{ color: colors.fabText, fontSize: 11 }}>{dayPlans.length}</Text>
                    </View>
                  )}
                  {dayPlans.slice(0, 3).map((p) => (
                    <Text key={p.id} style={[styles.miniPlan, { color: colors.textSecondary }]} numberOfLines={1}>
                      {p.hasTime && p.time ? `${p.time} ` : ''}{p.title}
                    </Text>
                  ))}
                </Pressable>
              );
            })}
          </View>
        )}

        {viewMode === 'month' && (
          <View>
            <Text style={[styles.monthTitle, { color: colors.text }]}>
              {getMonthName(currentDate.getMonth(), language)} {currentDate.getFullYear()}
            </Text>
            {monthWeeks.map((week, wi) => (
              <View key={wi} style={styles.monthRow}>
                {week.map((date, di) => {
                  if (!date) return <View key={di} style={styles.monthCell} />;
                  const dateStr = formatDateISO(date);
                  const count = (plansMap[dateStr] ?? []).length;
                  const isToday = dateStr === today;

                  return (
                    <Pressable
                      key={di}
                      onPress={() => handleDayPress(date)}
                      style={[
                        styles.monthCell,
                        isToday && { backgroundColor: colors.nowHighlight, borderRadius: radius.sm },
                      ]}
                    >
                      <Text style={[styles.monthDay, { color: isToday ? colors.primary : colors.text }]}>
                        {date.getDate()}
                      </Text>
                      {count > 0 && (
                        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {viewMode === 'year' && (
          <View style={styles.yearGrid}>
            {Array.from({ length: 12 }, (_, i) => {
              const monthPlans = Object.entries(plansMap).filter(([d]) => {
                const dt = new Date(d);
                return dt.getMonth() === i && dt.getFullYear() === currentDate.getFullYear();
              });
              const total = monthPlans.reduce((sum, [, ps]) => sum + ps.length, 0);

              return (
                <Pressable
                  key={i}
                  onPress={() => {
                    setCurrentDate(new Date(currentDate.getFullYear(), i, 1));
                    setViewMode('month');
                  }}
                  style={[styles.yearCell, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={[styles.yearMonth, { color: colors.text }]}>
                    {getMonthName(i, language)}
                  </Text>
                  {total > 0 && (
                    <Text style={[styles.yearCount, { color: colors.primary }]}>
                      {t('calendar.plansCount', { count: total })}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.lg },
  title: { ...typography.display, fontSize: 26, textAlign: 'right', marginBottom: spacing.md },
  modeRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' },
  scroll: { padding: spacing.lg, paddingBottom: 100 },
  weekContainer: { gap: spacing.sm },
  weekDay: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  weekDayName: { ...typography.caption, textAlign: 'right' },
  weekDayNum: { ...typography.title, textAlign: 'right' },
  countBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  miniPlan: { ...typography.caption, textAlign: 'right', marginTop: 2 },
  monthTitle: { ...typography.title, textAlign: 'center', marginBottom: spacing.lg },
  monthRow: { flexDirection: 'row' },
  monthCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDay: { ...typography.body },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  yearCell: {
    width: '30%',
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  yearMonth: { ...typography.label, marginBottom: spacing.xs },
  yearCount: { ...typography.caption },
});
