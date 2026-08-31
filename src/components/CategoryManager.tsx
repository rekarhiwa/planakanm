import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Category } from '../domain/entities/types';
import { useDialogStore } from '../stores/dialogStore';
import { usePlanStore } from '../stores/planStore';
import { radius, spacing, typography } from '../theme/colors';
import { FontTextInput } from './FontTextInput';
import { layoutRow, rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';

const CATEGORY_COLORS = [
  '#D4AF37',
  '#4A90D9',
  '#7B68EE',
  '#27AE60',
  '#E74C3C',
  '#E67E22',
  '#E91E63',
  '#95A5A6',
];

export function CategoryManager() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const categories = usePlanStore((s) => s.categories);
  const createCategory = usePlanStore((s) => s.createCategory);
  const deleteCategory = usePlanStore((s) => s.deleteCategory);
  const rtl = rtlTextStyle();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createCategory(name, selectedColor);
    setName('');
    setSelectedColor(CATEGORY_COLORS[(categories.length + 1) % CATEGORY_COLORS.length]);
  };

  const handleDelete = async (category: Category) => {
    const confirmed = await useDialogStore.getState().showConfirm({
      title: t('categories.deleteTitle'),
      message: t('categories.deleteMessage'),
      confirmLabel: t('common.delete'),
      accent: 'danger',
      destructive: true,
      highlight: { color: category.color, label: category.name },
    });

    if (confirmed) {
      await deleteCategory(category.id);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.hint, { color: colors.textSecondary }, rtl]}>{t('categories.hint')}</Text>

      <FontTextInput
        value={name}
        onChangeText={setName}
        placeholder={t('categories.namePlaceholder')}
        placeholderColor={colors.textSecondary}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.surface,
          },
        ]}
      />

      <View style={styles.colorRow}>
        {CATEGORY_COLORS.map((color) => (
          <Pressable
            key={color}
            onPress={() => setSelectedColor(color)}
            style={[
              styles.colorDot,
              { backgroundColor: color },
              selectedColor === color && { borderColor: colors.text, borderWidth: 2 },
            ]}
          />
        ))}
      </View>

      <Pressable
        onPress={() => {
          void handleCreate();
        }}
        style={[styles.addBtn, { backgroundColor: colors.primary }]}
      >
        <Text style={[{ color: colors.fabText, ...typography.label }, rtl]}>{t('categories.add')}</Text>
      </Pressable>

      {categories.length > 0 && (
        <View style={styles.list}>
          {categories.map((category) => (
            <View
              key={category.id}
              style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.itemLeft}>
                <View style={[styles.itemDot, { backgroundColor: category.color }]} />
                <Text style={[{ color: colors.text, ...typography.label }, rtl]}>{category.name}</Text>
              </View>
              <Pressable
                onPress={() => {
                  void handleDelete(category);
                }}
                hitSlop={8}
              >
                <Text style={[{ color: colors.danger, ...typography.caption }, rtl]}>{t('common.delete')}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm, width: '100%' },
  hint: { ...typography.caption, lineHeight: 18, width: '100%' },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    width: '100%',
  },
  colorRow: {
    flexDirection: layoutRow(),
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'flex-start',
    width: '100%',
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  addBtn: {
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    width: '100%',
  },
  list: { gap: spacing.sm, marginTop: spacing.sm, width: '100%' },
  item: {
    flexDirection: layoutRow(),
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    width: '100%',
  },
  itemLeft: {
    flexDirection: layoutRow(),
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  itemDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
