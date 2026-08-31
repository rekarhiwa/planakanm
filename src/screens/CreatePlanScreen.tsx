import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '../components/Chip';
import { DateSelector } from '../components/DateSelector';
import { FontTextInput } from '../components/FontTextInput';
import { getDefaultTimeValue, TimePicker } from '../components/TimePicker';
import type { PlanPriority, RepeatType } from '../domain/entities/types';
import { parseNaturalLanguage, parsedToCreateInput } from '../domain/services/nlpParser';
import type { RootStackParamList } from '../navigation';
import { usePlanStore } from '../stores/planStore';
import { useSettingsStore } from '../stores/settingsStore';
import { radius, spacing, typography } from '../theme/colors';
import { FONT_FAMILY } from '../theme/fonts';
import { layoutAlignEnd, layoutRow, rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';
import { formatTime24, formatTimeDisplay, getTodayISO } from '../utils/dates';

export function CreatePlanScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreatePlan'>>();
  const prefill = route.params;

  const createPlan = usePlanStore((s) => s.createPlan);
  const categories = usePlanStore((s) => s.categories);
  const timeFormat = useSettingsStore((s) => s.settings.timeFormat);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [time, setTime] = useState(getDefaultTimeValue());
  const [repeatType, setRepeatType] = useState<RepeatType>('none');
  const [priority, setPriority] = useState<PlanPriority>('normal');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [nlpPreview, setNlpPreview] = useState<string | null>(null);

  useEffect(() => {
    setTitle(prefill?.title ?? '');
    setNotes(prefill?.description ?? '');
    setDate(getTodayISO());
    setTime(getDefaultTimeValue());
    setRepeatType('none');
    setPriority('normal');
    setCategoryId(undefined);
    setNlpPreview(null);
  }, [prefill]);

  const timePreview = useMemo(() => {
    const [hourPart, minutePart] = time.split(':');
    const hour = Number.parseInt(hourPart, 10);
    const minute = Number.parseInt(minutePart, 10);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return '';
    const display = formatTimeDisplay(hour, minute, timeFormat);
    return display.period ? `${display.main} ${display.period}` : display.main;
  }, [time, timeFormat]);

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
      input = { ...parsedToCreateInput(parsed), reminderType: 'notification' as const };
    } else {
      input = {
        title: title.trim(),
        description: notes.trim() || undefined,
        date,
        time: formatTime24(time),
        hasTime: true,
        repeatType,
        priority,
        reminderType: 'notification' as const,
        categoryId,
      };
    }

    await createPlan(input);
    navigation.goBack();
  };

  const rtl = rtlTextStyle();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border, flexDirection: layoutRow() }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerBtn}>
          <Text style={[styles.headerAction, { color: colors.primary }]}>{t('notes.back')}</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {t('create.title')}
        </Text>
        <Pressable
          onPress={() => { void handleSubmit(); }}
          hitSlop={12}
          style={styles.headerBtn}
          disabled={!title.trim()}
        >
          <Text
            style={[
              styles.headerAction,
              { color: colors.primary, fontWeight: '600', opacity: title.trim() ? 1 : 0.4 },
            ]}
          >
            {t('create.addPlan')}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.block, { alignItems: layoutAlignEnd() }]}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }, rtl]}>{t('create.alarmTitle')}</Text>
            <FontTextInput
              style={[styles.titleInput, { color: colors.text }]}
              placeholder={t('create.placeholder')}
              placeholderColor={colors.textSecondary}
              value={title}
              onChangeText={handleTitleChange}
              autoFocus={!prefill?.title}
            />
            {nlpPreview ? (
              <Text style={[styles.nlpPreview, { color: colors.primary }]}>{nlpPreview}</Text>
            ) : null}
          </View>

          <View style={[styles.block, { alignItems: layoutAlignEnd() }]}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }, rtl]}>{t('create.alarmNote')}</Text>
            <FontTextInput
              style={[
                styles.notesInput,
                { color: colors.text, backgroundColor: colors.surfaceElevated },
              ]}
              placeholder={t('create.notesPlaceholder')}
              placeholderColor={colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              scrollEnabled={false}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.block}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('create.pickDate')}</Text>
            <View style={styles.dateSelectorWrap}>
              <DateSelector selectedDate={date} onSelectDate={setDate} />
            </View>
          </View>

          <View style={styles.block}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('create.setTime')}</Text>
            {timePreview ? (
              <Text style={[styles.timePreview, { color: colors.text }]}>{timePreview}</Text>
            ) : null}
            <TimePicker value={time} onChange={setTime} />
          </View>

          <View style={[styles.block, styles.optionsBlock, { borderTopColor: colors.border }]}>
            {categories.length > 0 ? (
              <View style={styles.optionSection}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('create.category')}</Text>
                <View style={styles.chipRow}>
                  <Chip
                    label={t('categories.none')}
                    selected={!categoryId}
                    onPress={() => setCategoryId(undefined)}
                  />
                  {categories.map((category) => (
                    <Chip
                      key={category.id}
                      label={category.name}
                      selected={categoryId === category.id}
                      onPress={() => setCategoryId(category.id)}
                      color={category.color}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.optionSection}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('create.repeat')}</Text>
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
            </View>

            <View style={styles.optionSection}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }, rtl]}>{t('create.priority')}</Text>
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
            </View>
          </View>

          <Pressable
            onPress={() => { void handleSubmit(); }}
            style={[styles.submit, { backgroundColor: colors.primary, opacity: title.trim() ? 1 : 0.5 }]}
            disabled={!title.trim()}
          >
            <Text style={[styles.submitText, { color: colors.fabText }]}>{t('create.addPlan')}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  headerBtn: {
    minWidth: 72,
    paddingVertical: spacing.xs,
  },
  headerTitle: {
    ...typography.label,
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  headerAction: {
    ...typography.label,
    fontSize: 15,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.xl,
  },
  block: {
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.xs,
    alignSelf: 'stretch',
  },
  titleInput: {
    fontFamily: FONT_FAMILY,
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 34,
    paddingVertical: spacing.xs,
    width: '100%',
    alignSelf: 'stretch',
  },
  nlpPreview: {
    ...typography.caption,
  },
  notesInput: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    lineHeight: 26,
    minHeight: 88,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    alignSelf: 'stretch',
  },
  dateSelectorWrap: {
    marginHorizontal: -spacing.xl,
  },
  timePreview: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontVariant: ['tabular-nums'],
  },
  optionsBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  optionSection: {
    gap: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  reminderHint: {
    ...typography.caption,
    lineHeight: 18,
    textAlign: 'right',
  },
  submit: {
    padding: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitText: {
    ...typography.label,
    fontSize: 16,
  },
});
