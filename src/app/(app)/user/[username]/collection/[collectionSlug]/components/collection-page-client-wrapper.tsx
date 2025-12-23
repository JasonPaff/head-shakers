'use client';

import type { ReactNode } from 'react';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { CollectionViewTracker } from '@/components/analytics/collection-view-tracker';
import { generateTestId } from '@/lib/test-ids';

interface CollectionPageClientWrapperProps extends ComponentTestIdProps {
  children: ReactNode;
  collection: PublicCollection;
  collectionId: string;
}

export const CollectionPageClientWrapper = ({
  children,
  collection,
  collectionId,
  testId,
}: CollectionPageClientWrapperProps) => {
  const wrapperTestId = testId || generateTestId('feature', 'collection-page-wrapper');
  const collectionSlug = collection?.slug || '';

  return (
    <CollectionViewTracker collectionId={collectionId} collectionSlug={collectionSlug}>
      <div data-slot={'collection-page-wrapper'} data-testid={wrapperTestId}>
        {children}
      </div>
    </CollectionViewTracker>
  );
};
