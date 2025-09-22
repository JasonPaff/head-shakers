import { Suspense } from 'react';

import type { ReportTargetType } from '@/components/feature/content-reports/report-button';

import { ReportStatusAsync } from './async/report-status-async';
import { ContentReportsErrorBoundary } from './content-reports-error-boundary';
import { ReportStatusSkeleton } from './skeletons/report-status-skeleton';

interface ReportStatusWrapperProps {
  targetId: string;
  targetType: ReportTargetType;
}

export const ReportStatusWrapper = ({ targetId, targetType }: ReportStatusWrapperProps) => {
  return (
    <ContentReportsErrorBoundary section={'report-status'}>
      <Suspense fallback={<ReportStatusSkeleton />}>
        <ReportStatusAsync targetId={targetId} targetType={targetType} />
      </Suspense>
    </ContentReportsErrorBoundary>
  );
};
