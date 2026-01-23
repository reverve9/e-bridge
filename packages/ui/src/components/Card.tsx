import React, { ReactNode } from 'react';
import { useTheme } from '../ThemeContext';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
  onClick?: () => void;
}

// 기본 카드
export function Card({ 
  children, 
  className = '',
  padding = 'md',
  shadow = true,
  onClick,
}: CardProps) {
  const theme = useTheme();
  
  const paddingClass = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  }[padding];
  
  return (
    <div 
      className={`rounded-2xl ${paddingClass} ${shadow ? 'shadow-sm' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ 
        backgroundColor: theme.colors.cardBg,
        border: theme.isDark ? `1px solid ${theme.colors.border}` : 'none',
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// 섹션 카드 (타이틀 포함)
interface SectionCardProps {
  title: string;
  children: ReactNode;
  rightElement?: ReactNode;
  className?: string;
}

export function SectionCard({ 
  title, 
  children, 
  rightElement,
  className = '',
}: SectionCardProps) {
  const theme = useTheme();
  
  return (
    <section className={`px-4 mt-3 ${className}`}>
      <div 
        className="rounded-2xl shadow-sm"
        style={{ 
          backgroundColor: theme.colors.cardBg,
          border: theme.isDark ? `1px solid ${theme.colors.border}` : 'none',
        }}
      >
        {/* 타이틀 영역 */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h3 className="font-bold flex items-center gap-2">
            <span 
              className="w-1 h-5 rounded-full" 
              style={{ backgroundColor: theme.colors.primary }} 
            />
            <span style={{ color: theme.colors.primary }}>{title}</span>
          </h3>
          {rightElement}
        </div>
        {/* 콘텐츠 영역 */}
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </section>
  );
}

// 인라인 카드 (배경색 있는 영역)
interface InlineCardProps {
  children: ReactNode;
  variant?: 'default' | 'muted' | 'primary';
  className?: string;
}

export function InlineCard({ 
  children, 
  variant = 'default',
  className = '',
}: InlineCardProps) {
  const theme = useTheme();
  
  const getBackgroundColor = () => {
    switch (variant) {
      case 'muted':
        return theme.isDark ? theme.colors.border : '#F3F4F6';
      case 'primary':
        return theme.colors.primaryLight;
      default:
        return theme.colors.cardBg;
    }
  };
  
  return (
    <div 
      className={`rounded-xl ${className}`}
      style={{ backgroundColor: getBackgroundColor() }}
    >
      {children}
    </div>
  );
}
