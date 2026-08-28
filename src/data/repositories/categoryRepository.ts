import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import type { Category } from '../../domain/entities/types';
import { getDb } from '../db/client';
import { categories } from '../db/schema';

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'کار', icon: '💼', color: '#4A90D9', isDefault: true },
  { name: 'خوێندن', icon: '📚', color: '#7B68EE', isDefault: true },
  { name: 'کەسی', icon: '👤', color: '#E67E22', isDefault: true },
  { name: 'ماڵ', icon: '🏠', color: '#27AE60', isDefault: true },
  { name: 'وەرزش', icon: '💪', color: '#E74C3C', isDefault: true },
  { name: 'خۆبەخشین', icon: '❤️', color: '#E91E63', isDefault: true },
  { name: 'بیرۆکە', icon: '💡', color: '#F39C12', isDefault: true },
  { name: 'هیتر', icon: '📌', color: '#95A5A6', isDefault: true },
];

function rowToCategory(row: typeof categories.$inferSelect): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isDefault: row.isDefault,
  };
}

export async function seedCategories(): Promise<void> {
  const db = getDb();
  const existing = await db.select().from(categories).limit(1);
  if (existing.length > 0) return;

  for (const cat of DEFAULT_CATEGORIES) {
    await db.insert(categories).values({
      id: uuidv4(),
      ...cat,
    });
  }
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

export async function createCategory(
  name: string,
  icon: string,
  color: string,
): Promise<Category> {
  const db = getDb();
  const id = uuidv4();
  await db.insert(categories).values({ id, name, icon, color, isDefault: false });
  return { id, name, icon, color, isDefault: false };
}

export async function deleteCategory(id: string): Promise<void> {
  const db = getDb();
  await db.delete(categories).where(eq(categories.id, id));
}
