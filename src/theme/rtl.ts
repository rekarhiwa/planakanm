import { I18nManager, type TextStyle, type ViewStyle } from 'react-native';

export function getIsRTL(): boolean {
  return I18nManager.isRTL;
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

export const textAlignStart: TextStyle['textAlign'] = getIsRTL() ? 'right' : 'left';
export const textAlignEnd: TextStyle['textAlign'] = getIsRTL() ? 'left' : 'right';
export const writingDirection: TextStyle['writingDirection'] = getIsRTL() ? 'rtl' : 'ltr';
export const rowDirection: ViewStyle['flexDirection'] = getIsRTL() ? 'row-reverse' : 'row';
export const alignItemsStart: ViewStyle['alignItems'] = getIsRTL() ? 'flex-end' : 'flex-start';
export const alignItemsEnd: ViewStyle['alignItems'] = getIsRTL() ? 'flex-start' : 'flex-end';

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
