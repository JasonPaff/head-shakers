'use client';

import { CalendarIcon, EyeIcon, PackageIcon, PencilIcon, ShareIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { Fragment, useMemo } from 'react';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';
import type { ContentLikeData } from '@/lib/facades/social/social.facade';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { CollectionDelete } from '@/components/feature/collections/collection-delete';
import { CollectionShareMenu } from '@/components/feature/collections/collection-share-menu';
import { CollectionUpsertDialog } from '@/components/feature/collections/collection-upsert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { LikeIconButton } from '@/components/ui/like-button';
import { useToggle } from '@/hooks/use-toggle';
import { generateTestId } from '@/lib/test-ids';

interface CollectionHeaderProps extends ComponentTestIdProps {
  collection: NonNullable<PublicCollection>;
  isOwner?: boolean;
  likeData: ContentLikeData;
  user: {
    avatarUrl: null | string;
    username: string;
  };
  viewCount?: number;
}

export const CollectionHeader = ({
  collection,
  isOwner = false,
  likeData,
  testId,
  user,
  viewCount = 0,
}: CollectionHeaderProps) => {
  // 1. useState hooks
  const [isEditDialogOpen, setIsEditDialogOpen] = useToggle();

  // 3. useMemo hooks
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(collection.lastUpdatedAt));
  }, [collection.lastUpdatedAt]);

  // 5. Utility functions
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const headerTestId = testId || generateTestId('feature', 'collection-card');

  return (
    <div className={'mb-8'} data-slot={'collection-header'} data-testid={headerTestId}>
      {/* Cover Image */}
      <Conditional isCondition={!!collection.coverImageUrl}>
        <div
          className={'relative mb-6 h-40 overflow-hidden rounded-xl sm:h-56 lg:h-64'}
          data-slot={'cover-image'}
          data-testid={`${headerTestId}-cover-image`}
        >
          <CldImage
            alt={`${collection.name} cover`}
            className={'h-full w-full object-cover'}
            height={256}
            src={collection.coverImageUrl || 'placeholder'}
            width={1024}
          />
          <div className={'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent'} />
        </div>
      </Conditional>

      {/* Header Content */}
      <div
        className={'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'}
        data-slot={'content'}
        data-testid={`${headerTestId}-content`}
      >
        <div className={'flex-1'}>
          {/* Collection Title */}
          <h1
            className={'mb-2 text-2xl font-bold sm:text-3xl'}
            data-slot={'title'}
            data-testid={`${headerTestId}-title`}
          >
            {collection.name}
          </h1>

          {/* Collector Byline */}
          <div className={'mb-3 flex items-center gap-2'}>
            <Avatar className={'size-6'}>
              <AvatarImage alt={user.username} src={user.avatarUrl ?? undefined} />
              <AvatarFallback className={'text-xs'}>{getInitials(user.username)}</AvatarFallback>
            </Avatar>
            <span className={'text-sm text-muted-foreground'}>
              by <span className={'font-medium text-foreground'}>{user.username}</span>
            </span>
          </div>

          {/* Description */}
          <Conditional isCondition={!!collection.description}>
            <p
              className={'mb-4 max-w-2xl text-muted-foreground'}
              data-slot={'description'}
              data-testid={`${headerTestId}-description`}
            >
              {collection.description}
            </p>
          </Conditional>

          {/* Stats */}
          <div
            className={'flex flex-wrap items-center gap-4 text-sm text-muted-foreground'}
            data-slot={'stats'}
            data-testid={`${headerTestId}-stats`}
          >
            <span className={'flex items-center gap-1.5'} data-testid={`${headerTestId}-stats-items`}>
              <PackageIcon aria-hidden className={'size-4'} />
              {collection.totalBobbleheadCount} items
            </span>
            <span className={'flex items-center gap-1.5'} data-testid={`${headerTestId}-stats-views`}>
              <EyeIcon aria-hidden className={'size-4'} />
              {viewCount.toLocaleString()} views
            </span>
            <span className={'flex items-center gap-1.5'} data-testid={`${headerTestId}-stats-updated`}>
              <CalendarIcon aria-hidden className={'size-4'} />
              Updated {formattedDate}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div
          className={'flex items-center gap-2 sm:shrink-0'}
          data-slot={'actions'}
          data-testid={`${headerTestId}-actions`}
        >
          {/* Like Button */}
          <LikeIconButton
            initialLikeCount={likeData.likeCount}
            isInitiallyLiked={likeData.isLiked}
            targetId={collection.id}
            targetType={'collection'}
            testId={`${headerTestId}-like-button`}
          />

          {/* Share Menu */}
          <CollectionShareMenu collectionSlug={collection.slug} username={user.username}>
            <Button size={'icon'} testId={`${headerTestId}-share-button`} variant={'outline'}>
              <ShareIcon aria-hidden className={'size-4'} />
              <span className={'sr-only'}>Share collection</span>
            </Button>
          </CollectionShareMenu>

          {/* Owner Actions */}
          <Conditional isCondition={isOwner}>
            <Fragment>
              {/* Edit Collection Button */}
              <Button
                onClick={setIsEditDialogOpen.on}
                size={'sm'}
                testId={`${headerTestId}-edit-button`}
                variant={'outline'}
              >
                <PencilIcon aria-hidden className={'mr-2 size-4'} />
                Edit
              </Button>

              {/* Delete Collection Button */}
              <CollectionDelete
                collectionId={collection.id}
                collectionName={collection.name}
                testId={`${headerTestId}-delete-button`}
              >
                Delete
              </CollectionDelete>

              {/* Edit Dialog */}
              <Conditional isCondition={isEditDialogOpen}>
                <CollectionUpsertDialog
                  collection={collection}
                  isOpen={isEditDialogOpen}
                  onClose={setIsEditDialogOpen.off}
                />
              </Conditional>
            </Fragment>
          </Conditional>
        </div>
      </div>
    </div>
  );
};
