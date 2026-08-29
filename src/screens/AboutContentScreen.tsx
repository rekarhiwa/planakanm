import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '../components/ScreenHeader';
import type { SettingsStackParamList } from '../navigation';
import { ABOUT_PAGE_I18N } from './about/aboutPages';
import { spacing, typography } from '../theme/colors';
import { rtlText } from '../theme/rtl';
import { useTheme } from '../theme/ThemeContext';

export function AboutContentScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const route = useRoute<RouteProp<SettingsStackParamList, 'AboutContent'>>();
  const page = ABOUT_PAGE_I18N[route.params.page];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader
        title={t(page.title)}
        backLabel={t('about.back')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.body, { color: colors.text }]}>{t(page.content)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  body: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 28,
    ...rtlText,
  },
});
