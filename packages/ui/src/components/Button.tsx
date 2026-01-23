import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import { useTheme } from '../ThemeContext';

type ButtonVariant = 'filled' | 'outline' | 'ghost' | 'light' | 'muted';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  children,
  variant = 'filled',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const theme = useTheme();
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
    xl: 'px-6 py-3.5 text-lg',
  };
  
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: theme.colors.primary,
          color: theme.colors.primaryText,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme.colors.primary,
          border: `2px solid ${theme.colors.primary}`,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: theme.colors.primary,
        };
      case 'light':
        return {
          backgroundColor: theme.colors.primaryLight,
          color: theme.colors.primary,
        };
      case 'muted':
        return {
          backgroundColor: theme.isDark ? theme.colors.border : '#F3F4F6',
          color: theme.colors.textSecondary,
        };
      default:
        return {};
    }
  };
  
  return (
    <button
      className={`
        font-semibold rounded-xl transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-offset-2
        inline-flex items-center justify-center gap-2
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.98]'}
        ${className}
      `}
      style={{
        ...getVariantStyles(),
        ...style,
      }}
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

// 아이콘 버튼
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  rounded = true,
  className = '',
  ...props
}: IconButtonProps) {
  const theme = useTheme();
  
  const sizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
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
      case 'muted':
        return {
          backgroundColor: theme.isDark ? theme.colors.border : 'rgba(255,255,255,0.2)',
          color: theme.colors.textSecondary,
        };
      default:
        return {
          backgroundColor: 'transparent',
          color: theme.colors.textMuted,
        };
    }
  };
  
  return (
    <button
      className={`
        flex items-center justify-center transition-all
        ${sizes[size]}
        ${rounded ? 'rounded-full' : 'rounded-lg'}
        ${className}
      `}
      style={getVariantStyles()}
      {...props}
    >
      {icon}
    </button>
  );
}

// 텍스트 링크 버튼
interface LinkButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function LinkButton({ children, onClick, className = '' }: LinkButtonProps) {
  const theme = useTheme();
  
  return (
    <button
      onClick={onClick}
      className={`text-xs flex items-center gap-0.5 hover:opacity-80 ${className}`}
      style={{ color: theme.colors.textMuted }}
    >
      {children}
    </button>
  );
}
