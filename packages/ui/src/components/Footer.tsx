import React, { ReactNode } from 'react';
import { useTheme } from '../ThemeContext';

interface FooterProps {
  children: ReactNode;
  variant?: 'default' | 'muted';
  className?: string;
}

export function Footer({ 
  children, 
  variant = 'default',
  className = '',
}: FooterProps) {
  const theme = useTheme();
  
  const getBackgroundColor = () => {
    if (variant === 'muted') {
      return theme.isDark ? theme.colors.cardBg : '#E5E7EB'; // gray-200
    }
    return theme.isDark ? theme.colors.border : '#F3F4F6'; // gray-100
  };
  
  return (
    <footer 
      className={`px-6 py-6 ${className}`}
      style={{ backgroundColor: getBackgroundColor() }}
    >
      {children}
    </footer>
  );
}

// 연락처 정보 아이템
interface ContactItemProps {
  icon: ReactNode;
  children: ReactNode;
}

export function ContactItem({ icon, children }: ContactItemProps) {
  const theme = useTheme();
  
  return (
    <p 
      className="flex items-center gap-2"
      style={{ color: theme.colors.textSecondary }}
    >
      <span style={{ color: theme.colors.textMuted }}>{icon}</span>
      {children}
    </p>
  );
}
