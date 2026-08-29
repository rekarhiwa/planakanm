import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Chip } from './Chip';
import { spacing } from '../theme/colors';
import { usePlanStore } from '../stores/planStore';

export function CategoryFilterChips() {
  const { t } = useTranslation();
  const categories = usePlanStore((s) => s.categories);
  const categoryFilter = usePlanStore((s) => s.categoryFilter);
  const setCategoryFilter = usePlanStore((s) => s.setCategoryFilter);

  if (categories.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Chip
        label={t('categories.all')}
        selected={categoryFilter === null}
        onPress={() => setCategoryFilter(null)}
      />
      {categories.map((category) => (
        <Chip
          key={category.id}
          label={category.name}
          selected={categoryFilter === category.id}
          onPress={() => setCategoryFilter(category.id)}
          color={category.color}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
});
