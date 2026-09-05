export type PlanStatus = 'pending' | 'completed' | 'overdue' | 'snoozed' | 'cancelled';
export type PlanPriority = 'low' | 'normal' | 'high' | 'urgent';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ReminderType = 'notification' | 'alarm';
export type HistoryAction =
  | 'created'
  | 'completed'
  | 'snoozed'
  | 'rescheduled'
  | 'missed'
  | 'cancelled'
  | 'updated';

export interface Plan {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  hasTime: boolean;
  status: PlanStatus;
  priority: PlanPriority;
  categoryId?: string;
  repeatType: RepeatType;
  repeatRule?: string;
  reminderType: ReminderType;
  reminderSound?: string;
  notificationId?: string;
  snoozedUntil?: string;
  originalScheduledAt?: string;
  completedAt?: string;
  deletedAt?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  id: string;
  title: string;
  body?: string;
  hasAlarm: boolean;
  alarmDate?: string;
  alarmTime?: string;
  planId?: string;
  completed: boolean;
  completedAt?: string;
  deletedAt?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateNoteInput {
  title: string;
  body?: string;
  hasAlarm?: boolean;
  alarmDate?: string;
  alarmTime?: string;
  planId?: string;
}

export interface SaveNoteInput {
  id?: string;
  title: string;
  body?: string;
  hasAlarm: boolean;
  alarmDate?: string;
  alarmTime?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface PlanHistory {
  id: string;
  planId: string;
  action: HistoryAction;
  fromValue?: string;
  toValue?: string;
  timestamp: number;
}

export interface AppSettings {
  language: 'ku' | 'en';
  theme: 'light' | 'dark' | 'system';
  defaultReminderType: ReminderType;
  defaultSnoozeMinutes: number;
  weekStartsOn: 0 | 1 | 6;
  timeFormat: '12h' | '24h';
  onboardingComplete: boolean;
  notificationsEnabled: boolean;
  vibrationEnabled: boolean;
  userName?: string;
}

export type SnoozePreset =
  | '5min'
  | '10min'
  | '15min'
  | '30min'
  | '1hour'
  | '2hours'
  | 'tomorrow'
  | 'custom';

export interface CreatePlanInput {
  title: string;
  description?: string;
  date: string;
  time?: string;
  hasTime?: boolean;
  priority?: PlanPriority;
  categoryId?: string;
  repeatType?: RepeatType;
  repeatRule?: string;
  reminderType?: ReminderType;
}

export interface UpdatePlanInput extends Partial<CreatePlanInput> {
  status?: PlanStatus;
}
