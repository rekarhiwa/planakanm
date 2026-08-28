import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { PlanPriority, RepeatType, ReminderType } from '../domain/entities/types';
import { parseNaturalLanguage, parsedToCreateInput } from '../domain/services/nlpParser';
import { getTodayISO, getTomorrowISO } from '../utils/dates';
import { Chip } from './Chip';
import { radius, spacing, typography } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { usePlanStore } from '../stores/planStore';

interface QuickCreateSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function QuickCreateSheet({ visible, onClose }: QuickCreateSheetProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const createPlan = usePlanStore((s) => s.createPlan);
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['75%'], []);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [time, setTime] = useState('');
  const [hasTime, setHasTime] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [repeatType, setRepeatType] = useState<RepeatType>('none');
  const [priority, setPriority] = useState<PlanPriority>('normal');
  const [reminderType, setReminderType] = useState<ReminderType>('notification');
  const [nlpPreview, setNlpPreview] = useState<string | null>(null);

  const reset = () => {
    setTitle('');
    setDate(getTodayISO());
    setTime('');
    setHasTime(false);
    setShowAdvanced(false);
    setRepeatType('none');
    setPriority('normal');
    setNlpPreview(null);
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (text.length > 5) {
      const parsed = parseNaturalLanguage(text);
      if (parsed.confidence !== 'low') {
        setNlpPreview(`${parsed.title} • ${parsed.date}${parsed.time ? ` • ${parsed.time}` : ''}`);
      } else {
        setNlpPreview(null);
      }
    } else {
      setNlpPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    let input;
    const parsed = parseNaturalLanguage(title);
    if (parsed.confidence === 'high') {
      input = parsedToCreateInput(parsed);
    } else {
      input = {
        title: title.trim(),
        date,
        time: hasTime ? time : undefined,
        hasTime,
        repeatType,
        priority,
        reminderType,
      };
    }

    await createPlan(input);
    reset();
    onClose();
  };

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
      onClose={() => { reset(); onClose(); }}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <BottomSheetView style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{t('create.title')}</Text>

        <BottomSheetTextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder={t('create.placeholder')}
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={handleTitleChange}
          autoFocus
        />

        {nlpPreview && (
          <Text style={[styles.nlpPreview, { color: colors.primary }]}>{nlpPreview}</Text>
        )}

        <View style={styles.chipRow}>
          <Chip label={t('create.today')} selected={date === getTodayISO()} onPress={() => setDate(getTodayISO())} />
          <Chip label={t('create.tomorrow')} selected={date === getTomorrowISO()} onPress={() => setDate(getTomorrowISO())} />
        </View>

        <Pressable
          onPress={() => setHasTime(!hasTime)}
          style={[styles.timeToggle, { borderColor: colors.border }]}
        >
          <Text style={{ color: hasTime ? colors.primary : colors.textSecondary }}>
            {t('create.setTime')}
          </Text>
        </Pressable>

        {hasTime && (
          <BottomSheetTextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="20:00"
            placeholderTextColor={colors.textSecondary}
            value={time}
            onChangeText={setTime}
            keyboardType="numbers-and-punctuation"
          />
        )}

        <Pressable onPress={() => setShowAdvanced(!showAdvanced)}>
          <Text style={[styles.advancedToggle, { color: colors.primary }]}>
            {t('create.advanced')} {showAdvanced ? '▲' : '▼'}
          </Text>
        </Pressable>

        {showAdvanced && (
          <ScrollView style={styles.advanced}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('create.repeat')}</Text>
            <View style={styles.chipRow}>
              {(['none', 'daily', 'weekly', 'monthly', 'yearly'] as RepeatType[]).map((r) => (
                <Chip
                  key={r}
                  label={t(`create.${r === 'none' ? 'noRepeat' : r}`)}
                  selected={repeatType === r}
                  onPress={() => setRepeatType(r)}
                />
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('create.priority')}</Text>
            <View style={styles.chipRow}>
              {(['low', 'normal', 'high', 'urgent'] as PlanPriority[]).map((p) => (
                <Chip
                  key={p}
                  label={t(`priority.${p}`)}
                  selected={priority === p}
                  onPress={() => setPriority(p)}
                />
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('create.reminderType')}</Text>
            <View style={styles.chipRow}>
              <Chip label={t('create.notification')} selected={reminderType === 'notification'} onPress={() => setReminderType('notification')} />
              <Chip label={t('create.alarm')} selected={reminderType === 'alarm'} onPress={() => setReminderType('alarm')} />
            </View>
          </ScrollView>
        )}

        <Pressable
          onPress={handleSubmit}
          style={[styles.submit, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.submitText, { color: colors.fabText }]}>{t('create.addPlan')}</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    flex: 1,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...typography.body,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  nlpPreview: {
    ...typography.caption,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
    justifyContent: 'flex-end',
  },
  timeToggle: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  advancedToggle: {
    ...typography.label,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  advanced: {
    maxHeight: 200,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  submit: {
    padding: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitText: {
    ...typography.label,
    fontSize: 16,
  },
});
