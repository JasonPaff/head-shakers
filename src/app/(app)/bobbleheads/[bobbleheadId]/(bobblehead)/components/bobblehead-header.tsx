import 'server-only';
import { ArrowLeftIcon, CalendarIcon, EditIcon, EyeIcon, HeartIcon, ShareIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import type { ContentLikeData } from '@/lib/facades/social/social.facade';
import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';

import { BobbleheadHeaderDelete } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-header-delete';
import { BobbleheadShareMenu } from '@/components/feature/bobblehead/bobblehead-share-menu';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { LikeIconButton } from '@/components/ui/like-button';

interface BobbleheadHeaderProps {
  bobblehead: BobbleheadWithRelations;
  isOwner?: boolean;
  likeData: ContentLikeData;
}

export const BobbleheadHeader = ({ bobblehead, isOwner = false, likeData }: BobbleheadHeaderProps) => {
  const _hasSubcollection = !!bobblehead.subcollectionId && !!bobblehead.subcollectionName;
  const _backButtonLabel =
    (_hasSubcollection ? bobblehead.subcollectionName : bobblehead.collectionName) ?? 'Parent';

  return (
    <Fragment>
      {/* Navigation and Actions Row */}
      <div className={'mb-6 flex items-center justify-between gap-4'}>
        {/* Back Button */}
        <Button asChild size={'sm'} variant={'outline'}>
          <Link
            href={
              _hasSubcollection ?
                $path({
                  route: '/collections/[collectionId]/subcollection/[subcollectionId]',
                  routeParams: {
                    collectionId: bobblehead.collectionId,
                    subcollectionId: bobblehead.subcollectionId!,
                  },
                })
              : $path({
                  route: '/collections/[collectionId]',
                  routeParams: { collectionId: bobblehead.collectionId },
                })
            }
          >
            <ArrowLeftIcon aria-hidden className={'mr-2 size-4'} />
            View {_backButtonLabel}
          </Link>
        </Button>

        {/* Action Buttons */}
        <Conditional isCondition={isOwner}>
          <div className={'flex items-center gap-2'}>
            {/* Share Bobblehead Menu */}
            <BobbleheadShareMenu>
              <Button size={'sm'} variant={'outline'}>
                <ShareIcon aria-hidden className={'mr-2 size-4'} />
                Share
              </Button>
            </BobbleheadShareMenu>

            {/* Edit Bobblehead Button */}
            <Button size={'sm'} variant={'outline'}>
              <EditIcon aria-hidden className={'mr-2 size-4'} />
              Edit
            </Button>

            {/* Delete Bobblehead Button */}
            <BobbleheadHeaderDelete
              bobbleheadId={bobblehead.id}
              collectionId={bobblehead.collectionId}
              subcollectionId={bobblehead.subcollectionId}
            >
              Delete
            </BobbleheadHeaderDelete>
          </div>
        </Conditional>
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
              <EyeIcon aria-hidden className={'size-4'} />
              {bobblehead.viewCount} views
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
