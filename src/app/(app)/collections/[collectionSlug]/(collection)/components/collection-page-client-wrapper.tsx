'use client';

import type { ReactNode } from 'react';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';
import type { ContentLikeData } from '@/lib/facades/social/social.facade';

import { CollectionViewTracker } from '@/components/analytics/collection-view-tracker';
import { CollectionStickyHeader } from '@/components/feature/collection/collection-sticky-header';
import { StickyHeaderWrapper } from '@/components/feature/sticky-header/sticky-header-wrapper';

interface CollectionPageClientWrapperProps {
  canDelete: boolean;
  canEdit: boolean;
  children: ReactNode;
  collection: PublicCollection;
  collectionId: string;
  collectionSlug: string;
  isOwner: boolean;
  likeData: ContentLikeData | null;
  title: string;
}

export function CollectionPageClientWrapper({
  canDelete,
  canEdit,
  children,
  collection,
  collectionId,
  collectionSlug,
  isOwner,
  likeData,
  title,
}: CollectionPageClientWrapperProps) {
  return (
    <CollectionViewTracker collectionId={collectionId} collectionSlug={collectionSlug}>
      <StickyHeaderWrapper>
        {(isSticky) => (
          <div>
            {/* Sticky Header - shown when scrolling */}
            {isSticky && (
              <CollectionStickyHeader
                canDelete={canDelete}
                canEdit={canEdit}
                collection={collection}
                collectionId={collectionId}
                collectionSlug={collectionSlug}
                isLiked={likeData?.isLiked ?? false}
                isOwner={isOwner}
                likeCount={likeData?.likeCount ?? 0}
                title={title}
              />
            )}

            {/* Page content passed from server */}
            {children}
          </div>
        )}
      </StickyHeaderWrapper>
    </CollectionViewTracker>
  );
}
