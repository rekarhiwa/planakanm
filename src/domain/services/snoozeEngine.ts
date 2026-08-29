import type { Plan } from '../entities/types';
import { addSnoozeDuration, formatDateISO } from '../../utils/dates';
import * as planRepo from '../../data/repositories/planRepository';
import { SNOOZE_PRESETS } from '../constants/snoozePresets';

export { SNOOZE_PRESETS };

export type SnoozeSelection =
  | { kind: 'preset'; key: string }
  | { kind: 'minutes'; minutes: number }
  | { kind: 'datetime'; date: string; time: string };

export async function snoozePlanByPreset(
  planId: string,
  preset: string,
): Promise<Plan | null> {
  const snooze = addSnoozeDuration(preset);
  return planRepo.snoozePlan(planId, snooze.iso, snooze.date, snooze.time);
}

export async function applySnoozeSelection(
  planId: string,
  selection: SnoozeSelection,
): Promise<Plan | null> {
  switch (selection.kind) {
    case 'preset':
      return snoozePlanByPreset(planId, selection.key);
    case 'minutes':
      return snoozePlanByMinutes(planId, selection.minutes);
    case 'datetime':
      return snoozePlanToCustom(planId, selection.date, selection.time);
    default:
      return null;
  }
}

export async function snoozePlanByMinutes(
  planId: string,
  minutes: number,
): Promise<Plan | null> {
  const safeMinutes = Math.min(24 * 60, Math.max(1, Math.round(minutes)));
  const target = new Date(Date.now() + safeMinutes * 60 * 1000);
  const date = formatDateISO(target);
  const time = `${String(target.getHours()).padStart(2, '0')}:${String(target.getMinutes()).padStart(2, '0')}`;
  return planRepo.snoozePlan(planId, target.toISOString(), date, time);
}

export async function snoozePlanToCustom(
  planId: string,
  date: string,
  time?: string,
): Promise<Plan | null> {
  const iso = time ? `${date}T${time}:00` : `${date}T09:00:00`;
  return planRepo.snoozePlan(planId, iso, date, time);
}