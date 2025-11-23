'use client';

import type { ReactNode } from 'react';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';
import type { ContentLikeData } from '@/lib/facades/social/social.facade';
import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';

import { BobbleheadViewTracker } from '@/components/analytics/bobblehead-view-tracker';
import { BobbleheadStickyHeader } from '@/components/feature/bobblehead/bobblehead-sticky-header';
import { StickyHeaderWrapper } from '@/components/feature/sticky-header/sticky-header-wrapper';

interface BobbleheadPageClientWrapperProps {
  bobblehead: BobbleheadWithRelations;
  bobbleheadId: string;
  bobbleheadSlug: string;
  canDelete: boolean;
  canEdit: boolean;
  children: ReactNode;
  collectionId?: string;
  collections: Array<ComboboxItem>;
  isOwner: boolean;
  likeData: ContentLikeData | null;
}

export function BobbleheadPageClientWrapper({
  bobblehead,
  bobbleheadId,
  bobbleheadSlug,
  canDelete,
  canEdit,
  children,
  collectionId,
  collections,
  isOwner,
  likeData,
}: BobbleheadPageClientWrapperProps) {
  return (
    <BobbleheadViewTracker
      bobbleheadId={bobbleheadId}
      bobbleheadSlug={bobbleheadSlug}
      collectionId={collectionId}
    >
      <StickyHeaderWrapper>
        {(isSticky) => (
          <div>
            {/* Sticky Header - shown when scrolling */}
            {isSticky && (
              <BobbleheadStickyHeader
                bobblehead={bobblehead}
                canDelete={canDelete}
                canEdit={canEdit}
                collectionName={bobblehead.collectionName || ''}
                collections={collections}
                collectionSlug={bobblehead.collectionSlug || ''}
                commentCount={bobblehead.commentCount ?? 0}
                isLiked={likeData?.isLiked ?? false}
                isOwner={isOwner}
                likeCount={likeData?.likeCount ?? 0}
                subcollectionName={bobblehead.subcollectionName}
                subcollectionSlug={bobblehead.subcollectionSlug}
                thumbnailUrl={bobblehead.photos?.[0]?.url}
                title={bobblehead.name}
              />
            )}

            {/* Page content passed from server */}
            {children}
          </div>
        )}
      </StickyHeaderWrapper>
    </BobbleheadViewTracker>
  );
}
