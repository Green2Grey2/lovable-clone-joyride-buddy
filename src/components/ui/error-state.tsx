import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronLeft } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  type?: 'error' | 'warning' | 'not-found' | 'network' | 'permission';
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  className?: string;
  showActions?: boolean;
  retryText?: string;
  icon?: React.ReactNode;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  type = 'error',
  onRetry,
  onGoBack,
  onGoHome,
  className,
  showActions = true,
  retryText = 'Try again',
  icon,
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'not-found':
        return {
          title: '404 - Page Not Found',
          message: 'The page you are looking for could not be found.',
          icon: <AlertTriangle className="h-12 w-12 text-amber-500" />,
        };
      case 'network':
        return {
          title: 'Connection Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
          icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
        };
      case 'permission':
        return {
          title: 'Access Denied',
          message: 'You do not have permission to access this resource.',
          icon: <AlertTriangle className="h-12 w-12 text-orange-500" />,
        };
      case 'warning':
        return {
          title: 'Warning',
          message: 'Something unexpected happened.',
          icon: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
        };
      default:
        return {
          title: 'Something went wrong',
          message: 'An unexpected error occurred. Please try again.',
          icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
        };
    }
  };

  const defaultContent = getDefaultContent();
  const displayTitle = title || defaultContent.title;
  const displayMessage = message || defaultContent.message;
  const displayIcon = icon || defaultContent.icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="mb-4" aria-hidden="true">
        {displayIcon}
      </div>
      
      <h2 className="text-lg font-semibold text-foreground mb-2">
        {displayTitle}
      </h2>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        {displayMessage}
      </p>

      {showActions && (
        <div className="flex flex-col sm:flex-row gap-3">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="default"
              className="flex items-center gap-2"
              ariaLabel={`${retryText}. ${displayTitle}`}
            >
              <RefreshCw className="h-4 w-4" />
              {retryText}
            </Button>
          )}
          
          {onGoBack && (
            <Button
              onClick={onGoBack}
              variant="outline"
              className="flex items-center gap-2"
              ariaLabel="Go back to previous page"
            >
              <ChevronLeft className="h-4 w-4" />
              Go Back
            </Button>
          )}
          
          {onGoHome && (
            <Button
              onClick={onGoHome}
              variant="ghost"
              className="flex items-center gap-2"
              ariaLabel="Go to homepage"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'warning';
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  onRetry,
  className,
  variant = 'destructive',
}) => {
  const variantClasses = {
    default: 'bg-gray-50 text-gray-700 border-gray-200',
    destructive: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border',
        variantClasses[variant],
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm">{message}</span>
      </div>
      
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="ghost"
          size="sm"
          className="h-auto p-1 text-current hover:bg-current/10"
          ariaLabel={`Retry. Error: ${message}`}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
  className?: string;
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetError,
  className,
}) => {
  return (
    <ErrorState
      title="Application Error"
      message={
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Something went wrong. Please refresh the page and try again.'
      }
      type="error"
      onRetry={resetError}
      onGoHome={() => window.location.href = '/dashboard'}
      className={className}
    />
  );
};

interface LoadingErrorWrapperProps {
  children: React.ReactNode;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  className?: string;
}

export const LoadingErrorWrapper: React.FC<LoadingErrorWrapperProps> = ({
  children,
  loading,
  error,
  onRetry,
  loadingComponent,
  errorComponent,
  className,
}) => {
  if (loading) {
    return (
      <div className={className}>
        {loadingComponent || (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {errorComponent || (
          <InlineError
            message={error}
            onRetry={onRetry}
          />
        )}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};