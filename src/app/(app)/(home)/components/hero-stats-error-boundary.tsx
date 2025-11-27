'use client';

import type { ErrorInfo, ReactNode } from 'react';

import { AlertCircleIcon } from 'lucide-react';
import { Component } from 'react';

import { Button } from '@/components/ui/button';
import { generateTestId } from '@/lib/test-ids';

type Children<TProps = NonNullable<unknown>> = Readonly<{ children?: ReactNode | undefined }> & TProps;

type ErrorBoundaryProps = Children<{
  fallback?: ReactNode;
}>;

interface ErrorBoundaryState {
  error?: Error;
  hasError: boolean;
}

/**
 * Error boundary for the hero stats section
 *
 * Catches errors from the HeroStatsAsync component and displays
 * a user-friendly error message with retry option.
 * Matches the styling of the hero section with light/dark mode support.
 */
export class HeroStatsErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error in hero stats section:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className={
            'flex flex-wrap gap-8 rounded-lg border border-destructive/20 bg-destructive/5 p-6 pt-8 dark:border-destructive/30 dark:bg-destructive/10'
          }
          data-slot={'hero-stats-error'}
          data-testid={generateTestId('feature', 'hero-stats', 'error')}
        >
          <div className={'flex w-full items-center gap-2'}>
            <AlertCircleIcon aria-hidden className={'size-5 text-destructive'} />
            <span className={'text-sm font-medium text-destructive'}>Failed to load statistics</span>
          </div>
          <p className={'w-full text-sm text-muted-foreground'}>
            There was a problem loading platform statistics.
          </p>
          <Button
            data-slot={'hero-stats-error-retry'}
            data-testid={generateTestId('feature', 'hero-stats', 'error-retry')}
            onClick={() => {
              window.location.reload();
            }}
            size={'sm'}
            variant={'outline'}
          >
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
