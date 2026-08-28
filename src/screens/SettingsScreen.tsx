import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '../components/Chip';
import { exportPlans, importPlans } from '../data/exportImport';
import { requestAppPermissions } from '../permissions';
import { useSettingsStore } from '../stores/settingsStore';
import { useTheme } from '../theme/ThemeContext';
import type { ThemeMode } from '../theme/colors';
import { radius, spacing, typography } from '../theme/colors';
import type { AppLanguage } from '../i18n';

export function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const { t } = useTranslation();
  const settings = useSettingsStore((s) => s.settings);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const handleExport = async () => {
    try {
      await exportPlans();
    } catch {
      Alert.alert('Error', 'Export failed');
    }
  };

  const handleImport = async () => {
    try {
      const count = await importPlans();
      Alert.alert('OK', `${count} plans imported`);
    } catch {
      Alert.alert('Error', 'Import failed');
    }
  };

  const handleNotifications = async () => {
    await requestAppPermissions({ force: true });
    await updateSettings({ notificationsEnabled: true });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.text }]}>{t('settings.title')}</Text>

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

        <SettingSection title={t('settings.notifications')} colors={colors}>
          <Pressable
            onPress={handleNotifications}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <Text style={{ color: colors.fabText, ...typography.label }}>
              {t('onboarding.allowNotifications')}
            </Text>
          </Pressable>
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

        <Text style={[styles.version, { color: colors.textSecondary }]}>
          {t('settings.about')} — {t('settings.version')} 1.0.0
        </Text>
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
  colors: { text: string };
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
  title: { ...typography.display, fontSize: 26, textAlign: 'right', marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl },
  sectionTitle: { ...typography.label, textAlign: 'right', marginBottom: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-end' },
  button: { padding: spacing.lg, borderRadius: radius.md, alignItems: 'center' },
  version: { ...typography.caption, textAlign: 'center', marginTop: spacing.xl },
});
