import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useFonts } from 'expo-font';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useEffect, useState } from 'react';
import { ActivityIndicator, I18nManager, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppNavigation } from './src/navigation';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { initDatabase } from './src/data/db/client';
import { seedCategories } from './src/data/repositories/categoryRepository';
import { initI18n } from './src/i18n';
import { requestAppPermissions } from './src/permissions';
import {
  addNotificationResponseListener,
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
      } catch {
        // Notifications are unavailable in Expo Go.
      }

      if (cancelled) return;

      responseSub = await addNotificationResponseListener((planId, action) => {
        if (action === 'complete') completePlan(planId);
        else if (action.includes('snooze')) snoozePlan(planId, '15min');
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
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);

        await initDatabase();
        await seedCategories();
        await initI18n('ku');
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
