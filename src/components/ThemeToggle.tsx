import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '../theme/ThemeContext';

export function ThemeToggle() {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.primary,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.icon, { color: colors.primary }]}>
        {isDark ? '☀️' : '🌙'}
      </Text>
      <Text style={[styles.label, { color: colors.text }]}>
        {isDark ? 'لات مۆد' : 'دارک مۆد'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
