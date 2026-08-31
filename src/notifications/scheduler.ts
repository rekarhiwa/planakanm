import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import type { Plan } from '../domain/entities/types';
import * as planRepo from '../data/repositories/planRepository';
import { getScheduledDateTime } from '../utils/dates';
import { areNotificationsAvailable } from './support';

type NotificationsModule = typeof import('expo-notifications');

const MAX_SCHEDULED = 60;
const HANDLED_NOTIFICATION_KEY = '@planakanm/handled-notification-response';
const noopSubscription = { remove: () => {} };

let notificationsModule: NotificationsModule | null = null;

export async function loadNotifications(): Promise<NotificationsModule | null> {
  if (!areNotificationsAvailable()) return null;
  if (notificationsModule) return notificationsModule;

  try {
    notificationsModule = await import('expo-notifications');
    const Notifications = notificationsModule;
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    return notificationsModule;
  } catch {
    return null;
  }
}

export async function initNotifications(): Promise<boolean> {
  return (await loadNotifications()) !== null;
}

export async function setupNotificationChannels() {
  const Notifications = await loadNotifications();
  if (!Notifications) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('plan_reminders', {
      name: 'Plan Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
    await Notifications.setNotificationChannelAsync('plan_alarms', {
      name: 'Plan Alarms',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 500, 250, 500, 250, 500],
      bypassDnd: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      enableVibrate: true,
      enableLights: true,
      lightColor: '#D4AF37',
    });
    await Notifications.setNotificationChannelAsync('overdue', {
      name: 'Overdue Plans',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
    await Notifications.setNotificationChannelAsync('daily_digest', {
      name: 'Daily Summary',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  await Notifications.setNotificationCategoryAsync('plan_actions', [
    { identifier: 'complete', buttonTitle: 'تەواو', options: { opensAppToForeground: true } },
    { identifier: 'snooze_15', buttonTitle: '١٥ خولەک', options: { opensAppToForeground: false } },
    { identifier: 'open', buttonTitle: 'کردنەوە', options: { opensAppToForeground: true } },
  ]);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = await loadNotifications();
  if (!Notifications) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });
  return status === 'granted';
}

export async function dismissPlanNotifications(planId: string): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;

  const plan = await planRepo.getPlanById(planId);

  if (plan?.notificationId) {
    try {
      await Notifications.dismissNotificationAsync(plan.notificationId);
    } catch {
      // Already dismissed.
    }
    try {
      await Notifications.cancelScheduledNotificationAsync(plan.notificationId);
    } catch {
      // Already cancelled.
    }
  }

  try {
    const presented = await Notifications.getPresentedNotificationsAsync();
    for (const notification of presented) {
      const data = notification.request.content.data as { planId?: string };
      if (data.planId === planId) {
        await Notifications.dismissNotificationAsync(notification.request.identifier);
      }
    }
  } catch {
    // Not supported on this platform.
  }

  await planRepo.clearNotificationId(planId);
}

export async function schedulePlanNotification(plan: Plan): Promise<string | null> {
  const Notifications = await loadNotifications();
  if (!Notifications) return null;
  if (plan.status === 'completed' || plan.status === 'cancelled') return null;
  if (!plan.hasTime || !plan.time) return null;

  const scheduled = getScheduledDateTime(plan);
  if (!scheduled || scheduled.getTime() <= Date.now()) return null;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: plan.title,
      body: plan.description ?? 'کاتی پلانەکەت گەیشت',
      data: {
        planId: plan.id,
        type: 'reminder',
        reminderType: 'notification',
      },
      categoryIdentifier: 'plan_actions',
      sound: 'default',
      ...(Platform.OS === 'android'
        ? {
            channelId: 'plan_reminders',
            autoDismiss: true,
          }
        : {}),
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
  const Notifications = await loadNotifications();
  if (!Notifications) return null;

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
  await dismissPlanNotifications(planId);
}

async function cancelAllPlanScheduledNotifications(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const request of scheduled) {
    const data = request.content.data as { type?: string; planId?: string };
    if (data?.planId || data?.type === 'reminder' || data?.type === 'overdue') {
      await Notifications.cancelScheduledNotificationAsync(request.identifier);
    }
  }
}

export async function reconcileAllNotifications(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;

  const allPlans = await planRepo.getAllActivePlans();
  const pending = allPlans.filter(
    (p) =>
      (p.status === 'pending' || p.status === 'snoozed') &&
      p.hasTime &&
      p.time,
  );

  const toSchedule = pending.slice(0, MAX_SCHEDULED);

  await cancelAllPlanScheduledNotifications();

  for (const plan of toSchedule) {
    await schedulePlanNotification(plan);
  }

  const { refreshDailyDigests } = await import('./dailyDigest');
  await refreshDailyDigests();
}

export async function clearLastNotificationResponse(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications?.clearLastNotificationResponseAsync) return;
  await Notifications.clearLastNotificationResponseAsync();
}

export async function consumePendingNotificationLaunch(): Promise<string | null> {
  const Notifications = await loadNotifications();
  if (!Notifications) return null;

  const response = await Notifications.getLastNotificationResponseAsync();
  if (!response) return null;

  const data = response.notification.request.content.data as {
    planId?: string;
    type?: string;
  };

  if (!data.planId || data.type === 'daily_digest') {
    return null;
  }

  const responseKey = `${response.notification.request.identifier}:${response.actionIdentifier}`;
  const handled = await AsyncStorage.getItem(HANDLED_NOTIFICATION_KEY);
  if (handled === responseKey) {
    return null;
  }

  await AsyncStorage.setItem(HANDLED_NOTIFICATION_KEY, responseKey);

  const actionId = response.actionIdentifier;
  if (actionId === 'complete' || actionId === 'snooze_15') {
    return null;
  }

  return data.planId;
}

/** @deprecated Use consumePendingNotificationLaunch */
export const consumePendingAlarmLaunch = consumePendingNotificationLaunch;

export async function addNotificationResponseListener(
  handler: (planId: string, action: string) => void,
) {
  const Notifications = await loadNotifications();
  if (!Notifications) return noopSubscription;

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
