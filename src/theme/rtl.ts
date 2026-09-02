import { I18nManager, type TextStyle, type ViewStyle } from 'react-native';

import { isRtlLanguage, type AppLanguage } from '../i18n/languages';

let layoutLanguage: AppLanguage = 'ku';

export function setLayoutLanguage(language: AppLanguage) {
  layoutLanguage = language;
}

/** Desired reading direction from the selected app language. */
export function getIsRTL(): boolean {
  return isRtlLanguage(layoutLanguage);
}

/**
 * Native I18nManager may stay LTR even when we want RTL (forceRTL needs a full
 * restart). Mirror flex rows/alignment when language and native disagree.
 */
function needsLayoutMirror(): boolean {
  return getIsRTL() !== I18nManager.isRTL;
}

export function rtlTextStyle(): TextStyle {
  const rtl = getIsRTL();
  return {
    textAlign: rtl ? 'right' : 'left',
    writingDirection: rtl ? 'rtl' : 'ltr',
  };
}

/** @deprecated Use rtlTextStyle() for runtime-correct direction. */
export const rtlText: TextStyle = rtlTextStyle();

export function layoutRow(): ViewStyle['flexDirection'] {
  return needsLayoutMirror() ? 'row-reverse' : 'row';
}

/** Align children toward the reading-start edge (right in RTL languages). */
export function layoutAlignEnd(): ViewStyle['alignItems'] {
  return needsLayoutMirror() ? 'flex-end' : 'flex-start';
}

export function edgeStart(): 'left' | 'right' {
  return getIsRTL() ? 'right' : 'left';
}

export function edgeEnd(): 'left' | 'right' {
  return getIsRTL() ? 'left' : 'right';
}
