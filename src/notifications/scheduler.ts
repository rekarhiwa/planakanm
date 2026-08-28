import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Plan } from '../domain/entities/types';
import * as planRepo from '../data/repositories/planRepository';
import { getScheduledDateTime } from '../utils/dates';

const MAX_SCHEDULED = 60;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotificationChannels() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('plan_reminders', {
      name: 'Plan Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
    await Notifications.setNotificationChannelAsync('plan_alarms', {
      name: 'Plan Alarms',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
    await Notifications.setNotificationChannelAsync('overdue', {
      name: 'Overdue Plans',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  await Notifications.setNotificationCategoryAsync('plan_actions', [
    { identifier: 'complete', buttonTitle: 'تەواو', options: { opensAppToForeground: true } },
    { identifier: 'snooze_15', buttonTitle: '١٥ خولەک', options: { opensAppToForeground: true } },
    { identifier: 'open', buttonTitle: 'کردنەوە', options: { opensAppToForeground: true } },
  ]);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function schedulePlanNotification(plan: Plan): Promise<string | null> {
  if (plan.status === 'completed' || plan.status === 'cancelled') return null;
  if (!plan.hasTime || !plan.time) return null;

  const scheduled = getScheduledDateTime(plan);
  if (!scheduled || scheduled.getTime() <= Date.now()) return null;

  const channelId =
    plan.reminderType === 'alarm' ? 'plan_alarms' : 'plan_reminders';

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `⏰ ${plan.title}`,
      body: plan.description ?? '',
      data: { planId: plan.id, type: 'reminder' },
      categoryIdentifier: 'plan_actions',
      sound: plan.reminderType === 'alarm' ? 'default' : undefined,
      ...(Platform.OS === 'android' ? { channelId } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: scheduled,
    },
  });

  await planRepo.setNotificationId(plan.id, notificationId);
  return notificationId;
}

export async function scheduleOverdueNotification(plan: Plan): Promise<string | null> {
  const scheduled = getScheduledDateTime(plan);
  if (!scheduled) return null;

  const overdueTime = new Date(scheduled.getTime() + 5 * 60 * 1000);
  if (overdueTime.getTime() <= Date.now()) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `⏰ کاتی «${plan.title}» تێپەڕی`,
      body: 'پلانەکەت دواکەوتووە',
      data: { planId: plan.id, type: 'overdue' },
      categoryIdentifier: 'plan_actions',
      ...(Platform.OS === 'android' ? { channelId: 'overdue' } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: overdueTime,
    },
  });
}

export async function cancelPlanNotifications(planId: string): Promise<void> {
  const plan = await planRepo.getPlanById(planId);
  if (plan?.notificationId) {
    await Notifications.cancelScheduledNotificationAsync(plan.notificationId);
  }
}

export async function reconcileAllNotifications(): Promise<void> {
  const allPlans = await planRepo.getAllActivePlans();
  const pending = allPlans.filter(
    (p) =>
      (p.status === 'pending' || p.status === 'snoozed') &&
      p.hasTime &&
      p.time,
  );

  const toSchedule = pending.slice(0, MAX_SCHEDULED);

  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const plan of toSchedule) {
    await schedulePlanNotification(plan);
  }
}

export function addNotificationResponseListener(
  handler: (planId: string, action: string) => void,
) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as {
      planId?: string;
    };
    const actionId = response.actionIdentifier;
    if (data.planId) {
      handler(data.planId, actionId);
    }
  });
}

export function addNotificationReceivedListener(
  handler: (planId: string, type: string) => void,
) {
  return Notifications.addNotificationReceivedListener((notification) => {
    const data = notification.request.content.data as {
      planId?: string;
      type?: string;
    };
    if (data.planId) {
      handler(data.planId, data.type ?? 'reminder');
    }
  });
}
