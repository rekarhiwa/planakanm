import { I18nManager, type TextStyle, type ViewStyle } from 'react-native';

export const isRTL = I18nManager.isRTL;

/** Logical start edge for Kurdish/Arabic (right) or LTR (left). */
export const textAlignStart: TextStyle['textAlign'] = isRTL ? 'right' : 'left';

/** Logical end edge alignment. */
export const textAlignEnd: TextStyle['textAlign'] = isRTL ? 'left' : 'right';

export const writingDirection: TextStyle['writingDirection'] = isRTL ? 'rtl' : 'ltr';

export const rtlText: TextStyle = {
  textAlign: textAlignStart,
  writingDirection,
};

export const rowDirection: ViewStyle['flexDirection'] = isRTL ? 'row-reverse' : 'row';

export const alignItemsStart: ViewStyle['alignItems'] = isRTL ? 'flex-end' : 'flex-start';

export const alignItemsEnd: ViewStyle['alignItems'] = isRTL ? 'flex-start' : 'flex-end';
