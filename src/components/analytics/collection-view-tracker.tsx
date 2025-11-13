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
  subcollectionId?: string;
  subcollectionSlug?: string;
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
  subcollectionId,
  subcollectionSlug,
  testId,
  viewThreshold = 0.6, // higher threshold for collections
  viewTimeThreshold = 2000, // longer threshold for meaningful engagement
}: CollectionViewTrackerProps) => {
  const collectionTrackerTestId = testId || generateTestId('feature', 'collection-card');

  // determine the target type and ID based on whether it's a collection or subcollection
  const targetType = subcollectionId ? 'subcollection' : 'collection';
  const targetId = subcollectionId || collectionId;

  // add collection-specific metadata with both IDs and slugs for comprehensive tracking
  const metadata = {
    collectionId,
    pageType: targetType,
    ...(collectionSlug && { collectionSlug }),
    ...(subcollectionId && { subcollectionId }),
    ...(subcollectionSlug && { subcollectionSlug }),
  };

  return (
    <ViewTracker
      className={className}
      metadata={metadata}
      onViewRecorded={onViewRecorded}
      sessionId={sessionId}
      targetId={targetId}
      targetType={targetType}
      testId={collectionTrackerTestId}
      viewThreshold={viewThreshold}
      viewTimeThreshold={viewTimeThreshold}
    >
      {children}
    </ViewTracker>
  );
};
