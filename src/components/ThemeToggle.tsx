import { Pressable, StyleSheet, Text } from 'react-native';

import { layoutRow, rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';

export function ThemeToggle() {
  const { colors, isDark, toggleTheme } = useTheme();
  const rtl = rtlTextStyle();

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.primary,
          opacity: pressed ? 0.85 : 1,
          flexDirection: layoutRow(),
        },
      ]}
    >
      <Text style={[styles.icon, { color: colors.primary }]}>
        {isDark ? '☀️' : '🌙'}
      </Text>
      <Text style={[styles.label, { color: colors.text }, rtl]}>
        {isDark ? 'لات مۆد' : 'دارک مۆد'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
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
