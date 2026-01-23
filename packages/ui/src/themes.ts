import { ThemeColors, HeaderStyle, Theme, ThemeMode, PartyCode } from './types';

// ========================================
// 클래식 테마 색상 (현재 하드코딩된 값 그대로)
// ========================================
const CLASSIC_COLORS: ThemeColors = {
  // 배경
  background: '#F5F5F5',      // bg-gray-50 대응
  cardBg: '#FFFFFF',          // bg-white
  cardBgHover: '#F9FAFB',     // hover:bg-gray-50
  cardBgAlt: '#F3F4F6',       // bg-gray-100
  
  // 텍스트 (gray 계열)
  textPrimary: '#111827',     // text-gray-900
  textSecondary: '#4B5563',   // text-gray-600
  textMuted: '#9CA3AF',       // text-gray-400
  textInverse: '#FFFFFF',
  
  // 테두리
  border: '#E5E7EB',          // border-gray-200
  borderLight: '#F3F4F6',     // border-gray-100
  
  // 상태
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  
  // 특수
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  // 정당 컬러 (정당별로 오버라이드)
  primary: '#6B7280',
  primaryLight: '#F3F4F6',
  primaryDark: '#4B5563',
  primaryText: '#FFFFFF',
  secondary: '#9CA3AF',
};

// ========================================
// 다크 테마 색상
// ========================================
const DARK_COLORS: ThemeColors = {
  // 배경
  background: '#0F172A',      // slate-900
  cardBg: '#1E293B',          // slate-800
  cardBgHover: '#334155',     // slate-700
  cardBgAlt: '#334155',       // slate-700
  
  // 텍스트
  textPrimary: '#F1F5F9',     // slate-100
  textSecondary: '#CBD5E1',   // slate-300 (더 밝게 수정)
  textMuted: '#94A3B8',       // slate-400
  textInverse: '#0F172A',
  
  // 테두리
  border: '#334155',          // slate-700
  borderLight: '#1E293B',     // slate-800
  
  // 상태
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',
  
  // 특수
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  
  // 정당 컬러 (정당별로 오버라이드)
  primary: '#94A3B8',
  primaryLight: '#334155',
  primaryDark: '#64748B',
  primaryText: '#FFFFFF',
  secondary: '#CBD5E1',
};

// ========================================
// 정당별 브랜드 컬러
// ========================================
interface PartyBrandColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  // 다크모드용
  darkPrimary: string;
  darkPrimaryLight: string;
  darkSecondary: string;
}

const PARTY_BRAND: Record<PartyCode, PartyBrandColors> = {
  // 더불어민주당
  dmj: {
    primary: '#004EA2',
    primaryLight: '#E8F0FA',
    primaryDark: '#003670',
    secondary: '#0073E6',
    darkPrimary: '#4D9FFF',
    darkPrimaryLight: '#1E3A5F',
    darkSecondary: '#6BB8FF',
  },
  // 국민의힘
  ppp: {
    primary: '#E61E2B',
    primaryLight: '#FDECEE',
    primaryDark: '#B8161F',
    secondary: '#00B5E2',
    darkPrimary: '#FF6B78',
    darkPrimaryLight: '#3D1A1D',
    darkSecondary: '#00B5E2',
  },
  // 무소속
  ind: {
    primary: '#6B7280',
    primaryLight: '#F3F4F6',
    primaryDark: '#4B5563',
    secondary: '#9CA3AF',
    darkPrimary: '#A1A1AA',
    darkPrimaryLight: '#27272A',
    darkSecondary: '#D4D4D8',
  },
};

// ========================================
// 정당별 헤더 스타일
// ========================================
const PARTY_HEADERS: Record<PartyCode, { classic: HeaderStyle; dark: HeaderStyle }> = {
  dmj: {
    classic: {
      background: 'linear-gradient(90deg, #00B050 0%, #00A0E0 50%, #004EA2 100%)',
      textColor: '#FFFFFF',
      iconBgColor: 'rgba(255, 255, 255, 0.2)',
    },
    dark: {
      background: 'linear-gradient(90deg, #006030 0%, #006090 50%, #003670 100%)',
      textColor: '#FFFFFF',
      iconBgColor: 'rgba(255, 255, 255, 0.15)',
    },
  },
  ppp: {
    classic: {
      background: '#E61E2B',
      textColor: '#FFFFFF',
      iconBgColor: 'rgba(255, 255, 255, 0.2)',
    },
    dark: {
      background: '#8B1118',
      textColor: '#FFFFFF',
      iconBgColor: 'rgba(255, 255, 255, 0.15)',
    },
  },
  ind: {
    classic: {
      background: '#6B7280',
      textColor: '#FFFFFF',
      iconBgColor: 'rgba(255, 255, 255, 0.2)',
    },
    dark: {
      background: '#374151',
      textColor: '#FFFFFF',
      iconBgColor: 'rgba(255, 255, 255, 0.15)',
    },
  },
};

// ========================================
// 정당명 매핑
// ========================================
const PARTY_NAMES: Record<PartyCode, string> = {
  dmj: '더불어민주당',
  ppp: '국민의힘',
  ind: '무소속',
};

const PARTY_CODE_FROM_NAME: Record<string, PartyCode> = {
  '더불어민주당': 'dmj',
  '국민의힘': 'ppp',
  '무소속': 'ind',
};

// ========================================
// 테마 생성 함수
// ========================================
export function createTheme(partyCode: PartyCode, mode: ThemeMode): Theme {
  const brand = PARTY_BRAND[partyCode];
  const isDark = mode === 'dark';
  
  // 기본 색상 선택
  const baseColors = isDark ? { ...DARK_COLORS } : { ...CLASSIC_COLORS };
  
  // 정당 브랜드 컬러 적용
  const colors: ThemeColors = {
    ...baseColors,
    primary: isDark ? brand.darkPrimary : brand.primary,
    primaryLight: isDark ? brand.darkPrimaryLight : brand.primaryLight,
    primaryDark: brand.primaryDark,
    primaryText: '#FFFFFF',
    secondary: isDark ? brand.darkSecondary : brand.secondary,
  };
  
  // 헤더 스타일
  const header = PARTY_HEADERS[partyCode][mode];
  
  return {
    mode,
    party: partyCode,
    partyName: PARTY_NAMES[partyCode],
    colors,
    header,
    isDark,
  };
}

// ========================================
// 유틸리티 함수
// ========================================

// 정당명으로 테마 생성
export function createThemeByPartyName(partyName: string, mode: ThemeMode): Theme {
  const partyCode = PARTY_CODE_FROM_NAME[partyName] || 'ind';
  return createTheme(partyCode, mode);
}

// 정당 코드 가져오기
export function getPartyCode(partyName: string): PartyCode {
  return PARTY_CODE_FROM_NAME[partyName] || 'ind';
}

// 정당명 가져오기
export function getPartyName(partyCode: PartyCode): string {
  return PARTY_NAMES[partyCode];
}

// 기본 테마 (무소속 클래식)
export const defaultTheme = createTheme('ind', 'classic');

export { PARTY_BRAND, PARTY_NAMES, PARTY_CODE_FROM_NAME };
