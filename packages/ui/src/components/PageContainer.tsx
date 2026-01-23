import React, { ReactNode } from 'react';
import { useTheme } from '../ThemeContext';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

// 페이지 최상위 컨테이너
export function PageContainer({ children, className = '' }: PageContainerProps) {
  const theme = useTheme();
  
  return (
    <div 
      className={`min-h-screen ${className}`}
      style={{ backgroundColor: theme.colors.background }}
    >
      {children}
    </div>
  );
}

// 로딩 스피너
export function LoadingSpinner() {
  const theme = useTheme();
  
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: theme.colors.cardBg }}
    >
      <div 
        className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ 
          borderColor: theme.colors.border,
          borderTopColor: theme.colors.primary,
        }}
      />
    </div>
  );
}

// 에러/404 페이지 컨테이너
export function ErrorContainer({ 
  icon, 
  title, 
  message, 
  children 
}: { 
  icon: ReactNode;
  title: string;
  message: string;
  children?: ReactNode;
}) {
  const theme = useTheme();
  
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: theme.colors.background }}
    >
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: theme.colors.border }}
      >
        {icon}
      </div>
      <h1 
        className="text-xl font-bold mb-2"
        style={{ color: theme.colors.textSecondary }}
      >
        {title}
      </h1>
      <p 
        className="text-center mb-6"
        style={{ color: theme.colors.textMuted }}
      >
        {message}
      </p>
      {children}
    </div>
  );
}
