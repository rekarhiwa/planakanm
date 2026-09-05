import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Note } from '../domain/entities/types';
import { NoteRow } from './NoteRow';
import { SectionHeader } from './SectionHeader';
import { radius, spacing, typography } from '../theme/colors';
import { layoutAlignStart, rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';

interface NotesSectionProps {
  notes: Note[];
  onAddNote: () => void;
  onOpenNote: (note: Note) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (note: Note) => void;
  showHeader?: boolean;
}

export function NotesSection({
  notes,
  onAddNote,
  onOpenNote,
  onToggleComplete,
  onDelete,
  showHeader = true,
}: NotesSectionProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const rtl = rtlTextStyle();

  const activeNotes = notes.filter((note) => !note.completed);
  const completedNotes = notes.filter((note) => note.completed);

  return (
    <View style={styles.container}>
      {showHeader ? (
        <SectionHeader title={t('notes.sectionTitle')} count={activeNotes.length} />
      ) : null}

      <Pressable
        onPress={onAddNote}
        style={[styles.addBtn, { borderColor: colors.border, backgroundColor: colors.surface, alignItems: layoutAlignStart() }]}
      >
        <Text style={[{ color: colors.primary, ...typography.label }, rtl]}>+ {t('notes.add')}</Text>
      </Pressable>

      {notes.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textSecondary }, rtl]}>{t('notes.empty')}</Text>
      ) : (
        <>
          {activeNotes.map((note) => (
            <NoteRow
              key={note.id}
              note={note}
              onPress={() => onOpenNote(note)}
              onToggleComplete={() => onToggleComplete(note.id)}
              onDelete={() => onDelete(note)}
            />
          ))}

          {completedNotes.length > 0 && (
            <>
              <Text style={[styles.doneLabel, { color: colors.textSecondary }, rtl]}>
                {t('notes.completed')} ({completedNotes.length})
              </Text>
              {completedNotes.map((note) => (
                <NoteRow
                  key={note.id}
                  note={note}
                  onPress={() => onOpenNote(note)}
                  onToggleComplete={() => onToggleComplete(note.id)}
                  onDelete={() => onDelete(note)}
                />
              ))}
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  addBtn: {
    borderWidth: 1,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  empty: {
    ...typography.caption,
    width: '100%',
    lineHeight: 20,
    paddingVertical: spacing.md,
  },
  doneLabel: {
    ...typography.caption,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
});
