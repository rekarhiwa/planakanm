import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../navigation';
import type { Plan } from '../domain/entities/types';
import * as planRepo from '../data/repositories/planRepository';
import { usePlanStore } from '../stores/planStore';
import { useUIStore } from '../stores/uiStore';
import { radius, spacing, typography } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

export function PlanDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PlanDetail'>>();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [history, setHistory] = useState<Awaited<ReturnType<typeof planRepo.getPlanHistory>>>([]);

  const completePlan = usePlanStore((s) => s.completePlan);
  const deletePlan = usePlanStore((s) => s.deletePlan);
  const openSnooze = useUIStore((s) => s.openSnooze);
  const showUndo = useUIStore((s) => s.showUndo);

  const loadPlan = useCallback(async () => {
    const p = await planRepo.getPlanById(route.params.planId);
    setPlan(p);
    if (p) {
      const h = await planRepo.getPlanHistory(p.id);
      setHistory(h);
    }
  }, [route.params.planId]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  if (!plan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 40 }}>
          {t('common.loading')}
        </Text>
      </SafeAreaView>
    );
  }

  const actions = [
    { key: 'complete', label: t('detail.complete'), action: async () => { await completePlan(plan.id); navigation.goBack(); } },
    { key: 'snooze', label: t('detail.snooze'), action: () => openSnooze(plan.id) },
    { key: 'delete', label: t('detail.delete'), action: async () => { await deletePlan(plan.id); showUndo(t('common.deleted')); navigation.goBack(); } },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={{ color: colors.primary, ...typography.label }}>→</Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.text }]}>{plan.title}</Text>
        <Text style={[styles.status, { color: colors.primary }]}>{t(`status.${plan.status}`)}</Text>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <InfoRow label={t('detail.date')} value={plan.date} colors={colors} />
          {plan.hasTime && plan.time && (
            <InfoRow label={t('detail.time')} value={plan.time} colors={colors} />
          )}
          <InfoRow label={t('detail.repeat')} value={t(`create.${plan.repeatType === 'none' ? 'noRepeat' : plan.repeatType}`)} colors={colors} />
          <InfoRow label={t('detail.priority')} value={t(`priority.${plan.priority}`)} colors={colors} />
          {plan.description && (
            <InfoRow label={t('detail.notes')} value={plan.description} colors={colors} />
          )}
        </View>

        <View style={styles.actions}>
          {actions.map((a) => (
            <Pressable
              key={a.key}
              onPress={a.action}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: a.key === 'delete' ? colors.danger : colors.primary,
                },
              ]}
            >
              <Text style={{ color: a.key === 'delete' ? '#fff' : colors.fabText, ...typography.label }}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {history.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('detail.history')}</Text>
            {history.map((h) => (
              <View key={h.id} style={[styles.historyRow, { borderColor: colors.border }]}>
                <Text style={{ color: colors.textSecondary, ...typography.caption }}>
                  {new Date(h.timestamp).toLocaleTimeString()}
                </Text>
                <Text style={{ color: colors.text, ...typography.body }}>
                  {t(`status.${h.action}`, { defaultValue: h.action })}
                  {h.toValue ? ` → ${h.toValue}` : ''}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { text: string; textSecondary: string };
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={{ color: colors.textSecondary, ...typography.caption }}>{label}</Text>
      <Text style={{ color: colors.text, ...typography.body }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg },
  back: { alignSelf: 'flex-start', padding: spacing.sm, marginBottom: spacing.md },
  title: { ...typography.display, fontSize: 28, textAlign: 'right', marginBottom: spacing.sm },
  status: { ...typography.label, textAlign: 'right', marginBottom: spacing.xl },
  infoCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.xl },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  actions: { gap: spacing.sm, marginBottom: spacing.xl },
  actionBtn: { padding: spacing.lg, borderRadius: radius.md, alignItems: 'center' },
  sectionTitle: { ...typography.title, textAlign: 'right', marginBottom: spacing.md },
  historyRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    alignItems: 'flex-end',
  },
});
