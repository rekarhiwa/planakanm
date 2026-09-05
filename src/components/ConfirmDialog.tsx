import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useDialogStore } from '../stores/dialogStore';
import { layoutRow, rtlTextStyle } from '../theme/rtl';
import { radius, spacing, typography } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

export function ConfirmDialog() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const visible = useDialogStore((s) => s.visible);
  const variant = useDialogStore((s) => s.variant);
  const options = useDialogStore((s) => s.options);
  const confirm = useDialogStore((s) => s.confirm);
  const cancel = useDialogStore((s) => s.cancel);
  const rtl = rtlTextStyle();

  if (!options) return null;

  const titleColor =
    options.accent === 'danger'
      ? colors.danger
      : options.accent === 'warning'
        ? colors.warning
        : colors.text;

  const confirmBg = options.destructive ? colors.danger : colors.primary;
  const confirmTextColor = options.destructive ? '#FFFFFF' : colors.fabText;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cancel}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: titleColor }, rtl]}>{options.title}</Text>

          {options.highlight ? (
            <View style={[styles.highlight, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, flexDirection: layoutRow(), alignItems: 'center' }]}>
              <View style={[styles.highlightDot, { backgroundColor: options.highlight.color }]} />
              <Text style={[styles.highlightLabel, { color: colors.text }, rtl]} numberOfLines={1}>
                {options.highlight.label}
              </Text>
            </View>
          ) : null}

          {options.message ? (
            <Text style={[styles.message, { color: colors.textSecondary }, rtl]}>{options.message}</Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              onPress={confirm}
              style={[styles.confirmBtn, { backgroundColor: confirmBg }]}
            >
              <Text style={[{ color: confirmTextColor, ...typography.label }, rtl]}>
                {options.confirmLabel ?? (variant === 'alert' ? t('common.ok') : t('common.confirm'))}
              </Text>
            </Pressable>

            {variant === 'confirm' ? (
              <Pressable onPress={cancel} style={styles.cancelBtn}>
                <Text style={[{ color: colors.textSecondary, ...typography.label }, rtl]}>
                  {options.cancelLabel ?? t('common.cancel')}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
  },
  highlight: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  highlightDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  highlightLabel: {
    ...typography.label,
    flexShrink: 1,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  confirmBtn: {
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  cancelBtn: {
    padding: spacing.sm,
    alignItems: 'center',
  },
});
