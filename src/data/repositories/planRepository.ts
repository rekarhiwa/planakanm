import { and, eq, gte, isNull, like, lte, ne, or, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import type {
  CreatePlanInput,
  Plan,
  PlanStatus,
  UpdatePlanInput,
} from '../../domain/entities/types';
import { getDb } from '../db/client';
import { planHistory, plans } from '../db/schema';

function rowToPlan(row: typeof plans.$inferSelect): Plan {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    date: row.date,
    time: row.time ?? undefined,
    hasTime: row.hasTime,
    status: row.status as Plan['status'],
    priority: row.priority as Plan['priority'],
    categoryId: row.categoryId ?? undefined,
    repeatType: row.repeatType as Plan['repeatType'],
    repeatRule: row.repeatRule ?? undefined,
    reminderType: row.reminderType as Plan['reminderType'],
    reminderSound: row.reminderSound ?? undefined,
    notificationId: row.notificationId ?? undefined,
    snoozedUntil: row.snoozedUntil ?? undefined,
    originalScheduledAt: row.originalScheduledAt ?? undefined,
    completedAt: row.completedAt ?? undefined,
    deletedAt: row.deletedAt ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function createPlan(input: CreatePlanInput): Promise<Plan> {
  const db = getDb();
  const now = Date.now();
  const id = uuidv4();
  const hasTime = input.hasTime ?? !!input.time;

  const plan: Plan = {
    id,
    title: input.title.trim(),
    description: input.description,
    date: input.date,
    time: input.time,
    hasTime,
    status: 'pending',
    priority: input.priority ?? 'normal',
    categoryId: input.categoryId,
    repeatType: input.repeatType ?? 'none',
    repeatRule: input.repeatRule,
    reminderType: input.reminderType ?? 'notification',
    originalScheduledAt: hasTime && input.time ? `${input.date}T${input.time}` : input.date,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(plans).values({
    id: plan.id,
    title: plan.title,
    description: plan.description ?? null,
    date: plan.date,
    time: plan.time ?? null,
    hasTime: plan.hasTime,
    status: plan.status,
    priority: plan.priority,
    categoryId: plan.categoryId ?? null,
    repeatType: plan.repeatType,
    repeatRule: plan.repeatRule ?? null,
    reminderType: plan.reminderType,
    originalScheduledAt: plan.originalScheduledAt ?? null,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  });

  await db.insert(planHistory).values({
    id: uuidv4(),
    planId: id,
    action: 'created',
    toValue: plan.title,
    timestamp: now,
  });

  return plan;
}

export async function updatePlan(id: string, input: UpdatePlanInput): Promise<Plan | null> {
  const db = getDb();
  const existing = await getPlanById(id);
  if (!existing) return null;

  const now = Date.now();
  const hasTime = input.hasTime ?? (input.time !== undefined ? !!input.time : existing.hasTime);

  const updates: Partial<typeof plans.$inferInsert> = {
    updatedAt: now,
  };

  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined) updates.description = input.description;
  if (input.date !== undefined) updates.date = input.date;
  if (input.time !== undefined) updates.time = input.time;
  if (input.hasTime !== undefined || input.time !== undefined) updates.hasTime = hasTime;
  if (input.status !== undefined) updates.status = input.status;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.categoryId !== undefined) updates.categoryId = input.categoryId;
  if (input.repeatType !== undefined) updates.repeatType = input.repeatType;
  if (input.repeatRule !== undefined) updates.repeatRule = input.repeatRule;
  if (input.reminderType !== undefined) updates.reminderType = input.reminderType;

  await db.update(plans).set(updates).where(eq(plans.id, id));

  await db.insert(planHistory).values({
    id: uuidv4(),
    planId: id,
    action: 'updated',
    fromValue: existing.title,
    toValue: input.title ?? existing.title,
    timestamp: now,
  });

  return getPlanById(id);
}

export async function getPlanById(id: string): Promise<Plan | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(plans)
    .where(and(eq(plans.id, id), isNull(plans.deletedAt)))
    .limit(1);
  return rows[0] ? rowToPlan(rows[0]) : null;
}

export async function getPlansForDate(date: string): Promise<Plan[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(plans)
    .where(and(eq(plans.date, date), isNull(plans.deletedAt), ne(plans.status, 'cancelled')))
    .orderBy(plans.time);
  return rows.map(rowToPlan);
}

export async function getPlansInRange(startDate: string, endDate: string): Promise<Plan[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(plans)
    .where(
      and(
        gte(plans.date, startDate),
        lte(plans.date, endDate),
        isNull(plans.deletedAt),
        ne(plans.status, 'cancelled'),
      ),
    )
    .orderBy(plans.date, plans.time);
  return rows.map(rowToPlan);
}

