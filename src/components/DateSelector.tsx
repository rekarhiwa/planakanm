import { addDays, format, parseISO } from 'date-fns';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { getDayNameCompact, getTodayISO } from '../utils/dates';
import { radius, spacing } from '../theme/colors';
import { FONT_FAMILY } from '../theme/fonts';
import { useTheme } from '../theme/ThemeContext';
import { useSettingsStore } from '../stores/settingsStore';

interface DateSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  daysCount?: number;
}

export function DateSelector({
  selectedDate,
  onSelectDate,
  daysCount = 14,
}: DateSelectorProps) {
  const { colors } = useTheme();
  const language = useSettingsStore((s) => s.settings.language);
  const today = getTodayISO();

  const dates = Array.from({ length: daysCount }, (_, i) => {
    const d = addDays(new Date(), i - 3);
    return format(d, 'yyyy-MM-dd');
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {dates.map((dateStr) => {
        const date = parseISO(dateStr);
        const isSelected = dateStr === selectedDate;
        const isToday = dateStr === today;

        return (
          <Pressable
            key={dateStr}
            onPress={() => onSelectDate(dateStr)}
            style={[
              styles.item,
              {
                backgroundColor: isSelected ? colors.primary : colors.surface,
                borderColor: isToday ? colors.accent : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.dayName,
                { color: isSelected ? colors.fabText : colors.textSecondary },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {getDayNameCompact(date, language)}
            </Text>
            <Text
              style={[
                styles.dayNum,
                { color: isSelected ? colors.fabText : colors.text },
              ]}
            >
              {date.getDate()}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    minWidth: 46,
    maxWidth: 58,
    gap: 1,
  },
  dayName: {
    fontFamily: FONT_FAMILY,
    fontSize: 9,
    lineHeight: 11,
    textAlign: 'center',
  },
  dayNum: {
    fontFamily: FONT_FAMILY,
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '600',
  },
});
