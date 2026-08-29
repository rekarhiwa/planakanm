import { and, desc, eq, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import type { CreateNoteInput, Note } from '../../domain/entities/types';
import { getDb } from '../db/client';
import { notes } from '../db/schema';

function rowToNote(row: typeof notes.$inferSelect): Note {
  return {
    id: row.id,
    title: row.title,
    body: row.body ?? undefined,
    hasAlarm: row.hasAlarm,
    alarmDate: row.alarmDate ?? undefined,
    alarmTime: row.alarmTime ?? undefined,
    planId: row.planId ?? undefined,
    completed: row.completed,
    completedAt: row.completedAt ?? undefined,
    deletedAt: row.deletedAt ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getAllNotes(): Promise<Note[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(notes)
    .where(isNull(notes.deletedAt))
    .orderBy(notes.completed, desc(notes.updatedAt));
  return rows.map(rowToNote);
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const db = getDb();
  const now = Date.now();
  const id = uuidv4();
  const note: Note = {
    id,
    title: input.title.trim(),
    body: input.body?.trim() || undefined,
    hasAlarm: input.hasAlarm ?? false,
    alarmDate: input.alarmDate,
    alarmTime: input.alarmTime,
    planId: input.planId,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(notes).values({
    id: note.id,
    title: note.title,
    body: note.body ?? null,
    hasAlarm: note.hasAlarm,
    alarmDate: note.alarmDate ?? null,
    alarmTime: note.alarmTime ?? null,
    planId: note.planId ?? null,
    completed: false,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  });

  return note;
}

export async function toggleNoteCompleted(id: string): Promise<Note | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), isNull(notes.deletedAt)))
    .limit(1);
  const existing = rows[0];
  if (!existing) return null;

  const completed = !existing.completed;
  const now = Date.now();
  await db
    .update(notes)
    .set({
      completed,
      completedAt: completed ? new Date().toISOString() : null,
      updatedAt: now,
    })
    .where(eq(notes.id, id));

  return getNoteById(id);
}

export async function deleteNote(id: string): Promise<void> {
  const db = getDb();
  await db
    .update(notes)
    .set({ deletedAt: new Date().toISOString(), updatedAt: Date.now() })
    .where(eq(notes.id, id));
}

export async function restoreNote(id: string): Promise<void> {
  const db = getDb();
  await db
    .update(notes)
    .set({ deletedAt: null, updatedAt: Date.now() })
    .where(eq(notes.id, id));
}

export async function updateNote(
  id: string,
  input: {
    title?: string;
    body?: string;
    hasAlarm?: boolean;
    alarmDate?: string | null;
    alarmTime?: string | null;
    planId?: string | null;
  },
): Promise<Note | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), isNull(notes.deletedAt)))
    .limit(1);
  const existing = rows[0];
  if (!existing) return null;

  const now = Date.now();
  const nextTitle = input.title !== undefined ? input.title.trim() : existing.title;
  const nextBody =
    input.body !== undefined ? input.body.trim() || null : existing.body;

  await db
    .update(notes)
    .set({
      title: nextTitle,
      body: nextBody,
      hasAlarm: input.hasAlarm ?? existing.hasAlarm,
      alarmDate: input.alarmDate !== undefined ? input.alarmDate : existing.alarmDate,
      alarmTime: input.alarmTime !== undefined ? input.alarmTime : existing.alarmTime,
      planId: input.planId !== undefined ? input.planId : existing.planId,
      updatedAt: now,
    })
    .where(eq(notes.id, id));

  return getNoteById(id);
}

export async function getNoteById(id: string): Promise<Note | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), isNull(notes.deletedAt)))
    .limit(1);
  return rows[0] ? rowToNote(rows[0]) : null;
}
