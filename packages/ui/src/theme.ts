// 정당별 테마 시스템
// 현재: classic 모드만 (추후 colorful, dark 추가 예정)

export type PartyCode = 'dmj' | 'ppp' | 'ind';
export type ThemeMode = 'classic' | 'colorful' | 'dark';

export interface PartyTheme {
  primary: string;       // 메인 컬러
  primaryLight: string;  // 배경/호버용 (10% opacity 느낌)
  primaryDark: string;   // 강조/눌림
  primaryText: string;   // primary 배경 위 텍스트 색상
  secondary: string;     // 보조 컬러
  accent: string;        // 강조 포인트
}

export interface ThemeConfig {
  party: PartyCode;
  mode: ThemeMode;
  colors: PartyTheme;
  name: string;          // 정당명
}

// 정당별 클래식 테마 정의
const PARTY_THEMES: Record<PartyCode, Record<ThemeMode, PartyTheme>> = {
  // 더불어민주당
  dmj: {
    classic: {
      primary: '#004EA2',
      primaryLight: '#E8F0FA',
      primaryDark: '#003670',
      primaryText: '#FFFFFF',
      secondary: '#0073E6',
      accent: '#00A3FF',
    },
    colorful: {
      primary: '#0066CC',
      primaryLight: '#CCE5FF',
      primaryDark: '#004499',
      primaryText: '#FFFFFF',
      secondary: '#00AAFF',
      accent: '#66D4FF',
    },
    dark: {
      primary: '#4D9FFF',
      primaryLight: '#1A3A5C',
      primaryDark: '#003366',
      primaryText: '#FFFFFF',
      secondary: '#6BB8FF',
      accent: '#99D1FF',
    },
  },

  // 국민의힘 (공식 CI 기준)
  ppp: {
    classic: {
      primary: '#E61E2B',        // 주색상 빨강
      primaryLight: '#FDECEE',   // 연한 배경
      primaryDark: '#B8161F',    // 진한 빨강
      primaryText: '#FFFFFF',
      secondary: '#00B5E2',      // 보조색상 청록
      accent: '#004C7E',         // 진파랑 (강조)
    },
    colorful: {
      primary: '#E61E2B',
      primaryLight: '#EDB19D',   // 살구색 배경
      primaryDark: '#E5554F',    // 진코랄
      primaryText: '#FFFFFF',
      secondary: '#00B5E2',      // 청록
      accent: '#F18070',         // 코랄
    },
    dark: {
      primary: '#E5554F',        // 진코랄
      primaryLight: '#3D1A1D',
      primaryDark: '#990011',
      primaryText: '#FFFFFF',
      secondary: '#00B5E2',
      accent: '#BDE4F8',         // 연파랑
    },
  },

  // 무소속
  ind: {
    classic: {
      primary: '#6B7280',
      primaryLight: '#F3F4F6',
      primaryDark: '#4B5563',
      primaryText: '#FFFFFF',
      secondary: '#9CA3AF',
      accent: '#D1D5DB',
    },
    colorful: {
      primary: '#8B5CF6',
      primaryLight: '#EDE9FE',
      primaryDark: '#6D28D9',
      primaryText: '#FFFFFF',
      secondary: '#A78BFA',
      accent: '#C4B5FD',
    },
    dark: {
      primary: '#A1A1AA',
      primaryLight: '#27272A',
      primaryDark: '#52525B',
      primaryText: '#FFFFFF',
      secondary: '#D4D4D8',
      accent: '#E4E4E7',
    },
  },
};

// 정당 코드 → 정당명 매핑
const PARTY_NAMES: Record<PartyCode, string> = {
  dmj: '더불어민주당',
  ppp: '국민의힘',
  ind: '무소속',
};

// 정당명 → 정당 코드 매핑
const PARTY_CODE_MAP: Record<string, PartyCode> = {
  '더불어민주당': 'dmj',
  '국민의힘': 'ppp',
  '무소속': 'ind',
};

/**
 * 정당 코드로 테마 가져오기
 */
export function getTheme(partyCode: PartyCode, mode: ThemeMode = 'classic'): ThemeConfig {
  const colors = PARTY_THEMES[partyCode]?.[mode] || PARTY_THEMES.ind.classic;
  return {
    party: partyCode,
    mode,
    colors,
    name: PARTY_NAMES[partyCode] || '무소속',
  };
}

/**
 * 정당명으로 테마 가져오기
 */
export function getThemeByPartyName(partyName: string, mode: ThemeMode = 'classic'): ThemeConfig {
  const partyCode = PARTY_CODE_MAP[partyName] || 'ind';
  return getTheme(partyCode, mode);
}

/**
 * 정당 컬러만 빠르게 가져오기 (기존 getPartyColor 대체용)
 */
export function getPartyColors(partyCode: string, mode: ThemeMode = 'classic'): PartyTheme {
  const code = (partyCode as PartyCode) || 'ind';
  return PARTY_THEMES[code]?.[mode] || PARTY_THEMES.ind.classic;
}

/**
 * CSS 변수로 테마 적용 (선택적 사용)
 */
export function getThemeCSSVariables(theme: ThemeConfig): Record<string, string> {
  return {
    '--theme-primary': theme.colors.primary,
    '--theme-primary-light': theme.colors.primaryLight,
    '--theme-primary-dark': theme.colors.primaryDark,
    '--theme-primary-text': theme.colors.primaryText,
    '--theme-secondary': theme.colors.secondary,
    '--theme-accent': theme.colors.accent,
  };
}

export { PARTY_THEMES, PARTY_NAMES, PARTY_CODE_MAP };
