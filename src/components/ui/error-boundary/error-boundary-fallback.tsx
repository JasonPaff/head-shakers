import type { ReactNode } from 'react';

import { AlertCircleIcon, RefreshCwIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';

import { Alert } from '../alert';
import { Button } from '../button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';
import { Conditional } from '../conditional';

export interface ErrorBoundaryFallbackProps extends ComponentTestIdProps {
  /** Additional action buttons */
  actions?: ReactNode;
  /** The error that was caught */
  error: Error;
  /** Section/component name for display */
  name?: string;
  /** Function to reset the error boundary */
  onReset: () => void;
  /** Variant: 'card' (default) or 'inline' for compact display */
  variant?: 'card' | 'inline';
}

export function ErrorBoundaryFallback({
  actions,
  error,
  name = 'content',
  onReset,
  testId,
  variant = 'card',
}: ErrorBoundaryFallbackProps) {
  const fallbackTestId = testId || generateTestId('ui', 'error-boundary', 'fallback');
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Inline variant - compact Alert style
  if (variant === 'inline') {
    return (
      <div className={'space-y-2'} data-testid={fallbackTestId}>
        <Alert variant={'error'}>
          <span>Failed to load {name}. </span>
          <button className={'font-medium underline underline-offset-2'} onClick={onReset} type={'button'}>
            Try again
          </button>
        </Alert>
      </div>
    );
  }

  // Card variant - full card style (default)
  return (
    <Card className={'border-destructive/20'} data-testid={fallbackTestId}>
      <CardHeader>
        <div className={'flex items-center gap-3'}>
          <div
            className={
              'flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 shadow-sm'
            }
          >
            <AlertCircleIcon aria-hidden className={'size-5 text-destructive'} />
          </div>
          <div>
            <CardTitle className={'text-destructive'}>Failed to load {name}</CardTitle>
            <CardDescription>There was a problem loading this section. Please try again.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className={'space-y-4'}>
        {/* Action Buttons */}
        <div className={'flex flex-wrap gap-2'}>
          <Button onClick={onReset} size={'sm'} type={'button'} variant={'default'}>
            <RefreshCwIcon aria-hidden className={'size-4'} />
            Try Again
          </Button>
          {actions}
        </div>

        {/* Development Error Details */}
        <Conditional isCondition={isDevelopment}>
          <details className={'rounded-md border bg-muted/50 p-3 text-xs'}>
            <summary className={'cursor-pointer font-medium'}>Error Details (dev only)</summary>
            <div className={'mt-2 space-y-2'}>
              <div>
                <span className={'font-semibold'}>Name:</span> {error.name}
              </div>
              <div>
                <span className={'font-semibold'}>Message:</span> {error.message}
              </div>
              <Conditional isCondition={!!error.stack}>
                <div>
                  <span className={'font-semibold'}>Stack:</span>
                  <pre className={'mt-1 overflow-auto rounded bg-background p-2 text-[10px]'}>
                    {error.stack}
                  </pre>
                </div>
              </Conditional>
            </div>
          </details>
        </Conditional>
      </CardContent>
    </Card>
  );
}
