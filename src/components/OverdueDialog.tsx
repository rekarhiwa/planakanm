import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SNOOZE_PRESETS } from '../domain/constants/snoozePresets';
import { radius, spacing, typography } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

interface OverdueDialogProps {
  visible: boolean;
  planTitle?: string;
  onSnooze: (preset: string) => void;
  onComplete: () => void;
  onDismiss: () => void;
}

export function OverdueDialog({
  visible,
  planTitle,
  onSnooze,
  onComplete,
  onDismiss,
}: OverdueDialogProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.overdue }]}>
            {t('snooze.overdueTitle')}
          </Text>
          {planTitle && (
            <Text style={[styles.planTitle, { color: colors.text }]}>{planTitle}</Text>
          )}
          <Text style={[styles.question, { color: colors.textSecondary }]}>
            {t('snooze.missedQuestion')}
          </Text>

          <View style={styles.options}>
            {SNOOZE_PRESETS.filter((p) => p.key !== 'custom').map((preset) => (
              <Pressable
                key={preset.key}
                onPress={() => onSnooze(preset.key)}
                style={[styles.option, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>
                  {t(preset.labelKey)}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable onPress={onComplete} style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
              <Text style={{ color: colors.fabText, ...typography.label }}>{t('snooze.doNow')}</Text>
            </Pressable>
            <Pressable onPress={onDismiss} style={styles.dismissBtn}>
              <Text style={{ color: colors.textSecondary }}>{t('common.cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  planTitle: {
    ...typography.body,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  question: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  optionText: {
    ...typography.caption,
  },
  actions: {
    gap: spacing.sm,
  },
  actionBtn: {
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  dismissBtn: {
    padding: spacing.sm,
    alignItems: 'center',
  },
});
