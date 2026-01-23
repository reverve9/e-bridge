import React, { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { useTheme } from '../ThemeContext';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: InputProps) {
  const theme = useTheme();
  
  return (
    <div className="w-full">
      {label && (
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: theme.colors.textSecondary }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: theme.colors.textMuted }}
          >
            {leftIcon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3 rounded-xl transition-all duration-200
            focus:outline-none focus:ring-2
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${className}
          `}
          style={{
            backgroundColor: theme.colors.cardBg,
            color: theme.colors.textPrimary,
            border: `1px solid ${error ? theme.colors.error : theme.colors.border}`,
          }}
          {...props}
        />
        {rightIcon && (
          <div 
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: theme.colors.textMuted }}
          >
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm" style={{ color: theme.colors.error }}>{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs" style={{ color: theme.colors.textMuted }}>{helperText}</p>
      )}
    </div>
  );
}

// TextArea
interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function TextArea({
  label,
  error,
  helperText,
  className = '',
  ...props
}: TextAreaProps) {
  const theme = useTheme();
  
  return (
    <div className="w-full">
      {label && (
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: theme.colors.textSecondary }}
        >
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3 rounded-xl transition-all duration-200
          focus:outline-none focus:ring-2 resize-none
          ${className}
        `}
        style={{
          backgroundColor: theme.colors.cardBg,
          color: theme.colors.textPrimary,
          border: `1px solid ${error ? theme.colors.error : theme.colors.border}`,
        }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm" style={{ color: theme.colors.error }}>{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs" style={{ color: theme.colors.textMuted }}>{helperText}</p>
      )}
    </div>
  );
}
