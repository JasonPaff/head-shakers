'use client';

import type { Route } from 'next';

import { ChevronRight, FolderOpen, Heart, ImageIcon, User, Users } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { $path } from 'next-typesafe-url';
import Image from 'next/image';
import Link from 'next/link';

import type {
  BrowseCollectionRecord,
  BrowseCollectionWithSubcollectionsRecord,
  BrowseSubcollectionRecord,
} from '@/lib/queries/collections/collections.query';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { EmptyState } from '@/components/ui/empty-state';
import { CLOUDINARY_PATHS } from '@/lib/constants/cloudinary-paths';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type BrowseCollectionsTableProps = {
  collections: Array<BrowseCollectionRecord | BrowseCollectionWithSubcollectionsRecord>;
};

/**
 * Helper function to check if a record has subcollections
 */
const _hasSubcollections = (
  record: BrowseCollectionRecord | BrowseCollectionWithSubcollectionsRecord,
): record is BrowseCollectionWithSubcollectionsRecord => {
  return (
    'subCollections' in record && Array.isArray(record.subCollections) && record.subCollections.length > 0
  );
};

/**
 * Renders a single subcollection item with visual hierarchy
 */
type SubcollectionItemProps = {
  collectionSlug: string;
  isLast: boolean;
  subcollection: BrowseSubcollectionRecord;
};

const SubcollectionItem = ({ collectionSlug, isLast, subcollection }: SubcollectionItemProps) => {
  const subcollectionTestId = generateTestId('feature', 'browse-subcollection-item', subcollection.id);
  const _hasImage = !!subcollection.coverImageUrl;

  const subcollectionPath = $path({
    route: '/collections/[collectionSlug]/subcollection/[subcollectionSlug]',
    routeParams: {
      collectionSlug,
      subcollectionSlug: subcollection.slug,
    },
  }) as Route;

  return (
    <Link
      className={cn(
        'group/sub flex items-center gap-3 rounded-lg p-3',
        'bg-muted/50 transition-colors hover:bg-muted',
        !isLast && 'mb-2',
      )}
      data-slot={'browse-subcollection-item'}
      data-testid={subcollectionTestId}
      href={subcollectionPath}
    >
      {/* Subcollection Image */}
      <div
        className={'relative size-12 shrink-0 overflow-hidden rounded-md bg-muted'}
        data-slot={'browse-subcollection-image'}
      >
        <Conditional isCondition={_hasImage}>
          <CldImage
            alt={`${subcollection.name} cover`}
            className={'size-full object-cover'}
            crop={'fill'}
            format={'auto'}
            gravity={'auto'}
            height={48}
            quality={'auto:good'}
            src={subcollection.coverImageUrl ?? ''}
            width={48}
          />
        </Conditional>
        <Conditional isCondition={!_hasImage}>
          <Image
            alt={'Subcollection placeholder'}
            className={'size-full object-cover'}
            height={48}
            src={CLOUDINARY_PATHS.PLACEHOLDERS.SUBCOLLECTION_COVER}
            width={48}
          />
        </Conditional>
      </div>

      {/* Subcollection Info */}
      <div className={'min-w-0 flex-1'} data-slot={'browse-subcollection-info'}>
        <h4
          className={'line-clamp-1 text-sm font-medium transition-colors group-hover/sub:text-primary'}
          data-slot={'browse-subcollection-name'}
        >
          {subcollection.name}
        </h4>
        <Conditional isCondition={!!subcollection.description}>
          <p
            className={'line-clamp-1 text-xs text-muted-foreground'}
            data-slot={'browse-subcollection-description'}
          >
            {subcollection.description}
          </p>
        </Conditional>
      </div>

      {/* Item Count Badge */}
      <Badge className={'shrink-0'} variant={'secondary'}>
        {subcollection.itemCount} {subcollection.itemCount === 1 ? 'item' : 'items'}
      </Badge>

      {/* Chevron Indicator */}
      <ChevronRight
        aria-hidden
        className={
          'size-4 shrink-0 text-muted-foreground transition-transform group-hover/sub:translate-x-0.5'
        }
      />
    </Link>
  );
};

