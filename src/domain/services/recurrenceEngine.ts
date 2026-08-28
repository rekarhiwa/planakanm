import type { Plan, RepeatType } from '../entities/types';
import { generateRecurrenceDates, getTodayISO, isPlanOverdue } from '../../utils/dates';
import * as planRepo from '../../data/repositories/planRepository';

const RECURRENCE_WINDOW = 30;

export async function detectAndMarkOverdue(): Promise<Plan[]> {
  const today = getTodayISO();
  const allPlans = await planRepo.getPlansInRange(
    new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    today,
  );

  const newlyOverdue: Plan[] = [];

  for (const plan of allPlans) {
    if (plan.status === 'pending' && isPlanOverdue(plan)) {
      const updated = await planRepo.markOverdue(plan.id);
      if (updated) newlyOverdue.push(updated);
    }
  }

  return newlyOverdue;
}

export async function generateRecurringInstances(
  parentPlan: Plan,
  windowDays = RECURRENCE_WINDOW,
): Promise<Plan[]> {
  if (parentPlan.repeatType === 'none') return [parentPlan];

  const dates = generateRecurrenceDates(
    parentPlan.date,
    parentPlan.repeatType,
    parentPlan.repeatRule,
    windowDays,
  );

  const instances: Plan[] = [];
  for (const date of dates) {
    if (date === parentPlan.date) {
      instances.push(parentPlan);
      continue;
    }
    const existing = await planRepo.getPlansForDate(date);
    const duplicate = existing.find(
      (p) => p.title === parentPlan.title && p.repeatType === 'none',
    );
    if (!duplicate) {
      const instance = await planRepo.createPlan({
        title: parentPlan.title,
        description: parentPlan.description,
        date,
        time: parentPlan.time,
        hasTime: parentPlan.hasTime,
        priority: parentPlan.priority,
        categoryId: parentPlan.categoryId,
        repeatType: 'none',
        reminderType: parentPlan.reminderType,
      });
      instances.push(instance);
    }
  }

  return instances;
}

export function getNextOccurrence(plan: Plan): string | null {
  if (plan.repeatType === 'none') return plan.date;
  const dates = generateRecurrenceDates(plan.date, plan.repeatType, plan.repeatRule, 60);
  const today = getTodayISO();
  return dates.find((d) => d >= today) ?? null;
}

export async function expandRecurringPlans(plans: Plan[]): Promise<Plan[]> {
  const expanded: Plan[] = [];
  for (const plan of plans) {
    if (plan.repeatType !== 'none') {
      const instances = await generateRecurringInstances(plan, 14);
      expanded.push(...instances);
    } else {
      expanded.push(plan);
    }
  }
  return expanded;
}
