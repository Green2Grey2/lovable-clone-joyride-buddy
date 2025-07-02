import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  variant?: 'spinner' | 'skeleton' | 'pulse' | 'dots';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  size = 'md',
  text,
  className,
  variant = 'spinner',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  if (variant === 'spinner') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
        <svg
          className={cn('animate-spin text-primary', sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse" aria-live="polite">
            {text}
          </p>
        )}
        <span className="sr-only">Loading{text ? `: ${text}` : ''}</span>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-1', className)}>
        <div className="flex space-x-1">
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
        </div>
        {text && (
          <span className="ml-3 text-sm text-muted-foreground" aria-live="polite">
            {text}
          </span>
        )}
        <span className="sr-only">Loading{text ? `: ${text}` : ''}</span>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="flex items-center gap-3">
          <div className={cn('bg-primary rounded-full animate-pulse', sizeClasses[size])} />
          {text && (
            <p className="text-sm text-muted-foreground animate-pulse" aria-live="polite">
              {text}
            </p>
          )}
        </div>
        <span className="sr-only">Loading{text ? `: ${text}` : ''}</span>
      </div>
    );
  }

  return null;
};

interface SkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  lines = 3,
  avatar = false,
}) => {
  return (
    <div className={cn('animate-pulse', className)} role="status" aria-label="Loading content">
      <div className="space-y-3">
        {avatar && (
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-gray-300 h-12 w-12" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/4" />
              <div className="h-3 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
        )}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-4 bg-gray-300 rounded',
                index === lines - 1 ? 'w-3/4' : 'w-full'
              )}
            />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading content...</span>
    </div>
  );
};

interface LoadingCardProps {
  className?: string;
  title?: boolean;
  image?: boolean;
  content?: boolean;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  className,
  title = true,
  image = false,
  content = true,
}) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border p-6 animate-pulse', className)}>
      {image && <div className="h-48 bg-gray-300 rounded-lg mb-4" />}
      {title && <div className="h-6 bg-gray-300 rounded mb-4 w-3/4" />}
      {content && (
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-5/6" />
          <div className="h-4 bg-gray-300 rounded w-4/6" />
        </div>
      )}
      <span className="sr-only">Loading card content...</span>
    </div>
  );
};

interface LoadingOverlayProps {
  children: React.ReactNode;
  loading: boolean;
  text?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  children,
  loading,
  text = 'Loading...',
  className,
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
          <LoadingState text={text} />
        </div>
      )}
    </div>
  );
};