import Constants, { ExecutionEnvironment } from 'expo-constants';

export function areNotificationsAvailable(): boolean {
  return Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
}
