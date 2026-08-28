import type { Plan } from '../entities/types';
import { addSnoozeDuration } from '../../utils/dates';
import * as planRepo from '../../data/repositories/planRepository';
import { SNOOZE_PRESETS } from '../constants/snoozePresets';

export { SNOOZE_PRESETS };

export async function snoozePlanByPreset(
  planId: string,
  preset: string,
): Promise<Plan | null> {
  const snooze = addSnoozeDuration(preset);
  return planRepo.snoozePlan(planId, snooze.iso, snooze.date, snooze.time);
}

export async function snoozePlanToCustom(
  planId: string,
  date: string,
  time?: string,
): Promise<Plan | null> {
  const iso = time ? `${date}T${time}:00` : `${date}T09:00:00`;
  return planRepo.snoozePlan(planId, iso, date, time);
}