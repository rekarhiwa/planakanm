import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import type { Category, Plan } from '../domain/entities/types';
import { radius, spacing, typography } from '../theme/colors';
import { getIsRTL, layoutAlignEnd, layoutRow, rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';

interface PlanRowProps {
  plan: Plan;
  category?: Category;
  showCategory?: boolean;
  onPress?: () => void;
  onComplete?: () => void;
  onSnooze?: () => void;
  onDelete?: () => void;
  showTime?: boolean;
  remainingLabel?: string;
}

export function PlanRow({
  plan,
  category,
  showCategory = false,
  onPress,
  onComplete,
  onSnooze,
  onDelete,
  showTime = true,
  remainingLabel,
}: PlanRowProps) {
  const { colors } = useTheme();
  const rtl = rtlTextStyle();

  const statusColor =
    plan.status === 'completed'
      ? colors.primaryMuted
      : plan.status === 'overdue'
        ? colors.overdue
        : plan.status === 'snoozed'
          ? colors.snoozed
          : colors.textSecondary;

  const renderCompleteAction = () => (
    <View style={[styles.actions, { flexDirection: layoutRow() }]}>
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

  const renderSecondaryActions = () => (
    <View style={[styles.actions, { flexDirection: layoutRow() }]}>
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
        { flexDirection: layoutRow() },
        {
          backgroundColor: plan.status === 'completed' ? colors.completed : colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.content, { alignItems: layoutAlignEnd() }]}>
        <View style={[styles.titleRow, { flexDirection: layoutRow() }]}>
          <Text
            style={[
              styles.title,
              rtl,
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
        {remainingLabel ? (
          <Text style={[styles.remaining, { color: colors.textSecondary }, rtl]} numberOfLines={1}>
            {remainingLabel}
          </Text>
        ) : null}
        {showCategory && category && (
          <View style={[styles.categoryBadge, { flexDirection: layoutRow() }]}>
            <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
            <Text style={[styles.categoryText, { color: category.color }, rtl]} numberOfLines={1}>
              {category.name}
            </Text>
          </View>
        )}
      </View>

      {showTime && plan.hasTime && plan.time ? (
        <Text style={[styles.time, { color: colors.primary }]}>{plan.time}</Text>
      ) : null}
      {!plan.hasTime ? <Text style={[styles.bullet, { color: colors.primary }]}>•</Text> : null}

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
    const isRtl = getIsRTL();
    return (
      <Swipeable
        renderRightActions={isRtl ? renderSecondaryActions : renderCompleteAction}
        renderLeftActions={isRtl ? renderCompleteAction : renderSecondaryActions}
      >
        {content}
      </Swipeable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
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
    gap: 4,
  },
  titleRow: {
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
  title: {
    ...typography.body,
    flexShrink: 1,
  },
  remaining: {
    ...typography.caption,
    alignSelf: 'stretch',
  },
  categoryBadge: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    maxWidth: '100%',
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryText: {
    ...typography.caption,
    fontSize: 11,
    maxWidth: 120,
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
