import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_ALARM_KEY = '@planakanm/pending-alarm-plan';

export async function queuePendingAlarm(planId: string): Promise<void> {
  await AsyncStorage.setItem(PENDING_ALARM_KEY, planId);
}

export async function consumePendingAlarm(): Promise<string | null> {
  const planId = await AsyncStorage.getItem(PENDING_ALARM_KEY);
  if (!planId) return null;
  await AsyncStorage.removeItem(PENDING_ALARM_KEY);
  return planId;
}
