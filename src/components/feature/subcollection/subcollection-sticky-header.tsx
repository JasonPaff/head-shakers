'use client';

import { ArrowLeftIcon, PencilIcon, ShareIcon, TrashIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import type { PublicSubcollection } from '@/lib/facades/collections/subcollections.facade';

import { ReportButton } from '@/components/feature/content-reports/report-button';
import { SubcollectionDelete } from '@/components/feature/subcollections/subcollection-delete';
import { SubcollectionEditDialog } from '@/components/feature/subcollections/subcollection-edit-dialog';
import { SubcollectionShareMenu } from '@/components/feature/subcollections/subcollection-share-menu';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { LikeCompactButton } from '@/components/ui/like-button';
import { useToggle } from '@/hooks/use-toggle';

interface SubcollectionStickyHeaderProps {
  canDelete: boolean;
  canEdit: boolean;
  collectionName: string;
  collectionSlug: string;
  isLiked: boolean;
  isOwner: boolean;
  likeCount: number;
  subcollection?: PublicSubcollection;
  subcollectionId: string;
  subcollectionSlug: string;
  title: string;
}

export const SubcollectionStickyHeader = ({
  canDelete,
  canEdit,
  collectionName,
  collectionSlug,
  isLiked,
  isOwner,
  likeCount,
  subcollection,
  subcollectionId,
  subcollectionSlug,
  title,
}: SubcollectionStickyHeaderProps) => {
  // useState hooks
  const [isEditDialogOpen, setIsEditDialogOpen] = useToggle();

  // Event handlers
  const handleEditClick = () => {
    setIsEditDialogOpen.on();
  };

  return (
    <Fragment>
      <header
        aria-label={'Subcollection sticky header'}
        className={
          'sticky top-16 z-40 border-b bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-reduce:transition-none'
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

              {/* Separator */}
              <span className={'hidden text-muted-foreground sm:inline'}>{'/'}</span>

              {/* Subcollection Title */}
              <h2 className={'min-w-0 flex-1 truncate text-base font-semibold md:text-lg'}>{title}</h2>
            </div>

            {/* Action Buttons */}
            <div className={'flex flex-shrink-0 items-center gap-1.5 md:gap-2'}>
              {/* Like Button */}
              <LikeCompactButton
                initialLikeCount={likeCount ?? 0}
                isInitiallyLiked={isLiked}
                targetId={subcollectionId}
                targetType={'subcollection'}
              />

              {/* Share Menu */}
              <SubcollectionShareMenu collectionSlug={collectionSlug} subcollectionSlug={subcollectionSlug}>
                <Button aria-label={'Share subcollection'} size={'icon'} variant={'ghost'}>
                  <ShareIcon aria-hidden className={'size-4'} />
                </Button>
              </SubcollectionShareMenu>

              {/* Owner Actions */}
              <Conditional isCondition={isOwner}>
                <Fragment>
                  {/* Edit Button */}
                  <Conditional isCondition={canEdit}>
                    <Button
                      aria-label={'Edit subcollection'}
                      onClick={handleEditClick}
                      size={'icon'}
                      variant={'ghost'}
                    >
                      <PencilIcon aria-hidden className={'size-4'} />
                    </Button>
                  </Conditional>

                  {/* Delete Button */}
                  <Conditional isCondition={canDelete}>
                    <SubcollectionDelete size={'icon'} subcollectionId={subcollectionId} variant={'ghost'}>
                      <TrashIcon aria-hidden className={'size-4'} />
                    </SubcollectionDelete>
                  </Conditional>
                </Fragment>
              </Conditional>

              {/* Non-Owner Report Button */}
              <Conditional isCondition={!isOwner}>
                <ReportButton targetId={subcollectionId} targetType={'subcollection'} variant={'ghost'} />
              </Conditional>
            </div>
          </div>
        </div>
      </header>

      {/* Edit Dialog */}
      <Conditional isCondition={isEditDialogOpen && !!subcollection}>
        <SubcollectionEditDialog
          isOpen={isEditDialogOpen}
          onClose={setIsEditDialogOpen.off}
          subcollection={subcollection!}
        />
      </Conditional>
    </Fragment>
  );
};
