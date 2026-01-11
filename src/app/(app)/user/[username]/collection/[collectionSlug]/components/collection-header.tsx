'use client';

import type { ComponentProps } from 'react';

import * as Sentry from '@sentry/nextjs';
import {
  CalendarIcon,
  EyeIcon,
  FacebookIcon,
  HeartIcon,
  LinkIcon,
  PackageIcon,
  ShareIcon,
  TwitterIcon,
} from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLike } from '@/hooks/use-like';
import { SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS } from '@/lib/constants';
import { generateTestId } from '@/lib/test-ids';
import { formatShortDate } from '@/lib/utils/date.utils';
import { cn } from '@/utils/tailwind-utils';

import type { CollectionViewData, CollectorData } from '../types';

type CollectionHeaderProps = ComponentProps<'div'> & {
  /** Collection metadata */
  collection: CollectionViewData;
  /** Collector profile */
  collector: CollectorData;
  /** Initial like count for optimistic updates */
  initialLikeCount: number;
  /** Initial like status for optimistic updates */
  isInitiallyLiked: boolean;
};

export const CollectionHeader = ({
  className,
  collection,
  collector,
  initialLikeCount,
  isInitiallyLiked,
  ...props
}: CollectionHeaderProps) => {
  // 1. Other hooks (useLike wraps useState internally)
  const { isLiked, isPending, likeCount, toggleLike } = useLike({
    initialLikeCount,
    isInitiallyLiked,
    targetId: collection.collectionId,
    targetType: 'collection',
  });

  // 3. useMemo hooks
  const formattedDate = useMemo(() => {
    return formatShortDate(collection.lastUpdatedAt) ?? 'N/A';
  }, [collection.lastUpdatedAt]);

  // 5. Utility functions
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // 6. Event handlers (prefixed with 'handle')
  const handleLikeClick = useCallback(() => {
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.USER_INTERACTION,
      data: {
        action: 'like-toggle',
        collectionId: collection.collectionId,
        component: 'collection-header',
        isCurrentlyLiked: isLiked,
      },
      level: SENTRY_LEVELS.INFO,
      message: `User ${isLiked ? 'unliking' : 'liking'} collection`,
    });
    toggleLike();
  }, [collection.collectionId, isLiked, toggleLike]);

  const handleCopyLink = useCallback(() => {
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.USER_INTERACTION,
      data: {
        action: 'copy-link',
        collectionId: collection.collectionId,
        component: 'collection-header',
      },
      level: SENTRY_LEVELS.DEBUG,
      message: 'User copying collection link',
    });
    void navigator.clipboard.writeText(window.location.href);
  }, [collection.collectionId]);

  const handleShareTwitter = useCallback(() => {
    const shareText = `Check out this amazing bobblehead collection: ${collection.name}`;
    const shareUrl = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  }, [collection.name]);

  const handleShareFacebook = useCallback(() => {
    const shareUrl = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  }, []);

  // 7. Derived variables for conditional rendering (prefixed with '_')
  const _collectorDisplayName = collector.displayName || collector.username;
  const _hasCoverImage = Boolean(collection.coverImageUrl);
  const _hasDescription = Boolean(collection.description);
  const _isLikeDisabled = isPending;

  const headerTestId = generateTestId('feature', 'collection-header');

  return (
    <div
      className={cn('mb-8', className)}
      data-slot={'collection-header'}
      data-testid={headerTestId}
      {...props}
    >
      {/* Cover Image */}
      <Conditional isCondition={_hasCoverImage}>
        <div
          className={'relative mb-6 h-40 overflow-hidden rounded-xl sm:h-56 lg:h-64'}
          data-slot={'collection-header-cover'}
          data-testid={`${headerTestId}-cover`}
        >
          <img
            alt={`${collection.name} cover`}
            className={'h-full w-full object-cover'}
            src={collection.coverImageUrl!}
          />
          <div className={'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent'} />
        </div>
      </Conditional>

      {/* Header Content */}
      <div className={'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'}>
        <div className={'flex-1'}>
          {/* Collection Title */}
          <h1
            className={'mb-2 text-2xl font-bold sm:text-3xl'}
            data-slot={'collection-header-title'}
            data-testid={`${headerTestId}-title`}
          >
            {collection.name}
          </h1>

          {/* Collector Byline */}
          <div
            className={'mb-3 flex items-center gap-2'}
            data-slot={'collection-header-byline'}
            data-testid={`${headerTestId}-byline`}
          >
            <Avatar className={'size-6'}>
              <AvatarImage alt={_collectorDisplayName} src={collector.avatarUrl ?? undefined} />
              <AvatarFallback className={'text-xs'}>{getInitials(_collectorDisplayName)}</AvatarFallback>
            </Avatar>
            <span className={'text-sm text-muted-foreground'}>
              by{' '}
              <span className={'font-medium text-foreground'} data-testid={`${headerTestId}-collector-name`}>
                {_collectorDisplayName}
              </span>
            </span>
          </div>

          {/* Description */}
          <Conditional isCondition={_hasDescription}>
            <p
              className={'mb-4 max-w-2xl text-muted-foreground'}
              data-slot={'collection-header-description'}
              data-testid={`${headerTestId}-description`}
            >
              {collection.description}
            </p>
          </Conditional>

          {/* Stats */}
          <div
            className={'flex flex-wrap items-center gap-4 text-sm text-muted-foreground'}
            data-slot={'collection-header-stats'}
            data-testid={`${headerTestId}-stats`}
          >
            <span className={'flex items-center gap-1.5'} data-testid={`${headerTestId}-item-count`}>
              <PackageIcon aria-hidden className={'size-4'} />
              {collection.totalBobbleheadCount} items
            </span>
            <span className={'flex items-center gap-1.5'} data-testid={`${headerTestId}-view-count`}>
              <EyeIcon aria-hidden className={'size-4'} />
              {collection.viewCount.toLocaleString()} views
            </span>
            <span className={'flex items-center gap-1.5'} data-testid={`${headerTestId}-like-count`}>
              <HeartIcon aria-hidden className={'size-4'} />
              {likeCount} likes
            </span>
            <span className={'flex items-center gap-1.5'} data-testid={`${headerTestId}-updated-date`}>
              <CalendarIcon aria-hidden className={'size-4'} />
              Updated {formattedDate}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div
          className={'flex items-center gap-2 sm:flex-shrink-0'}
          data-slot={'collection-header-actions'}
          data-testid={`${headerTestId}-actions`}
        >
          {/* Like Button */}
          <Button
            aria-label={isLiked ? 'Unlike this collection' : 'Like this collection'}
            aria-pressed={isLiked}
            className={cn(
              'gap-2',
              isLiked && 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
            )}
            disabled={_isLikeDisabled}
            onClick={handleLikeClick}
            testId={`${headerTestId}-like-button`}
            variant={isLiked ? 'default' : 'outline'}
          >
            <HeartIcon aria-hidden className={cn('size-4', isLiked && 'fill-current')} />
            {isLiked ? 'Liked' : 'Like'}
            <span className={'ml-1 tabular-nums'}>({likeCount})</span>
          </Button>

          {/* Share Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label={'Share this collection'}
                size={'icon'}
                testId={`${headerTestId}-share-button`}
                variant={'outline'}
              >
                <ShareIcon aria-hidden className={'size-4'} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={'end'} data-testid={`${headerTestId}-share-menu`}>
              <DropdownMenuItem data-testid={`${headerTestId}-share-copy-link`} onClick={handleCopyLink}>
                <LinkIcon aria-hidden className={'mr-2 size-4'} />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem data-testid={`${headerTestId}-share-twitter`} onClick={handleShareTwitter}>
                <TwitterIcon aria-hidden className={'mr-2 size-4'} />
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem data-testid={`${headerTestId}-share-facebook`} onClick={handleShareFacebook}>
                <FacebookIcon aria-hidden className={'mr-2 size-4'} />
                Share on Facebook
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
