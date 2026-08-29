import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AlarmIcon } from './AlarmIcon';
import {
  requestAllAlarmPermissions,
  requestPermission,
  type PermissionKey,
  type PermissionStatus,
} from '../permissions';
import { radius, spacing, typography } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

interface AlarmPermissionsCardProps {
  status: PermissionStatus;
  onRefresh: () => Promise<void>;
}

export function AlarmPermissionsCard({ status, onRefresh }: AlarmPermissionsCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleEnableAll = useCallback(async () => {
    await requestAllAlarmPermissions();
    await onRefresh();
  }, [onRefresh]);

  const handleEnableOne = useCallback(
    async (key: PermissionKey) => {
      await requestPermission(key);
      await onRefresh();
    },
    [onRefresh],
  );

  if (Platform.OS !== 'android') {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t('settings.alarmPermissionsTitle')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {status.notifications ? t('settings.permissionGranted') : t('settings.permissionNeeded')}
        </Text>
        {!status.notifications ? (
          <Pressable
            onPress={() => handleEnableOne('notifications')}
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.primaryBtnText, { color: colors.fabText }]}>
              {t('settings.enableNotifications')}
            </Text>
          </Pressable>
        ) : (
          <View style={[styles.successBox, { backgroundColor: colors.nowHighlight, borderColor: colors.success }]}>
            <Text style={[styles.successTitle, { color: colors.success }]}>✓ {t('settings.allPermissionsReady')}</Text>
            <Text style={[styles.successHint, { color: colors.textSecondary }]}>{t('settings.lockScreenHint')}</Text>
          </View>
        )}
      </View>
    );
  }

  const rows: Array<{ key: PermissionKey; label: string; granted: boolean }> = [
    {
      key: 'notifications',
      label: t('settings.permissionNotifications'),
      granted: status.notifications,
    },
    {
      key: 'exactAlarm',
      label: t('settings.permissionExactAlarm'),
      granted: status.exactAlarm,
    },
    {
      key: 'fullScreen',
      label: t('settings.permissionFullScreen'),
      granted: status.fullScreen,
    },
  ];

  if (status.isSamsung) {
    rows.push({
      key: 'battery',
      label: t('settings.permissionBattery'),
      granted: status.battery,
    });
  }

  const allGranted = rows.every((row) => row.granted);

  return (
    <View style={[styles.card, { backgroundColor: colors.nowHighlight, borderColor: colors.primary }]}>
      <AlarmIcon color={colors.primary} size={32} />
      <Text style={[styles.title, { color: colors.text }]}>{t('settings.alarmPermissionsTitle')}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {status.isSamsung ? t('settings.alarmPermissionsSamsungDesc') : t('settings.alarmPermissionsDesc')}
      </Text>

      {rows.map((row) => (
        <View
          key={row.key}
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.rowText}>
            <Text style={{ color: colors.text, ...typography.label }}>{row.label}</Text>
            <Text style={{ color: row.granted ? colors.success : colors.warning, ...typography.caption }}>
              {row.granted ? `✓ ${t('settings.permissionGranted')}` : t('settings.permissionNeeded')}
            </Text>
          </View>
          {!row.granted && (
            <Pressable
              onPress={() => handleEnableOne(row.key)}
              style={[styles.rowBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: colors.fabText, ...typography.caption }}>
                {t('settings.permissionEnable')}
              </Text>
            </Pressable>
          )}
        </View>
      ))}

      {!allGranted ? (
        <Pressable
          onPress={handleEnableAll}
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.primaryBtnText, { color: colors.fabText }]}>
            {t('settings.enableAllAlarmPermissions')}
          </Text>
        </Pressable>
      ) : (
        <View style={[styles.successBox, { backgroundColor: colors.surface, borderColor: colors.success }]}>
          <Text style={[styles.successTitle, { color: colors.success }]}>✓ {t('settings.allPermissionsReady')}</Text>
          <Text style={[styles.successHint, { color: colors.textSecondary }]}>{t('settings.lockScreenHint')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  title: {
    ...typography.title,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  primaryBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    ...typography.label,
    fontSize: 15,
  },
  successBox: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  successTitle: {
    ...typography.label,
    textAlign: 'center',
  },
  successHint: {
    ...typography.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
});
