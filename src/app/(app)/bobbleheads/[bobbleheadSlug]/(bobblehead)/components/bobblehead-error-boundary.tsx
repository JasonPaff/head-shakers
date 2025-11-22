'use client';

import type { ErrorInfo, ReactNode } from 'react';

import { AlertCircleIcon } from 'lucide-react';
import { Component } from 'react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Children<TProps = NonNullable<unknown>> = Readonly<{ children?: ReactNode | undefined }> & TProps;

type ErrorBoundaryProps = Children<{
  fallback?: ReactNode;
  section?:
    | 'comments'
    | 'details'
    | 'feature'
    | 'gallery'
    | 'header'
    | 'metrics'
    | 'navigation'
    | 'secondary';
}>;

interface ErrorBoundaryState {
  error?: Error;
  hasError: boolean;
}

export class BobbleheadErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in bobblehead ${this.props.section || 'component'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className={'border-destructive'}>
          <CardHeader className={'pb-3'}>
            <CardTitle className={'flex items-center gap-2 text-destructive'}>
              <AlertCircleIcon aria-hidden className={'size-4'} />
              Error loading {this.props.section || 'content'}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Alert variant={'error'}>
              We encountered an error while loading this section. Please try refreshing the page.
            </Alert>

            <Button
              className={'mt-3'}
              onClick={() => {
                window.location.reload();
              }}
              size={'sm'}
              variant={'outline'}
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
