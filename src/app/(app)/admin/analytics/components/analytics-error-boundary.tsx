'use client';

import type { ErrorInfo } from 'react';

import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { Component } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';

type AnalyticsErrorBoundaryProps = Children<{
  section: string;
}>;

interface AnalyticsErrorBoundaryState {
  error?: Error;
  hasError: boolean;
}

export class AnalyticsErrorBoundary extends Component<
  AnalyticsErrorBoundaryProps,
  AnalyticsErrorBoundaryState
> {
  constructor(props: AnalyticsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AnalyticsErrorBoundaryState {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Analytics ${this.props.section} error:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className={'border-destructive'}>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2 text-destructive'}>
              <AlertTriangleIcon aria-hidden className={'size-5'} />
              Analytics Error
            </CardTitle>
            <CardDescription>
              Failed to load {this.props.section} analytics data. This could be due to a temporary
              connectivity issue or server error.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={'space-y-4'}>
              {/* Error Message */}
              <Conditional isCondition={!!this.state.error}>
                <details className={'text-sm text-muted-foreground'}>
                  <summary className={'cursor-pointer font-medium'}>Error Details</summary>
                  <pre className={'mt-2 rounded bg-muted p-2 whitespace-pre-wrap'}>
                    {this.state.error ? this.state.error.message : 'Unknown error'}
                  </pre>
                </details>
              </Conditional>

              {/* Retry Button */}
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
