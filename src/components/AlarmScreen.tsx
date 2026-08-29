import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlarmIcon } from './AlarmIcon';
import type { Plan } from '../domain/entities/types';
import * as planRepo from '../data/repositories/planRepository';
import { usePlanStore } from '../stores/planStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';
import { radius, spacing, typography } from '../theme/colors';
import { FONT_FAMILY } from '../theme/fonts';
import { useTheme } from '../theme/ThemeContext';
import { formatTimeDisplay } from '../utils/dates';

const MONO_FONT = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

interface AlarmScreenProps {
  planId: string;
  onClose: () => void;
}

export function AlarmScreen({ planId, onClose }: AlarmScreenProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const timeFormat = useSettingsStore((s) => s.settings.timeFormat);
  const vibrationEnabled = useSettingsStore((s) => s.settings.vibrationEnabled);
  const completePlan = usePlanStore((s) => s.completePlan);
  const snoozePlan = usePlanStore((s) => s.snoozePlan);
  const openSnooze = useUIStore((s) => s.openSnooze);

  const [plan, setPlan] = useState<Plan | null>(null);
  const pulse = useRef(0);
  const [, setPulseTick] = useState(0);

  useEffect(() => {
    void planRepo.getPlanById(planId).then(setPlan);
  }, [planId]);

  useEffect(() => {
    if (!vibrationEnabled) return undefined;

    const pattern = [0, 400, 200, 400];
    Vibration.vibrate(pattern, false);

    const timer = setInterval(() => {
      pulse.current += 1;
      setPulseTick(pulse.current);
    }, 900);

    return () => {
      clearInterval(timer);
      Vibration.cancel();
    };
  }, [vibrationEnabled]);

  const timeLabel = useMemo(() => {
    if (!plan?.time) return null;
    const [hourPart, minutePart] = plan.time.split(':').map(Number);
    const display = formatTimeDisplay(hourPart, minutePart, timeFormat);
    return display.period ? `${display.main} ${display.period}` : display.main;
  }, [plan?.time, timeFormat]);

  const handleSnooze = useCallback(async () => {
    Vibration.cancel();
    await snoozePlan(planId, { kind: 'preset', key: '15min' });
    onClose();
  }, [onClose, planId, snoozePlan]);

  const handleComplete = useCallback(async () => {
    Vibration.cancel();
    await completePlan(planId);
    onClose();
  }, [completePlan, onClose, planId]);

  const handleCustomSnooze = useCallback(() => {
    Vibration.cancel();
    openSnooze(planId);
    onClose();
  }, [onClose, openSnooze, planId]);

  const handleDismiss = useCallback(() => {
    Vibration.cancel();
    onClose();
  }, [onClose]);

  return (
    <Modal visible animationType="fade" presentationStyle="fullScreen" statusBarTranslucent>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.glow} />

        <View style={styles.content}>
          <Text style={[styles.badge, { color: colors.primary }]}>{t('alarm.fullscreenBadge')}</Text>
          <AlarmIcon color={colors.primary} size={56} />
          {timeLabel && (
            <Text style={[styles.time, { color: colors.text }]}>{timeLabel}</Text>
          )}
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={3}>
            {plan?.title ?? t('common.loading')}
          </Text>
          {plan?.description ? (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
              {plan.description}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={handleSnooze}
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.primaryBtnText, { color: colors.fabText }]}>
              {t('alarm.snooze15')}
            </Text>
          </Pressable>

          <View style={styles.secondaryRow}>
            <Pressable
              onPress={handleComplete}
              style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.text }]}>{t('alarm.complete')}</Text>
            </Pressable>
            <Pressable
              onPress={handleCustomSnooze}
              style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.text }]}>{t('alarm.customSnooze')}</Text>
            </Pressable>
          </View>

          <Pressable onPress={handleDismiss} style={styles.dismissBtn}>
            <Text style={[styles.dismissText, { color: colors.textSecondary }]}>{t('alarm.dismiss')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  glow: {
    position: 'absolute',
    top: '18%',
    alignSelf: 'center',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#D4AF37',
    opacity: 0.08,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
  badge: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  time: {
    fontFamily: MONO_FONT,
    fontSize: 34,
    fontWeight: '600',
    letterSpacing: 1,
    lineHeight: 40,
  },
  title: {
    ...typography.display,
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 34,
    marginTop: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  actions: {
    gap: spacing.md,
  },
  primaryBtn: {
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  primaryBtnText: {
    ...typography.label,
    fontSize: 17,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryBtnText: {
    ...typography.label,
    fontSize: 14,
  },
  dismissBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dismissText: {
    ...typography.caption,
    fontSize: 14,
  },
});
