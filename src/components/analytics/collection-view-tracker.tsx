'use client';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';

import { ViewTracker } from './view-tracker';

type CollectionViewTrackerProps = Children<{
  className?: string;
  collectionId: string;
  onViewRecorded?: (viewData: { isDuplicate: boolean; totalViews: number; viewId: string }) => void;
  sessionId?: string;
  subcollectionId?: string;
  viewThreshold?: number;
  viewTimeThreshold?: number;
}> &
  ComponentTestIdProps;

export const CollectionViewTracker = ({
  children,
  className,
  collectionId,
  onViewRecorded,
  sessionId,
  subcollectionId,
  testId,
  viewThreshold = 0.6, // higher threshold for collections
  viewTimeThreshold = 2000, // longer threshold for meaningful engagement
}: CollectionViewTrackerProps) => {
  const collectionTrackerTestId = testId || generateTestId('feature', 'collection-card');

  // determine the target type and ID based on whether it's a collection or subcollection
  const targetType = subcollectionId ? 'subcollection' : 'collection';
  const targetId = subcollectionId || collectionId;

  // add collection-specific metadata
  const metadata = {
    collectionId,
    pageType: targetType,
    ...(subcollectionId && { subcollectionId }),
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
