import { I18nManager } from 'react-native';

// Keep native shell RTL for Kurdish/Arabic. Do not toggle at runtime —
// changing forceRTL without a full native restart freezes the app.
I18nManager.allowRTL(true);
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
}
