import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSettingsStore } from '../stores/settingsStore';
import {
  formatAlarmDateHeader,
  formatDateISO,
  formatTime24,
  getDayNameCompact,
  getWeekDates,
} from '../utils/dates';
import { spacing } from '../theme/colors';
import { FONT_FAMILY } from '../theme/fonts';
import { useTheme } from '../theme/ThemeContext';
import { ScrollWheel } from './ScrollWheel';

const ITEM_HEIGHT = 52;
const HOURS_24 = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const HOURS_12 = Array.from({ length: 12 }, (_, index) => index + 1);
const PERIODS = ['am', 'pm'] as const;

function parseTime(value: string): { hour: number; minute: number } {
  if (!value.includes(':')) {
    return { hour: 9, minute: 0 };
  }

  const [hourPart, minutePart] = value.split(':');
  const hour = Number.parseInt(hourPart, 10);
  const minute = Number.parseInt(minutePart, 10);

  return {
    hour: Number.isFinite(hour) ? Math.min(23, Math.max(0, hour)) : 9,
    minute: Number.isFinite(minute) ? Math.min(59, Math.max(0, minute)) : 0,
  };
}

function toTimeValue(hour: number, minute: number): string {
  return formatTime24(`${hour}:${minute}`);
}

function parseTimeDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function to12Hour(hour24: number): { hour12: number; period: 'am' | 'pm' } {
  const period = hour24 >= 12 ? 'pm' : 'am';
  const hour12 = hour24 % 12 || 12;
  return { hour12, period };
}

function to24Hour(hour12: number, period: 'am' | 'pm'): number {
  if (period === 'am') return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function wheelOpacity(distance: number, isSelected: boolean): number {
  if (isSelected) return 1;
  if (distance === 1) return 0.42;
  if (distance === 2) return 0.22;
  return 0.1;
}

function wheelFontSize(distance: number, isSelected: boolean, selectedSize: number): number {
  if (isSelected) return selectedSize;
  if (distance === 1) return selectedSize * 0.78;
  return selectedSize * 0.66;
}

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  date?: string;
  onDateChange?: (date: string) => void;
}

