import React from 'react';
import { PartyTheme } from '../theme';

interface ThemedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  theme: PartyTheme;
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function ThemedInput({
  theme,
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: ThemedInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3 border rounded-xl transition-all duration-200
            focus:outline-none focus:ring-2
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}
            ${className}
          `}
          style={{
            '--tw-ring-color': error ? '#FEE2E2' : theme.primaryLight,
            borderColor: error ? '#EF4444' : undefined,
          } as React.CSSProperties}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = theme.primary;
            }
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = '#D1D5DB';
            }
            props.onBlur?.(e);
          }}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-400">{helperText}</p>
      )}
    </div>
  );
}

// TextArea 버전
interface ThemedTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  theme: PartyTheme;
  label?: string;
  error?: string;
  helperText?: string;
}

export function ThemedTextArea({
  theme,
  label,
  error,
  helperText,
  className = '',
  ...props
}: ThemedTextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3 border rounded-xl transition-all duration-200
          focus:outline-none focus:ring-2 resize-none
          ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}
          ${className}
        `}
        style={{
          '--tw-ring-color': error ? '#FEE2E2' : theme.primaryLight,
        } as React.CSSProperties}
        onFocus={(e) => {
          if (!error) {
            e.target.style.borderColor = theme.primary;
          }
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          if (!error) {
            e.target.style.borderColor = '#D1D5DB';
          }
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
