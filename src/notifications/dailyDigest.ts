import { addDays } from 'date-fns';
import { Platform } from 'react-native';

import * as planRepo from '../data/repositories/planRepository';
import i18n from '../i18n';
import { formatDateISO, getTodayISO } from '../utils/dates';
import { loadNotifications } from './scheduler';

const MORNING_HOUR = 8;
const MORNING_MINUTE = 0;
const EVENING_HOUR = 18;
const EVENING_MINUTE = 0;
const DIGEST_DAYS_AHEAD = 14;

type DigestSlot = 'morning' | 'evening';

function buildDigestDateTime(dateStr: string, hour: number, minute: number): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function addDaysToIso(dateStr: string, amount: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return formatDateISO(addDays(new Date(year, month - 1, day), amount));
}

async function cancelDailyDigestNotifications(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const request of scheduled) {
    const data = request.content.data as { type?: string };
    if (data?.type === 'daily_digest') {
      await Notifications.cancelScheduledNotificationAsync(request.identifier);
    }
  }
}

async function scheduleDigest(
  dateStr: string,
  slot: DigestSlot,
  count: number,
  triggerAt: Date,
): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;

  const titleKey = slot === 'morning' ? 'notification.dailyDigest.morningTitle' : 'notification.dailyDigest.eveningTitle';
  const bodyKey = slot === 'morning' ? 'notification.dailyDigest.morningBody' : 'notification.dailyDigest.eveningBody';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t(titleKey),
      body: i18n.t(bodyKey, { count }),
      data: {
        type: 'daily_digest',
        slot,
        date: dateStr,
        count,
      },
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId: 'daily_digest' } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerAt,
    },
  });
}

export async function refreshDailyDigests(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;

  await cancelDailyDigestNotifications();

  const today = getTodayISO();
  const now = Date.now();

  for (let offset = 0; offset < DIGEST_DAYS_AHEAD; offset += 1) {
    const dateStr = addDaysToIso(today, offset);
    const count = await planRepo.countPendingPlansForDate(dateStr);
    if (count === 0) continue;

    const morningAt = buildDigestDateTime(dateStr, MORNING_HOUR, MORNING_MINUTE);
    if (morningAt.getTime() > now) {
      await scheduleDigest(dateStr, 'morning', count, morningAt);
    }

    const eveningAt = buildDigestDateTime(dateStr, EVENING_HOUR, EVENING_MINUTE);
    if (eveningAt.getTime() > now) {
      await scheduleDigest(dateStr, 'evening', count, eveningAt);
    }
  }
}
