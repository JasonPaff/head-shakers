'use client';

import { ArrowLeftIcon, MessageCircleIcon, ShareIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';

import { BobbleheadHeaderDelete } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-header-delete';
import { BobbleheadShareMenu } from '@/components/feature/bobblehead/bobblehead-share-menu';
import { ReportButton } from '@/components/feature/content-reports/report-button';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { LikeCompactButton } from '@/components/ui/like-button';

interface BobbleheadStickyHeaderProps {
  bobblehead: BobbleheadWithRelations;
  canDelete: boolean;
  collectionName: string;
  collectionSlug: string;
  commentCount: number;
  isLiked: boolean;
  isOwner: boolean;
  likeCount: number;
  thumbnailUrl?: null | string;
  title: string;
}

export const BobbleheadStickyHeader = ({
  bobblehead,
  canDelete,
  collectionName,
  collectionSlug,
  commentCount,
  isLiked,
  isOwner,
  likeCount,
  thumbnailUrl,
  title,
}: BobbleheadStickyHeaderProps) => {
  const handleCommentsClick = () => {
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(() => {
        const commentInput = document.getElementById('comment-input');
        if (commentInput) {
          commentInput.focus();
        }
      }, 500);
    }
  };

  // derived variables
  const _hasThumbnail = !!thumbnailUrl;

  return (
    <Fragment>
      <header
        aria-label={'Bobblehead sticky header'}
        className={
          'sticky top-16 z-40 border-b bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-reduce:transition-none'
        }
        role={'region'}
      >
        <div className={'container mx-auto px-3 py-2 md:px-4 md:py-3 lg:px-6'}>
          <div className={'flex items-center justify-between gap-2 md:gap-3 lg:gap-4'}>
            {/* Breadcrumb & Title */}
            <div className={'flex min-w-0 flex-1 items-center gap-1.5 md:gap-2'}>
              {/* Parent Collection Link */}
              <Link
                aria-label={`Back to ${collectionName} collection`}
                className={
                  'flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground md:text-sm'
                }
                href={$path({
                  route: '/collections/[collectionSlug]',
                  routeParams: { collectionSlug },
                })}
              >
                <ArrowLeftIcon aria-hidden className={'size-3'} />
                <span className={'hidden truncate sm:inline'}>{collectionName}</span>
              </Link>

              {/* Separator */}
              <span className={'hidden text-muted-foreground sm:inline'}>{'/'}</span>

              {/* Thumbnail & Title */}
              <div className={'flex min-w-0 flex-1 items-center gap-1.5 md:gap-2'}>
                {/* Optional Thumbnail */}
                <Conditional isCondition={_hasThumbnail}>
                  <div className={'size-6 flex-shrink-0 overflow-hidden rounded-sm bg-muted md:size-8'}>
                    <img
                      alt={''}
                      className={'size-full object-cover'}
                      loading={'lazy'}
                      src={thumbnailUrl as string}
                    />
                  </div>
                </Conditional>

                {/* Bobblehead Title */}
                <h2 className={'min-w-0 flex-1 truncate text-base font-semibold md:text-lg'}>{title}</h2>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={'flex flex-shrink-0 items-center gap-1.5 md:gap-2'}>
              {/* Like Button */}
              <LikeCompactButton
                initialLikeCount={likeCount ?? 0}
                isInitiallyLiked={isLiked}
                targetId={bobblehead.id}
                targetType={'bobblehead'}
              />

              {/* Comments Button */}
              <Button
                aria-label={`${commentCount} comments. View comments`}
                className={'gap-1.5 text-muted-foreground hover:text-foreground'}
                onClick={handleCommentsClick}
                size={'sm'}
                variant={'ghost'}
              >
                <MessageCircleIcon aria-hidden className={'size-4'} />
                <span className={'text-sm'}>{commentCount}</span>
              </Button>

              {/* Share Menu */}
              <BobbleheadShareMenu bobbleheadSlug={bobblehead.slug}>
                <Button aria-label={'Share bobblehead'} size={'icon'} variant={'ghost'}>
                  <ShareIcon aria-hidden className={'size-4'} />
                </Button>
              </BobbleheadShareMenu>

              {/* Owner Actions */}
              <Conditional isCondition={isOwner}>
                {/* Delete Button */}
                <Conditional isCondition={canDelete}>
                  <BobbleheadHeaderDelete
                    bobbleheadId={bobblehead.id}
                    collectionSlug={collectionSlug}
                    size={'icon'}
                    variant={'ghost'}
                  />
                </Conditional>
              </Conditional>

              {/* Non-Owner Report Button */}
              <Conditional isCondition={!isOwner}>
                <ReportButton targetId={bobblehead.id} targetType={'bobblehead'} variant={'ghost'} />
              </Conditional>
            </div>
          </div>
        </div>
      </header>
    </Fragment>
  );
};
