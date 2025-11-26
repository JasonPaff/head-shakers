'use client';

import { ChevronRightIcon, EyeIcon, LockIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { $path } from 'next-typesafe-url';
import Image from 'next/image';
import Link from 'next/link';

import type { CollectionDashboardData } from '@/lib/facades/collections/collections.facade';

import { CollectionActions } from '@/app/(app)/dashboard/collection/(collection)/components/collection-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { CLOUDINARY_PATHS } from '@/lib/constants/cloudinary-paths';

interface CollectionCardProps {
  collection: CollectionDashboardData;
}

export const CollectionCard = ({ collection }: CollectionCardProps) => {
  return (
    <Card className={'relative flex flex-col'}>
      {/* Cover Photo */}
      <div className={'relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted'}>
        <Conditional isCondition={!!collection.coverImageUrl}>
          <CldImage
            alt={`${collection.name} cover photo`}
            className={'object-cover'}
            fill
            sizes={'(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
            src={collection.coverImageUrl ?? ''}
          />
        </Conditional>
        <Conditional isCondition={!collection.coverImageUrl}>
          <Image
            alt={'Collection placeholder'}
            className={'object-cover'}
            fill
            sizes={'(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
            src={CLOUDINARY_PATHS.PLACEHOLDERS.COLLECTION_COVER}
          />
        </Conditional>
      </div>

      <CardHeader className={'pb-3'}>
        {/* Title and Privacy Status */}
        <div className={'flex items-start justify-between'}>
          <CardTitle className={'text-lg font-semibold text-balance'}>{collection.name}</CardTitle>
          <div className={'mr-8 flex gap-1'}>
            <Conditional isCondition={collection.isPublic}>
              <EyeIcon aria-hidden className={'size-4 text-muted-foreground'} />
            </Conditional>
            <Conditional isCondition={!collection.isPublic}>
              <LockIcon aria-hidden className={'size-4 text-muted-foreground'} />
            </Conditional>
          </div>
        </div>

        {/* Description */}
        <p className={'text-sm text-pretty text-muted-foreground'}>{collection.description}</p>

        {/* Actions Menu */}
        <div className={'absolute top-4 right-4'}>
          <CollectionActions collection={collection} />
        </div>
      </CardHeader>

      <CardContent className={'flex flex-1 flex-col'}>
        <div className={'flex-1 space-y-4'}>
          {/* Metrics Badges */}
          <div className={'flex items-center gap-4 text-sm'}>
            <Badge variant={'secondary'}>{collection.metrics.totalBobbleheads} bobbleheads</Badge>
          </div>
        </div>

        {/* View Collection Button */}
        <Button asChild className={'mt-4'}>
          <Link
            href={$path({
              route: '/collections/[collectionSlug]',
              routeParams: { collectionSlug: collection.slug },
            })}
          >
            View Collection
            <ChevronRightIcon aria-hidden className={'ml-2 size-4'} />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
