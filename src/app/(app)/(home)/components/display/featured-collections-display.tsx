'use client';

import { EyeIcon, FlameIcon, HeartIcon, LayersIcon, MessageCircleIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { $path } from 'next-typesafe-url';
import Image from 'next/image';
import Link from 'next/link';

import type { ComponentTestIdProps } from '@/lib/test-ids/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { CLOUDINARY_PATHS } from '@/lib/constants/cloudinary-paths';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl, generateBlurDataUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

export interface FeaturedCollection {
  comments: number;
  contentId: string;
  contentSlug: string;
  description: string;
  id: string;
  imageUrl: null | string;
  isLiked: boolean;
  isTrending?: boolean;
  likeId: null | string;
  likes: number;
  ownerAvatarUrl?: null | string;
  ownerDisplayName: string;
  title: string;
  totalItems?: number;
  totalValue?: number;
  viewCount: number;
}

export interface FeaturedCollectionsDisplayProps extends ComponentTestIdProps {
  collections: Array<FeaturedCollection>;
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
      className={'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'}
      data-slot={'featured-collections-grid'}
      data-testid={testId ?? generateTestId('feature', 'collection-grid')}
    >
      {collections.map((collection, index) => (
        <FeaturedCollectionCard
          className={index >= 3 ? 'hidden md:block' : undefined}
          collection={collection}
          key={collection.id}
        />
      ))}
    </div>
  );
};

type FeaturedCollectionCardProps = ClassName<
  ComponentTestIdProps & {
    collection: FeaturedCollection;
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
        'group relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg',
        'transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl',
        'dark:border-border dark:bg-card',
        className,
      )}
      data-slot={'featured-collection-card'}
      data-testid={testId ?? generateTestId('feature', 'collection-card', collection.id)}
      href={$path({
        route: '/collections/[collectionSlug]',
        routeParams: { collectionSlug: collection.contentSlug },
      })}
    >
      {/* Image Section */}
      <div
        className={'relative aspect-[4/3] overflow-hidden'}
        data-slot={'featured-collection-image-container'}
      >
        <Conditional isCondition={_hasImage}>
          <CldImage
            alt={collection.title}
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
          className={'absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent'}
          data-slot={'featured-collection-overlay'}
        />

        {/* Trending Badge */}
        <Conditional isCondition={Boolean(collection.isTrending)}>
          <div className={'absolute top-4 right-4'} data-slot={'featured-collection-trending-badge'}>
            <Badge
              className={
                'border-transparent bg-gradient-to-r from-gradient-from to-trending text-trending-foreground shadow-lg'
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
      <div className={'p-5'} data-slot={'featured-collection-footer'}>
        {/* Owner Section */}
        <div className={'flex items-center justify-between'} data-slot={'featured-collection-owner-section'}>
          <div className={'flex items-center gap-3'}>
            <Image
              alt={collection.ownerDisplayName}
              className={'size-9 rounded-full object-cover ring-2 ring-primary/20'}
              height={36}
              src={avatarUrl}
              width={36}
            />
            <div>
              <div className={'text-sm font-medium text-foreground'}>@{collection.ownerDisplayName}</div>
              <div className={'text-xs text-muted-foreground'}>{collection.totalItems || 0} items</div>
            </div>
          </div>
          <div className={'text-right'}>
            <div className={'text-sm font-semibold text-primary'}>
              ${(collection.totalValue || 0).toLocaleString()}
            </div>
            <div className={'text-xs text-muted-foreground'}>Est. Value</div>
          </div>
        </div>

        {/* Stats Row */}
        <div
          className={cn(
            'mt-4 flex items-center gap-4 border-t border-border pt-4',
            'text-sm text-muted-foreground',
          )}
          data-slot={'featured-collection-stats'}
        >
          <span className={'flex items-center gap-1'}>
            <HeartIcon aria-hidden className={'size-4 text-trending'} />
            {collection.likes.toLocaleString()}
          </span>
          <span className={'flex items-center gap-1'}>
            <EyeIcon aria-hidden className={'size-4'} />
            {collection.viewCount.toLocaleString()}
          </span>
          <span className={'flex items-center gap-1'}>
            <MessageCircleIcon aria-hidden className={'size-4'} />
            {collection.comments}
          </span>
        </div>
      </div>
    </Link>
  );
};
