'use client';

import { CldImage } from 'next-cloudinary';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useMemo } from 'react';

import type {
  BobbleheadSearchResult,
  CollectionSearchResult,
  SubcollectionSearchResult,
} from '@/lib/queries/content-search/content-search.query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

type SearchResultItemEntityType = 'bobblehead' | 'collection' | 'subcollection';

type SearchResultItemProps = ComponentTestIdProps & {
  className?: string;
  contentClassName?: string;
  entityType: SearchResultItemEntityType;
  imageClassName?: string;
  isCompact?: boolean;
  linkClassName?: string;
  onClick?: () => void;
  result: BobbleheadSearchResult | CollectionSearchResult | SubcollectionSearchResult;
};

export const SearchResultItem = ({
  className,
  contentClassName,
  entityType,
  imageClassName,
  isCompact = false,
  linkClassName,
  onClick,
  result,
  testId,
}: SearchResultItemProps) => {
  const searchResultItemTestId =
    testId || generateTestId('feature', 'search-results', `result-item-${entityType}-${result.id}`);

  // Memoized entity URL based on type
  const entityUrl = useMemo(() => {
    if (entityType === 'collection') {
      return $path({ route: '/collections/[collectionSlug]', routeParams: { collectionSlug: result.slug } });
    }

    if (entityType === 'subcollection') {
      const subcollectionResult = result as SubcollectionSearchResult;
      return $path({
        route: '/collections/[collectionSlug]/subcollection/[subcollectionSlug]',
        routeParams: {
          collectionSlug: subcollectionResult.collectionSlug,
          subcollectionSlug: result.slug,
        },
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
    const configMap: Record<SearchResultItemEntityType, { label: string; variant: 'default' | 'outline' | 'secondary' }> =
      {
        bobblehead: { label: 'Bobblehead', variant: 'outline' },
        collection: { label: 'Collection', variant: 'default' },
        subcollection: { label: 'Subcollection', variant: 'secondary' },
      };

    return configMap[entityType];
  }, [entityType]);

  // Derived conditional variables
  const _hasImage = !!displayData.imageUrl;
  const _hasDescription = !!displayData.description && !isCompact;
  const _hasValidImage = displayData.imageUrl && displayData.imageUrl !== '/placeholder.jpg';

  return (
    <Link
      className={cn(
        'group flex items-start gap-3 rounded-md p-2',
        'transition-all duration-200',
        'hover:bg-accent hover:shadow-sm',
        'focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        linkClassName,
        className,
      )}
      data-slot={'search-result-item'}
      data-testid={searchResultItemTestId}
      href={entityUrl}
      onClick={onClick}
    >
      {/* Result Image */}
      <Conditional
        fallback={
          <div
            className={cn('size-12 shrink-0 rounded-md bg-muted', imageClassName)}
            data-slot={'search-result-item-image-placeholder'}
          />
        }
        isCondition={_hasImage}
      >
        <div
          className={cn(
            'relative size-12 shrink-0 overflow-hidden rounded-md bg-muted',
            'transition-transform duration-200 group-hover:scale-105',
            imageClassName,
          )}
          data-slot={'search-result-item-image-container'}
        >
          {_hasValidImage ?
            <CldImage
              alt={displayData.name}
              className={'size-full object-cover'}
              crop={'fill'}
              data-slot={'search-result-item-image'}
              format={'auto'}
              gravity={'auto'}
              height={48}
              quality={'auto:good'}
              sizes={'48px'}
              src={extractPublicIdFromCloudinaryUrl(displayData.imageUrl!)}
              width={48}
            />
          : <div
              className={'flex size-full items-center justify-center bg-muted'}
              data-slot={'search-result-item-image-fallback'}
            >
              <span className={'text-xs text-muted-foreground'}>No Image</span>
            </div>
          }
        </div>
      </Conditional>

      {/* Result Content */}
      <div
        className={cn('flex min-w-0 flex-1 flex-col gap-1', contentClassName)}
        data-slot={'search-result-item-content'}
      >
        {/* Entity Type Badge */}
        <Badge
          className={'w-fit text-xs'}
          data-slot={'search-result-item-badge'}
          variant={badgeConfig.variant}
        >
          {badgeConfig.label}
        </Badge>

        {/* Result Name */}
        <p
          className={cn(
            'truncate text-sm font-medium text-foreground',
            'transition-colors duration-200 group-hover:text-primary',
          )}
          data-slot={'search-result-item-name'}
        >
          {displayData.name}
        </p>

        {/* Result Description */}
        <Conditional isCondition={_hasDescription}>
          <p
            className={'line-clamp-2 text-xs text-muted-foreground'}
            data-slot={'search-result-item-description'}
          >
            {displayData.description}
          </p>
        </Conditional>

        {/* Owner Info */}
        <p
          className={'truncate text-xs text-muted-foreground'}
          data-slot={'search-result-item-owner'}
        >
          By {displayData.owner}
        </p>
      </div>
    </Link>
  );
};
