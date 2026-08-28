import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, spacing, typography } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

interface FABProps {
  label: string;
  onPress: () => void;
}

export function FAB({ label, onPress }: FABProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: colors.fab,
          bottom: insets.bottom + spacing.lg,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.fabText }]}>+ {label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  label: {
    ...typography.label,
    fontSize: 16,
  },
});
