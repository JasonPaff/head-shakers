'use client';

import { ArrowLeftIcon, PencilIcon, ShareIcon, TrashIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';
import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';

import { BobbleheadHeaderDelete } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-header-delete';
import { BobbleheadEditDialog } from '@/components/feature/bobblehead/bobblehead-edit-dialog';
import { BobbleheadShareMenu } from '@/components/feature/bobblehead/bobblehead-share-menu';
import { ReportButton } from '@/components/feature/content-reports/report-button';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { LikeCompactButton } from '@/components/ui/like-button';
import { useToggle } from '@/hooks/use-toggle';

interface BobbleheadStickyHeaderProps {
  bobblehead: BobbleheadWithRelations;
  canDelete: boolean;
  canEdit: boolean;
  collectionName: string;
  collections: Array<ComboboxItem>;
  collectionSlug: string;
  isLiked: boolean;
  isOwner: boolean;
  likeCount: number;
  subcollectionName?: null | string;
  subcollectionSlug?: null | string;
  thumbnailUrl?: null | string;
  title: string;
}

export const BobbleheadStickyHeader = ({
  bobblehead,
  canDelete,
  canEdit,
  collectionName,
  collections,
  collectionSlug,
  isLiked,
  isOwner,
  likeCount,
  subcollectionName,
  subcollectionSlug,
  thumbnailUrl,
  title,
}: BobbleheadStickyHeaderProps) => {
  // useState hooks
  const [isEditDialogOpen, setIsEditDialogOpen] = useToggle();

  // event handlers
  const handleEditClick = () => {
    setIsEditDialogOpen.on();
  };

  // derived variables
  const _hasSubcollection = !!subcollectionName && !!subcollectionSlug;
  const _hasThumbnail = !!thumbnailUrl;

  return (
    <Fragment>
      <header
        aria-label={'Bobblehead sticky header'}
        className={
          'sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-reduce:transition-none'
        }
        role={'banner'}
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

              {/* Subcollection Link (if exists) */}
              <Conditional isCondition={_hasSubcollection}>
                <Fragment>
                  {/* Separator */}
                  <span className={'hidden text-muted-foreground sm:inline'}>{'/'}</span>

                  {/* Subcollection Link */}
                  <Link
                    aria-label={`Back to ${subcollectionName} subcollection`}
                    className={
                      'hidden items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground sm:flex md:text-sm'
                    }
                    href={$path({
                      route: '/collections/[collectionSlug]/subcollection/[subcollectionSlug]',
                      routeParams: { collectionSlug, subcollectionSlug: subcollectionSlug as string },
                    })}
                  >
                    <span className={'truncate'}>{subcollectionName}</span>
                  </Link>
                </Fragment>
              </Conditional>

              {/* Separator */}
              <span className={'hidden text-muted-foreground sm:inline'}>{'/'}</span>

              {/* Thumbnail & Title */}
              <div className={'flex min-w-0 flex-1 items-center gap-1.5 md:gap-2'}>
                {/* Optional Thumbnail */}
                <Conditional isCondition={_hasThumbnail}>
                  <div className={'size-6 flex-shrink-0 overflow-hidden rounded-md bg-muted md:size-8'}>
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

              {/* Share Menu */}
              <BobbleheadShareMenu bobbleheadSlug={bobblehead.slug}>
                <Button aria-label={'Share bobblehead'} size={'icon'} variant={'ghost'}>
                  <ShareIcon aria-hidden className={'size-4'} />
                </Button>
              </BobbleheadShareMenu>

              {/* Owner Actions */}
              <Conditional isCondition={isOwner}>
                <Fragment>
                  {/* Edit Button */}
                  <Conditional isCondition={canEdit}>
                    <Button
                      aria-label={'Edit bobblehead'}
                      onClick={handleEditClick}
                      size={'icon'}
                      variant={'ghost'}
                    >
                      <PencilIcon aria-hidden className={'size-4'} />
                    </Button>
                  </Conditional>

                  {/* Delete Button */}
                  <Conditional isCondition={canDelete}>
                    <BobbleheadHeaderDelete
                      bobbleheadId={bobblehead.id}
                      collectionSlug={collectionSlug}
                      size={'icon'}
                      subcollectionSlug={subcollectionSlug}
                      variant={'ghost'}
                    >
                      <TrashIcon aria-hidden className={'size-4'} />
                    </BobbleheadHeaderDelete>
                  </Conditional>
                </Fragment>
              </Conditional>

              {/* Non-Owner Report Button */}
              <Conditional isCondition={!isOwner}>
                <ReportButton targetId={bobblehead.id} targetType={'bobblehead'} variant={'ghost'} />
              </Conditional>
            </div>
          </div>
        </div>
      </header>

      {/* Edit Dialog */}
      <Conditional isCondition={isEditDialogOpen}>
        <BobbleheadEditDialog
          bobblehead={bobblehead}
          collections={collections}
          isOpen={isEditDialogOpen}
          onClose={setIsEditDialogOpen.off}
        />
      </Conditional>
    </Fragment>
  );
};
