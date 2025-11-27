import { Suspense } from 'react';

import type { ReportTargetType } from '@/components/feature/content-reports/report-button';

import { ErrorBoundary } from '@/components/ui/error-boundary/error-boundary';
import { ErrorBoundaryFallback } from '@/components/ui/error-boundary/error-boundary-fallback';

import { ReportStatusAsync } from './async/report-status-async';
import { ReportStatusSkeleton } from './skeletons/report-status-skeleton';

interface ReportStatusWrapperProps {
  targetId: string;
  targetType: ReportTargetType;
}

export const ReportStatusWrapper = ({ targetId, targetType }: ReportStatusWrapperProps) => {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <ErrorBoundaryFallback error={error} name={'report status'} onReset={reset} variant={'inline'} />
      )}
      name={'report-status'}
    >
      <Suspense fallback={<ReportStatusSkeleton />}>
        <ReportStatusAsync targetId={targetId} targetType={targetType} />
      </Suspense>
    </ErrorBoundary>
  );
};
