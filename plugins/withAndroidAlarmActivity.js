const fs = require('fs');
const path = require('path');
const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

/**
 * Alarm notifications use high-priority channels only.
 * Full-screen intent is intentionally disabled so the alarm UI
 * appears after the user opens the app, not over the lock screen.
 */
function withAndroidAlarmActivity(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const permissions = manifest.manifest['uses-permission'] ?? [];
    const wakeLock = { $: { 'android:name': 'android.permission.WAKE_LOCK' } };
    const hasWakeLock = permissions.some(
      (item) => item.$?.['android:name'] === 'android.permission.WAKE_LOCK',
    );
    if (!hasWakeLock) {
      permissions.push(wakeLock);
      manifest.manifest['uses-permission'] = permissions;
    }

    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(manifest);
    mainActivity.$['android:launchMode'] = 'singleTop';
    return config;
  });
}

module.exports = withAndroidAlarmActivity;
