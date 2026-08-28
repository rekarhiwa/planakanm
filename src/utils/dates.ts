import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  format,
  getDaysInMonth,
  isBefore,
  parseISO,
  startOfDay,
} from 'date-fns';

import type { Plan, RepeatType } from '../domain/entities/types';

export function formatDateISO(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatTime24(time: string): string {
  const [h, m] = time.split(':').map(Number);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getTodayISO(): string {
  return formatDateISO(new Date());
}

export function getTomorrowISO(): string {
  return formatDateISO(addDays(new Date(), 1));
}

export function getGreetingKey(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export type TimeGroup = 'morning' | 'afternoon' | 'noTime';

export function groupPlansByTime(plans: Plan[]): Record<TimeGroup, Plan[]> {
  const groups: Record<TimeGroup, Plan[]> = {
    morning: [],
    afternoon: [],
    noTime: [],
  };

  for (const plan of plans) {
    if (!plan.hasTime || !plan.time) {
      groups.noTime.push(plan);
      continue;
    }
    const hour = parseInt(plan.time.split(':')[0], 10);
    if (hour < 12) groups.morning.push(plan);
    else groups.afternoon.push(plan);
  }

  return groups;
}

export function getScheduledDateTime(plan: Plan): Date | null {
  if (!plan.hasTime || !plan.time) return null;
  const [h, m] = plan.time.split(':').map(Number);
  const d = parseISO(plan.date);
  d.setHours(h, m, 0, 0);
  return d;
}

export function isPlanOverdue(plan: Plan): boolean {
  if (plan.status === 'completed' || plan.status === 'cancelled') return false;
  const scheduled = getScheduledDateTime(plan);
  if (!scheduled) return false;
  return isBefore(scheduled, new Date());
}

export function isPlanNow(plan: Plan, windowMinutes = 30): boolean {
  const scheduled = getScheduledDateTime(plan);
  if (!scheduled) return false;
  const now = new Date();
  const diff = scheduled.getTime() - now.getTime();
  return diff <= windowMinutes * 60 * 1000 && diff >= -windowMinutes * 60 * 1000;
}

export function getWeekDates(startDate: Date, weekStartsOn: 0 | 1 | 6 = 6): Date[] {
  const dates: Date[] = [];
  const day = startDate.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  const weekStart = addDays(startDate, -diff);

  for (let i = 0; i < 7; i++) {
    dates.push(addDays(weekStart, i));
  }
  return dates;
}

export function getMonthDays(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = getDaysInMonth(firstDay);
  const startDow = firstDay.getDay();
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = new Array(startDow).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(new Date(year, month, day));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }
  return weeks;
}

export function addSnoozeDuration(
  preset: string,
  from: Date = new Date(),
): { date: string; time?: string; iso: string } {
  let target = new Date(from);

  switch (preset) {
    case '5min':
      target = new Date(from.getTime() + 5 * 60 * 1000);
      break;
    case '10min':
      target = new Date(from.getTime() + 10 * 60 * 1000);
      break;
    case '15min':
      target = new Date(from.getTime() + 15 * 60 * 1000);
      break;
    case '30min':
      target = new Date(from.getTime() + 30 * 60 * 1000);
      break;
    case '1hour':
      target = new Date(from.getTime() + 60 * 60 * 1000);
      break;
    case '2hours':
      target = new Date(from.getTime() + 2 * 60 * 60 * 1000);
      break;
    case 'tomorrow': {
      const tomorrow = addDays(startOfDay(from), 1);
      tomorrow.setHours(9, 0, 0, 0);
      target = tomorrow;
      break;
    }
    default:
      target = new Date(from.getTime() + 15 * 60 * 1000);
  }

  return {
    date: formatDateISO(target),
    time: `${String(target.getHours()).padStart(2, '0')}:${String(target.getMinutes()).padStart(2, '0')}`,
    iso: target.toISOString(),
  };
}

export function generateRecurrenceDates(
  startDate: string,
  repeatType: RepeatType,
  repeatRule: string | undefined,
  count: number,
): string[] {
  const dates: string[] = [];
  let current = parseISO(startDate);

  for (let i = 0; i < count; i++) {
    dates.push(formatDateISO(current));
    switch (repeatType) {
      case 'daily':
        current = addDays(current, 1);
        break;
      case 'weekly':
        current = addWeeks(current, 1);
        break;
      case 'monthly':
        current = addMonths(current, 1);
        break;
      case 'yearly':
        current = addYears(current, 1);
        break;
      default:
        return dates;
    }
  }
  return dates;
}

export function getDayNameShort(date: Date, locale = 'ku'): string {
  const days = {
    ku: ['ی', 'د', 'س', 'چ', 'پ', 'ه', 'ش'],
    ar: ['أ', 'إ', 'ث', 'أ', 'خ', 'ج', 'س'],
    en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  };
  const lang = locale as keyof typeof days;
  return (days[lang] ?? days.en)[date.getDay()];
}

export function getMonthName(month: number, locale = 'ku'): string {
  const months = {
    ku: [
      'کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران',
      'تەممووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم',
    ],
    ar: [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نovember', 'ديسمبر',
    ],
    en: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ],
  };
  const lang = locale as keyof typeof months;
  return (months[lang] ?? months.en)[month];
}
