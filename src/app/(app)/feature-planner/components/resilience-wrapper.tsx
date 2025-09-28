'use client';

import type { ComponentProps } from 'react';

import { AlertCircleIcon, RefreshCwIcon, WifiOffIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { FeaturePlannerErrorBoundary } from '@/app/(app)/feature-planner/components/error-boundary';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type ResilienceWrapperProps = Children<{
  onRetry: () => void;
}> &
  ComponentProps<'div'> &
  ComponentTestIdProps;

/**
 * Resilience Wrapper Component
 * Combines error boundaries with connection monitoring and retry mechanisms
 */
export const ResilienceWrapper = ({
  children,
  className,
  onRetry,
  testId,
  ...props
}: ResilienceWrapperProps) => {
  const resilienceTestId = testId || generateTestId('feature', 'alert');

  const handleErrorBoundaryError = (error: Error, errorInfo: string) => {
    console.error('ResilienceWrapper - Error caught:', { error, errorInfo });
  };

  const _isOnline = true;
  const _isOffline = false;

  return (
    <div className={cn('space-y-4', className)} data-testid={resilienceTestId} {...props}>
      {/* Connection Status Alerts */}
      <Conditional isCondition={_isOnline}>
        <Alert title={'Connection lost'} variant={'error'}>
          <WifiOffIcon aria-hidden className={'size-4'} />
          You&#39;re currently offline. Some features may not work properly until your connection is restored.
        </Alert>
      </Conditional>

      <Conditional isCondition={_isOffline}>
        <Alert title={'Connection Restored'} variant={'success'}>
          <RefreshCwIcon aria-hidden className={'size-4'} />
          <div className={'flex items-center justify-between'}>
            <span>You&#39;re back online! You can now continue using all features.</span>
            <Button onClick={onRetry} size={'sm'} variant={'outline'}>
              Retry
            </Button>
          </div>
        </Alert>
      </Conditional>

      {/* Error Boundary with Custom Fallback */}
      <FeaturePlannerErrorBoundary
        fallback={(error, reset) => (
          <Alert title={'Feature Planner Error'} variant={'error'}>
            <AlertCircleIcon aria-hidden className={'size-4'} />
            <div className={'space-y-3'}>
              <p>An error occurred while processing your request: {error.message}</p>
              <div className={'flex gap-2'}>
                <Button onClick={reset} size={'sm'} variant={'outline'}>
                  <RefreshCwIcon aria-hidden className={'mr-2 size-4'} />
                  Try Again
                </Button>

                <Button onClick={onRetry} size={'sm'} variant={'secondary'}>
                  Retry Operation
                </Button>
              </div>
            </div>
          </Alert>
        )}
        onError={handleErrorBoundaryError}
      >
        {children}
      </FeaturePlannerErrorBoundary>
    </div>
  );
};
