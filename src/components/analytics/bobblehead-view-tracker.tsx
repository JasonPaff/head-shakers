'use client';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';

import { ViewTracker } from './view-tracker';

type BobbleheadViewTrackerProps = Children<{
  bobbleheadId: string;
  className?: string;
  collectionId?: string;
  onViewRecorded?: (viewData: { isDuplicate: boolean; totalViews: number; viewId: string }) => void;
  sessionId?: string;
  subcollectionId?: string;
  viewThreshold?: number;
  viewTimeThreshold?: number;
}> &
  ComponentTestIdProps;

export const BobbleheadViewTracker = ({
  bobbleheadId,
  children,
  className,
  collectionId,
  onViewRecorded,
  sessionId,
  subcollectionId,
  testId,
  viewThreshold = 0.1,
  viewTimeThreshold = 3000,
}: BobbleheadViewTrackerProps) => {
  const bobbleheadTrackerTestId = testId || generateTestId('feature', 'bobblehead-card');

  // add bobblehead-specific metadata
  const metadata = {
    bobbleheadId,
    pageType: 'bobblehead',
    ...(collectionId && { collectionId }),
    ...(subcollectionId && { subcollectionId }),
  };

  return (
    <ViewTracker
      className={className}
      metadata={metadata}
      onViewRecorded={onViewRecorded}
      sessionId={sessionId}
      targetId={bobbleheadId}
      targetType={'bobblehead'}
      testId={bobbleheadTrackerTestId}
      viewThreshold={viewThreshold}
      viewTimeThreshold={viewTimeThreshold}
    >
      {children}
    </ViewTracker>
  );
};
