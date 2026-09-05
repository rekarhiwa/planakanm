/**
 * Central RTL/LTR layout helpers.
 *
 * Source of truth = app language (not I18nManager alone).
 * Native forceRTL is set once at bootstrap for Kurdish (primary).
 * English uses style mirroring when the native shell stays RTL —
 * we never toggle forceRTL at runtime (that freezes release builds).
 */
import { I18nManager, type FlexAlignType, type TextStyle, type ViewStyle } from 'react-native';

import { isRtlLanguage, type AppLanguage } from '../i18n/languages';

let layoutLanguage: AppLanguage = 'ku';

export function setLayoutLanguage(language: AppLanguage) {
  layoutLanguage = language;
}

export function getLayoutLanguage(): AppLanguage {
  return layoutLanguage;
}

/** Desired reading direction from the selected app language. */
export function getIsRTL(): boolean {
  return isRtlLanguage(layoutLanguage);
}

/**
 * True when Yoga's native direction disagrees with the desired language direction.
 * In that case we mirror row/align helpers instead of calling forceRTL again.
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

/** LTR island for numbers, times, phones, URLs, codes. */
export function ltrTextStyle(): TextStyle {
  return {
    textAlign: 'left',
    writingDirection: 'ltr',
  };
}

/** @deprecated Use rtlTextStyle() so direction tracks language changes. */
export const rtlText: TextStyle = {
  textAlign: 'right',
  writingDirection: 'rtl',
};

/**
 * Main-axis row that starts at the reading-start edge.
 * Prefer this over hardcoding flexDirection:'row' for icon+text rows.
 */
export function layoutRow(): ViewStyle['flexDirection'] {
  return needsLayoutMirror() ? 'row-reverse' : 'row';
}

/**
 * Align children toward reading-start on the cross axis of a column
 * (right in Kurdish, left in English).
 */
export function layoutAlignStart(): FlexAlignType {
  return needsLayoutMirror() ? 'flex-end' : 'flex-start';
}

/**
 * Align children toward reading-end on the cross axis of a column.
 * @deprecated Prefer layoutAlignStart for reading-start alignment.
 */
export function layoutAlignEnd(): ViewStyle['alignItems'] {
  return layoutAlignStart();
}

export function edgeStart(): 'left' | 'right' {
  return getIsRTL() ? 'right' : 'left';
}

export function edgeEnd(): 'left' | 'right' {
  return getIsRTL() ? 'left' : 'right';
}

/** Absolute position pinned to reading-start. */
export function insetStart(value: number): ViewStyle {
  return getIsRTL() ? { right: value } : { left: value };
}

/** Absolute position pinned to reading-end. */
export function insetEnd(value: number): ViewStyle {
  return getIsRTL() ? { left: value } : { right: value };
}

/** Directional back chevron glyph (← / →). */
export function backChevron(): string {
  return getIsRTL() ? '→' : '←';
}

/** Directional forward chevron glyph. */
export function forwardChevron(): string {
  return getIsRTL() ? '←' : '→';
}

/** Root direction style for form/page wrappers. */
export function contentDirectionStyle(): ViewStyle {
  return { direction: getIsRTL() ? 'rtl' : 'ltr' };
}
