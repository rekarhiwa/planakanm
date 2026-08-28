import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Chip } from './Chip';
import { spacing } from '../theme/colors';
import { usePlanStore } from '../stores/planStore';

const FILTERS = ['all', 'pending', 'completed', 'overdue', 'today', 'upcoming'] as const;

export function FilterChips() {
  const { t } = useTranslation();
  const filter = usePlanStore((s) => s.filter);
  const setFilter = usePlanStore((s) => s.setFilter);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((f) => (
        <Chip
          key={f}
          label={t(`filters.${f}`)}
          selected={filter === f}
          onPress={() => setFilter(f)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
