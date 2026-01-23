import React from 'react';
import { PartyTheme } from '../theme';

interface ThemedBadgeProps {
  theme: PartyTheme;
  variant?: 'filled' | 'light' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function ThemedBadge({
  theme,
  variant = 'light',
  size = 'sm',
  children,
  className = '',
}: ThemedBadgeProps) {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: theme.primary,
          color: theme.primaryText,
        };
      case 'light':
        return {
          backgroundColor: theme.primaryLight,
          color: theme.primary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme.primary,
          border: `1px solid ${theme.primary}`,
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
