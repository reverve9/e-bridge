import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { Theme, ThemeMode, PartyCode, ThemeContextValue } from './types';
import { createTheme, defaultTheme } from './themes';

// Context 생성
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Provider Props
interface ThemeProviderProps {
  children: ReactNode;
  partyCode: PartyCode;
  initialMode?: ThemeMode;
}

// Theme Provider 컴포넌트
export function ThemeProvider({ 
  children, 
  partyCode, 
  initialMode = 'classic' 
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  
  const theme = useMemo(() => {
    return createTheme(partyCode, mode);
  }, [partyCode, mode]);
  
  const value: ThemeContextValue = useMemo(() => ({
    theme,
    setThemeMode: setMode,
  }), [theme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// useTheme Hook
export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (!context) {
    // Context 없이 사용할 때 기본 테마 반환
    return defaultTheme;
  }
  return context.theme;
}

// useThemeContext Hook (모드 변경 포함)
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}

// 테마 없이 직접 사용할 수 있는 유틸리티
export { ThemeContext };
