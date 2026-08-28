import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { NavigationContainer, Theme as NavigationTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { CalendarScreen } from '../screens/CalendarScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PlanDetailScreen } from '../screens/PlanDetailScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';
import { FONT_FAMILY } from '../theme/fonts';
import { useTheme } from '../theme/ThemeContext';

export type RootStackParamList = {
  Main: undefined;
  PlanDetail: { planId: string };
  Search: undefined;
  Onboarding: undefined;
};

export type TabParamList = {
  Home: undefined;
  Calendar: undefined;
  Stats: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<string, string> = {
  Home: '🏠',
  Calendar: '📅',
  Stats: '📊',
  Settings: '⚙️',
};

function TabIcon({ label, focused, color }: { label: string; focused: boolean; color: string }) {
  return <Text style={{ fontSize: focused ? 22 : 20, color }}>{TAB_ICONS[label] ?? '•'}</Text>;
}

function MainTabs() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      height: 60,
      paddingBottom: 8,
    }),
    [colors.surface, colors.border],
  );

  const tabBarLabelStyle = useMemo(
    () => ({ fontFamily: FONT_FAMILY, fontSize: 12 }),
    [],
  );

  const screenOptions = useCallback(
    ({ route }: { route: { name: keyof TabParamList } }): BottomTabNavigationOptions => ({
      headerShown: false,
      tabBarStyle,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarLabelStyle,
      tabBarIcon: ({ focused, color }) => (
        <TabIcon label={route.name} focused={focused} color={color} />
      ),
      tabBarLabel: t(`tabs.${route.name.toLowerCase()}`),
    }),
    [tabBarStyle, tabBarLabelStyle, colors.primary, colors.textSecondary, t],
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigation() {
  const { colors, isDark } = useTheme();
  const onboardingComplete = useSettingsStore((s) => s.settings.onboardingComplete);
  const showOnboarding = useUIStore((s) => s.showOnboarding);

  const needsOnboarding = !onboardingComplete || showOnboarding;

  const navigationTheme = useMemo<NavigationTheme>(
    () => ({
      dark: isDark,
      colors: {
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.primary,
      },
      fonts: {
        regular: { fontFamily: FONT_FAMILY, fontWeight: '400' },
        medium: { fontFamily: FONT_FAMILY, fontWeight: '400' },
        bold: { fontFamily: FONT_FAMILY, fontWeight: '400' },
        heavy: { fontFamily: FONT_FAMILY, fontWeight: '400' },
      },
    }),
    [colors, isDark],
  );

  const stackScreenOptions = useMemo<NativeStackNavigationOptions>(
    () => ({
      headerShown: false,
      contentStyle: { backgroundColor: colors.background },
    }),
    [colors.background],
  );

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={stackScreenOptions}>
        {needsOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="PlanDetail"
              component={PlanDetailScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
