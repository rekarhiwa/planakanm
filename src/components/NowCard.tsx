import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { Plan } from '../domain/entities/types';
import { radius, spacing, typography } from '../theme/colors';
import { layoutAlignEnd, layoutRow, rtlTextStyle } from '../theme/rtl';
import { getPlanRemainingParts } from '../utils/dates';
import { useTheme } from '../theme/ThemeContext';

interface NowCardProps {
  plan: Plan;
  onComplete: () => void;
  onSnooze: () => void;
}

function useRemainingLabel(plan: Plan): string {
  const { t } = useTranslation();
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 60_000);
    return () => clearInterval(timer);
  }, []);

  const remaining = getPlanRemainingParts(plan);
  if (!remaining) return '';

  if (remaining.dueNow) {
    return t('home.dueNow');
  }

  if (remaining.hours === 0) {
    return t('home.remainingMinutes', { count: remaining.minutes });
  }

  if (remaining.minutes === 0) {
    return t('home.remainingHoursOnly', { hours: remaining.hours });
  }

  return t('home.remainingHours', { hours: remaining.hours, minutes: remaining.minutes });
}

export function NowCard({ plan, onComplete, onSnooze }: NowCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const remainingLabel = useRemainingLabel(plan);
  const rtl = rtlTextStyle();

  return (
    <View style={[styles.card, { backgroundColor: colors.nowHighlight, borderColor: colors.primary }]}>
      <View style={[styles.main, { flexDirection: layoutRow() }]}>
        <View style={[styles.textBlock, { alignItems: layoutAlignEnd() }]}>
          <Text style={[styles.badge, { color: colors.primary }, rtl]}>{t('home.now')}</Text>
          <Text style={[styles.title, { color: colors.text }, rtl]} numberOfLines={1}>
            {plan.title}
          </Text>
          {remainingLabel ? (
            <Text style={[styles.remaining, { color: colors.textSecondary }, rtl]} numberOfLines={1}>
              {remainingLabel}
            </Text>
          ) : null}
        </View>

        <View style={[styles.actions, { flexDirection: layoutRow() }]}>
          <Pressable
            onPress={onComplete}
            hitSlop={8}
            style={[styles.iconBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
          >
            <Text style={{ color: colors.fabText, fontSize: 15 }}>✓</Text>
          </Pressable>
          <Pressable
            onPress={onSnooze}
            hitSlop={8}
            style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={{ fontSize: 14 }}>💤</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  main: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  badge: {
    ...typography.caption,
    fontSize: 11,
  },
  title: {
    ...typography.label,
    fontSize: 15,
  },
  remaining: {
    ...typography.caption,
  },
  actions: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
