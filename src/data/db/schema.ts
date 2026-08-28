import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const plans = sqliteTable(
  'plans',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    date: text('date').notNull(),
    time: text('time'),
    hasTime: integer('has_time', { mode: 'boolean' }).notNull().default(false),
    status: text('status').notNull().default('pending'),
    priority: text('priority').notNull().default('normal'),
    categoryId: text('category_id'),
    repeatType: text('repeat_type').notNull().default('none'),
    repeatRule: text('repeat_rule'),
    reminderType: text('reminder_type').notNull().default('notification'),
    reminderSound: text('reminder_sound'),
    notificationId: text('notification_id'),
    snoozedUntil: text('snoozed_until'),
    originalScheduledAt: text('original_scheduled_at'),
    completedAt: text('completed_at'),
    deletedAt: text('deleted_at'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    index('plans_date_status_idx').on(table.date, table.status),
    index('plans_snoozed_idx').on(table.snoozedUntil),
    index('plans_status_idx').on(table.status),
  ],
);

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
});

export const planHistory = sqliteTable(
  'plan_history',
  {
    id: text('id').primaryKey(),
    planId: text('plan_id').notNull(),
    action: text('action').notNull(),
    fromValue: text('from_value'),
    toValue: text('to_value'),
    timestamp: integer('timestamp').notNull(),
  },
  (table) => [index('history_plan_idx').on(table.planId)],
);

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
