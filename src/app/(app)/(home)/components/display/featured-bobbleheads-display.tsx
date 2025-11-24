'use client';

import { ArrowRight, Award, User } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { $path } from 'next-typesafe-url';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';

import type { FeaturedContentData } from '@/lib/queries/featured-content/featured-content-transformer';

import { Conditional } from '@/components/ui/conditional';
import { LikeCompactButton } from '@/components/ui/like-button';
import {
  featuredCardBadgeVariants,
  featuredCardContentVariants,
  featuredCardImageVariants,
  featuredCardOverlayVariants,
  featuredCardTitleVariants,
  featuredCardVariants,
} from '@/components/ui/variants/featured-card-variants';
import { CLOUDINARY_PATHS } from '@/lib/constants/cloudinary-paths';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl, generateBlurDataUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

/**
 * Props for a featured bobblehead item
 */
export interface FeaturedBobblehead {
  contentId: string;
  contentName: null | string;
  contentSlug: null | string;
  featureType: FeaturedContentData['featureType'];
  id: string;
  imageUrl: null | string;
  isLiked: boolean;
  likeId: null | string;
  likes: number;
  ownerDisplayName: null | string;
  viewCount: number;
}

export interface FeaturedBobbleheadsDisplayProps {
  bobbleheads: Array<FeaturedBobblehead>;
}

/**
 * Display component for featured bobbleheads grid
 *
 * Renders a responsive grid of featured bobblehead cards with
 * interactive hover states, engagement metrics, and navigation links.
 */
export const FeaturedBobbleheadsDisplay = ({ bobbleheads }: FeaturedBobbleheadsDisplayProps) => {
  // Derived condition for empty state
  const _isEmpty = bobbleheads.length === 0;

  return (
    <Fragment>
      {/* Empty State */}
      <Conditional isCondition={_isEmpty}>
        <div
          className={'py-12 text-center'}
          data-slot={'featured-bobbleheads-empty'}
          data-testid={generateTestId('feature', 'bobbleheads-empty-state')}
        >
          <Award aria-hidden className={'mx-auto mb-4 size-12 text-muted-foreground/50'} />
          <p className={'text-muted-foreground'}>No featured bobbleheads available at this time.</p>
        </div>
      </Conditional>

      {/* Bobbleheads Grid */}
      <Conditional isCondition={!_isEmpty}>
        <div
          className={'grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4'}
          data-slot={'featured-bobbleheads-grid'}
          data-testid={generateTestId('feature', 'bobblehead-grid')}
        >
          {bobbleheads.map((bobblehead, index) => (
            <FeaturedBobbleheadCard bobblehead={bobblehead} index={index} key={bobblehead.id} />
          ))}
        </div>
      </Conditional>
    </Fragment>
  );
};

interface FeaturedBobbleheadCardProps {
  bobblehead: FeaturedBobblehead;
  index: number;
}

/**
 * Individual featured bobblehead card component
 *
 * Displays bobblehead image, name, owner, and engagement metrics
 * with hover animations and interactive elements.
 */
