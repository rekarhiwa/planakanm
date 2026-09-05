import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateSelector } from '../components/DateSelector';
import { AlarmIcon } from '../components/AlarmIcon';
import { FontTextInput } from '../components/FontTextInput';
import { getDefaultTimeValue, TimePicker } from '../components/TimePicker';
import type { NotesStackParamList } from '../navigation';
import { getPermissionStatus, requestAllAlarmPermissions } from '../permissions';
import { useDialogStore } from '../stores/dialogStore';
import { useNoteStore } from '../stores/noteStore';
import { useSettingsStore } from '../stores/settingsStore';
import { radius, spacing, typography } from '../theme/colors';
import { FONT_FAMILY } from '../theme/fonts';
import { contentDirectionStyle, layoutRow, ltrTextStyle, rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';
import { formatTimeDisplay, getTodayISO } from '../utils/dates';

const BODY_MIN_HEIGHT = Math.max(360, Dimensions.get('window').height * 0.4);

export function NoteEditorScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<NotesStackParamList>>();
  const route = useRoute<RouteProp<NotesStackParamList, 'NoteEditor'>>();
  const noteId = route.params?.noteId;
  const timeFormat = useSettingsStore((s) => s.settings.timeFormat);

  const saveNote = useNoteStore((s) => s.saveNote);
  const notes = useNoteStore((s) => s.notes);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [hasAlarm, setHasAlarm] = useState(false);
  const [alarmDate, setAlarmDate] = useState(getTodayISO());
  const [alarmTime, setAlarmTime] = useState(getDefaultTimeValue());
  const bodyRef = useRef<TextInput>(null);
  const savedRef = useRef(false);

  useEffect(() => {
    if (!noteId) {
      setTitle('');
      setBody('');
      setHasAlarm(false);
      setAlarmDate(getTodayISO());
      setAlarmTime(getDefaultTimeValue());
      return;
    }
    const note = notes.find((item) => item.id === noteId);
    if (!note) return;
    setTitle(note.title);
    setBody(note.body ?? '');
    setHasAlarm(note.hasAlarm);
    setAlarmDate(note.alarmDate ?? getTodayISO());
    setAlarmTime(note.alarmTime ?? getDefaultTimeValue());
  }, [noteId, notes]);

  const timePreview = useMemo(() => {
    if (!hasAlarm) return '';
    const [hourPart, minutePart] = alarmTime.split(':');
    const hour = Number.parseInt(hourPart, 10);
    const minute = Number.parseInt(minutePart, 10);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return '';
    const display = formatTimeDisplay(hour, minute, timeFormat);
    return display.period ? `${display.main} ${display.period}` : display.main;
  }, [alarmTime, hasAlarm, timeFormat]);

  const toggleAlarm = useCallback(async () => {
    const next = !hasAlarm;
    if (next) {
      const status = await getPermissionStatus();
      if (!status.notifications) {
        const confirmed = await useDialogStore.getState().showConfirm({
          title: t('settings.alarmPermissionsTitle'),
          message: t('settings.alarmPermissionsDesc'),
          confirmLabel: t('settings.enableAllAlarmPermissions'),
          accent: 'warning',
        });
        if (confirmed) {
          await requestAllAlarmPermissions();
        }
      }
      if (!alarmTime) {
        setAlarmTime(getDefaultTimeValue());
      }
    }
    setHasAlarm(next);
  }, [alarmTime, hasAlarm, t]);

  const persistNote = useCallback(async () => {
    if (savedRef.current) return;
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!noteId && !trimmedTitle && !trimmedBody) return;

    savedRef.current = true;
    await saveNote({
      id: noteId,
      title: trimmedTitle,
      body: trimmedBody,
      hasAlarm,
      alarmDate: hasAlarm ? alarmDate : undefined,
      alarmTime: hasAlarm ? alarmTime : undefined,
    });
  }, [alarmDate, alarmTime, body, hasAlarm, noteId, saveNote, title]);

  const handleBack = useCallback(async () => {
    await persistNote();
    navigation.goBack();
  }, [navigation, persistNote]);

  const rtl = rtlTextStyle();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border, flexDirection: layoutRow() }]}>
        <Pressable onPress={() => { void handleBack(); }} hitSlop={12} style={styles.headerBtn}>
          <Text style={[styles.headerAction, { color: colors.primary }, rtl]}>{t('notes.back')}</Text>
        </Pressable>

        <Pressable
          onPress={() => { void toggleAlarm(); }}
          hitSlop={12}
          style={[
            styles.alarmBtn,
            {
              backgroundColor: hasAlarm ? colors.nowHighlight : colors.surfaceElevated,
              borderColor: hasAlarm ? colors.primary : colors.border,
            },
          ]}
        >
          <AlarmIcon color={hasAlarm ? colors.primary : colors.textSecondary} size={20} />
        </Pressable>

        <Pressable onPress={() => { void handleBack(); }} hitSlop={12} style={styles.headerBtn}>
          <Text style={[styles.headerAction, { color: colors.primary, fontWeight: '600' }, rtl]}>
            {t('notes.save')}
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
          contentContainerStyle={[styles.scrollContent, contentDirectionStyle()]}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.block}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }, rtl]}>{t('notes.noteTitle')}</Text>
            <FontTextInput
              style={[styles.titleInput, { color: colors.text }]}
              placeholder={t('notes.titlePlaceholder')}
              placeholderColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
              onSubmitEditing={() => bodyRef.current?.focus()}
              blurOnSubmit={false}
              multiline={false}
              autoFocus={!noteId}
            />
          </View>

          <View style={styles.block}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }, rtl]}>{t('notes.noteBody')}</Text>
            <FontTextInput
              ref={bodyRef}
              style={[
                styles.bodyInput,
                { color: colors.text, backgroundColor: colors.surfaceElevated },
              ]}
              placeholder={t('notes.bodyPlaceholder')}
              placeholderColor={colors.textSecondary}
              value={body}
              onChangeText={setBody}
              multiline
              scrollEnabled={false}
              textAlignVertical="top"
            />
          </View>

          {hasAlarm ? (
            <View style={[styles.alarmBlock, { borderTopColor: colors.border }]}>
              <Text style={[styles.fieldLabel, { color: colors.primary }, rtl]}>{t('notes.hasAlarm')}</Text>

              <View style={styles.block}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }, rtl]}>{t('create.pickDate')}</Text>
                <View style={styles.dateSelectorWrap}>
                  <DateSelector selectedDate={alarmDate} onSelectDate={setAlarmDate} />
                </View>
              </View>

              <View style={styles.block}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }, rtl]}>{t('create.setTime')}</Text>
                {timePreview ? (
                  <Text style={[styles.timePreview, { color: colors.text }, ltrTextStyle()]}>{timePreview}</Text>
                ) : null}
                <TimePicker value={alarmTime} onChange={setAlarmTime} />
              </View>
            </View>
          ) : null}
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
  },
  headerBtn: {
    minWidth: 64,
    paddingVertical: spacing.xs,
  },
  headerAction: {
    ...typography.label,
    fontSize: 16,
  },
  alarmBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.xl,
  },
  block: {
    gap: spacing.sm,
    width: '100%',
    alignSelf: 'stretch',
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: '600',
    alignSelf: 'stretch',
    width: '100%',
  },
  titleInput: {
    fontFamily: FONT_FAMILY,
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 36,
    paddingVertical: spacing.xs,
    width: '100%',
    alignSelf: 'stretch',
  },
  bodyInput: {
    fontFamily: FONT_FAMILY,
    fontSize: 17,
    lineHeight: 28,
    minHeight: BODY_MIN_HEIGHT,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    alignSelf: 'stretch',
  },
  alarmBlock: {
    gap: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.lg,
    width: '100%',
    alignSelf: 'stretch',
  },
  dateSelectorWrap: {
    marginHorizontal: -spacing.xl,
    alignSelf: 'stretch',
    width: '100%',
  },
  timePreview: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
});
