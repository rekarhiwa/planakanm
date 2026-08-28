import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatTime24 } from '../utils/dates';
import { radius, spacing, typography } from '../theme/colors';
import { FONT_FAMILY } from '../theme/fonts';
import { useTheme } from '../theme/ThemeContext';
import { Chip } from './Chip';

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const PRESETS = ['08:00', '09:00', '12:00', '14:00', '17:00', '20:00'];

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

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const { colors } = useTheme();
  const { hour, minute } = useMemo(() => parseTime(value), [value]);
  const displayValue = toTimeValue(hour, minute);

  const updateTime = (nextHour: number, nextMinute: number) => {
    onChange(toTimeValue(nextHour, nextMinute));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
      <View style={styles.displayRow}>
        <Text style={[styles.display, { color: colors.text }]}>{displayValue}</Text>
        <Text style={[styles.displayHint, { color: colors.textSecondary }]}>24h</Text>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>کاتی خێرا</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
        {PRESETS.map((preset) => (
          <Chip
            key={preset}
            label={preset}
            selected={displayValue === preset}
            onPress={() => onChange(preset)}
          />
        ))}
      </ScrollView>

      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>کاتژمێر</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
        {HOURS.map((item) => {
          const selected = item === hour;
          return (
            <Pressable
              key={item}
              onPress={() => updateTime(item, minute)}
              style={[
                styles.selectorItem,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.selectorText, { color: selected ? colors.fabText : colors.text }]}>
                {String(item).padStart(2, '0')}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>خولەک</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
        {MINUTES.map((item) => {
          const selected = item === minute;
          return (
            <Pressable
              key={item}
              onPress={() => updateTime(hour, item)}
              style={[
                styles.selectorItem,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.selectorText, { color: selected ? colors.fabText : colors.text }]}>
                {String(item).padStart(2, '0')}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
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
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  displayRow: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  display: {
    fontFamily: FONT_FAMILY,
    fontSize: 42,
    letterSpacing: 1,
  },
  displayHint: {
    ...typography.caption,
  },
  sectionLabel: {
    ...typography.caption,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  presetRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selectorRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selectorItem: {
    minWidth: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  selectorText: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
  },
});
