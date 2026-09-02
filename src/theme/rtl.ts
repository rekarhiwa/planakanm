import type { TextStyle, ViewStyle } from 'react-native';

import { isRtlLanguage, type AppLanguage } from '../i18n/languages';

let layoutLanguage: AppLanguage = 'ku';

export function setLayoutLanguage(language: AppLanguage) {
  layoutLanguage = language;
}

export function getIsRTL(): boolean {
  return isRtlLanguage(layoutLanguage);
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

/**
 * Row direction for manual RTL layouts.
 * React Native does NOT auto-flip flexDirection when forceRTL is on,
 * so RTL languages need row-reverse to put the first child on the right.
 */
export function layoutRow(): ViewStyle['flexDirection'] {
  return getIsRTL() ? 'row-reverse' : 'row';
}

export function layoutAlignEnd(): ViewStyle['alignItems'] {
  return getIsRTL() ? 'flex-start' : 'flex-end';
}

export function edgeStart(): 'left' | 'right' {
  return getIsRTL() ? 'right' : 'left';
}

export function edgeEnd(): 'left' | 'right' {
  return getIsRTL() ? 'left' : 'right';
}
