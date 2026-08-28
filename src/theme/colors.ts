export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryMuted: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  overdue: string;
  snoozed: string;
  nowHighlight: string;
  completed: string;
  fab: string;
  fabText: string;
  statusBar: 'light' | 'dark';
}

export const lightTheme: ThemeColors = {
  background: '#F8F6F2',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  primary: '#9A7B1A',
  primaryMuted: '#C9A227',
  text: '#1A1A1A',
  textSecondary: '#5C5C5C',
  border: '#E8E4DC',
  accent: '#B8860B',
  success: '#2E7D32',
  warning: '#F57C00',
  danger: '#C62828',
  overdue: '#D84315',
  snoozed: '#7B68EE',
  nowHighlight: '#FFF8E1',
  completed: '#E8F5E9',
  fab: '#9A7B1A',
  fabText: '#FFFFFF',
  statusBar: 'dark',
};

export const darkTheme: ThemeColors = {
  background: '#0A0A0A',
  surface: '#141414',
  surfaceElevated: '#1E1E1E',
  primary: '#D4AF37',
  primaryMuted: '#B8962E',
  text: '#F5F0E6',
  textSecondary: '#A89878',
  border: '#2A2418',
  accent: '#FFD700',
  success: '#66BB6A',
  warning: '#FFA726',
  danger: '#EF5350',
  overdue: '#FF7043',
  snoozed: '#9575CD',
  nowHighlight: '#1A1508',
  completed: '#1B2E1B',
  fab: '#D4AF37',
  fabText: '#0A0A0A',
  statusBar: 'light',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

import { FONT_FAMILY } from './fonts';

export const typography = {
  display: { fontFamily: FONT_FAMILY, fontSize: 32 },
  title: { fontFamily: FONT_FAMILY, fontSize: 20 },
  body: { fontFamily: FONT_FAMILY, fontSize: 16 },
  caption: { fontFamily: FONT_FAMILY, fontSize: 13 },
  label: { fontFamily: FONT_FAMILY, fontSize: 15 },
};

export const motion = {
  fast: 150,
  normal: 200,
  slow: 300,
};
