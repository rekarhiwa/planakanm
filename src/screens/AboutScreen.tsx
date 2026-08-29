import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Application from 'expo-application';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '../components/ScreenHeader';
import type { SettingsStackParamList } from '../navigation';
import { ABOUT_PAGE_I18N, ABOUT_PAGE_ORDER } from './about/aboutPages';
import { radius, spacing, typography } from '../theme/colors';
import { rtlText } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';

const appIcon = require('../../assets/icon.png');

export function AboutScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const version = Application.nativeApplicationVersion ?? '1.0.0';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader
        title={t('about.title')}
        backLabel={t('about.back')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <View style={[styles.iconWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Image source={appIcon} style={styles.icon} resizeMode="contain" />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>{t('app.name')}</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>{t('about.tagline')}</Text>
          <Text style={[styles.version, { color: colors.primary }]}>
            {t('about.versionLabel', { version })}
          </Text>
        </View>

        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {ABOUT_PAGE_ORDER.map((pageId, index) => {
            const page = ABOUT_PAGE_I18N[pageId];
            const isLast = index === ABOUT_PAGE_ORDER.length - 1;

            return (
              <Pressable
                key={pageId}
                onPress={() => navigation.navigate('AboutContent', { page: pageId })}
                style={({ pressed }) => [
                  styles.row,
                  !isLast && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
                  pressed && { backgroundColor: colors.surfaceElevated },
                ]}
              >
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>{t(page.title)}</Text>
                  <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                    {t(`about.subtitles.${pageId}`)}
                  </Text>
                </View>
                <Text style={[styles.chevron, { color: colors.textSecondary }]}>‹</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.footer, { color: colors.textSecondary }]}>{t('about.footer')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 100 },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
  },
  appName: {
    ...typography.display,
    fontSize: 24,
    ...rtlText,
  },
  tagline: {
    ...typography.caption,
    marginTop: spacing.xs,
    textAlign: 'center',
    ...rtlText,
  },
  version: {
    ...typography.label,
    marginTop: spacing.sm,
  },
  group: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    ...typography.label,
    fontSize: 16,
    ...rtlText,
  },
  rowSubtitle: {
    ...typography.caption,
    lineHeight: 18,
    ...rtlText,
  },
  chevron: {
    fontSize: 22,
    transform: [{ scaleX: -1 }],
  },
  footer: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 20,
    ...rtlText,
  },
});
