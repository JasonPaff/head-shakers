'use client';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';

import { ViewTracker } from './view-tracker';

type BobbleheadViewTrackerProps = Children<{
  bobbleheadId: string;
  bobbleheadSlug?: string;
  className?: string;
  collectionId?: string;
  collectionSlug?: string;
  onViewRecorded?: (viewData: { isDuplicate: boolean; totalViews: number; viewId: string }) => void;
  sessionId?: string;
  viewThreshold?: number;
  viewTimeThreshold?: number;
}> &
  ComponentTestIdProps;

export const BobbleheadViewTracker = ({
  bobbleheadId,
  bobbleheadSlug,
  children,
  className,
  collectionId,
  collectionSlug,
  onViewRecorded,
  sessionId,
  testId,
  viewThreshold = 0.1,
  viewTimeThreshold = 3000,
}: BobbleheadViewTrackerProps) => {
  const bobbleheadTrackerTestId = testId || generateTestId('feature', 'bobblehead-card');

  // add bobblehead-specific metadata with both IDs and slugs for comprehensive tracking
  const metadata = {
    bobbleheadId,
    pageType: 'bobblehead',
    ...(bobbleheadSlug && { bobbleheadSlug }),
    ...(collectionId && { collectionId }),
    ...(collectionSlug && { collectionSlug }),
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