const FeaturedBobbleheadCard = ({ bobblehead, index }: FeaturedBobbleheadCardProps) => {
  // Derived conditions
  const _hasImage = Boolean(bobblehead.imageUrl && bobblehead.imageUrl !== '/placeholder.jpg');
  const _hasSlug = Boolean(bobblehead.contentSlug);

  // Stagger animation delay based on index
  const _animationDelayClass = index < 8 ? `animation-delay-${(index + 1) * 100}` : '';

  // Map feature type to badge variant
  const _badgeVariant = getBadgeVariant(bobblehead.featureType);

  // Extract publicId and generate blur placeholder for progressive loading
  const publicId = bobblehead.imageUrl ? extractPublicIdFromCloudinaryUrl(bobblehead.imageUrl) : '';
  const blurDataUrl = publicId ? generateBlurDataUrl(publicId) : undefined;

  // Build the href for navigation
  const _href =
    _hasSlug ?
      $path({
        route: '/bobbleheads/[bobbleheadSlug]',
        routeParams: { bobbleheadSlug: bobblehead.contentSlug as string },
      })
    : '#';

  return (
    <article
      className={cn(
        featuredCardVariants({ size: 'small', state: 'default' }),
        'flex animate-stagger-in flex-col bg-card will-change-card',
        _animationDelayClass,
      )}
      data-slot={'featured-bobblehead-card'}
      data-testid={generateTestId('feature', 'bobblehead-card', bobblehead.id)}
    >
      {/* Image Container */}
      <Link
        aria-label={`View ${bobblehead.contentName || 'bobblehead'} details`}
        className={cn(
          'block rounded-t-xl',
          'focus-visible:ring-2 focus-visible:ring-warm-orange focus-visible:ring-offset-2 focus-visible:outline-none',
        )}
        href={_href}
      >
        <div
          className={'relative aspect-square w-full overflow-hidden'}
          data-slot={'featured-bobblehead-image-container'}
        >
          {/* Cloudinary Image */}
          <Conditional isCondition={_hasImage}>
            <CldImage
              alt={bobblehead.contentName || 'Featured bobblehead'}
              blurDataURL={blurDataUrl}
              className={featuredCardImageVariants({ contentType: 'bobblehead' })}
              crop={'fill'}
              format={'auto'}
              gravity={'auto'}
              height={400}
              loading={'lazy'}
              placeholder={blurDataUrl ? 'blur' : 'empty'}
              quality={'auto:good'}
              sizes={'(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw'}
              src={publicId}
              width={400}
            />
          </Conditional>

          {/* Placeholder Image */}
          <Conditional isCondition={!_hasImage}>
            <Image
              alt={'Bobblehead placeholder'}
              className={featuredCardImageVariants({ contentType: 'bobblehead' })}
              height={400}
              src={CLOUDINARY_PATHS.PLACEHOLDERS.COLLECTION_COVER}
              width={400}
            />
          </Conditional>

          {/* Gradient Overlay */}
          <div
            aria-hidden
            className={featuredCardOverlayVariants({ intensity: 'medium', position: 'bottom' })}
            data-slot={'featured-bobblehead-overlay'}
          />

          {/* Featured Badge */}
          <div className={'absolute top-3 left-3 z-10'} data-slot={'featured-bobblehead-badge'}>
            <span className={featuredCardBadgeVariants({ variant: _badgeVariant })}>
              <Award aria-hidden className={'size-3'} />
              {getBadgeLabel(bobblehead.featureType)}
            </span>
          </div>
        </div>
      </Link>

      {/* Content Area */}
      <div
        className={cn(
          featuredCardContentVariants({ alignment: 'left', size: 'small' }),
          'relative flex flex-col gap-1 bg-card',
        )}
        data-slot={'featured-bobblehead-content'}
      >
        {/* Title */}
        <Link
          className={cn(
            'rounded-sm',
            'focus-visible:ring-2 focus-visible:ring-warm-orange focus-visible:outline-none',
          )}
          href={_href}
        >
          <h3
            className={cn(
              featuredCardTitleVariants({ size: 'small' }),
              'text-foreground transition-colors duration-200 hover:text-warm-amber-light',
            )}
            data-slot={'featured-bobblehead-title'}
          >
            {bobblehead.contentName || 'Unnamed Bobblehead'}
          </h3>
        </Link>

        {/* Owner */}
        <Conditional isCondition={Boolean(bobblehead.ownerDisplayName)}>
          <p
            className={'flex items-center gap-1.5 text-xs text-muted-foreground'}
            data-slot={'featured-bobblehead-owner'}
          >
            <User aria-hidden className={'size-3'} />
            {bobblehead.ownerDisplayName}
          </p>
        </Conditional>

        {/* Engagement Metrics */}
        <div className={'mt-2 flex items-center justify-between'} data-slot={'featured-bobblehead-metrics'}>
          {/* Left: Stats */}
          <div className={'flex items-center gap-3'}>
            {/* Like Button */}
            <LikeCompactButton
              className={'text-muted-foreground hover:text-destructive'}
              initialLikeCount={bobblehead.likes}
              isInitiallyLiked={bobblehead.isLiked}
              targetId={bobblehead.contentId}
              targetType={'bobblehead'}
              testId={generateTestId('ui', 'like-button', `bobblehead-${bobblehead.id}`)}
            />
          </div>

          {/* Right: View Link */}
          <Conditional isCondition={_hasSlug}>
            <Link
              aria-label={`View ${bobblehead.contentName || 'bobblehead'} details`}
              className={cn(
                'inline-flex items-center gap-1 rounded-sm text-xs font-medium text-muted-foreground',
                'transition-all duration-200',
                'hover:gap-2 hover:text-warm-amber-light',
                'focus-visible:ring-2 focus-visible:ring-warm-orange focus-visible:outline-none',
              )}
              href={_href}
            >
              View
              <ArrowRight aria-hidden className={'size-3.5 transition-transform duration-200'} />
            </Link>
          </Conditional>
        </div>
      </div>
    </article>
  );
};

/**
 * Map feature type to badge variant
 */
const getBadgeVariant = (
  featureType: FeaturedContentData['featureType'],
): 'featured' | 'new' | 'popular' | 'trending' => {
  switch (featureType) {
    case 'collection_of_week':
      return 'popular';
    case 'editor_pick':
      return 'featured';
    case 'homepage_banner':
      return 'new';
    case 'trending':
      return 'trending';
    default:
      return 'featured';
  }
};

/**
 * Get human-readable badge label for feature type
 */
const getBadgeLabel = (featureType: FeaturedContentData['featureType']): string => {
  switch (featureType) {
    case 'collection_of_week':
      return 'Popular';
    case 'editor_pick':
      return 'Editor Pick';
    case 'homepage_banner':
      return 'Featured';
    case 'trending':
      return 'Trending';
    default:
      return 'Featured';
  }
};
