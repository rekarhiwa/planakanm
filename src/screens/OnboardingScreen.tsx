import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { requestAppPermissions } from '../permissions';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';
import { radius, spacing, typography } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const STEPS = [
  { titleKey: 'onboarding.step1Title', descKey: 'onboarding.step1Desc', icon: '📋' },
  { titleKey: 'onboarding.step2Title', descKey: 'onboarding.step2Desc', icon: '⏰' },
  { titleKey: 'onboarding.step3Title', descKey: 'onboarding.step3Desc', icon: '💤' },
];

export function OnboardingScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const setShowOnboarding = useUIStore((s) => s.setShowOnboarding);
  const [step, setStep] = useState(0);

  const isLast = step === STEPS.length - 1;

  const handleNext = async () => {
    if (isLast) {
      await requestAppPermissions({ force: true });
      await updateSettings({ onboardingComplete: true });
      setShowOnboarding(false);
    } else {
      setStep(step + 1);
    }
  };

  const current = STEPS[step];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{current.icon}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{t(current.titleKey)}</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>{t(current.descKey)}</Text>

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === step ? colors.primary : colors.border },
              ]}
            />
          ))}
        </View>
      </View>

      <Pressable
        onPress={handleNext}
        style={[styles.button, { backgroundColor: colors.primary }]}
      >
        <Text style={{ color: colors.fabText, ...typography.label }}>
          {isLast ? t('onboarding.getStarted') : '→'}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: spacing.xxl },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 64, marginBottom: spacing.xl },
  title: { ...typography.display, fontSize: 28, textAlign: 'center', marginBottom: spacing.lg },
  desc: { ...typography.body, textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xxl },
  dot: { width: 8, height: 8, borderRadius: 4 },
  button: {
    padding: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
});
