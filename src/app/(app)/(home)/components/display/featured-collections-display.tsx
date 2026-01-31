'use client';

import { EyeIcon, FlameIcon, HeartIcon, LayersIcon, MessageCircleIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { $path } from 'next-typesafe-url';
import Image from 'next/image';
import Link from 'next/link';

import type { FeaturedCollectionData } from '@/lib/queries/featured-content/featured-content.query';
import type { ComponentTestIdProps } from '@/lib/test-ids/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { CLOUDINARY_PATHS } from '@/lib/constants/cloudinary-paths';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl, generateBlurDataUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

export interface FeaturedCollectionsDisplayProps extends ComponentTestIdProps {
  collections: Array<FeaturedCollectionData>;
}

export const FeaturedCollectionsDisplay = ({ collections, testId }: FeaturedCollectionsDisplayProps) => {
  if (collections.length === 0) {
    return (
      <div
        className={'py-12 text-center'}
        data-slot={'featured-collections-empty'}
        data-testid={generateTestId('feature', 'collections-empty-state')}
      >
        <LayersIcon aria-hidden className={'mx-auto mb-4 size-12 text-muted-foreground/50'} />
        <p className={'mb-4 text-muted-foreground'}>No featured collections available at this time.</p>
        <Button asChild variant={'outline'}>
          <Link href={$path({ route: '/browse' })}>Browse All Collections</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={'grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8'}
      data-slot={'featured-collections-grid'}
      data-testid={testId ?? generateTestId('feature', 'collection-grid')}
    >
      {collections.map((collection, index) => (
        <FeaturedCollectionCard
          className={index >= 3 ? 'hidden lg:block' : undefined}
          collection={collection}
          key={collection.id}
        />
      ))}
    </div>
  );
};

type FeaturedCollectionCardProps = ClassName<
  ComponentTestIdProps & {
    collection: FeaturedCollectionData;
  }
>;

const FeaturedCollectionCard = ({ className, collection, testId }: FeaturedCollectionCardProps) => {
  const _hasImage = Boolean(collection.imageUrl && collection.imageUrl !== '/placeholder.jpg');

  // Extract publicId and generate blur placeholder for progressive loading
  const publicId = collection.imageUrl ? extractPublicIdFromCloudinaryUrl(collection.imageUrl) : '';
  const blurDataUrl = publicId ? generateBlurDataUrl(publicId) : undefined;

  // Placeholder avatar URL if owner avatar not available
  const avatarUrl = collection.ownerAvatarUrl || CLOUDINARY_PATHS.PLACEHOLDERS.AVATAR;

  return (
    <Link
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60 bg-card',
        'shadow-md transition-all duration-300 ease-out',
        'hover:-translate-y-1.5 hover:border-border hover:shadow-xl',
        'active:scale-[0.99]',
        'sm:hover:-translate-y-2 sm:hover:shadow-2xl',
        'dark:border-border/50 dark:bg-card dark:hover:border-border',
        className,
      )}
      data-slot={'featured-collection-card'}
      data-testid={testId ?? generateTestId('feature', 'collection-card', collection.id)}
      href={$path({
        route: '/user/[username]/collection/[collectionSlug]',
        routeParams: { collectionSlug: collection.contentSlug, username: collection.ownerDisplayName ?? '' },
      })}
    >
      {/* Image Section */}
      <div
        className={'relative aspect-[4/3] overflow-hidden'}
        data-slot={'featured-collection-image-container'}
      >
        <Conditional isCondition={_hasImage}>
          <CldImage
            alt={collection.title ?? 'image'}
            blurDataURL={blurDataUrl}
            className={
              'absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110'
            }
            crop={'fill'}
            format={'auto'}
            gravity={'auto'}
            height={400}
            loading={'lazy'}
            placeholder={blurDataUrl ? 'blur' : 'empty'}
            quality={'auto:good'}
            sizes={'(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'}
            src={publicId}
            width={533}
          />
        </Conditional>

        <Conditional isCondition={!_hasImage}>
          <Image
            alt={'Collection placeholder'}
            className={
              'absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110'
            }
            height={400}
            src={CLOUDINARY_PATHS.PLACEHOLDERS.COLLECTION_COVER}
            width={533}
          />
        </Conditional>

        {/* Gradient Overlay */}
        <div
          aria-hidden
          className={'absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent'}
          data-slot={'featured-collection-overlay'}
        />

        {/* Trending Badge */}
        <Conditional isCondition={Boolean(collection.isTrending)}>
          <div className={'absolute top-4 right-4'} data-slot={'featured-collection-trending-badge'}>
            <Badge
              className={
                'border-transparent bg-linear-to-r from-gradient-from to-trending text-trending-foreground shadow-lg'
              }
            >
              <FlameIcon aria-hidden className={'size-3'} />
              Trending
            </Badge>
          </div>
        </Conditional>

        {/* Collection Info Overlay */}
        <div
          className={'absolute right-0 bottom-0 left-0 p-6'}
          data-slot={'featured-collection-overlay-content'}
        >
          <h3
            className={'text-xl font-bold text-white drop-shadow-lg'}
            data-slot={'featured-collection-title'}
          >
            {collection.title}
          </h3>
          <Conditional isCondition={Boolean(collection.description)}>
            <p
              className={'mt-2 line-clamp-2 text-sm text-white/80'}
              data-slot={'featured-collection-description'}
            >
              {collection.description}
            </p>
          </Conditional>
        </div>
      </div>

      {/* Footer Section */}
      <div className={'p-4 sm:p-5'} data-slot={'featured-collection-footer'}>
        {/* Owner Section */}
        <div
          className={'flex items-center justify-between gap-3'}
          data-slot={'featured-collection-owner-section'}
        >
          <div className={'flex min-w-0 items-center gap-2.5 sm:gap-3'}>
            <Image
              alt={collection.ownerDisplayName ?? 'image'}
              className={`size-8 shrink-0 rounded-full object-cover ring-2 ring-primary/20
                transition-all duration-300 group-hover:ring-primary/40
                sm:size-9`}
              height={36}
              src={avatarUrl}
              width={36}
            />
            <div className={'min-w-0'}>
              <div className={'truncate text-sm font-medium text-foreground'}>
                @{collection.ownerDisplayName}
              </div>
              <div className={'text-xs text-muted-foreground'}>{collection.totalItems || 0} items</div>
            </div>
          </div>
          <div className={'shrink-0 text-right'}>
            <div className={'text-sm font-semibold tabular-nums text-primary'}>
              ${(collection.totalValue || 0).toLocaleString()}
            </div>
            <div className={'text-xs text-muted-foreground'}>Est. Value</div>
          </div>
        </div>

        {/* Stats Row */}
        <div
          className={cn(
            'mt-3 flex items-center gap-3 border-t border-border/60 pt-3',
            'text-xs text-muted-foreground',
            'sm:mt-4 sm:gap-4 sm:pt-4 sm:text-sm',
          )}
          data-slot={'featured-collection-stats'}
        >
          <span className={'flex items-center gap-1'}>
            <HeartIcon aria-hidden className={'size-3.5 text-trending sm:size-4'} />
            <span className={'tabular-nums'}>{collection.likes.toLocaleString()}</span>
          </span>
          <span className={'flex items-center gap-1'}>
            <EyeIcon aria-hidden className={'size-3.5 sm:size-4'} />
            <span className={'tabular-nums'}>{collection.viewCount.toLocaleString()}</span>
          </span>
          <span className={'flex items-center gap-1'}>
            <MessageCircleIcon aria-hidden className={'size-3.5 sm:size-4'} />
            <span className={'tabular-nums'}>{collection.comments}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};
