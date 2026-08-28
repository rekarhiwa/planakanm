import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import type { Plan } from '../domain/entities/types';
import { radius, spacing, typography } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

interface PlanRowProps {
  plan: Plan;
  onPress?: () => void;
  onComplete?: () => void;
  onSnooze?: () => void;
  onDelete?: () => void;
  showTime?: boolean;
}

export function PlanRow({
  plan,
  onPress,
  onComplete,
  onSnooze,
  onDelete,
  showTime = true,
}: PlanRowProps) {
  const { colors } = useTheme();

  const statusColor =
    plan.status === 'completed'
      ? colors.success
      : plan.status === 'overdue'
        ? colors.overdue
        : plan.status === 'snoozed'
          ? colors.snoozed
          : colors.textSecondary;

  const renderRightActions = () => (
    <View style={styles.actions}>
      {onComplete && plan.status !== 'completed' && (
        <Pressable
          onPress={onComplete}
          style={[styles.actionBtn, { backgroundColor: colors.success }]}
        >
          <Text style={styles.actionText}>✓</Text>
        </Pressable>
      )}
    </View>
  );

  const renderLeftActions = () => (
    <View style={styles.actions}>
      {onSnooze && plan.status !== 'completed' && (
        <Pressable
          onPress={onSnooze}
          style={[styles.actionBtn, { backgroundColor: colors.snoozed }]}
        >
          <Text style={styles.actionText}>💤</Text>
        </Pressable>
      )}
      {onDelete && (
        <Pressable
          onPress={onDelete}
          style={[styles.actionBtn, { backgroundColor: colors.danger }]}
        >
          <Text style={styles.actionText}>✕</Text>
        </Pressable>
      )}
    </View>
  );

  const content = (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: plan.status === 'completed' ? colors.completed : colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {showTime && plan.hasTime && plan.time && (
        <Text style={[styles.time, { color: colors.primary }]}>{plan.time}</Text>
      )}
      {!plan.hasTime && <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>}

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: plan.status === 'completed' ? colors.textSecondary : colors.text,
              textDecorationLine: plan.status === 'completed' ? 'line-through' : 'none',
            },
          ]}
          numberOfLines={2}
        >
          {plan.title}
        </Text>
        {plan.status !== 'pending' && (
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        )}
      </View>

      {onComplete && plan.status !== 'completed' && (
        <Pressable
          onPress={onComplete}
          hitSlop={12}
          style={[styles.checkButton, { borderColor: colors.primary }]}
        >
          <Text style={{ color: colors.primary, fontSize: 16 }}>✓</Text>
        </Pressable>
      )}
    </Pressable>
  );

  if (onComplete || onSnooze || onDelete) {
    return (
      <Swipeable renderRightActions={renderRightActions} renderLeftActions={renderLeftActions}>
        {content}
      </Swipeable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  time: {
    ...typography.label,
    width: 48,
    textAlign: 'center',
  },
  bullet: {
    fontSize: 20,
    width: 48,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.body,
    flex: 1,
    textAlign: 'right',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  actionBtn: {
    width: 56,
    height: '80%',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 20,
    color: '#fff',
  },
});
