import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import { darkTheme, lightTheme, type ThemeColors, type ThemeMode } from './colors';

const THEME_STORAGE_KEY = '@planakanm/theme';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(
  mode: ThemeMode,
  systemScheme: string | null | undefined,
): ThemeColors {
  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  return isDark ? darkTheme : lightTheme;
}

export function ThemeProvider({
  children,
  initialMode,
}: {
  children: ReactNode;
  initialMode?: ThemeMode;
}) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(initialMode ?? 'system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (initialMode) {
      setIsReady(true);
      return;
    }
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState(stored);
        }
      })
      .finally(() => setIsReady(true));
  }, [initialMode]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const colors = resolveTheme(mode, systemScheme ?? 'light');
  const isDark = colors === darkTheme;

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, colors, isDark, setMode, toggleTheme }),
    [mode, colors, isDark, setMode, toggleTheme],
  );

  if (!isReady) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
