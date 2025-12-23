'use client';

import type { ComponentProps } from 'react';

import { CldImage } from 'next-cloudinary';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useMemo } from 'react';

import type {
  BobbleheadSearchResult,
  CollectionSearchResult,
} from '@/lib/queries/content-search/content-search.query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

type SearchResultCardEntityType = 'bobblehead' | 'collection';

type SearchResultCardProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    entityType: SearchResultCardEntityType;
    onClick?: () => void;
    result: BobbleheadSearchResult | CollectionSearchResult;
  };

export const SearchResultCard = ({
  className,
  entityType,
  onClick,
  result,
  testId,
  ...props
}: SearchResultCardProps) => {
  // Generate testId with entity type and id for specific targeting
  const searchResultCardTestId =
    testId || generateTestId('feature', 'card', `search-result-${entityType}-${result.id}`);

  // Memoized entity URL based on type
  const entityUrl = useMemo(() => {
    if (entityType === 'collection') {
      const username = ('ownerUsername' in result && result.ownerUsername) || '';
      return $path({
        route: '/user/[username]/collection/[collectionSlug]',
        routeParams: { collectionSlug: result.slug, username },
      });
    }

    return $path({ route: '/bobbleheads/[bobbleheadSlug]', routeParams: { bobbleheadSlug: result.slug } });
  }, [entityType, result]);

  // Memoized entity-specific display data
  const displayData = useMemo(() => {
    const name =
      'name' in result && result.name ? result.name
      : 'characterName' in result && result.characterName ? result.characterName
      : 'Unknown';

    const description =
      'description' in result && result.description ? result.description
      : 'collectionName' in result && result.collectionName ? `From collection: ${result.collectionName}`
      : '';

    const imageUrl =
      'primaryPhotoUrl' in result && result.primaryPhotoUrl ? result.primaryPhotoUrl
      : 'coverImageUrl' in result && result.coverImageUrl ? result.coverImageUrl
      : null;

    const owner =
      'ownerName' in result && result.ownerName ? result.ownerName
      : 'ownerUsername' in result && result.ownerUsername ? result.ownerUsername
      : 'Unknown';

    return { description, imageUrl, name, owner };
  }, [result]);

  // Memoized badge configuration
  const badgeConfig = useMemo(() => {
    const configMap: Record<
      SearchResultCardEntityType,
      { label: string; variant: 'default' | 'outline' | 'secondary' }
    > = {
      bobblehead: { label: 'Bobblehead', variant: 'outline' },
      collection: { label: 'Collection', variant: 'default' },
    };

    return configMap[entityType];
  }, [entityType]);

  // Derived conditional variables
  const _hasImage = !!displayData.imageUrl;
  const _hasValidImage = displayData.imageUrl && displayData.imageUrl !== '/placeholder.jpg';
  const _hasDescription = !!displayData.description;

  return (
    <Link
      className={'group block focus-visible:outline-none'}
      data-slot={'search-result-card-link'}
      href={entityUrl}
      onClick={onClick}
    >
      <Card
        className={cn(
          'relative h-full overflow-hidden transition-all duration-200',
          'hover:border-primary/20 hover:shadow-md',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          'group-hover:scale-[1.02]',
          className,
        )}
        data-slot={'search-result-card'}
        data-testid={searchResultCardTestId}
        {...props}
      >
        {/* Card Image Section */}
        <div
          className={cn(
            'relative aspect-[4/3] w-full overflow-hidden bg-muted',
            'transition-transform duration-200 group-hover:scale-105',
          )}
          data-slot={'search-result-card-image-container'}
        >
          <Conditional
            fallback={
              <div
                className={'flex size-full items-center justify-center bg-muted'}
                data-slot={'search-result-card-image-placeholder'}
              >
                <span className={'text-sm text-muted-foreground'}>No Image</span>
              </div>
            }
            isCondition={_hasImage}
          >
            {_hasValidImage ?
              <CldImage
                alt={displayData.name}
                className={'size-full object-cover'}
                crop={'fill'}
                data-slot={'search-result-card-image'}
                fill
                format={'auto'}
                gravity={'auto'}
                quality={'auto:good'}
                sizes={'(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
                src={extractPublicIdFromCloudinaryUrl(displayData.imageUrl ?? '')}
              />
            : <div
                className={'flex size-full items-center justify-center bg-muted'}
                data-slot={'search-result-card-image-placeholder'}
              >
                <span className={'text-sm text-muted-foreground'}>No Image</span>
              </div>
            }
          </Conditional>

          {/* Entity Type Badge Overlay */}
          <div className={'absolute top-3 left-3 z-10'} data-slot={'search-result-card-badge-container'}>
            <Badge
              className={'shadow-sm'}
              data-slot={'search-result-card-badge'}
              variant={badgeConfig.variant}
            >
              {badgeConfig.label}
            </Badge>
          </div>
        </div>

        {/* Card Content Section */}
        <CardHeader className={'space-y-1.5 p-4'} data-slot={'search-result-card-header'}>
          {/* Result Name */}
          <h3
            className={cn(
              'line-clamp-1 text-base font-semibold text-foreground',
              'transition-colors duration-200 group-hover:text-primary',
            )}
            data-slot={'search-result-card-title'}
          >
            {displayData.name}
          </h3>

          {/* Owner Info */}
          <p className={'truncate text-sm text-muted-foreground'} data-slot={'search-result-card-owner'}>
            By {displayData.owner}
          </p>
        </CardHeader>

        {/* Card Description Section */}
        <Conditional isCondition={_hasDescription}>
          <CardContent className={'px-4 pt-0 pb-4'} data-slot={'search-result-card-content'}>
            <p
              className={'line-clamp-2 text-sm text-muted-foreground'}
              data-slot={'search-result-card-description'}
            >
              {displayData.description}
            </p>
          </CardContent>
        </Conditional>
      </Card>
    </Link>
  );
};
