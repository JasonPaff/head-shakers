'use client';

import type { ReactNode } from 'react';

import type { ContentLikeData } from '@/lib/facades/social/social.facade';
import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';

import { BobbleheadViewTracker } from '@/components/analytics/bobblehead-view-tracker';
import { BobbleheadStickyHeader } from '@/components/feature/bobblehead/bobblehead-sticky-header';
import { StickyHeaderWrapper } from '@/components/feature/sticky-header/sticky-header-wrapper';
import { LikeProvider } from '@/components/ui/form/focus-management/like-context';

interface BobbleheadPageClientWrapperProps {
  bobblehead: BobbleheadWithRelations;
  bobbleheadId: string;
  bobbleheadSlug: string;
  children: ReactNode;
  collectionId: string;
  collectionSlug: string;
  isOwner: boolean;
  likeData: ContentLikeData | null;
  ownerUsername: string;
}

export function BobbleheadPageClientWrapper({
  bobblehead,
  bobbleheadId,
  bobbleheadSlug,
  children,
  collectionId,
  collectionSlug,
  isOwner,
  likeData,
  ownerUsername,
}: BobbleheadPageClientWrapperProps) {
  return (
    <LikeProvider
      initialLikeCount={likeData?.likeCount ?? 0}
      isInitiallyLiked={likeData?.isLiked ?? false}
      targetId={bobbleheadId}
      targetType={'bobblehead'}
    >
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
                  collectionName={bobblehead.collectionName || ''}
                  collectionSlug={collectionSlug}
                  commentCount={bobblehead.commentCount ?? 0}
                  isOwner={isOwner}
                  thumbnailUrl={bobblehead.photos?.[0]?.url}
                  title={bobblehead.name}
                  username={ownerUsername}
                />
              )}

              {/* Page content passed from server */}
              {children}
            </div>
          )}
        </StickyHeaderWrapper>
      </BobbleheadViewTracker>
    </LikeProvider>
  );
}
