import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  center?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = 'xl',
  padding = 'md',
  center = true,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 sm:px-6 lg:px-8',
    md: 'px-6 sm:px-8 md:px-10 lg:px-12',
    lg: 'px-8 sm:px-12 md:px-16 lg:px-20',
  };

  return (
    <div
      className={cn(
        'w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        center && 'mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 'md',
}) => {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  const gridClasses = [
    'grid',
    gapClasses[gap],
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  );
};

interface ResponsiveStackProps {
  children: ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
  direction?: 'vertical' | 'horizontal';
  responsive?: boolean;
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  className,
  spacing = 'md',
  direction = 'vertical',
  responsive = true,
}) => {
  const spacingClasses = {
    sm: direction === 'vertical' ? 'space-y-4' : 'space-x-4',
    md: direction === 'vertical' ? 'space-y-6' : 'space-x-6',
    lg: direction === 'vertical' ? 'space-y-8' : 'space-x-8',
  };

  const responsiveClasses = responsive && direction === 'horizontal'
    ? 'flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6'
    : '';

  return (
    <div
      className={cn(
        direction === 'horizontal' ? 'flex' : 'flex flex-col',
        responsive ? responsiveClasses : spacingClasses[spacing],
        className
      )}
    >
      {children}
    </div>
  );
};