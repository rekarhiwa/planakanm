import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FontTextInput } from '../components/FontTextInput';
import { PlanRow } from '../components/PlanRow';
import type { Plan } from '../domain/entities/types';
import * as planRepo from '../data/repositories/planRepository';
import { spacing, typography } from '../theme/colors';
import { rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';

export function SearchScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const rtl = rtlTextStyle();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Plan[]>([]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const plans = await planRepo.searchPlans(q.trim());
    setResults(plans);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FontTextInput
        style={[
          styles.input,
          { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
        ]}
        placeholder={t('search.placeholder')}
        placeholderColor={colors.textSecondary}
        value={query}
        onChangeText={setQuery}
        autoFocus
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          query ? (
            <View style={styles.empty}>
              <Text style={[{ color: colors.textSecondary, textAlign: 'center' }, rtl]}>
                {t('search.noResults')}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => <PlanRow plan={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  input: {
    margin: spacing.lg,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.lg,
    ...typography.body,
    width: 'auto',
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  empty: { padding: spacing.xxl },
});
