import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import type { Category } from '../../domain/entities/types';
import { getDb } from '../db/client';
import { categories, plans } from '../db/schema';

function rowToCategory(row: typeof categories.$inferSelect): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isDefault: row.isDefault,
  };
}

export async function getAllCategories(): Promise<Category[]> {
  const db = getDb();
  const rows = await db.select().from(categories);
  return rows.map(rowToCategory);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const db = getDb();
  const rows = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return rows[0] ? rowToCategory(rows[0]) : null;
}

export async function createCategory(name: string, color: string): Promise<Category> {
  const db = getDb();
  const id = uuidv4();
  const trimmed = name.trim();
  await db.insert(categories).values({
    id,
    name: trimmed,
    icon: trimmed.charAt(0) || '•',
    color,
    isDefault: false,
  });
  return { id, name: trimmed, icon: trimmed.charAt(0) || '•', color, isDefault: false };
}

export async function deleteCategory(id: string): Promise<void> {
  const db = getDb();
  await db.update(plans).set({ categoryId: null }).where(eq(plans.categoryId, id));
  await db.delete(categories).where(eq(categories.id, id));
}
