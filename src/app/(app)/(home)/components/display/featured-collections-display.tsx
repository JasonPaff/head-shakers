'use client';

import { ArrowRight, Layers, User } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { $path } from 'next-typesafe-url';
import Image from 'next/image';
import Link from 'next/link';

import { Conditional } from '@/components/ui/conditional';
import { LikeCompactButton } from '@/components/ui/like-button';
import {
  featuredCardBadgeVariants,
  featuredCardContentVariants,
  featuredCardDescriptionVariants,
  featuredCardImageVariants,
  featuredCardOverlayVariants,
  featuredCardTitleVariants,
  featuredCardVariants,
} from '@/components/ui/variants/featured-card-variants';
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
  likeId: null | string;
  likes: number;
  ownerDisplayName: string;
  title: string;
  viewCount: number;
}

export interface FeaturedCollectionsDisplayProps {
  collections: Array<FeaturedCollection>;
}

export const FeaturedCollectionsDisplay = ({ collections }: FeaturedCollectionsDisplayProps) => {
  if (collections.length === 0) {
    return (
      <div
        className={'py-12 text-center'}
        data-slot={'featured-collections-empty'}
        data-testid={generateTestId('feature', 'collections-empty-state')}
      >
        <Layers aria-hidden className={'mx-auto mb-4 size-12 text-muted-foreground/50'} />
        <p className={'text-muted-foreground'}>No featured collections available at this time.</p>
      </div>
    );
  }

  return (
    <div
      className={'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'}
      data-slot={'featured-collections-grid'}
      data-testid={generateTestId('feature', 'collection-grid')}
    >
      {collections.map((collection, index) => (
        <FeaturedCollectionCard collection={collection} index={index} key={collection.id} />
      ))}
    </div>
  );
};

interface FeaturedCollectionCardProps {
  collection: FeaturedCollection;
  index: number;
}

const FeaturedCollectionCard = ({ collection, index }: FeaturedCollectionCardProps) => {
  const _hasImage = Boolean(collection.imageUrl && collection.imageUrl !== '/placeholder.jpg');

  // Stagger animation delay based on index (extended to support more cards)
  const _animationDelayClass = index < 8 ? `animation-delay-${(index + 1) * 100}` : '';

  // Extract publicId and generate blur placeholder for progressive loading
  const publicId = collection.imageUrl ? extractPublicIdFromCloudinaryUrl(collection.imageUrl) : '';
  const blurDataUrl = publicId ? generateBlurDataUrl(publicId) : undefined;

  return (
    <article
      className={cn(
        featuredCardVariants({ size: 'medium', state: 'default' }),
        'animate-stagger-in bg-card will-change-card',
        _animationDelayClass,
      )}
      data-slot={'featured-collection-card'}
      data-testid={generateTestId('feature', 'collection-card', collection.id)}
    >
      {/* Image Container */}
      <Link
        aria-label={`View ${collection.title} collection`}
        className={cn(
          'block rounded-t-xl',
          'focus-visible:ring-2 focus-visible:ring-warm-orange focus-visible:ring-offset-2 focus-visible:outline-none',
        )}
        href={$path({
          route: '/collections/[collectionSlug]',
          routeParams: { collectionSlug: collection.contentSlug },
        })}
      >
        <div
          className={'relative aspect-[4/3] w-full overflow-hidden'}
          data-slot={'featured-collection-image-container'}
        >
          <Conditional isCondition={_hasImage}>
            <CldImage
              alt={collection.title}
              blurDataURL={blurDataUrl}
              className={featuredCardImageVariants({ contentType: 'collection' })}
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
              className={featuredCardImageVariants({ contentType: 'collection' })}
              height={400}
              src={CLOUDINARY_PATHS.PLACEHOLDERS.COLLECTION_COVER}
              width={533}
            />
          </Conditional>

          {/* Gradient Overlay */}
          <div
            aria-hidden
            className={featuredCardOverlayVariants({ intensity: 'medium', position: 'bottom' })}
            data-slot={'featured-collection-overlay'}
          />

          {/* Featured Badge */}
          <div className={'absolute top-3 left-3 z-10'} data-slot={'featured-collection-badge'}>
            <span className={featuredCardBadgeVariants({ variant: 'featured' })}>
              <Layers aria-hidden className={'size-3'} />
              Featured
            </span>
          </div>
        </div>
      </Link>

      {/* Content Overlay */}
      <div
        className={featuredCardContentVariants({ alignment: 'left', size: 'medium' })}
        data-slot={'featured-collection-content'}
      >
        {/* Title and Owner */}
        <Link
          className={cn(
            'rounded-sm',
            'focus-visible:ring-2 focus-visible:ring-warm-orange focus-visible:outline-none',
          )}
          href={$path({
            route: '/collections/[collectionSlug]',
            routeParams: { collectionSlug: collection.contentSlug },
          })}
        >
          <h3
            className={cn(
              featuredCardTitleVariants({ size: 'medium' }),
              'transition-colors duration-200 hover:text-warm-amber-light',
            )}
            data-slot={'featured-collection-title'}
          >
            {collection.title}
          </h3>
        </Link>

        <p
          className={'mt-1 flex items-center gap-1.5 text-sm text-white/70'}
          data-slot={'featured-collection-owner'}
        >
          <User aria-hidden className={'size-3.5'} />
          {collection.ownerDisplayName}
        </p>

        {/* Description */}
        <Conditional isCondition={Boolean(collection.description)}>
          <p
            className={featuredCardDescriptionVariants({ size: 'medium' })}
            data-slot={'featured-collection-description'}
          >
            {collection.description}
          </p>
        </Conditional>

        {/* Engagement Metrics */}
        <div className={'mt-4 flex items-center justify-between'} data-slot={'featured-collection-metrics'}>
          {/* Left: Like Button */}
          <LikeCompactButton
            className={'text-white/80 hover:text-white'}
            initialLikeCount={collection.likes}
            isInitiallyLiked={collection.isLiked}
            targetId={collection.contentId}
            targetType={'collection'}
            testId={generateTestId('ui', 'like-button', `collection-${collection.id}`)}
          />

          {/* Right: View Link */}
          <Link
            aria-label={`View ${collection.title} collection`}
            className={cn(
              'inline-flex items-center gap-1 rounded-sm text-sm font-medium text-white/90',
              'transition-all duration-200',
              'hover:gap-2 hover:text-warm-amber-light',
              'focus-visible:ring-2 focus-visible:ring-warm-orange focus-visible:outline-none',
            )}
            href={$path({
              route: '/collections/[collectionSlug]',
              routeParams: { collectionSlug: collection.contentSlug },
            })}
          >
            View
            <ArrowRight aria-hidden className={'size-4 transition-transform duration-200'} />
          </Link>
        </div>
      </div>
    </article>
  );
};
