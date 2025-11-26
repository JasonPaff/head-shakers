'use client';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';

import { ViewTracker } from './view-tracker';

type CollectionViewTrackerProps = Children<{
  className?: string;
  collectionId: string;
  collectionSlug?: string;
  onViewRecorded?: (viewData: { isDuplicate: boolean; totalViews: number; viewId: string }) => void;
  sessionId?: string;
  viewThreshold?: number;
  viewTimeThreshold?: number;
}> &
  ComponentTestIdProps;

export const CollectionViewTracker = ({
  children,
  className,
  collectionId,
  collectionSlug,
  onViewRecorded,
  sessionId,
  testId,
  viewThreshold = 0.6, // higher threshold for collections
  viewTimeThreshold = 2000, // longer threshold for meaningful engagement
}: CollectionViewTrackerProps) => {
  const collectionTrackerTestId = testId || generateTestId('feature', 'collection-card');

  // add collection-specific metadata with both IDs and slugs for comprehensive tracking
  const metadata = {
    collectionId,
    pageType: 'collection',
    ...(collectionSlug && { collectionSlug }),
  };

  return (
    <ViewTracker
      className={className}
      metadata={metadata}
      onViewRecorded={onViewRecorded}
      sessionId={sessionId}
      targetId={collectionId}
      targetType={'collection'}
      testId={collectionTrackerTestId}
      viewThreshold={viewThreshold}
      viewTimeThreshold={viewTimeThreshold}
    >
      {children}
    </ViewTracker>
  );
};
