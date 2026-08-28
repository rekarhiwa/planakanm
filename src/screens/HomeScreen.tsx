import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateSelector } from '../components/DateSelector';
import { EmptyState } from '../components/EmptyState';
import { FAB } from '../components/FAB';
import { FilterChips } from '../components/FilterChips';
import { NowCard } from '../components/NowCard';
import { OverdueDialog } from '../components/OverdueDialog';
import { PlanRow } from '../components/PlanRow';
import { QuickCreateSheet } from '../components/QuickCreateSheet';
import { SectionHeader } from '../components/SectionHeader';
import { SnoozePicker } from '../components/SnoozePicker';
import { UndoSnackbar } from '../components/UndoSnackbar';
import type { RootStackParamList } from '../navigation';
import type { Plan } from '../domain/entities/types';
import { filterPlans, usePlanStore } from '../stores/planStore';
import { useUIStore } from '../stores/uiStore';
import { spacing, typography } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { getGreetingKey, getTodayISO, groupPlansByTime, isPlanNow } from '../utils/dates';

export function HomeScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const rawPlans = usePlanStore((s) => s.plans);
  const filter = usePlanStore((s) => s.filter);
  const searchQuery = usePlanStore((s) => s.searchQuery);
  const plans = useMemo(
    () => filterPlans(rawPlans, filter, searchQuery),
    [rawPlans, filter, searchQuery],
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

  const showQuickCreate = useUIStore((s) => s.showQuickCreate);
  const openQuickCreate = useUIStore((s) => s.openQuickCreate);
  const closeQuickCreate = useUIStore((s) => s.closeQuickCreate);
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

  const greeting = t(`greeting.${getGreetingKey()}`);
  const pendingCount = plans.filter((p) => p.status === 'pending' || p.status === 'overdue').length;
  const groups = groupPlansByTime(plans);
  const nowPlan = plans.find((p) => isPlanNow(p) && p.status !== 'completed');
  const overdueList = plans.filter((p) => p.status === 'overdue');
  const upcomingPlans = plans.filter(
    (p) => p.status === 'pending' && p.hasTime && !isPlanNow(p),
  );

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
    async (id: string) => {
      await deletePlan(id);
      showUndo(t('common.deleted'));
    },
    [deletePlan, showUndo, t],
  );

  const handleSnoozeSelect = useCallback(
    async (preset: string) => {
      if (snoozePlanId) await snoozePlan(snoozePlanId, preset);
    },
    [snoozePlanId, snoozePlan],
  );

  const overduePlan = overdueList[0] ?? (overduePlans.length > 0 ? plans.find((p) => p.id === overduePlans[0]) : undefined);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => loadPlansForDate(selectedDate)} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable onPress={() => navigation.navigate('Search')} hitSlop={12}>
              <Text style={{ fontSize: 22 }}>🔍</Text>
            </Pressable>
            <View style={styles.headerText}>
              <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
              <Text style={[styles.remaining, { color: colors.textSecondary }]}>
                {t('home.remaining', { count: pendingCount })}
              </Text>
            </View>
          </View>
        </View>

        <DateSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <FilterChips />

        {nowPlan && (
          <>
            <SectionHeader title={t('home.now')} />
            <NowCard
              plan={nowPlan}
              onComplete={() => handleComplete(nowPlan.id)}
              onSnooze={() => openSnooze(nowPlan.id)}
            />
          </>
        )}

        {overdueList.length > 0 && (
          <>
            <SectionHeader title={t('home.overdue')} count={overdueList.length} />
            {overdueList.map((plan) => (
              <PlanRow
                key={plan.id}
                plan={plan}
                onPress={() => handlePlanPress(plan)}
                onComplete={() => handleComplete(plan.id)}
                onSnooze={() => openSnooze(plan.id)}
                onDelete={() => handleDelete(plan.id)}
              />
            ))}
          </>
        )}

        {plans.length === 0 ? (
          <EmptyState onCreatePress={openQuickCreate} />
        ) : (
          <>
            <SectionHeader title={t('home.today')} count={plans.length} />

            {groups.morning.length > 0 && (
              <>
                <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>
                  {t('home.morning')}
                </Text>
                {groups.morning.map((plan) => (
                  <PlanRow
                    key={plan.id}
                    plan={plan}
                    onPress={() => handlePlanPress(plan)}
                    onComplete={() => handleComplete(plan.id)}
                    onSnooze={() => openSnooze(plan.id)}
                    onDelete={() => handleDelete(plan.id)}
                  />
                ))}
              </>
            )}

            {groups.afternoon.length > 0 && (
              <>
                <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>
                  {t('home.afternoon')}
                </Text>
                {groups.afternoon.map((plan) => (
                  <PlanRow
                    key={plan.id}
                    plan={plan}
                    onPress={() => handlePlanPress(plan)}
                    onComplete={() => handleComplete(plan.id)}
                    onSnooze={() => openSnooze(plan.id)}
                    onDelete={() => handleDelete(plan.id)}
                  />
                ))}
              </>
            )}

            {groups.noTime.length > 0 && (
              <>
                <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>
                  {t('home.noTime')}
                </Text>
                {groups.noTime.map((plan) => (
                  <PlanRow
                    key={plan.id}
                    plan={plan}
                    showTime={false}
                    onPress={() => handlePlanPress(plan)}
                    onComplete={() => handleComplete(plan.id)}
                    onSnooze={() => openSnooze(plan.id)}
                    onDelete={() => handleDelete(plan.id)}
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
                    plan={plan}
                    onPress={() => handlePlanPress(plan)}
                    onComplete={() => handleComplete(plan.id)}
                    onSnooze={() => openSnooze(plan.id)}
                    onDelete={() => handleDelete(plan.id)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      <FAB label={t('home.newPlan')} onPress={openQuickCreate} />

      <QuickCreateSheet visible={showQuickCreate} onClose={closeQuickCreate} />
      <SnoozePicker
        visible={showSnoozeSheet}
        onClose={closeSnooze}
        onSelect={handleSnoozeSelect}
      />
      <OverdueDialog
        visible={showOverdueDialog}
        planTitle={overduePlan?.title}
        onSnooze={(preset) => {
          if (overduePlan) snoozePlan(overduePlan.id, preset);
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: { flex: 1 },
  greeting: { ...typography.display, fontSize: 26, textAlign: 'right' },
  remaining: { ...typography.body, textAlign: 'right', marginTop: spacing.xs },
  groupLabel: {
    ...typography.caption,
    textAlign: 'right',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
});
