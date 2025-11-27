'use client';

import type { ErrorInfo, ReactNode } from 'react';

import { AlertCircleIcon } from 'lucide-react';
import { Component } from 'react';

import { Button } from '@/components/ui/button';

type Children<TProps = NonNullable<unknown>> = Readonly<{ children?: ReactNode | undefined }> & TProps;

type ErrorBoundaryProps = Children<{
  fallback?: ReactNode;
}>;

interface ErrorBoundaryState {
  error?: Error;
  hasError: boolean;
}

export class FeaturedCollectionsErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error in featured collections section:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={'rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center'}>
          <div className={'mb-2 flex items-center justify-center gap-2'}>
            <AlertCircleIcon aria-hidden className={'size-5 text-destructive'} />
            <h3 className={'font-semibold text-destructive'}>Failed to load featured collections</h3>
          </div>
          <p className={'mb-4 text-sm text-muted-foreground'}>
            There was a problem loading featured collections. Please try refreshing the page.
          </p>
          <Button
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
