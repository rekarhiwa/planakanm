import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '../components/AppIcon';
import { DateSelector } from '../components/DateSelector';
import { CategoryFilterChips } from '../components/CategoryFilterChips';
import { EmptyState } from '../components/EmptyState';
import { FAB } from '../components/FAB';
import { FilterChips } from '../components/FilterChips';
import { NowCard } from '../components/NowCard';
import { OverdueDialog } from '../components/OverdueDialog';
import { PlanRow } from '../components/PlanRow';
import { SectionHeader } from '../components/SectionHeader';
import { SnoozePicker } from '../components/SnoozePicker';
import { UndoSnackbar } from '../components/UndoSnackbar';
import { navigateToCreatePlan } from '../navigation/navigationRef';
import type { RootStackParamList } from '../navigation';
import type { Plan } from '../domain/entities/types';
import { filterPlans, usePlanStore } from '../stores/planStore';
import { useDialogStore } from '../stores/dialogStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';
import { spacing, typography } from '../theme/colors';
import { layoutAlignEnd, layoutRow, rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';
import type { SnoozeSelection } from '../domain/services/snoozeEngine';
import {
  getGreetingKey,
  getPlanRemainingParts,
  getScheduledDateTime,
  groupPlansByTime,
  isPlanNow,
} from '../utils/dates';

function formatRemainingLabel(
  plan: Plan,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  const remaining = getPlanRemainingParts(plan);
  if (!remaining) return '';
  if (remaining.dueNow) return t('home.dueNow');
  if (remaining.hours === 0) return t('home.remainingMinutes', { count: remaining.minutes });
  if (remaining.minutes === 0) return t('home.remainingHoursOnly', { hours: remaining.hours });
  return t('home.remainingHours', { hours: remaining.hours, minutes: remaining.minutes });
}

export function HomeScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const rawPlans = usePlanStore((s) => s.plans);
  const filter = usePlanStore((s) => s.filter);
  const searchQuery = usePlanStore((s) => s.searchQuery);
  const categoryFilter = usePlanStore((s) => s.categoryFilter);
  const categories = usePlanStore((s) => s.categories);
  const plans = useMemo(
    () => filterPlans(rawPlans, filter, searchQuery, categoryFilter),
    [rawPlans, filter, searchQuery, categoryFilter],
  );
  const selectedDate = usePlanStore((s) => s.selectedDate);
  const setSelectedDate = usePlanStore((s) => s.setSelectedDate);
  const loadPlansForDate = usePlanStore((s) => s.loadPlansForDate);
  const completePlan = usePlanStore((s) => s.completePlan);
  const deletePlan = usePlanStore((s) => s.deletePlan);
  const undoDelete = usePlanStore((s) => s.undoDelete);
  const snoozePlan = usePlanStore((s) => s.snoozePlan);
  const checkOverdue = usePlanStore((s) => s.checkOverdue);
  const isLoading = usePlanStore((s) => s.isLoading);
  const userName = useSettingsStore((s) => s.settings.userName);

  const showSnoozeSheet = useUIStore((s) => s.showSnoozeSheet);
  const snoozePlanId = useUIStore((s) => s.snoozePlanId);
  const openSnooze = useUIStore((s) => s.openSnooze);
  const closeSnooze = useUIStore((s) => s.closeSnooze);
  const showOverdueDialog = useUIStore((s) => s.showOverdueDialog);
  const overduePlans = useUIStore((s) => s.overduePlans);
  const setOverdueDialog = useUIStore((s) => s.setOverdueDialog);
  const showUndoSnackbar = useUIStore((s) => s.showUndoSnackbar);
  const undoMessage = useUIStore((s) => s.undoMessage);
  const showUndo = useUIStore((s) => s.showUndo);
  const hideUndo = useUIStore((s) => s.hideUndo);

  const overduePrompted = useRef(false);

  useEffect(() => {
    loadPlansForDate(selectedDate);
    if (overduePrompted.current) return;

    checkOverdue().then((overdue) => {
      if (overdue.length > 0) {
        overduePrompted.current = true;
        setOverdueDialog(true, overdue.map((p) => p.id));
      }
    });
  }, [selectedDate, loadPlansForDate, checkOverdue, setOverdueDialog]);

  const greetingBase = t(`greeting.${getGreetingKey()}`);
  const greeting = userName?.trim() ? `${greetingBase}، ${userName.trim()}` : greetingBase;
  const pendingCount = plans.filter((p) => p.status === 'pending' || p.status === 'overdue').length;
  const groups = groupPlansByTime(plans);
  const nowPlan = plans.find((p) => isPlanNow(p) && p.status !== 'completed');
  const overdueList = plans.filter((p) => p.status === 'overdue');
  const upcomingPlans = plans.filter(
    (p) => p.status === 'pending' && p.hasTime && !isPlanNow(p),
  );
  const nearestPlanId = useMemo(() => {
    const candidates = plans.filter(
      (p) => (p.status === 'pending' || p.status === 'overdue') && p.hasTime && p.time,
    );
    let bestId: string | undefined;
    let bestDiff = Number.POSITIVE_INFINITY;
    const now = Date.now();
    for (const plan of candidates) {
      const scheduled = getScheduledDateTime(plan);
      if (!scheduled) continue;
      const diff = Math.abs(scheduled.getTime() - now);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestId = plan.id;
      }
    }
    return bestId;
  }, [plans]);

  const handlePlanPress = useCallback(
    (plan: Plan) => navigation.navigate('PlanDetail', { planId: plan.id }),
    [navigation],
  );

  const handleComplete = useCallback(
    async (id: string) => {
      await completePlan(id);
    },
    [completePlan],
  );

  const handleDelete = useCallback(
    async (plan: Plan) => {
      const confirmed = await useDialogStore.getState().showConfirm({
        title: t('detail.deleteTitle'),
        message: t('detail.deleteMessage'),
        confirmLabel: t('common.delete'),
        accent: 'danger',
        destructive: true,
        highlight: { color: colors.primary, label: plan.title },
      });

      if (!confirmed) return;

      await deletePlan(plan.id);
      showUndo(t('common.deleted'));
    },
    [colors.primary, deletePlan, showUndo, t],
  );

  const handleSnoozeSelect = useCallback(
    async (selection: SnoozeSelection) => {
      if (snoozePlanId) await snoozePlan(snoozePlanId, selection);
    },
    [snoozePlanId, snoozePlan],
  );

  const overduePlan = overdueList[0] ?? (overduePlans.length > 0 ? plans.find((p) => p.id === overduePlans[0]) : undefined);
  const rtl = rtlTextStyle();

  const getPlanRowProps = (plan: Plan) => ({
    plan,
    category: categories.find((c) => c.id === plan.categoryId),
    showCategory: categories.length > 0,
    remainingLabel:
      plan.id === nearestPlanId && !nowPlan ? formatRemainingLabel(plan, t) : undefined,
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => loadPlansForDate(selectedDate)} />
        }
      >
        <View style={styles.header}>
          <View style={[styles.headerTop, { flexDirection: layoutRow() }]}>
            <View style={[styles.headerText, { alignItems: layoutAlignEnd() }]}>
              <Text style={[styles.greeting, { color: colors.text }, rtl]}>{greeting}</Text>
              <Text style={[styles.remaining, { color: colors.textSecondary }, rtl]}>
                {t('home.remaining', { count: pendingCount })}
              </Text>
            </View>
            <Pressable onPress={() => navigation.navigate('Search')} hitSlop={12} style={styles.searchBtn}>
              <AppIcon name="Search" color={colors.textSecondary} size={22} />
            </Pressable>
          </View>
        </View>

        <DateSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <FilterChips />
        <CategoryFilterChips />

        {nowPlan && (
          <NowCard
            plan={nowPlan}
            onComplete={() => handleComplete(nowPlan.id)}
            onSnooze={() => openSnooze(nowPlan.id)}
          />
        )}

        {overdueList.length > 0 && (
          <>
            <SectionHeader title={t('home.overdue')} count={overdueList.length} />
            {overdueList.map((plan) => (
              <PlanRow
                key={plan.id}
                {...getPlanRowProps(plan)}
                onPress={() => handlePlanPress(plan)}
                onComplete={() => handleComplete(plan.id)}
                onSnooze={() => openSnooze(plan.id)}
                onDelete={() => handleDelete(plan)}
              />
            ))}
          </>
        )}

        {plans.length === 0 ? (
          <EmptyState onCreatePress={() => navigateToCreatePlan()} />
        ) : (
          <>
            <SectionHeader title={t('home.today')} count={plans.length} />

            {groups.morning.length > 0 && (
              <>
                <Text style={[styles.groupLabel, { color: colors.textSecondary }, rtl]}>
                  {t('home.morning')}
                </Text>
                {groups.morning.map((plan) => (
                  <PlanRow
                    key={plan.id}
                    {...getPlanRowProps(plan)}
                    onPress={() => handlePlanPress(plan)}
                    onComplete={() => handleComplete(plan.id)}
                    onSnooze={() => openSnooze(plan.id)}
                    onDelete={() => handleDelete(plan)}
                  />
                ))}
              </>
            )}

            {groups.afternoon.length > 0 && (
              <>
                <Text style={[styles.groupLabel, { color: colors.textSecondary }, rtl]}>
                  {t('home.afternoon')}
                </Text>
                {groups.afternoon.map((plan) => (
                  <PlanRow
                    key={plan.id}
                    {...getPlanRowProps(plan)}
                    onPress={() => handlePlanPress(plan)}
                    onComplete={() => handleComplete(plan.id)}
                    onSnooze={() => openSnooze(plan.id)}
                    onDelete={() => handleDelete(plan)}
                  />
                ))}
              </>
            )}

            {groups.noTime.length > 0 && (
              <>
                <Text style={[styles.groupLabel, { color: colors.textSecondary }, rtl]}>
                  {t('home.noTime')}
                </Text>
                {groups.noTime.map((plan) => (
                  <PlanRow
                    key={plan.id}
                    {...getPlanRowProps(plan)}
                    showTime={false}
                    onPress={() => handlePlanPress(plan)}
                    onComplete={() => handleComplete(plan.id)}
                    onSnooze={() => openSnooze(plan.id)}
                    onDelete={() => handleDelete(plan)}
                  />
                ))}
              </>
            )}

            {upcomingPlans.length > 0 && (
              <>
                <SectionHeader title={t('home.upcoming')} count={upcomingPlans.length} />
                {upcomingPlans.map((plan) => (
                  <PlanRow
                    key={plan.id}
                    {...getPlanRowProps(plan)}
                    onPress={() => handlePlanPress(plan)}
                    onComplete={() => handleComplete(plan.id)}
                    onSnooze={() => openSnooze(plan.id)}
                    onDelete={() => handleDelete(plan)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      <FAB label={t('home.newPlan')} onPress={() => navigateToCreatePlan()} />

      <SnoozePicker
        visible={showSnoozeSheet}
        onClose={closeSnooze}
        onSelect={handleSnoozeSelect}
      />
      <OverdueDialog
        visible={showOverdueDialog}
        planTitle={overduePlan?.title}
        onSnooze={(preset) => {
          if (overduePlan) snoozePlan(overduePlan.id, { kind: 'preset', key: preset });
          setOverdueDialog(false);
        }}
        onComplete={() => {
          if (overduePlan) handleComplete(overduePlan.id);
          setOverdueDialog(false);
        }}
        onDismiss={() => setOverdueDialog(false)}
      />
      <UndoSnackbar
        visible={showUndoSnackbar}
        message={undoMessage}
        onUndo={undoDelete}
        onDismiss={hideUndo}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 100 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTop: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: { flex: 1 },
  searchBtn: {
    paddingTop: 4,
  },
  greeting: { ...typography.display, fontSize: 26 },
  remaining: { ...typography.body, marginTop: spacing.xs },
  groupLabel: {
    ...typography.caption,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
});
