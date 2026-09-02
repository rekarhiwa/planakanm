import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FAB } from '../components/FAB';
import { NotesSection } from '../components/NotesSection';
import type { Note } from '../domain/entities/types';
import type { NotesStackParamList } from '../navigation';
import { useDialogStore } from '../stores/dialogStore';
import { useNoteStore } from '../stores/noteStore';
import { useUIStore } from '../stores/uiStore';
import { spacing, typography } from '../theme/colors';
import { layoutAlignEnd, rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';

export function NotesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<NotesStackParamList>>();

  const notes = useNoteStore((s) => s.notes);
  const loadNotes = useNoteStore((s) => s.loadNotes);
  const toggleNoteCompleted = useNoteStore((s) => s.toggleNoteCompleted);
  const deleteNote = useNoteStore((s) => s.deleteNote);
  const showUndo = useUIStore((s) => s.showUndo);
  const rtl = rtlTextStyle();

  useFocusEffect(
    useCallback(() => {
      void loadNotes();
    }, [loadNotes]),
  );

  const handleOpenEditor = useCallback(
    (noteId?: string) => {
      navigation.navigate('NoteEditor', noteId ? { noteId } : undefined);
    },
    [navigation],
  );

  const handleDeleteNote = useCallback(
    async (note: Note) => {
      const confirmed = await useDialogStore.getState().showConfirm({
        title: t('notes.deleteTitle'),
        message: t('notes.deleteMessage'),
        confirmLabel: t('common.delete'),
        accent: 'danger',
        destructive: true,
        highlight: { color: colors.primary, label: note.title },
      });
      if (!confirmed) return;
      await deleteNote(note.id);
      showUndo(t('notes.deleted'));
    },
    [colors.primary, deleteNote, showUndo, t],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { alignItems: layoutAlignEnd() }]}>
        <Text style={[styles.title, { color: colors.text }, rtl]}>{t('notes.screenTitle')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }, rtl]}>{t('notes.addHint')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('notes.emptyTitle')}</Text>
            <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>{t('notes.empty')}</Text>
          </View>
        ) : (
          <NotesSection
            notes={notes}
            onAddNote={() => handleOpenEditor()}
            onOpenNote={(note) => handleOpenEditor(note.id)}
            onToggleComplete={(id) => {
              void toggleNoteCompleted(id);
            }}
            onDelete={(note) => {
              void handleDeleteNote(note);
            }}
            showHeader={false}
          />
        )}
      </ScrollView>

      <FAB label={t('notes.add')} onPress={() => handleOpenEditor()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    ...typography.display,
    fontSize: 28,
  },
  subtitle: {
    ...typography.caption,
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl * 2,
    gap: spacing.sm,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.title,
    textAlign: 'center',
  },
  emptyMessage: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
});
