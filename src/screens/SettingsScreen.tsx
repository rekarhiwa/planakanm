import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Application from 'expo-application';
import { AppState, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlarmPermissionsCard } from '../components/AlarmPermissionsCard';
import { CategoryManager } from '../components/CategoryManager';
import { Chip } from '../components/Chip';
import { exportPlans, importPlans } from '../data/exportImport';
import type { SettingsStackParamList } from '../navigation';
import { getPermissionStatus, type PermissionStatus } from '../permissions';
import { useDialogStore } from '../stores/dialogStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTheme } from '../theme/ThemeContext';
import type { ThemeMode } from '../theme/colors';
import { radius, spacing, typography } from '../theme/colors';
import { FONT_FAMILY } from '../theme/fonts';
import { rtlText } from '../theme/rtl';
import type { AppLanguage } from '../i18n';

export function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const settings = useSettingsStore((s) => s.settings);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    notifications: false,
    exactAlarm: false,
    fullScreen: false,
    battery: false,
    isSamsung: false,
  });
  const [profileName, setProfileName] = useState(settings.userName ?? '');

  const refreshPermissions = useCallback(async () => {
    setPermissionStatus(await getPermissionStatus());
  }, []);

  useEffect(() => {
    void refreshPermissions();
  }, [refreshPermissions]);

  useFocusEffect(
    useCallback(() => {
      void refreshPermissions();
    }, [refreshPermissions]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refreshPermissions();
      }
    });
    return () => sub.remove();
  }, [refreshPermissions]);

  useEffect(() => {
    setProfileName(settings.userName ?? '');
  }, [settings.userName]);

  const saveProfileName = async () => {
    const trimmed = profileName.trim();
    if (trimmed === (settings.userName ?? '')) return;
    await updateSettings({ userName: trimmed || undefined });
  };

  const handleExport = async () => {
    try {
      await exportPlans();
    } catch {
      await useDialogStore.getState().showAlert({
        title: t('settings.exportErrorTitle'),
        message: t('settings.exportErrorMessage'),
        accent: 'danger',
      });
    }
  };

  const handleImport = async () => {
    try {
      const count = await importPlans();
      await useDialogStore.getState().showAlert({
        title: t('settings.importSuccessTitle'),
        message: t('settings.importSuccessMessage', { count }),
        accent: 'default',
      });
    } catch {
      await useDialogStore.getState().showAlert({
        title: t('settings.importErrorTitle'),
        message: t('settings.importErrorMessage'),
        accent: 'danger',
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.text }]}>{t('settings.title')}</Text>

        <AlarmPermissionsCard status={permissionStatus} onRefresh={refreshPermissions} />

        <SettingSection title={t('settings.profile')} colors={colors}>
          <TextInput
            value={profileName}
            onChangeText={setProfileName}
            onBlur={() => {
              void saveProfileName();
            }}
            placeholder={t('onboarding.namePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.profileInput,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          />
        </SettingSection>

        <SettingSection title={t('categories.title')} colors={colors}>
          <CategoryManager />
        </SettingSection>

        <SettingSection title={t('settings.language')} colors={colors}>
          <View style={styles.chipRow}>
            {(['ku', 'ar', 'en'] as AppLanguage[]).map((lang) => (
              <Chip
                key={lang}
                label={lang === 'ku' ? 'کوردی' : lang === 'ar' ? 'العربية' : 'English'}
                selected={settings.language === lang}
                onPress={() => setLanguage(lang)}
              />
            ))}
          </View>
        </SettingSection>

        <SettingSection title={t('settings.theme')} colors={colors}>
          <View style={styles.chipRow}>
            {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
              <Chip
                key={m}
                label={t(`settings.theme${m.charAt(0).toUpperCase()}${m.slice(1)}`)}
                selected={mode === m}
                onPress={() => setMode(m)}
              />
            ))}
          </View>
        </SettingSection>

        <SettingSection title={t('settings.defaultReminder')} colors={colors}>
          <View style={styles.chipRow}>
            <Chip
              label={t('create.notification')}
              selected={settings.defaultReminderType === 'notification'}
              onPress={() => updateSettings({ defaultReminderType: 'notification' })}
            />
            <Chip
              label={t('create.fullscreenAlarm')}
              selected={settings.defaultReminderType === 'alarm'}
              onPress={() => updateSettings({ defaultReminderType: 'alarm' })}
            />
          </View>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            {t('settings.defaultReminderHint')}
          </Text>
        </SettingSection>

        <SettingSection title={t('settings.defaultSnooze')} colors={colors}>
          <View style={styles.chipRow}>
            {[5, 10, 15, 30].map((min) => (
              <Chip
                key={min}
                label={`${min} min`}
                selected={settings.defaultSnoozeMinutes === min}
                onPress={() => updateSettings({ defaultSnoozeMinutes: min })}
              />
            ))}
          </View>
        </SettingSection>

        <SettingSection title="" colors={colors}>
          <Pressable
            onPress={handleExport}
            style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
          >
            <Text style={{ color: colors.text, ...typography.label }}>{t('settings.export')}</Text>
          </Pressable>
          <Pressable
            onPress={handleImport}
            style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, marginTop: spacing.sm }]}
          >
            <Text style={{ color: colors.text, ...typography.label }}>{t('settings.import')}</Text>
          </Pressable>
        </SettingSection>

        <SettingSection title="" colors={colors}>
          <Pressable
            onPress={() => navigation.navigate('About')}
            style={[styles.aboutRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.aboutText}>
              <Text style={[styles.aboutTitle, { color: colors.text }]}>{t('about.title')}</Text>
              <Text style={[styles.aboutSubtitle, { color: colors.textSecondary }]}>
                {t('about.openHint')} · {t('about.versionLabel', {
                  version: Application.nativeApplicationVersion ?? '1.0.0',
                })}
              </Text>
            </View>
            <Text style={[styles.aboutChevron, { color: colors.textSecondary }]}>‹</Text>
          </Pressable>
        </SettingSection>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingSection({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: { text: string; textSecondary?: string };
}) {
  return (
    <View style={styles.section}>
      {title ? <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 100 },
  title: { ...typography.display, fontSize: 26, textAlign: 'right', marginBottom: spacing.lg },
  section: { marginBottom: spacing.xl },
  sectionTitle: { ...typography.label, textAlign: 'right', marginBottom: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-end' },
  hint: { ...typography.caption, textAlign: 'right', marginTop: spacing.sm, lineHeight: 18 },
  button: { padding: spacing.lg, borderRadius: radius.md, alignItems: 'center' },
  profileInput: {
    fontFamily: FONT_FAMILY,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    ...rtlText,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  aboutText: {
    flex: 1,
    gap: 2,
  },
  aboutTitle: {
    ...typography.label,
    fontSize: 16,
    textAlign: 'right',
  },
  aboutSubtitle: {
    ...typography.caption,
    textAlign: 'right',
    lineHeight: 18,
  },
  aboutChevron: {
    fontSize: 22,
    transform: [{ scaleX: -1 }],
  },
});
