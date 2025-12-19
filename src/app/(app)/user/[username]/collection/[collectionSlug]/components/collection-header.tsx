'use client';

import {
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  LinkIcon,
  PackageIcon,
  ShareIcon,
  TwitterIcon,
} from 'lucide-react';
import { FacebookIcon } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/tailwind-utils';

import type { MockCollection, MockCollector } from '../mock-data';

interface CollectionHeaderProps {
  collection: MockCollection;
  collector: MockCollector;
}

export const CollectionHeader = ({ collection, collector }: CollectionHeaderProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(collection.likeCount);

  const handleLikeToggle = () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(collection.lastUpdatedAt);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={'mb-8'}>
      {/* Cover Image */}
      {collection.coverImageUrl && (
        <div className={'relative mb-6 h-40 overflow-hidden rounded-xl sm:h-56 lg:h-64'}>
          {}
          <img
            alt={`${collection.name} cover`}
            className={'h-full w-full object-cover'}
            src={collection.coverImageUrl}
          />
          <div className={'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent'} />
        </div>
      )}

      {/* Header Content */}
      <div className={'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'}>
        <div className={'flex-1'}>
          {/* Collection Title */}
          <h1 className={'mb-2 text-2xl font-bold sm:text-3xl'}>{collection.name}</h1>

          {/* Collector Byline */}
          <div className={'mb-3 flex items-center gap-2'}>
            <Avatar className={'size-6'}>
              <AvatarImage
                alt={collector.displayName || collector.username}
                src={collector.avatarUrl ?? undefined}
              />
              <AvatarFallback className={'text-xs'}>
                {getInitials(collector.displayName || collector.username)}
              </AvatarFallback>
            </Avatar>
            <span className={'text-sm text-muted-foreground'}>
              by{' '}
              <a
                className={'font-medium text-foreground hover:underline'}
                href={`/user/${collector.username}`}
              >
                {collector.displayName || collector.username}
              </a>
            </span>
          </div>

          {/* Description */}
          {collection.description && (
            <p className={'mb-4 max-w-2xl text-muted-foreground'}>{collection.description}</p>
          )}

          {/* Stats */}
          <div className={'flex flex-wrap items-center gap-4 text-sm text-muted-foreground'}>
            <span className={'flex items-center gap-1.5'}>
              <PackageIcon className={'size-4'} />
              {collection.totalBobbleheadCount} items
            </span>
            <span className={'flex items-center gap-1.5'}>
              <EyeIcon className={'size-4'} />
              {collection.viewCount.toLocaleString()} views
            </span>
            <span className={'flex items-center gap-1.5'}>
              <HeartIcon className={'size-4'} />
              {likeCount} likes
            </span>
            <span className={'flex items-center gap-1.5'}>
              <CalendarIcon className={'size-4'} />
              Updated {formattedDate}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className={'flex items-center gap-2 sm:flex-shrink-0'}>
          {/* Like Button */}
          <Button
            className={cn(
              'gap-2',
              isLiked && 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
            )}
            onClick={handleLikeToggle}
            variant={isLiked ? 'default' : 'outline'}
          >
            <HeartIcon className={cn('size-4', isLiked && 'fill-current')} />
            {isLiked ? 'Liked' : 'Like'}
            <span className={'ml-1 tabular-nums'}>({likeCount})</span>
          </Button>

          {/* Share Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size={'icon'} variant={'outline'}>
                <ShareIcon className={'size-4'} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={'end'}>
              <DropdownMenuItem>
                <LinkIcon className={'mr-2 size-4'} />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem>
                <TwitterIcon className={'mr-2 size-4'} />
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FacebookIcon className={'mr-2 size-4'} />
                Share on Facebook
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
