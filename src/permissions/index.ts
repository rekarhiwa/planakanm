import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as IntentLauncher from 'expo-intent-launcher';
import { Linking, PermissionsAndroid, Platform } from 'react-native';

import i18n from '../i18n';
import { useDialogStore } from '../stores/dialogStore';

import { requestNotificationPermissions } from '../notifications/scheduler';

const PERMISSIONS_PROMPT_KEY = '@planakanm/permissions-prompted-v1';
const EXACT_ALARM_ACK_KEY = '@planakanm/perm-exact-alarm-ack';
const FULL_SCREEN_ACK_KEY = '@planakanm/perm-full-screen-ack';
const BATTERY_OPT_ACK_KEY = '@planakanm/perm-battery-ack';

export type PermissionKey = 'notifications' | 'exactAlarm' | 'fullScreen' | 'battery';

export interface PermissionStatus {
  notifications: boolean;
  exactAlarm: boolean;
  fullScreen: boolean;
  battery: boolean;
  isSamsung: boolean;
}

function getPackageName(): string {
  return Application.applicationId ?? 'com.planakanm.rekargroup';
}

export function isSamsungDevice(): boolean {
  if (Platform.OS !== 'android') return false;
  const manufacturer =
    (Platform.constants as { Manufacturer?: string; Brand?: string }).Manufacturer ??
    (Platform.constants as { Brand?: string }).Brand ??
    '';
  return manufacturer.toLowerCase().includes('samsung');
}

async function requestAndroidPostNotifications(): Promise<boolean> {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 33) {
    return true;
  }

  const alreadyGranted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  if (alreadyGranted) return true;

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    {
      title: i18n.t('settings.permissionNotifications'),
      message: i18n.t('settings.notificationRequiredMessage'),
      buttonPositive: i18n.t('common.ok'),
      buttonNegative: i18n.t('common.cancel'),
    },
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function openAndroidSettingsAction(action: string): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  const packageName = getPackageName();

  try {
    await IntentLauncher.startActivityAsync(action, {
      data: `package:${packageName}`,
    });
    return true;
  } catch {
    // Fall through to alternate intents.
  }

  try {
    await IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
      { data: `package:${packageName}` },
    );
    return true;
  } catch {
    try {
      await Linking.openURL(`package:${packageName}`);
      return true;
    } catch {
      return false;
    }
  }
}

async function openBatteryOptimizationSettings(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  const packageName = getPackageName();

  try {
    await IntentLauncher.startActivityAsync(
      'android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
      { data: `package:${packageName}` },
    );
    await AsyncStorage.setItem(BATTERY_OPT_ACK_KEY, 'true');
    return true;
  } catch {
    return openAndroidSettingsAction(
      IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
    );
  }
}

export async function getPermissionStatus(): Promise<PermissionStatus> {
  const { areNotificationsAvailable } = await import('../notifications/support');
  const isSamsung = isSamsungDevice();

  if (!areNotificationsAvailable()) {
    return {
      notifications: false,
      exactAlarm: false,
      fullScreen: false,
      battery: false,
      isSamsung,
    };
  }

  const { getPermissionsAsync } = await import('expo-notifications');
  const { status } = await getPermissionsAsync();
  const notifications = status === 'granted';

  if (Platform.OS !== 'android') {
    return {
      notifications,
      exactAlarm: true,
      fullScreen: true,
      battery: true,
      isSamsung,
    };
  }

  const [exactAck, fullScreenAck, batteryAck] = await Promise.all([
    AsyncStorage.getItem(EXACT_ALARM_ACK_KEY),
    AsyncStorage.getItem(FULL_SCREEN_ACK_KEY),
    AsyncStorage.getItem(BATTERY_OPT_ACK_KEY),
  ]);

  const apiLevel = Number(Platform.Version);

  return {
    notifications,
    exactAlarm: apiLevel < 31 || exactAck === 'true',
    fullScreen: apiLevel < 34 || fullScreenAck === 'true',
    battery: !isSamsung || batteryAck === 'true',
    isSamsung,
  };
}

export async function requestPermission(key: PermissionKey): Promise<boolean> {
  switch (key) {
    case 'notifications': {
      const androidGranted = await requestAndroidPostNotifications();
      const expoGranted = await requestNotificationPermissions();
      return androidGranted && expoGranted;
    }
    case 'exactAlarm':
      if (Platform.OS !== 'android' || Number(Platform.Version) < 31) return true;
      const exactOpened = await openAndroidSettingsAction(
        IntentLauncher.ActivityAction.REQUEST_SCHEDULE_EXACT_ALARM,
      );
      if (exactOpened) {
        await AsyncStorage.setItem(EXACT_ALARM_ACK_KEY, 'true');
      }
      return exactOpened;
    case 'fullScreen':
      if (Platform.OS !== 'android' || Number(Platform.Version) < 34) return true;
      const fullScreenOpened = await openAndroidSettingsAction(
        'android.settings.MANAGE_APP_USE_FULL_SCREEN_INTENT',
      );
      if (fullScreenOpened) {
        await AsyncStorage.setItem(FULL_SCREEN_ACK_KEY, 'true');
      }
      return fullScreenOpened;
    case 'battery':
      return openBatteryOptimizationSettings();
    default:
      return false;
  }
}

export async function requestAllAlarmPermissions(): Promise<void> {
  const notificationsGranted = await requestPermission('notifications');
  if (!notificationsGranted) {
    await useDialogStore.getState().showAlert({
      title: i18n.t('settings.notificationRequiredTitle'),
      message: i18n.t('settings.notificationRequiredMessage'),
      accent: 'warning',
    });
  }

  if (Platform.OS === 'android' && Number(Platform.Version) >= 31) {
    await requestPermission('exactAlarm');
  }

  if (isSamsungDevice()) {
    await requestPermission('battery');
  }
}

export async function requestAppPermissions(options?: { force?: boolean }): Promise<void> {
  if (!options?.force) {
    const prompted = await AsyncStorage.getItem(PERMISSIONS_PROMPT_KEY);
    if (prompted === 'true') return;
  }

  await requestAllAlarmPermissions();
  await AsyncStorage.setItem(PERMISSIONS_PROMPT_KEY, 'true');
}

export async function refreshPermissionAcknowledgements(): Promise<PermissionStatus> {
  return getPermissionStatus();
}
