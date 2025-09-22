'use client';

import type { ErrorInfo, ReactNode } from 'react';

import { AlertCircleIcon } from 'lucide-react';
import { Component } from 'react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Children<TProps = NonNullable<unknown>> = Readonly<{ children?: ReactNode | undefined }> & TProps;

type ContentReportsErrorBoundaryProps = Children<{
  fallback?: ReactNode;
  section?: 'report-button' | 'report-dialog' | 'report-status';
}>;

interface ErrorBoundaryState {
  error?: Error;
  hasError: boolean;
}

export class ContentReportsErrorBoundary extends Component<
  ContentReportsErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ContentReportsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in content reports ${this.props.section || 'component'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // for the report status section, show a simpler fallback
      if (this.props.section === 'report-status') {
        return (
          <Alert variant={'error'}>
            <AlertCircleIcon aria-hidden className={'size-4'} />
            Unable to load report status
          </Alert>
        );
      }

      // for other sections, show a more detailed error card
      return (
        <Card className={'border-destructive'}>
          <CardHeader className={'pb-3'}>
            <CardTitle className={'flex items-center gap-2 text-destructive'}>
              <AlertCircleIcon aria-hidden className={'size-4'} />
              Error loading {this.props.section || 'content reporting feature'}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Alert variant={'error'}>
              We encountered an error with the reporting feature. Please try refreshing the page.
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
