import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

interface SectionHeaderProps {
  title: string;
  count?: number;
}

export function SectionHeader({ title, count }: SectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {count !== undefined && count > 0 && (
        <Text style={[styles.count, { color: colors.textSecondary }]}>{count}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
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
