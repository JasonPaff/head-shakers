'use client';

import type { ComponentProps, ReactNode } from 'react';

import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { Component } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface ErrorBoundaryProps extends ComponentTestIdProps, Omit<ComponentProps<'div'>, 'children' | 'onError'> {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: string) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: null | string;
  hasError: boolean;
}

/**
 * Error Boundary for Feature Planner Components
 * Provides graceful error handling and recovery mechanisms
 */
export class FeaturePlannerErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      error,
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const errorString = errorInfo.componentStack || 'No component stack available';

    this.setState({
      errorInfo: errorString,
    });

    // Call optional error handler
    this.props.onError?.(error, errorString);

    // Log error for debugging
    console.error('FeaturePlannerErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      error: null,
      errorInfo: null,
      hasError: false,
    });
  };

  render(): ReactNode {
    const { children, className, fallback, testId, ...props } = this.props;
    const { error, hasError } = this.state;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.handleReset);
      }

      // Default error UI
      const errorBoundaryTestId = testId || generateTestId('feature', 'alert');

      return (
        <div className={cn('p-4', className)} data-testid={errorBoundaryTestId} {...props}>
          <Card className={'border-destructive'}>
            <CardHeader>
              <CardTitle className={'flex items-center gap-2 text-destructive'}>
                <AlertTriangleIcon aria-hidden className={'size-5'} />
                Something went wrong
              </CardTitle>
              <CardDescription>
                An error occurred in the feature planner. You can try refreshing the component or reload the page.
              </CardDescription>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              <div className={'rounded-md bg-muted p-3'}>
                <p className={'text-sm font-medium'}>Error Details:</p>
                <p className={'mt-1 text-sm text-muted-foreground'}>{error.message}</p>
              </div>

              <div className={'flex gap-2'}>
                <Button onClick={this.handleReset} size={'sm'} variant={'outline'}>
                  <RefreshCwIcon aria-hidden className={'mr-2 size-4'} />
                  Try Again
                </Button>
                <Button
                  onClick={() => {
                    window.location.reload();
                  }}
                  size={'sm'}
                  variant={'destructive'}
                >
                  Reload Page
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className={'mt-4'}>
                  <summary className={'cursor-pointer text-sm font-medium'}>
                    Development Details (Click to expand)
                  </summary>
                  <pre className={'mt-2 overflow-auto rounded bg-muted p-2 text-xs'}>
                    {this.state.errorInfo}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}