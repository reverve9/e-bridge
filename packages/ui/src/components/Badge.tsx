import React, { ReactNode } from 'react';
import { useTheme } from '../ThemeContext';

type BadgeVariant = 'filled' | 'light' | 'outline' | 'muted';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export function Badge({
  children,
  variant = 'light',
  size = 'sm',
  className = '',
}: BadgeProps) {
  const theme = useTheme();
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: theme.colors.primary,
          color: theme.colors.primaryText,
        };
      case 'light':
        return {
          backgroundColor: theme.colors.primaryLight,
          color: theme.colors.primary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme.colors.primary,
          border: `1px solid ${theme.colors.primary}`,
        };
      case 'muted':
        return {
          backgroundColor: theme.isDark ? theme.colors.border : '#F3F4F6',
          color: theme.colors.textMuted,
        };
      default:
        return {};
    }
  };
  
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizes[size]} ${className}`}
      style={getVariantStyles()}
    >
      {children}
    </span>
  );
}

// 타입 배지 (활동/뉴스/공지 등)
interface TypeBadgeProps {
  type: string;
  className?: string;
}

export function TypeBadge({ type, className = '' }: TypeBadgeProps) {
  const labels: Record<string, string> = {
    activity: '활동',
    news: '뉴스',
    notice: '공지',
  };
  
  return (
    <Badge variant="light" size="sm" className={className}>
      {labels[type] || type}
    </Badge>
  );
}
