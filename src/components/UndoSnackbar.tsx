import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { spacing, typography } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

interface UndoSnackbarProps {
  visible: boolean;
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoSnackbar({ visible, message, onUndo, onDismiss }: UndoSnackbarProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[styles.container, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
    >
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      <Pressable onPress={onUndo}>
        <Text style={[styles.undo, { color: colors.primary }]}>{t('common.undo')}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 4,
  },
  message: {
    ...typography.body,
    flex: 1,
    textAlign: 'right',
  },
  undo: {
    ...typography.label,
    marginLeft: spacing.lg,
  },
});
