import React, { ReactNode } from 'react';
import { useTheme } from '../ThemeContext';

interface HeaderProps {
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  children?: ReactNode;
  className?: string;
}

// 정당별 헤더
export function Header({ 
  leftElement, 
  rightElement, 
  children,
  className = '',
}: HeaderProps) {
  const theme = useTheme();
  
  return (
    <header 
      className={className}
      style={{ background: theme.header.background }}
    >
      <div className="flex items-center justify-between px-4 py-[15px]">
        {leftElement}
        {children}
        {rightElement}
      </div>
    </header>
  );
}

// SNS 아이콘 버튼 (헤더용)
interface HeaderIconButtonProps {
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
}

export function HeaderIconButton({ icon, href, onClick }: HeaderIconButtonProps) {
  const theme = useTheme();
  
  const buttonStyle = {
    backgroundColor: theme.header.iconBgColor,
    color: theme.header.textColor,
  };
  
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-7 h-7 rounded-full flex items-center justify-center"
        style={buttonStyle}
      >
        {icon}
      </a>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-full flex items-center justify-center"
      style={buttonStyle}
    >
      {icon}
    </button>
  );
}
