import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { radius, spacing, typography } from '../theme/colors';
import { rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';

interface EmptyStateProps {
  onCreatePress?: () => void;
}

export function EmptyState({ onCreatePress }: EmptyStateProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const rtl = rtlTextStyle();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🎯</Text>
      <Text style={[styles.title, { color: colors.text }, rtl]}>{t('home.emptyTitle')}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }, rtl]}>
        {t('home.emptySubtitle')}
      </Text>
      {onCreatePress ? (
        <Pressable
          onPress={onCreatePress}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.buttonText, { color: colors.fabText }, rtl]}>
            + {t('home.newPlan')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  buttonText: {
    ...typography.label,
  },
});
