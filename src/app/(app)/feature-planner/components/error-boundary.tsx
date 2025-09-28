'use client';

import type { ErrorInfo, ReactNode } from 'react';

import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { Component } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Children<TProps = NonNullable<unknown>> = Readonly<{ children?: ReactNode | undefined }> & TProps;

interface ErrorBoundaryState {
  error?: Error;
  hasError: boolean;
}

type FeaturePlannerErrorBoundaryProps = Children<{
  fallback?: ReactNode;
  section?: string;
}>;

export class FeaturePlannerErrorBoundary extends Component<
  FeaturePlannerErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: FeaturePlannerErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in feature planner ${this.props.section || 'component'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className={'border-destructive'}>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2 text-destructive'}>
              <AlertTriangleIcon aria-hidden className={'size-5'} />
              Feature Planner Error
            </CardTitle>
            <CardDescription>
              Failed to load {this.props.section || 'feature planner'} data. This could be due to a temporary
              connectivity issue or server error.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={'space-y-4'}>
              {this.state.error && (
                <details className={'text-sm text-muted-foreground'}>
                  <summary className={'cursor-pointer font-medium'}>Error Details</summary>
                  <pre className={'mt-2 rounded bg-muted p-2 whitespace-pre-wrap'}>
                    {this.state.error.message}
                  </pre>
                </details>
              )}

              <Button onClick={this.handleRetry} size={'sm'} variant={'outline'}>
                <RefreshCwIcon aria-hidden className={'mr-2 size-4'} />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }

  private handleRetry = () => {
    this.setState({ error: undefined, hasError: false });
  };
}
