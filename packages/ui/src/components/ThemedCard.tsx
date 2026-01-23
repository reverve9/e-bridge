import React from 'react';
import { PartyTheme } from '../theme';

interface ThemedCardProps {
  theme: PartyTheme;
  variant?: 'default' | 'bordered' | 'elevated' | 'highlighted';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ThemedCard({
  theme,
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  onClick,
}: ThemedCardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: '#FFFFFF',
        };
      case 'bordered':
        return {
          backgroundColor: '#FFFFFF',
          border: `1px solid ${theme.primaryLight}`,
        };
      case 'elevated':
        return {
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        };
      case 'highlighted':
        return {
          backgroundColor: theme.primaryLight,
          borderLeft: `4px solid ${theme.primary}`,
        };
      default:
        return {};
    }
  };

  return (
    <div
      className={`rounded-2xl ${paddings[padding]} ${onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''} ${className}`}
      style={getVariantStyles()}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// 카드 헤더 컴포넌트
interface ThemedCardHeaderProps {
  theme: PartyTheme;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  className?: string;
}

export function ThemedCardHeader({
  theme,
  title,
  subtitle,
  rightElement,
  className = '',
}: ThemedCardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <div className="flex items-center gap-2">
        <span
          className="w-1 h-5 rounded-full"
          style={{ backgroundColor: theme.primary }}
        />
        <div>
          <h3 className="font-bold" style={{ color: theme.primary }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      {rightElement}
    </div>
  );
}
