// 테마 모드
export type ThemeMode = 'classic' | 'dark';

// 정당 코드
export type PartyCode = 'dmj' | 'ppp' | 'ind';

// 테마 색상 정의
export interface ThemeColors {
  // 정당 브랜드 컬러
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryText: string;      // primary 배경 위 텍스트
  secondary: string;
  
  // 배경
  background: string;       // 페이지 배경
  cardBg: string;           // 카드 배경
  cardBgHover: string;      // 카드 호버
  cardBgAlt: string;        // 대체 카드 배경 (약간 더 어둡거나 밝은)
  
  // 텍스트
  textPrimary: string;      // 기본 텍스트
  textSecondary: string;    // 보조 텍스트
  textMuted: string;        // 비활성 텍스트
  textInverse: string;      // 반전 텍스트 (어두운 배경 위)
  
  // 테두리
  border: string;
  borderLight: string;
  
  // 상태
  success: string;
  error: string;
  warning: string;
  
  // 특수
  overlay: string;          // 모달 오버레이
  shadow: string;           // 그림자 색상
}

// 헤더 스타일 (정당별로 다름)
export interface HeaderStyle {
  background: string;
  textColor: string;
  iconBgColor: string;
}

// 전체 테마 설정
export interface Theme {
  mode: ThemeMode;
  party: PartyCode;
  partyName: string;
  colors: ThemeColors;
  header: HeaderStyle;
  isDark: boolean;
}

// 테마 컨텍스트 값
export interface ThemeContextValue {
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => void;
}
