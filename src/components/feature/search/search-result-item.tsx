'use client';

import { $path } from 'next-typesafe-url';
import Image from 'next/image';
import Link from 'next/link';

import type {
  BobbleheadSearchResult,
  CollectionSearchResult,
  SubcollectionSearchResult,
} from '@/lib/queries/content-search/content-search.query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type SearchResultItemProps = ComponentTestIdProps & {
  className?: string;
  entityType: 'bobblehead' | 'collection' | 'subcollection';
  onClick?: () => void;
  result: BobbleheadSearchResult | CollectionSearchResult | SubcollectionSearchResult;
};

export const SearchResultItem = ({
  className,
  entityType,
  onClick,
  result,
  testId,
}: SearchResultItemProps) => {
  const searchResultItemTestId = testId || generateTestId('feature', 'search-results', 'result-item');

  // Determine entity URL based on type
  const entityUrl =
    entityType === 'collection' ?
      $path({ route: '/collections/[collectionId]', routeParams: { collectionId: result.id } })
    : entityType === 'subcollection' ?
      $path({
        route: '/collections/[collectionId]/subcollection/[subcollectionId]',
        routeParams: {
          collectionId: (result as SubcollectionSearchResult).collectionId,
          subcollectionId: result.id,
        },
      })
    : $path({ route: '/bobbleheads/[bobbleheadId]', routeParams: { bobbleheadId: result.id } });

  // Get entity-specific display data
  const displayName =
    'name' in result && result.name ? result.name
    : 'characterName' in result && result.characterName ? result.characterName
    : 'Unknown';

  const displayDescription =
    'description' in result && result.description ? result.description
    : 'collectionName' in result && result.collectionName ? `From collection: ${result.collectionName}`
    : '';

  const displayImageUrl =
    'primaryPhotoUrl' in result && result.primaryPhotoUrl ? result.primaryPhotoUrl
    : 'coverImageUrl' in result && result.coverImageUrl ? result.coverImageUrl
    : null;

  const displayOwner =
    'ownerName' in result && result.ownerName ? result.ownerName
    : 'ownerUsername' in result && result.ownerUsername ? result.ownerUsername
    : 'Unknown';

  // Entity type badge variant
  const badgeVariant =
    entityType === 'collection' ? 'default'
    : entityType === 'subcollection' ? 'secondary'
    : 'outline';

  // Derived conditional variables
  const _hasImage = !!displayImageUrl;
  const _hasDescription = !!displayDescription;

  return (
    <Link
      className={cn(
        'flex items-start gap-3 rounded-md p-2 transition-colors',
        'hover:bg-accent focus-visible:bg-accent focus-visible:outline-none',
        className,
      )}
      data-slot={'search-result-item'}
      data-testid={searchResultItemTestId}
      href={entityUrl}
      onClick={onClick}
    >
      {/* Result Image */}
      <Conditional
        fallback={<div className={'size-12 shrink-0 rounded-md bg-muted'} />}
        isCondition={_hasImage}
      >
        <div className={'relative size-12 shrink-0 overflow-hidden rounded-md bg-muted'}>
          <Image
            alt={displayName}
            className={'object-cover'}
            fill
            sizes={'48px'}
            src={displayImageUrl || ''}
          />
        </div>
      </Conditional>

      {/* Result Content */}
      <div className={'flex min-w-0 flex-1 flex-col gap-1'}>
        {/* Entity Type Badge */}
        <Badge className={'w-fit text-xs'} variant={badgeVariant}>
          {entityType === 'collection' ?
            'Collection'
          : entityType === 'subcollection' ?
            'Subcollection'
          : 'Bobblehead'}
        </Badge>

        {/* Result Name */}
        <p className={'truncate text-sm font-medium text-foreground'}>{displayName}</p>

        {/* Result Description */}
        <Conditional isCondition={_hasDescription}>
          <p className={'line-clamp-2 text-xs text-muted-foreground'}>{displayDescription}</p>
        </Conditional>

        {/* Owner Info */}
        <p className={'truncate text-xs text-muted-foreground'}>By {displayOwner}</p>
      </div>
    </Link>
  );
};
