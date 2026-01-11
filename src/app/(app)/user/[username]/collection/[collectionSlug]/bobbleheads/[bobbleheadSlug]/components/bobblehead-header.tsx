import 'server-only';
import { CalendarIcon, HeartIcon, ShareIcon } from 'lucide-react';
import { Fragment, Suspense } from 'react';

import type { ContentLikeData } from '@/lib/facades/social/social.facade';
import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';

import { ViewCountAsync } from '@/components/analytics/async/view-count-async';
import { BobbleheadShareMenu } from '@/components/feature/bobblehead/bobblehead-share-menu';
import { ReportButton } from '@/components/feature/content-reports/report-button';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { LikeIconButton } from '@/components/ui/like-button';
import { Skeleton } from '@/components/ui/skeleton';

import { BobbleheadHeaderDelete } from './bobblehead-header-delete';
import { CollectionBreadcrumb } from './collection-breadcrumb';

interface BobbleheadHeaderProps {
  bobblehead: BobbleheadWithRelations;
  collectionSlug: string;
  currentUserId: null | string;
  isOwner?: boolean;
  likeData: ContentLikeData;
  ownerUsername: string;
}

export const BobbleheadHeader = ({
  bobblehead,
  collectionSlug,
  currentUserId,
  isOwner = false,
  likeData,
  ownerUsername,
}: BobbleheadHeaderProps) => {
  return (
    <Fragment>
      {/* Breadcrumb and Actions Row - Aligned */}
      <div className={'mb-6 flex items-center justify-between gap-4'}>
        {/* Collection Breadcrumb - Left Side */}
        <div className={'min-w-0 flex-1'}>
          <CollectionBreadcrumb
            collectionName={bobblehead.collectionName}
            collectionSlug={collectionSlug}
            ownerUsername={ownerUsername}
          />
        </div>

        {/* Action Buttons - Right Side */}
        <div className={'flex shrink-0 items-center gap-2'}>
          {/* Share Menu */}
          <BobbleheadShareMenu
            bobbleheadSlug={bobblehead.slug}
            collectionSlug={collectionSlug}
            ownerUsername={ownerUsername}
          >
            <Button size={'sm'} variant={'outline'}>
              <ShareIcon aria-hidden className={'mr-2 size-4'} />
              Share
            </Button>
          </BobbleheadShareMenu>

          {/* Owner Actions */}
          <Conditional isCondition={isOwner}>
            {/* Delete Bobblehead Button */}
            <BobbleheadHeaderDelete
              bobbleheadId={bobblehead.id}
              collectionSlug={collectionSlug}
              ownerUsername={ownerUsername}
            >
              Delete
            </BobbleheadHeaderDelete>
          </Conditional>

          {/* Non-Owner Actions */}
          <Conditional isCondition={!isOwner && !!currentUserId}>
            <ReportButton targetId={bobblehead.id} targetType={'bobblehead'} variant={'outline'} />
          </Conditional>
        </div>
      </div>

      <div className={'flex flex-col gap-6'}>
        {/* Title and Description */}
        <div>
          <h1 className={'mb-3 text-4xl font-bold text-balance text-primary'}>{bobblehead.name}</h1>
          <p className={'text-lg text-pretty text-muted-foreground'}>{bobblehead.description}</p>
        </div>

        {/* Metadata & Like Button */}
        <div className={'flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground'}>
          {/* Like Button */}
          <Conditional isCondition={!!likeData}>
            <LikeIconButton
              initialLikeCount={likeData?.likeCount ?? bobblehead.likeCount}
              isInitiallyLiked={likeData?.isLiked ?? false}
              targetId={bobblehead.id}
              targetType={'bobblehead'}
            />
          </Conditional>

          {/* Fallback static display if no like data */}
          <Conditional isCondition={!likeData}>
            <div className={'flex items-center gap-2'}>
              <HeartIcon aria-hidden className={'size-4'} />
              {bobblehead.likeCount} likes
            </div>
          </Conditional>

          <div className={'flex items-center gap-4'}>
            {/* Creation Date */}
            <div className={'flex items-center gap-2'}>
              <CalendarIcon aria-hidden className={'size-4'} />
              {/*Added {bobblehead.createdAt.toLocaleDateString()}*/}
            </div>

            {/* View Count */}
            <div className={'flex items-center gap-2'}>
              <span className={'text-sm font-medium'}>
                <Suspense fallback={<Skeleton className={'h-4 w-16'} />}>
                  <ViewCountAsync targetId={bobblehead.id} targetType={'bobblehead'} />
                </Suspense>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
