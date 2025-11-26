'use client';

import { PencilIcon, ShareIcon } from 'lucide-react';
import { Fragment } from 'react';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionDelete } from '@/components/feature/collections/collection-delete';
import { CollectionEditDialog } from '@/components/feature/collections/collection-edit-dialog';
import { CollectionShareMenu } from '@/components/feature/collections/collection-share-menu';
import { ReportButton } from '@/components/feature/content-reports/report-button';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { LikeCompactButton } from '@/components/ui/like-button';
import { useToggle } from '@/hooks/use-toggle';

interface CollectionStickyHeaderProps {
  canDelete: boolean;
  canEdit: boolean;
  collection?: PublicCollection;
  collectionId: string;
  collectionSlug: string;
  isLiked: boolean;
  isOwner: boolean;
  likeCount: number;
  title: string;
}

export const CollectionStickyHeader = ({
  canDelete,
  canEdit,
  collection,
  collectionId,
  collectionSlug,
  isLiked,
  isOwner,
  likeCount,
  title,
}: CollectionStickyHeaderProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useToggle();

  const handleEditClick = () => {
    setIsEditDialogOpen.on();
  };

  return (
    <Fragment>
      <header
        aria-label={'Collection sticky header'}
        className={
          'sticky top-16 z-40 border-b bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-reduce:transition-none'
        }
        role={'region'}
      >
        <div className={'container mx-auto px-3 py-2 md:px-4 md:py-3 lg:px-6'}>
          <div className={'flex items-center justify-between gap-2 md:gap-3 lg:gap-4'}>
            {/* Collection Title */}
            <h2 className={'min-w-0 flex-1 truncate text-base font-semibold md:text-lg'}>{title}</h2>

            {/* Action Buttons */}
            <div className={'flex flex-shrink-0 items-center gap-1.5 md:gap-2'}>
              {/* Like Button */}
              <LikeCompactButton
                initialLikeCount={likeCount ?? 0}
                isInitiallyLiked={isLiked}
                targetId={collectionId}
                targetType={'collection'}
              />

              {/* Share Menu */}
              <CollectionShareMenu collectionSlug={collectionSlug}>
                <Button aria-label={'Share collection'} size={'icon'} variant={'ghost'}>
                  <ShareIcon aria-hidden className={'size-4'} />
                </Button>
              </CollectionShareMenu>

              {/* Owner Actions */}
              <Conditional isCondition={isOwner}>
                <Fragment>
                  {/* Edit Button */}
                  <Conditional isCondition={canEdit}>
                    <Button
                      aria-label={'Edit collection'}
                      onClick={handleEditClick}
                      size={'icon'}
                      variant={'ghost'}
                    >
                      <PencilIcon aria-hidden className={'size-4'} />
                    </Button>
                  </Conditional>

                  {/* Delete Button */}
                  <Conditional isCondition={canDelete}>
                    <CollectionDelete
                      collectionId={collectionId}
                      collectionName={title}
                      size={'icon'}
                      variant={'ghost'}
                    />
                  </Conditional>
                </Fragment>
              </Conditional>

              {/* Non-Owner Report Button */}
              <Conditional isCondition={!isOwner}>
                <ReportButton targetId={collectionId} targetType={'collection'} variant={'ghost'} />
              </Conditional>
            </div>
          </div>
        </div>
      </header>

      {/* Edit Dialog */}
      {isEditDialogOpen && collection && (
        <CollectionEditDialog
          collection={collection}
          isOpen={isEditDialogOpen}
          onClose={setIsEditDialogOpen.off}
        />
      )}
    </Fragment>
  );
};
