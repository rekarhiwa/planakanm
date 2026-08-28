import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { Plan } from '../domain/entities/types';
import { radius, spacing, typography } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

interface NowCardProps {
  plan: Plan;
  onComplete: () => void;
  onSnooze: () => void;
}

export function NowCard({ plan, onComplete, onSnooze }: NowCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.card, { backgroundColor: colors.nowHighlight, borderColor: colors.primary }]}>
      <Text style={[styles.label, { color: colors.primary }]}>{t('home.now')}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{plan.title}</Text>
      {plan.time && (
        <Text style={[styles.time, { color: colors.textSecondary }]}>{plan.time}</Text>
      )}
      <View style={styles.actions}>
        <Pressable
          onPress={onComplete}
          style={[styles.btn, { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: colors.fabText, ...typography.label }}>{t('home.completeNow')}</Text>
        </Pressable>
        <Pressable
          onPress={onSnooze}
          style={[styles.btn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
        >
          <Text style={{ color: colors.text, ...typography.label }}>{t('home.snoozeNow')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  title: {
    ...typography.title,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  time: {
    ...typography.body,
    textAlign: 'right',
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  btn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
});
