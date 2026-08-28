import { StyleSheet, View, type ViewProps } from 'react-native';

import { radius, spacing } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ style, elevated, children, ...props }: CardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
});
