import 'server-only';
import { ArrowLeftIcon, CalendarIcon, EditIcon, EyeIcon, HeartIcon, ShareIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';

import { BobbleheadLikeButton } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-like-button';
import { BobbleheadDelete } from '@/components/feature/bobblehead/bobblehead-delete';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';

interface BobbleheadHeaderProps {
  bobblehead: BobbleheadWithRelations;
  isOwner?: boolean;
  likeData?: {
    isLiked: boolean;
    likeCount: number;
    likeId: null | string;
  };
}

export const BobbleheadHeader = ({ bobblehead, isOwner = false, likeData }: BobbleheadHeaderProps) => {
  const _hasSubcollection = !!bobblehead.subcollectionId && !!bobblehead.subcollectionName;
  const _backButtonLabel =
    (_hasSubcollection ? bobblehead.subcollectionName : bobblehead.collectionName) ?? 'Parent';

  return (
    <Fragment>
      {/* Navigation and Actions Row */}
      <div className={'mb-6 flex items-center justify-between'}>
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
          <div className={'flex gap-2'}>
            <Button size={'sm'} variant={'outline'}>
              <EditIcon aria-hidden className={'mr-2 size-4'} />
              Edit
            </Button>
            <Button size={'sm'} variant={'outline'}>
              <ShareIcon aria-hidden className={'mr-2 size-4'} />
              Share
            </Button>

            {/* Delete Bobblehead Button */}
            <BobbleheadDelete
              bobbleheadId={bobblehead.id}
              collectionId={bobblehead.collectionId}
              subcollectionId={bobblehead.subcollectionId}
            >
              Delete
            </BobbleheadDelete>
          </div>
        </Conditional>
      </div>

      {/* Bobblehead Info */}
      <div className={'flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'}>
        <div className={'flex-1'}>
          <h1 className={'mb-3 text-4xl font-bold text-balance text-primary'}>{bobblehead.name}</h1>
          <p className={'max-w-3xl text-lg text-pretty text-muted-foreground'}>{bobblehead.description}</p>
        </div>

        {/* Metadata */}
        <div className={'flex flex-wrap items-center gap-4 text-sm text-muted-foreground'}>
          <div className={'flex items-center gap-2'}>
            <CalendarIcon aria-hidden className={'size-4'} />
            Added {bobblehead.createdAt.toLocaleDateString()}
          </div>
          <div className={'flex items-center gap-2'}>
            <EyeIcon aria-hidden className={'size-4'} />
            {bobblehead.viewCount} views
          </div>
          {/* Interactive Like Button */}
          <Conditional isCondition={!!likeData}>
            <BobbleheadLikeButton
              bobbleheadId={bobblehead.id}
              initialLikeCount={likeData?.likeCount ?? bobblehead.likeCount}
              isInitiallyLiked={likeData?.isLiked ?? false}
            />
          </Conditional>
          {/* Fallback static display if no like data */}
          <Conditional isCondition={!likeData}>
            <div className={'flex items-center gap-2'}>
              <HeartIcon aria-hidden className={'size-4'} />
              {bobblehead.likeCount} likes
            </div>
          </Conditional>
        </div>
      </div>
    </Fragment>
  );
};
