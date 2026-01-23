import React from 'react';
import { PartyTheme } from '../theme';

interface ThemedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme: PartyTheme;
  variant?: 'filled' | 'outline' | 'ghost' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export function ThemedButton({
  theme,
  variant = 'filled',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  style,
  ...props
}: ThemedButtonProps) {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center gap-2';

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
    xl: 'px-6 py-3.5 text-lg',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: theme.primary,
          color: theme.primaryText,
          '--hover-bg': theme.primaryDark,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme.primary,
          border: `2px solid ${theme.primary}`,
          '--hover-bg': theme.primaryLight,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: theme.primary,
          '--hover-bg': theme.primaryLight,
        };
      case 'light':
        return {
          backgroundColor: theme.primaryLight,
          color: theme.primary,
          '--hover-bg': theme.primary,
          '--hover-color': theme.primaryText,
        };
      default:
        return {};
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <button
      className={`
        ${baseStyles} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.98]'}
        ${className}
      `}
      style={{
        ...variantStyles,
        focusRingColor: theme.primary,
        ...style,
      } as React.CSSProperties}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