export async function getPlansByStatus(status: PlanStatus): Promise<Plan[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(plans)
    .where(and(eq(plans.status, status), isNull(plans.deletedAt)))
    .orderBy(plans.date, plans.time);
  return rows.map(rowToPlan);
}

export async function getOverduePlans(): Promise<Plan[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(plans)
    .where(
      and(
        or(eq(plans.status, 'overdue'), eq(plans.status, 'pending')),
        isNull(plans.deletedAt),
        ne(plans.status, 'completed'),
        ne(plans.status, 'cancelled'),
      ),
    );
  return rows.map(rowToPlan).filter((p) => p.status === 'overdue');
}

export async function getAllActivePlans(): Promise<Plan[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(plans)
    .where(and(isNull(plans.deletedAt), ne(plans.status, 'cancelled')))
    .orderBy(plans.date, plans.time);
  return rows.map(rowToPlan);
}

export async function searchPlans(query: string): Promise<Plan[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(plans)
    .where(
      and(isNull(plans.deletedAt), like(plans.title, `%${query}%`)),
    )
    .orderBy(plans.date);
  return rows.map(rowToPlan);
}

export async function completePlan(id: string): Promise<Plan | null> {
  const db = getDb();
  const now = Date.now();
  await db
    .update(plans)
    .set({ status: 'completed', completedAt: new Date().toISOString(), updatedAt: now })
    .where(eq(plans.id, id));

  await db.insert(planHistory).values({
    id: uuidv4(),
    planId: id,
    action: 'completed',
    timestamp: now,
  });

  return getPlanById(id);
}

export async function snoozePlan(
  id: string,
  snoozedUntil: string,
  newDate?: string,
  newTime?: string,
): Promise<Plan | null> {
  const db = getDb();
  const now = Date.now();
  const updates: Partial<typeof plans.$inferInsert> = {
    status: 'snoozed',
    snoozedUntil,
    updatedAt: now,
  };
  if (newDate) updates.date = newDate;
  if (newTime) {
    updates.time = newTime;
    updates.hasTime = true;
  }

  await db.update(plans).set(updates).where(eq(plans.id, id));

  await db.insert(planHistory).values({
    id: uuidv4(),
    planId: id,
    action: 'snoozed',
    toValue: snoozedUntil,
    timestamp: now,
  });

  return getPlanById(id);
}

export async function markOverdue(id: string): Promise<Plan | null> {
  const db = getDb();
  const now = Date.now();
  await db.update(plans).set({ status: 'overdue', updatedAt: now }).where(eq(plans.id, id));

  await db.insert(planHistory).values({
    id: uuidv4(),
    planId: id,
    action: 'missed',
    timestamp: now,
  });

  return getPlanById(id);
}

export async function deletePlan(id: string, soft = true): Promise<void> {
  const db = getDb();
  const now = Date.now();
  if (soft) {
    await db
      .update(plans)
      .set({ deletedAt: new Date().toISOString(), updatedAt: now })
      .where(eq(plans.id, id));
  } else {
    await db.delete(plans).where(eq(plans.id, id));
  }
}

export async function restorePlan(id: string): Promise<Plan | null> {
  const db = getDb();
  const now = Date.now();
  await db.update(plans).set({ deletedAt: null, updatedAt: now }).where(eq(plans.id, id));
  return getPlanById(id);
}

export async function setNotificationId(id: string, notificationId: string): Promise<void> {
  const db = getDb();
  await db
    .update(plans)
    .set({ notificationId, updatedAt: Date.now() })
    .where(eq(plans.id, id));
}

export async function getPlanStats(since: number): Promise<{
  total: number;
  completed: number;
  missed: number;
  snoozed: number;
}> {
  const db = getDb();
  const rows = await db
    .select()
    .from(plans)
    .where(and(gte(plans.createdAt, since), isNull(plans.deletedAt)));

  return {
    total: rows.length,
    completed: rows.filter((r) => r.status === 'completed').length,
    missed: rows.filter((r) => r.status === 'overdue').length,
    snoozed: rows.filter((r) => r.status === 'snoozed').length,
  };
}

export async function getPlanHistory(planId: string) {
  const db = getDb();
  return db
    .select()
    .from(planHistory)
    .where(eq(planHistory.planId, planId))
    .orderBy(sql`${planHistory.timestamp} DESC`);
}

export async function getCompletedStreak(): Promise<number> {
  const db = getDb();
  const rows = await db
    .select()
    .from(plans)
    .where(and(eq(plans.status, 'completed'), isNull(plans.deletedAt)))
    .orderBy(sql`${plans.completedAt} DESC`);

  if (rows.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    const hasCompleted = rows.some((r) => r.date === dateStr);
    if (hasCompleted) streak++;
    else if (i > 0) break;
  }
  return streak;
}
