import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '../theme/colors';
import { layoutRow, rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';

interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
  backLabel?: string;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
}

export function ScreenHeader({ title, onBack, backLabel = '←', rightAction }: ScreenHeaderProps) {
  const { colors } = useTheme();
  const rtl = rtlTextStyle();

  return (
    <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.side}>
        <Text style={[styles.back, { color: colors.primary }, rtl]}>{backLabel}</Text>
      </Pressable>

      <Text style={[styles.title, { color: colors.text }, rtl]} numberOfLines={1}>
        {title}
      </Text>

      {rightAction ? (
        <Pressable onPress={rightAction.onPress} hitSlop={12} style={styles.side}>
          <Text style={[styles.back, { color: colors.primary, fontWeight: '600' }, rtl]}>{rightAction.label}</Text>
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: layoutRow(),
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  side: {
    minWidth: 72,
    alignItems: 'flex-start',
  },
  back: {
    ...typography.label,
    fontSize: 16,
  },
  title: {
    ...typography.title,
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
  },
});
