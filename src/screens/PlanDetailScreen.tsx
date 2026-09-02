import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FontTextInput } from '../components/FontTextInput';
import type { RootStackParamList } from '../navigation';
import type { Plan } from '../domain/entities/types';
import * as planRepo from '../data/repositories/planRepository';
import { useDialogStore } from '../stores/dialogStore';
import { usePlanStore } from '../stores/planStore';
import { useUIStore } from '../stores/uiStore';
import { radius, spacing, typography } from '../theme/colors';
import { getIsRTL, layoutAlignEnd, layoutRow, rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';

export function PlanDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PlanDetail'>>();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<Awaited<ReturnType<typeof planRepo.getPlanHistory>>>([]);
  const rtl = rtlTextStyle();

  const completePlan = usePlanStore((s) => s.completePlan);
  const deletePlan = usePlanStore((s) => s.deletePlan);
  const updatePlan = usePlanStore((s) => s.updatePlan);
  const openSnooze = useUIStore((s) => s.openSnooze);
  const showUndo = useUIStore((s) => s.showUndo);

  const loadPlan = useCallback(async () => {
    const p = await planRepo.getPlanById(route.params.planId);
    setPlan(p);
    setNotes(p?.description ?? '');
    if (p) {
      const h = await planRepo.getPlanHistory(p.id);
      setHistory(h);
    }
  }, [route.params.planId]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const saveNotes = async () => {
    if (!plan) return;
    const trimmed = notes.trim();
    const current = plan.description ?? '';
    if (trimmed === current) return;

    const updated = await updatePlan(plan.id, {
      description: trimmed || undefined,
    });
    if (updated) {
      setPlan(updated);
    }
  };

  const handleDelete = async () => {
    if (!plan) return;

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
    navigation.goBack();
  };

  if (!plan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[{ color: colors.text, textAlign: 'center', marginTop: 40 }, rtl]}>
          {t('common.loading')}
        </Text>
      </SafeAreaView>
    );
  }

  const actions = [
    { key: 'complete', label: t('detail.complete'), action: async () => { await completePlan(plan.id); navigation.goBack(); } },
    { key: 'snooze', label: t('detail.snooze'), action: () => openSnooze(plan.id) },
    { key: 'delete', label: t('detail.delete'), action: () => { void handleDelete(); } },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={[{ color: colors.primary, ...typography.label }, rtl]}>
            {getIsRTL() ? '→' : '←'}
          </Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.text }, rtl]}>{plan.title}</Text>
        <Text style={[styles.status, { color: colors.primary }, rtl]}>{t(`status.${plan.status}`)}</Text>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <InfoRow label={t('detail.date')} value={plan.date} colors={colors} />
          {plan.hasTime && plan.time && (
            <InfoRow label={t('detail.time')} value={plan.time} colors={colors} />
          )}
          <InfoRow label={t('detail.repeat')} value={t(`create.${plan.repeatType === 'none' ? 'noRepeat' : plan.repeatType}`)} colors={colors} />
          <InfoRow label={t('detail.priority')} value={t(`priority.${plan.priority}`)} colors={colors} />
        </View>

        <Text style={[styles.notesLabel, { color: colors.textSecondary }, rtl]}>{t('detail.notes')}</Text>
        <FontTextInput
          value={notes}
          onChangeText={setNotes}
          onBlur={() => { void saveNotes(); }}
          placeholder={t('detail.notesPlaceholder')}
          placeholderColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={[
            styles.notesInput,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        />

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
              <Text style={[{ color: a.key === 'delete' ? '#fff' : colors.fabText, ...typography.label }, rtl]}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {history.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }, rtl]}>{t('detail.history')}</Text>
            {history.map((h) => (
              <View key={h.id} style={[styles.historyRow, { borderColor: colors.border, alignItems: layoutAlignEnd() }]}>
                <Text style={[{ color: colors.textSecondary, ...typography.caption }, rtl]}>
                  {new Date(h.timestamp).toLocaleTimeString()}
                </Text>
                <Text style={[{ color: colors.text, ...typography.body }, rtl]}>
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
  const rtl = rtlTextStyle();

  return (
    <View style={[styles.infoRow, { flexDirection: layoutRow() }]}>
      <Text style={[{ color: colors.textSecondary, ...typography.caption }, rtl]}>{label}</Text>
      <Text style={[{ color: colors.text, ...typography.body }, rtl]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg },
  back: { alignSelf: 'flex-start', padding: spacing.sm, marginBottom: spacing.md },
  title: { ...typography.display, fontSize: 28, marginBottom: spacing.sm },
  status: { ...typography.label, marginBottom: spacing.xl },
  infoCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.lg },
  infoRow: { justifyContent: 'space-between', paddingVertical: spacing.sm },
  notesLabel: { ...typography.caption, marginBottom: spacing.sm },
  notesInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    minHeight: 96,
    marginBottom: spacing.xl,
    width: '100%',
  },
  actions: { gap: spacing.sm, marginBottom: spacing.xl },
  actionBtn: { padding: spacing.lg, borderRadius: radius.md, alignItems: 'center' },
  sectionTitle: { ...typography.title, marginBottom: spacing.md },
  historyRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
});
