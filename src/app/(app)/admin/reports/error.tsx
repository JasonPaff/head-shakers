'use client';

import type { ComponentPropsWithRef } from 'react';

import * as Sentry from '@sentry/nextjs';
import { AlertCircleIcon, RefreshCcwIcon } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ReportsErrorBoundaryProps extends ComponentPropsWithRef<'div'> {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ReportsErrorBoundary({ error, reset }: ReportsErrorBoundaryProps) {
  // useEffect hooks
  useEffect(() => {
    // Log error to Sentry with context
    Sentry.captureException(error, {
      contexts: {
        content_report: {
          digest: error.digest,
          message: error.message,
          name: error.name,
        },
      },
      tags: {
        component: 'admin-reports-page',
        feature: 'moderation',
      },
    });
  }, [error]);

  // Event handlers
  const handleRetry = () => {
    reset();
  };

  const handleReportIssue = () => {
    // Could integrate with support system or Sentry user feedback
    window.open('https://github.com/yourusername/head-shakers/issues', '_blank');
  };

  // Derived variables for conditional rendering
  const _isDatabaseError = error.message.includes('database') || error.message.includes('query');
  const _isAuthError = error.message.includes('authentication') || error.message.includes('unauthorized');
  const _hasDigest = !!error.digest;

  return (
    <div className={'container mx-auto py-8'}>
      {/* Page Header */}
      <div className={'mb-8'}>
        <h1 className={'text-3xl font-bold'}>Content Reports</h1>
        <p className={'mt-2 text-muted-foreground'}>Review and manage user reports and content moderation.</p>
      </div>

      {/* Error Display */}
      <Card className={'p-12'}>
        <div className={'mx-auto max-w-md text-center'}>
          {/* Error Icon */}
          <div
            className={'mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10'}
          >
            <AlertCircleIcon className={'size-8 text-destructive'} />
          </div>

          {/* Error Title */}
          <h2 className={'mb-3 text-2xl font-bold'}>Something went wrong</h2>

          {/* Error Message */}
          <div className={'mb-6 space-y-2'}>
            <p className={'text-sm text-muted-foreground'}>
              {_isDatabaseError ?
                'There was a problem connecting to the database. This might be a temporary issue.'
              : _isAuthError ?
                'Your session may have expired. Please try refreshing the page or signing in again.'
              : 'An unexpected error occurred while loading the reports. Our team has been notified.'}
            </p>

            {_hasDigest && (
              <p className={'font-mono text-xs text-muted-foreground'}>Error ID: {error.digest}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className={'flex flex-col gap-3 sm:flex-row sm:justify-center'}>
            <Button onClick={handleRetry} size={'lg'}>
              <RefreshCcwIcon className={'mr-2 size-4'} />
              Try Again
            </Button>
            <Button onClick={handleReportIssue} size={'lg'} variant={'outline'}>
              Report Issue
            </Button>
          </div>

          {/* Additional Help */}
          <div className={'mt-8 rounded-lg bg-muted/50 p-4'}>
            <h3 className={'mb-2 text-sm font-semibold'}>Need help?</h3>
            <p className={'text-xs text-muted-foreground'}>
              If this problem persists, please contact support with the error ID above.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
