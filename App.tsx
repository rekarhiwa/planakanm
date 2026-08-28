import 'react-native-gesture-handler';
import 'react-native-reanimated';

import {
  NotoKufiArabic_400Regular,
  NotoKufiArabic_600SemiBold,
  NotoKufiArabic_700Bold,
  useFonts,
} from '@expo-google-fonts/noto-kufi-arabic';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useEffect, useState } from 'react';
import { ActivityIndicator, I18nManager, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppNavigation } from './src/app/navigation';
import { initDatabase } from './src/data/db/client';
import { seedCategories } from './src/data/repositories/categoryRepository';
import { initI18n } from './src/i18n';
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
    setupNotificationChannels();
    reconcileAllNotifications();

    const responseSub = addNotificationResponseListener((planId, action) => {
      if (action === 'complete') completePlan(planId);
      else if (action.includes('snooze')) snoozePlan(planId, '15min');
    });

    return () => responseSub.remove();
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
  const [fontsLoaded] = useFonts({
    NotoKufiArabic_400Regular,
    NotoKufiArabic_600SemiBold,
    NotoKufiArabic_700Bold,
  });

  useEffect(() => {
    async function bootstrap() {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);

      await initDatabase();
      await seedCategories();
      await initI18n('ku');
      await useSettingsStore.getState().loadSettings();
      await usePlanStore.getState().refreshAll();
      setReady(true);
    }
    bootstrap();
  }, []);

  if (!fontsLoaded || !ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const themeMode = useSettingsStore.getState().settings.theme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider initialMode={themeMode}>
          <BottomSheetModalProvider>
            <AppContent />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