export const BrowseCollectionsTable = ({ collections }: BrowseCollectionsTableProps) => {
  const tableTestId = generateTestId('feature', 'browse-collections-table');

  if (collections.length === 0) {
    return (
      <EmptyState
        description={'Try adjusting your filters or search query'}
        icon={ImageIcon}
        title={'No Collections Found'}
      />
    );
  }

  return (
    <div
      className={'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}
      data-slot={'browse-collections-table'}
      data-testid={tableTestId}
    >
      {collections.map((record) => {
        const collectionPath = $path({
          route: '/collections/[collectionSlug]',
          routeParams: { collectionSlug: record.collection.slug },
        }) as Route;

        const _recordHasSubcollections = _hasSubcollections(record);
        const cardTestId = generateTestId('feature', 'browse-collection-card', record.collection.id);

        return (
          <div className={'flex flex-col'} data-slot={'browse-collection-wrapper'} key={record.collection.id}>
            {/* Collection Card */}
            <Link data-slot={'browse-collection-link'} href={collectionPath}>
              <Card
                className={'group h-full transition-all hover:shadow-lg'}
                data-slot={'browse-collection-card'}
                testId={cardTestId}
              >
                {/* Collection Image */}
                <div className={'relative aspect-square w-full overflow-hidden rounded-t-lg bg-muted'}>
                  {record.firstBobbleheadPhoto ?
                    <Image
                      alt={record.collection.name}
                      className={'object-cover transition-transform group-hover:scale-105'}
                      fill
                      sizes={
                        '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw'
                      }
                      src={record.firstBobbleheadPhoto}
                    />
                  : <div className={'flex h-full items-center justify-center'}>
                      <ImageIcon className={'size-16 text-muted-foreground'} />
                    </div>
                  }
                </div>

                {/* Collection Info */}
                <CardHeader className={'space-y-2'}>
                  <CardTitle className={'line-clamp-1 text-lg'}>{record.collection.name}</CardTitle>
                  {record.collection.description && (
                    <CardDescription className={'line-clamp-2'}>
                      {record.collection.description}
                    </CardDescription>
                  )}
                </CardHeader>

                {/* Owner Info */}
                <CardContent className={'space-y-4'}>
                  <div className={'flex items-center gap-2'}>
                    <Avatar className={'size-6'}>
                      {record.owner.avatarUrl && (
                        <AvatarImage alt={record.owner.username} src={record.owner.avatarUrl} />
                      )}
                      <AvatarFallback className={'text-xs'}>
                        <User className={'size-3'} />
                      </AvatarFallback>
                    </Avatar>
                    <span className={'text-sm text-muted-foreground'}>
                      by <span className={'font-medium text-foreground'}>{record.owner.username}</span>
                    </span>
                  </div>

                  {/* Stats */}
                  <div className={'flex items-center justify-between text-sm text-muted-foreground'}>
                    <div className={'flex items-center gap-1'}>
                      <ImageIcon className={'size-4'} />
                      <span>{record.collection.totalItems || 0}</span>
                    </div>
                    <div className={'flex items-center gap-3'}>
                      <div className={'flex items-center gap-1'}>
                        <Heart className={'size-4'} />
                        <span>{record.collection.likeCount || 0}</span>
                      </div>
                      <div className={'flex items-center gap-1'}>
                        <Users className={'size-4'} />
                        <span>{record.followerCount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Subcollections Section */}
            <Conditional isCondition={_recordHasSubcollections}>
              <div
                className={'mt-3 rounded-lg border bg-background p-3'}
                data-slot={'browse-subcollections-section'}
                data-testid={generateTestId('feature', 'browse-subcollections-section', record.collection.id)}
              >
                {/* Subcollections Header */}
                <div className={'mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground'}>
                  <FolderOpen aria-hidden className={'size-4'} />
                  <span>Subcollections</span>
                  <Badge className={'ml-auto'} variant={'outline'}>
                    {_recordHasSubcollections ? record.subCollections.length : 0}
                  </Badge>
                </div>

                {/* Subcollection Items */}
                <div data-slot={'browse-subcollections-list'}>
                  {_recordHasSubcollections &&
                    record.subCollections.map((subcollection, index) => (
                      <SubcollectionItem
                        collectionSlug={record.collection.slug}
                        isLast={index === record.subCollections.length - 1}
                        key={subcollection.id}
                        subcollection={subcollection}
                      />
                    ))}
                </div>
              </div>
            </Conditional>
          </div>
        );
      })}
    </div>
  );
};
