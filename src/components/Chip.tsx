import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
}

export function Chip({ label, selected, onPress, color }: ChipProps) {
  const { colors } = useTheme();
  const accent = color ?? colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? accent : colors.surface,
          borderColor: selected ? accent : colors.border,
        },
      ]}
    >
      <View style={styles.content}>
        {color && !selected && <View style={[styles.dot, { backgroundColor: color }]} />}
        <Text
          style={[
            styles.label,
            { color: selected ? colors.fabText : colors.text },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    ...typography.label,
    fontSize: 14,
  },
});
