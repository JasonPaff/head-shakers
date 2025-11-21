'use client';

import type { ReactNode } from 'react';

import type { PublicSubcollection } from '@/lib/facades/collections/subcollections.facade';
import type { ContentLikeData } from '@/lib/facades/social/social.facade';

import { CollectionViewTracker } from '@/components/analytics/collection-view-tracker';
import { StickyHeaderWrapper } from '@/components/feature/sticky-header/sticky-header-wrapper';
import { SubcollectionStickyHeader } from '@/components/feature/subcollection/subcollection-sticky-header';

interface SubcollectionPageClientWrapperProps {
  canDelete: boolean;
  canEdit: boolean;
  children: ReactNode;
  collectionId: string;
  collectionName: string;
  collectionSlug: string;
  isOwner: boolean;
  likeData: ContentLikeData | null;
  subcollection: PublicSubcollection;
  subcollectionId: string;
  subcollectionSlug: string;
  title: string;
}

export function SubcollectionPageClientWrapper({
  canDelete,
  canEdit,
  children,
  collectionId,
  collectionName,
  collectionSlug,
  isOwner,
  likeData,
  subcollection,
  subcollectionId,
  subcollectionSlug,
  title,
}: SubcollectionPageClientWrapperProps) {
  return (
    <CollectionViewTracker
      collectionId={collectionId}
      collectionSlug={collectionSlug}
      subcollectionId={subcollectionId}
      subcollectionSlug={subcollectionSlug}
    >
      <StickyHeaderWrapper>
        {(isSticky) => (
          <div>
            {/* Sticky Header - shown when scrolling */}
            {isSticky && (
              <SubcollectionStickyHeader
                canDelete={canDelete}
                canEdit={canEdit}
                collectionName={collectionName}
                collectionSlug={collectionSlug}
                isLiked={likeData?.isLiked ?? false}
                isOwner={isOwner}
                likeCount={likeData?.likeCount ?? 0}
                subcollection={subcollection}
                subcollectionId={subcollectionId}
                subcollectionSlug={subcollectionSlug}
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
