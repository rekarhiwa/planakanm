import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontTextInput } from '../components/FontTextInput';
import { requestAppPermissions } from '../permissions';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';
import { radius, spacing, typography } from '../theme/colors';
import { rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';

const FEATURE_STEPS = [
  { titleKey: 'onboarding.step1Title', descKey: 'onboarding.step1Desc', icon: '📋' },
  { titleKey: 'onboarding.step2Title', descKey: 'onboarding.step2Desc', icon: '⏰' },
  { titleKey: 'onboarding.step3Title', descKey: 'onboarding.step3Desc', icon: '💤' },
];

export function OnboardingScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const onboardingComplete = useSettingsStore((s) => s.settings.onboardingComplete);
  const setShowOnboarding = useUIStore((s) => s.setShowOnboarding);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const rtl = rtlTextStyle();

  const totalSteps = onboardingComplete ? 1 : FEATURE_STEPS.length + 1;
  const isProfileStep = step === 0;
  const featureIndex = step - 1;
  const isLast = step === totalSteps - 1;

  const handleNext = async () => {
    if (isProfileStep) {
      if (!name.trim()) return;
      await updateSettings({ userName: name.trim() });
      if (onboardingComplete) {
        setShowOnboarding(false);
        return;
      }
      setStep(1);
      return;
    }

    if (isLast) {
      await requestAppPermissions({ force: true });
      await updateSettings({ onboardingComplete: true });
      setShowOnboarding(false);
      return;
    }

    setStep(step + 1);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {isProfileStep ? (
          <>
            <Text style={styles.icon}>👋</Text>
            <Text style={[styles.title, { color: colors.text }, rtl]}>{t('onboarding.profileTitle')}</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }, rtl]}>{t('onboarding.profileDesc')}</Text>
            <FontTextInput
              value={name}
              onChangeText={setName}
              placeholder={t('onboarding.namePlaceholder')}
              placeholderColor={colors.textSecondary}
              autoFocus
              style={[
                styles.nameInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
            />
          </>
        ) : (
          <>
            <Text style={styles.icon}>{FEATURE_STEPS[featureIndex].icon}</Text>
            <Text style={[styles.title, { color: colors.text }, rtl]}>
              {t(FEATURE_STEPS[featureIndex].titleKey)}
            </Text>
            <Text style={[styles.desc, { color: colors.textSecondary }, rtl]}>
              {t(FEATURE_STEPS[featureIndex].descKey)}
            </Text>
          </>
        )}

        <View style={styles.dots}>
          {Array.from({ length: totalSteps }, (_, i) => (
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
        onPress={() => {
          void handleNext();
        }}
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
            opacity: isProfileStep && !name.trim() ? 0.5 : 1,
          },
        ]}
        disabled={isProfileStep && !name.trim()}
      >
        <Text style={{ color: colors.fabText, ...typography.label }}>
          {isProfileStep && onboardingComplete
            ? t('common.save')
            : isLast
              ? t('onboarding.getStarted')
              : t('onboarding.next')}
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
  desc: { ...typography.body, textAlign: 'center', lineHeight: 24, paddingHorizontal: spacing.lg },
  nameInput: {
    width: '100%',
    marginTop: spacing.xl,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    fontSize: 18,
  },
  dots: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xxl },
  dot: { width: 8, height: 8, borderRadius: 4 },
  button: {
    padding: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
});
