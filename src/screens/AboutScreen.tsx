import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Application from 'expo-application';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '../components/ScreenHeader';
import type { SettingsStackParamList } from '../navigation';
import { radius, spacing, typography } from '../theme/colors';
import { layoutAlignStart, ltrTextStyle, rtlTextStyle } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';

const appIcon = require('../../assets/icon.png');

export function AboutScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const version = Application.nativeApplicationVersion ?? '1.0.0';
  const rtl = rtlTextStyle();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader
        title={t('about.title')}
        backLabel={t('about.back')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, { alignItems: layoutAlignStart() }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Image source={appIcon} style={styles.icon} resizeMode="contain" />
          </View>
          <Text style={[styles.appName, { color: colors.text }, rtl]}>{t('app.name')}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }, rtl]}>
            {t('about.description')}
          </Text>
          <Text style={[styles.version, { color: colors.primary }, ltrTextStyle()]}>
            {t('about.versionLabel', { version })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 100,
    flexGrow: 1,
    justifyContent: 'center',
  },
  hero: {
    gap: spacing.md,
    width: '100%',
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: '100%',
  },
  description: {
    ...typography.body,
    lineHeight: 26,
    width: '100%',
  },
  version: {
    ...typography.caption,
    marginTop: spacing.sm,
    width: '100%',
  },
});