export function TimePicker({ value, onChange, date, onDateChange }: TimePickerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.settings.language);
  const timeFormat = useSettingsStore((s) => s.settings.timeFormat);
  const weekStartsOn = useSettingsStore((s) => s.settings.weekStartsOn);

  const { hour, minute } = useMemo(() => parseTime(value), [value]);
  const { hour12, period } = useMemo(() => to12Hour(hour), [hour]);

  const weekDates = useMemo(() => {
    if (!date) return [];
    return getWeekDates(parseTimeDate(date), weekStartsOn);
  }, [date, weekStartsOn]);

  const dateHeader = date
    ? formatAlarmDateHeader(date, language, t('create.today'), t('create.tomorrow'))
    : null;

  const updateTime = (nextHour: number, nextMinute: number) => {
    onChange(toTimeValue(nextHour, nextMinute));
  };

  const hourWheel =
    timeFormat === '24h' ? (
      <ScrollWheel
        key="hour"
        items={HOURS_24}
        selectedIndex={hour}
        onSelectIndex={(index) => updateTime(index, minute)}
        itemHeight={ITEM_HEIGHT}
        width={72}
        fadeColor={colors.surfaceElevated}
        keyExtractor={(item) => `h-${item}`}
        renderItem={(item, { isSelected, distance }) => (
          <Text
            style={[
              styles.digit,
              {
                color: colors.text,
                opacity: wheelOpacity(distance, isSelected),
                fontSize: wheelFontSize(distance, isSelected, 36),
                fontWeight: isSelected ? '300' : '400',
              },
            ]}
          >
            {String(item).padStart(2, '0')}
          </Text>
        )}
      />
    ) : (
      <ScrollWheel
        key="hour"
        items={HOURS_12}
        selectedIndex={hour12 - 1}
        onSelectIndex={(index) => updateTime(to24Hour(HOURS_12[index], period), minute)}
        itemHeight={ITEM_HEIGHT}
        width={64}
        fadeColor={colors.surfaceElevated}
        keyExtractor={(item) => `h12-${item}`}
        renderItem={(item, { isSelected, distance }) => (
          <Text
            style={[
              styles.digit,
              {
                color: colors.text,
                opacity: wheelOpacity(distance, isSelected),
                fontSize: wheelFontSize(distance, isSelected, 36),
                fontWeight: isSelected ? '300' : '400',
              },
            ]}
          >
            {String(item).padStart(2, '0')}
          </Text>
        )}
      />
    );

  const colon = (
    <Text key="colon" style={[styles.colon, { color: colors.text }]}>
      :
    </Text>
  );

  const minuteWheel = (
    <ScrollWheel
      key="minute"
      items={MINUTES}
      selectedIndex={minute}
      onSelectIndex={(index) => updateTime(hour, index)}
      itemHeight={ITEM_HEIGHT}
      width={72}
      fadeColor={colors.surfaceElevated}
      keyExtractor={(item) => `m-${item}`}
      renderItem={(item, { isSelected, distance }) => (
        <Text
          style={[
            styles.digit,
            {
              color: colors.text,
              opacity: wheelOpacity(distance, isSelected),
              fontSize: wheelFontSize(distance, isSelected, 36),
              fontWeight: isSelected ? '300' : '400',
            },
          ]}
        >
          {String(item).padStart(2, '0')}
        </Text>
      )}
    />
  );

  const periodWheel =
    timeFormat === '12h' ? (
      <ScrollWheel
        key="period"
        items={[...PERIODS]}
        selectedIndex={period === 'am' ? 0 : 1}
        onSelectIndex={(index) => updateTime(to24Hour(hour12, PERIODS[index]), minute)}
        itemHeight={ITEM_HEIGHT}
        width={56}
        fadeColor={colors.surfaceElevated}
        keyExtractor={(item) => item}
        renderItem={(item, { isSelected, distance }) => (
          <Text
            style={[
              styles.period,
              {
                color: colors.textSecondary,
                opacity: wheelOpacity(distance, isSelected),
                fontSize: wheelFontSize(distance, isSelected, 16),
                fontWeight: isSelected ? '600' : '400',
              },
            ]}
          >
            {item}
          </Text>
        )}
      />
    ) : null;

  const ltrWheels =
    timeFormat === '12h' && periodWheel
      ? [hourWheel, colon, minuteWheel, periodWheel]
      : [hourWheel, colon, minuteWheel];
  const timeWheels = ltrWheels;

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceElevated }]}>
      {date && onDateChange ? (
        <>
          <View style={styles.metaBlock}>
            <Text style={[styles.dateHeader, { color: colors.textSecondary }]} numberOfLines={1}>
              {dateHeader}
            </Text>
            <View style={styles.weekRow}>
              {weekDates.map((weekDate) => {
                const iso = formatDateISO(weekDate);
                const selected = iso === date;
                return (
                  <Pressable
                    key={iso}
                    onPress={() => onDateChange(iso)}
                    style={styles.weekCell}
                  >
                    <Text
                      style={[
                        styles.weekLetter,
                        { color: selected ? colors.danger : colors.textSecondary },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                    >
                      {getDayNameCompact(weekDate, language)}
                    </Text>
                    {selected ? (
                      <View style={[styles.weekDot, { backgroundColor: colors.danger }]} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: `${colors.border}88` }]} />
        </>
      ) : null}

      <View style={styles.timeColumns}>{timeWheels}</View>
    </View>
  );
}

export function getDefaultTimeValue(): string {
  const now = new Date();
  const nextHour = (now.getHours() + 1) % 24;
  return toTimeValue(nextHour, 0);
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  metaBlock: {
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  dateHeader: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  weekLetter: {
    fontFamily: FONT_FAMILY,
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  weekDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  timeColumns: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    alignSelf: 'stretch',
  },
  digit: {
    fontFamily: FONT_FAMILY,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  colon: {
    fontFamily: FONT_FAMILY,
    fontSize: 34,
    fontWeight: '300',
    marginBottom: 4,
    opacity: 0.85,
  },
  period: {
    fontFamily: FONT_FAMILY,
    textAlign: 'center',
  },
});
