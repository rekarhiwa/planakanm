import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';

import { requestNotificationPermissions } from '../notifications/scheduler';

const PERMISSIONS_PROMPT_KEY = '@planakanm/permissions-prompted-v1';

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
      title: 'مۆڵەتی ئاگاداری',
      message: 'پلانەکانم پێویستی بە ئاگاداری هەیە بۆ بیرهێنانی پلانەکانت.',
      buttonPositive: 'ڕازیم',
      buttonNegative: 'ڕەت',
    },
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function promptExactAlarmPermission(): Promise<void> {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 31) {
    return;
  }

  await new Promise<void>((resolve) => {
    Alert.alert(
      'مۆڵەتی ئەلارم',
      'بۆ ئەلارمی ڕاستەوخۆ لەسەر شاشە، لە ڕێکخستنەکاندا مۆڵەتی «Alarms & reminders» چالاک بکە.',
      [
        { text: 'دواتر', style: 'cancel', onPress: () => resolve() },
        {
          text: 'کردنەوەی ڕێکخستن',
          onPress: () => {
            void Linking.openSettings();
            resolve();
          },
        },
      ],
    );
  });
}

export async function requestAppPermissions(options?: { force?: boolean }): Promise<void> {
  if (!options?.force) {
    const prompted = await AsyncStorage.getItem(PERMISSIONS_PROMPT_KEY);
    if (prompted === 'true') return;
  }

  await requestAndroidPostNotifications();
  await requestNotificationPermissions();
  await promptExactAlarmPermission();

  await AsyncStorage.setItem(PERMISSIONS_PROMPT_KEY, 'true');
}
