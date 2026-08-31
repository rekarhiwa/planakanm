import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { AlarmIcon } from './AlarmIcon';
import type { Note } from '../domain/entities/types';
import { radius, spacing, typography } from '../theme/colors';
import { layoutRow } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';

interface NoteRowProps {
  note: Note;
  onPress: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
}

export function NoteRow({ note, onPress, onToggleComplete, onDelete }: NoteRowProps) {
  const { colors } = useTheme();

  const renderLeftActions = () => (
    <View style={styles.actions}>
      <Pressable
        onPress={onDelete}
        style={[styles.actionBtn, { backgroundColor: colors.danger }]}
      >
        <Text style={styles.actionText}>✕</Text>
      </Pressable>
    </View>
  );

  return (
    <Swipeable renderLeftActions={renderLeftActions}>
      <View
        style={[
          styles.row,
          { flexDirection: layoutRow() },
          {
            backgroundColor: note.completed ? colors.completed : colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={onToggleComplete}
          hitSlop={10}
          style={[
            styles.checkButton,
            {
              borderColor: note.completed ? colors.primaryMuted : colors.primary,
              backgroundColor: note.completed ? colors.primaryMuted : 'transparent',
            },
          ]}
        >
          {note.completed ? <Text style={styles.checkMark}>✓</Text> : null}
        </Pressable>

        <Pressable onPress={onPress} style={styles.content}>
          <View style={[styles.titleRow, { flexDirection: layoutRow() }]}>
            {note.hasAlarm ? (
              <AlarmIcon color={colors.primary} size={14} />
            ) : null}
            <Text
              style={[
                styles.title,
                {
                  color: note.completed ? colors.textSecondary : colors.text,
                  textDecorationLine: note.completed ? 'line-through' : 'none',
                },
              ]}
              numberOfLines={2}
            >
              {note.title}
            </Text>
          </View>
        </Pressable>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  content: {
    flex: 1,
    alignItems: 'flex-end',
  },
  titleRow: {
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: '100%',
  },
  title: {
    ...typography.body,
    textAlign: 'right',
    flexShrink: 1,
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  actionBtn: {
    width: 52,
    height: '80%',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});
