import React, { ReactNode } from 'react';
import { useTheme } from '../ThemeContext';

// 구분선이 있는 리스트
interface DividedListProps {
  children: ReactNode;
  className?: string;
}

export function DividedList({ children, className = '' }: DividedListProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {children}
    </div>
  );
}

// 구분선 아이템
interface DividedItemProps {
  children: ReactNode;
  isLast?: boolean;
  onClick?: () => void;
  className?: string;
}

export function DividedItem({ 
  children, 
  isLast = false, 
  onClick,
  className = '',
}: DividedItemProps) {
  const theme = useTheme();
  
  return (
    <div 
      className={`pb-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ 
        borderBottom: isLast ? 'none' : `1px solid ${theme.colors.borderLight}`,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// 간단한 키-값 행
interface InfoRowProps {
  label: string;
  value: ReactNode;
}

export function InfoRow({ label, value }: InfoRowProps) {
  const theme = useTheme();
  
  return (
    <div className="flex justify-between">
      <span style={{ color: theme.colors.textMuted }}>{label}</span>
      <span className="font-medium" style={{ color: theme.colors.textPrimary }}>{value}</span>
    </div>
  );
}

// 아코디언 아이템
interface AccordionItemProps {
  title: ReactNode;
  children: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  expandIcon?: ReactNode;
}

export function AccordionItem({ 
  title, 
  children, 
  isExpanded, 
  onToggle,
  expandIcon,
}: AccordionItemProps) {
  const theme = useTheme();
  
  return (
    <div 
      className="border-b last:border-0"
      style={{ borderColor: theme.colors.borderLight }}
    >
      <button
        className="w-full flex items-center justify-between py-3"
        onClick={onToggle}
      >
        <div className="flex-1 text-left">{title}</div>
        <div 
          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          style={{ color: theme.colors.textMuted }}
        >
          {expandIcon}
        </div>
      </button>
      {isExpanded && (
        <div className="pb-3">
          {children}
        </div>
      )}
    </div>
  );
}
