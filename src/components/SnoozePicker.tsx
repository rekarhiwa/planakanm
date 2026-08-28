import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SNOOZE_PRESETS } from '../domain/constants/snoozePresets';
import { radius, spacing, typography } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

interface SnoozePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (preset: string) => void;
  isOverdue?: boolean;
}

export function SnoozePicker({ visible, onClose, onSelect, isOverdue }: SnoozePickerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  if (!visible) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <BottomSheetView style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {isOverdue ? t('snooze.overdueTitle') : t('snooze.title')}
        </Text>
        {isOverdue && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('snooze.missedQuestion')}
          </Text>
        )}

        <View style={styles.grid}>
          {SNOOZE_PRESETS.map((preset) => (
            <Pressable
              key={preset.key}
              onPress={() => {
                onSelect(preset.key);
                onClose();
              }}
              style={[styles.option, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>
                {t(preset.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  option: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  optionText: {
    ...typography.label,
  },
});
