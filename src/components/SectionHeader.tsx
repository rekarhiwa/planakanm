import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '../theme/colors';
import { layoutRow, rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';

interface SectionHeaderProps {
  title: string;
  count?: number;
}

export function SectionHeader({ title, count }: SectionHeaderProps) {
  const { colors } = useTheme();
  const rtl = rtlTextStyle();

  return (
    <View style={[styles.container, { flexDirection: layoutRow() }]}>
      <Text style={[styles.title, { color: colors.text }, rtl]}>{title}</Text>
      {count !== undefined && count > 0 && (
        <Text style={[styles.count, { color: colors.textSecondary }, rtl]}>{count}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.label,
    fontSize: 16,
  },
  count: {
    ...typography.caption,
  },
});
