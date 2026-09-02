import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useFonts } from 'expo-font';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppNavigation } from './src/navigation';
import { ConfirmDialog } from './src/components/ConfirmDialog';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { initDatabase } from './src/data/db/client';
import { navigateToPlanDetail } from './src/navigation/navigationRef';
import { requestAppPermissions } from './src/permissions';
import {
  addNotificationResponseListener,
  clearLastNotificationResponse,
  consumePendingNotificationLaunch,
  dismissPlanNotifications,
  reconcileAllNotifications,
  setupNotificationChannels,
} from './src/notifications/scheduler';
import { usePlanStore } from './src/stores/planStore';
import { useSettingsStore } from './src/stores/settingsStore';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function AppContent() {
  const { colors } = useTheme();
  const completePlan = usePlanStore((s) => s.completePlan);
  const snoozePlan = usePlanStore((s) => s.snoozePlan);

  useEffect(() => {
    let responseSub: { remove: () => void } = { remove: () => {} };
    let cancelled = false;

    void (async () => {
      try {
        await setupNotificationChannels();
        await reconcileAllNotifications();

        const pendingPlanId = await consumePendingNotificationLaunch();
        if (pendingPlanId) {
          navigateToPlanDetail(pendingPlanId);
        }
      } catch {
        // Notifications are unavailable in Expo Go.
      }

      if (cancelled) return;

      responseSub = await addNotificationResponseListener(async (planId, action) => {
        if (action === 'complete') {
          await dismissPlanNotifications(planId);
          await completePlan(planId);
        } else if (action.includes('snooze')) {
          await dismissPlanNotifications(planId);
          await snoozePlan(planId, { kind: 'preset', key: '15min' });
        } else {
          navigateToPlanDetail(planId);
        }
        await clearLastNotificationResponse();
      });
    })();

    return () => {
      cancelled = true;
      responseSub.remove();
    };
  }, [completePlan, snoozePlan]);

  return (
    <>
      <StatusBar style={colors.statusBar} />
      <AppNavigation />
      <ConfirmDialog />
    </>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [fontsLoaded, fontError] = useFonts({
    Rabar: require('./assets/fonts/Rabar_022.ttf'),
  });

  useEffect(() => {
    async function bootstrap() {
      try {
        await initDatabase();
        await useSettingsStore.getState().loadSettings();
        await usePlanStore.getState().refreshAll();
      } catch (error) {
        setBootError(error instanceof Error ? error.message : 'Failed to start app');
      } finally {
        setReady(true);
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if (!ready || bootError) return;
    const timer = setTimeout(() => {
      void requestAppPermissions();
    }, 800);
    return () => clearTimeout(timer);
  }, [ready, bootError]);

  if (fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0A0A0A' }}>
        <Text style={{ color: '#F5F0E6', textAlign: 'center' }}>{fontError.message}</Text>
      </View>
    );
  }

  if (!fontsLoaded || !ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  if (bootError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0A0A0A' }}>
        <Text style={{ color: '#F5F0E6', textAlign: 'center' }}>{bootError}</Text>
      </View>
    );
  }

  const themeMode = useSettingsStore.getState().settings.theme;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider initialMode={themeMode}>
            <BottomSheetModalProvider>
              <AppContent />
            </BottomSheetModalProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
