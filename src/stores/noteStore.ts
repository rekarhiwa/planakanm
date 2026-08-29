import { create } from 'zustand';

import type { Note, SaveNoteInput } from '../domain/entities/types';
import * as noteRepo from '../data/repositories/noteRepository';
import { cancelPlanNotifications, schedulePlanNotification } from '../notifications/scheduler';
import { formatTime24, getTodayISO } from '../utils/dates';
import { usePlanStore } from './planStore';

interface NoteStore {
  notes: Note[];
  isLoading: boolean;
  lastDeletedNoteId: string | null;

  loadNotes: () => Promise<void>;
  saveNote: (input: SaveNoteInput) => Promise<Note | null>;
  toggleNoteCompleted: (id: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  undoDeleteNote: () => Promise<void>;
}

async function syncNoteAlarm(note: Note, input: SaveNoteInput): Promise<Note | null> {
  const planStore = usePlanStore.getState();

  if (!input.hasAlarm) {
    if (note.planId) {
      await cancelPlanNotifications(note.planId);
      await planStore.deletePlan(note.planId);
      return noteRepo.updateNote(note.id, {
        hasAlarm: false,
        alarmDate: null,
        alarmTime: null,
        planId: null,
      });
    }
    return noteRepo.updateNote(note.id, {
      hasAlarm: false,
      alarmDate: null,
      alarmTime: null,
    });
  }

  if (!input.alarmDate || !input.alarmTime) {
    return noteRepo.updateNote(note.id, {
      hasAlarm: true,
      alarmDate: input.alarmDate ?? getTodayISO(),
      alarmTime: input.alarmTime ?? null,
    });
  }

  const planPayload = {
    title: input.title.trim(),
    description: input.body?.trim() || undefined,
    date: input.alarmDate,
    time: formatTime24(input.alarmTime),
    hasTime: true,
    reminderType: 'alarm' as const,
  };

  if (note.planId) {
    await cancelPlanNotifications(note.planId);
    const updated = await planStore.updatePlan(note.planId, planPayload);
    if (updated) {
      await schedulePlanNotification(updated);
    }
    return noteRepo.updateNote(note.id, {
      hasAlarm: true,
      alarmDate: input.alarmDate,
      alarmTime: input.alarmTime,
      planId: note.planId,
    });
  }

  const plan = await planStore.createPlan(planPayload);
  return noteRepo.updateNote(note.id, {
    hasAlarm: true,
    alarmDate: input.alarmDate,
    alarmTime: input.alarmTime,
    planId: plan.id,
  });
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  isLoading: false,
  lastDeletedNoteId: null,

  loadNotes: async () => {
    set({ isLoading: true });
    const allNotes = await noteRepo.getAllNotes();
    set({ notes: allNotes, isLoading: false });
  },

  saveNote: async (input) => {
    const trimmedTitle = input.title.trim();
    const trimmedBody = input.body?.trim();
    if (!trimmedTitle && !trimmedBody) return null;

    const finalTitle = trimmedTitle || 'بێ ناونیشان';
    let note: Note | null;

    if (input.id) {
      note = await noteRepo.updateNote(input.id, {
        title: finalTitle,
        body: trimmedBody,
        hasAlarm: input.hasAlarm,
        alarmDate: input.hasAlarm ? input.alarmDate ?? getTodayISO() : null,
        alarmTime: input.hasAlarm ? input.alarmTime ?? null : null,
      });
      if (!note) return null;
      note = await syncNoteAlarm(note, { ...input, title: finalTitle, body: trimmedBody });
    } else {
      note = await noteRepo.createNote({
        title: finalTitle,
        body: trimmedBody,
        hasAlarm: input.hasAlarm,
        alarmDate: input.hasAlarm ? input.alarmDate ?? getTodayISO() : undefined,
        alarmTime: input.hasAlarm ? input.alarmTime : undefined,
      });
      note = await syncNoteAlarm(note, { ...input, id: note.id, title: finalTitle, body: trimmedBody });
    }

    await get().loadNotes();
    return note;
  },

  toggleNoteCompleted: async (id) => {
    await noteRepo.toggleNoteCompleted(id);
    await get().loadNotes();
  },

  deleteNote: async (id) => {
    const note = get().notes.find((item) => item.id === id);
    if (note?.planId) {
      await cancelPlanNotifications(note.planId);
      await usePlanStore.getState().deletePlan(note.planId);
    }
    await noteRepo.deleteNote(id);
    set({ lastDeletedNoteId: id });
    await get().loadNotes();
  },

  undoDeleteNote: async () => {
    const { lastDeletedNoteId } = get();
    if (!lastDeletedNoteId) return;
    await noteRepo.restoreNote(lastDeletedNoteId);
    set({ lastDeletedNoteId: null });
    await get().loadNotes();
  },
}));
