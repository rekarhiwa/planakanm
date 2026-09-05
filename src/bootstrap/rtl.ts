import { I18nManager } from 'react-native';

/**
 * Native RTL shell for the primary language (Kurdish).
 * Never call forceRTL again at runtime — that freezes release APKs.
 * English LTR is handled by theme/rtl.ts layout mirroring + text styles.
 */
I18nManager.allowRTL(true);
I18nManager.swapLeftAndRightInRTL(false);
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
}
