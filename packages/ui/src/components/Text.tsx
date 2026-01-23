import React, { ReactNode, CSSProperties } from 'react';
import { useTheme } from '../ThemeContext';

type TextVariant = 'primary' | 'secondary' | 'muted' | 'inverse' | 'brand';

interface TextProps {
  children: ReactNode;
  variant?: TextVariant;
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'label';
  className?: string;
  style?: CSSProperties;
}

// 텍스트 컴포넌트
export function Text({ 
  children, 
  variant = 'primary',
  as: Component = 'span',
  className = '',
  style = {},
}: TextProps) {
  const theme = useTheme();
  
  const getColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.textPrimary;
      case 'secondary':
        return theme.colors.textSecondary;
      case 'muted':
        return theme.colors.textMuted;
      case 'inverse':
        return theme.colors.textInverse;
      case 'brand':
        return theme.colors.primary;
      default:
        return theme.colors.textPrimary;
    }
  };
  
  return (
    <Component 
      className={className}
      style={{ color: getColor(), ...style }}
    >
      {children}
    </Component>
  );
}

// 제목 컴포넌트
interface HeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4;
  variant?: TextVariant;
  className?: string;
}

export function Heading({ 
  children, 
  level = 2,
  variant = 'primary',
  className = '',
}: HeadingProps) {
  const tags = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
  } as const;
  
  const sizes = {
    1: 'text-2xl font-bold',
    2: 'text-xl font-bold',
    3: 'text-lg font-semibold',
    4: 'text-base font-semibold',
  };
  
  return (
    <Text 
      as={tags[level]} 
      variant={variant}
      className={`${sizes[level]} ${className}`}
    >
      {children}
    </Text>
  );
}

// 라벨 (작은 텍스트)
interface LabelProps {
  children: ReactNode;
  variant?: TextVariant;
  className?: string;
}

export function Label({ 
  children, 
  variant = 'muted',
  className = '',
}: LabelProps) {
  return (
    <Text 
      as="span" 
      variant={variant}
      className={`text-xs ${className}`}
    >
      {children}
    </Text>
  );
}
