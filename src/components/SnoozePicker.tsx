import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SNOOZE_PRESETS } from '../domain/constants/snoozePresets';
import type { SnoozeSelection } from '../domain/services/snoozeEngine';
import { getDefaultTimeValue, TimePicker } from './TimePicker';
import { ScrollWheel } from './ScrollWheel';
import { radius, spacing, typography } from '../theme/colors';
import { FONT_FAMILY } from '../theme/fonts';
import { layoutRow, rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';
import { formatTime24, getTodayISO } from '../utils/dates';

type CustomMode = 'minutes' | 'time';

interface SnoozePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (selection: SnoozeSelection) => void;
  isOverdue?: boolean;
}

const PRESET_ITEMS = SNOOZE_PRESETS.filter((preset) => preset.key !== 'custom');
const MINUTE_OPTIONS = Array.from({ length: 120 }, (_, index) => index + 1);

export function SnoozePicker({ visible, onClose, onSelect, isOverdue }: SnoozePickerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['92%'], []);

  const [customMode, setCustomMode] = useState<CustomMode>('minutes');
  const [minuteIndex, setMinuteIndex] = useState(29);
  const [date, setDate] = useState(getTodayISO());
  const [time, setTime] = useState(getDefaultTimeValue());
  const rtl = rtlTextStyle();

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  const handleCustomMinutes = () => {
    onSelect({ kind: 'minutes', minutes: MINUTE_OPTIONS[minuteIndex] });
    onClose();
  };

  const handleCustomTime = () => {
    if (!time) return;
    onSelect({ kind: 'datetime', date, time: formatTime24(time) });
    onClose();
  };

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
      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }, rtl]}>
          {isOverdue ? t('snooze.overdueTitle') : t('snooze.title')}
        </Text>
        {isOverdue && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }, rtl]}>
            {t('snooze.missedQuestion')}
          </Text>
        )}

        <View style={[styles.grid, { flexDirection: layoutRow() }]}>
          {PRESET_ITEMS.map((preset) => (
            <Pressable
              key={preset.key}
              onPress={() => {
                onSelect({ kind: 'preset', key: preset.key });
                onClose();
              }}
              style={[styles.option, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            >
              <Text style={[styles.optionText, { color: colors.text }, rtl]}>
                {t(preset.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }, rtl]}>
          {t('snooze.customSection')}
        </Text>

        <View style={[styles.modeRow, { flexDirection: layoutRow() }]}>
          <Pressable
            onPress={() => setCustomMode('minutes')}
            style={[
              styles.modeBtn,
              {
                backgroundColor: customMode === 'minutes' ? colors.primary : colors.surfaceElevated,
                borderColor: customMode === 'minutes' ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={{ color: customMode === 'minutes' ? colors.fabText : colors.text, ...typography.label }}>
              {t('snooze.byMinutes')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setCustomMode('time')}
            style={[
              styles.modeBtn,
              {
                backgroundColor: customMode === 'time' ? colors.primary : colors.surfaceElevated,
                borderColor: customMode === 'time' ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={{ color: customMode === 'time' ? colors.fabText : colors.text, ...typography.label }}>
              {t('snooze.byTime')}
            </Text>
          </Pressable>
        </View>

        {customMode === 'minutes' ? (
          <View style={styles.wheelArea}>
            <Text style={[styles.wheelLabel, { color: colors.textSecondary }]}>
              {t('snooze.minutesLabel')}
            </Text>
            <ScrollWheel
              items={MINUTE_OPTIONS}
              selectedIndex={minuteIndex}
              onSelectIndex={setMinuteIndex}
              itemHeight={52}
              fadeColor={colors.surface}
              keyExtractor={(item) => String(item)}
              renderItem={(item, { isSelected, distance }) => (
                <Text
                  style={{
                    fontFamily: FONT_FAMILY,
                    color: colors.text,
                    opacity: isSelected ? 1 : distance === 1 ? 0.4 : 0.15,
                    fontSize: isSelected ? 34 : distance === 1 ? 26 : 20,
                    fontWeight: isSelected ? '300' : '400',
                  }}
                >
                  {item} {t('snooze.minuteUnit')}
                </Text>
              )}
            />
            <Pressable
              onPress={handleCustomMinutes}
              style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: colors.fabText, ...typography.label }}>{t('snooze.applyMinutes')}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.wheelArea}>
            <TimePicker value={time} onChange={setTime} date={date} onDateChange={setDate} />
            <Pressable
              onPress={handleCustomTime}
              style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: colors.fabText, ...typography.label }}>{t('snooze.applyTime')}</Text>
            </Pressable>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
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
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.lg,
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
  sectionLabel: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  modeRow: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  wheelArea: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  wheelLabel: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  confirmBtn: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});
