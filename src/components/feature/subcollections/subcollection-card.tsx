'use client';

import { CldImage } from 'next-cloudinary';
import { $path } from 'next-typesafe-url';
import Image from 'next/image';
import Link from 'next/link';

import { SubcollectionActions } from '@/components/feature/subcollections/subcollection-actions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { CLOUDINARY_PATHS } from '@/lib/constants/cloudinary-paths';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface SubcollectionCardProps {
  collectionSlug: string;
  isOwner: boolean;
  subcollection: {
    bobbleheadCount: number;
    coverImageUrl?: null | string;
    description: null | string;
    id: string;
    name: string;
    slug: string;
  };
}

export const SubcollectionCard = ({ collectionSlug, isOwner, subcollection }: SubcollectionCardProps) => {
  const subcollectionCardTestId = generateTestId('feature', 'subcollection-card', subcollection.id);

  const _hasImage = !!subcollection.coverImageUrl;
  const _hasDescription = !!subcollection.description;

  const subcollectionUrl = $path({
    route: '/collections/[collectionSlug]/subcollection/[subcollectionSlug]',
    routeParams: {
      collectionSlug,
      subcollectionSlug: subcollection.slug,
    },
  });

  return (
    <Card
      className={'group overflow-hidden py-0 transition-all hover:shadow-lg'}
      data-slot={'subcollection-card'}
      testId={subcollectionCardTestId}
    >
      {/* Card Image Section */}
      <Link
        aria-label={`View ${subcollection.name} subcollection`}
        className={'block'}
        data-slot={'subcollection-card-image-link'}
        data-testid={generateTestId('feature', 'subcollection-card-image-link', subcollection.id)}
        href={subcollectionUrl}
      >
        <div className={'relative aspect-[4/3] w-full overflow-hidden bg-muted'}>
          <Conditional isCondition={_hasImage}>
            <CldImage
              alt={`${subcollection.name} cover`}
              className={'size-full object-cover transition-transform duration-300 group-hover:scale-105'}
              crop={'fill'}
              format={'auto'}
              gravity={'auto'}
              height={400}
              quality={'auto:good'}
              src={subcollection.coverImageUrl ?? ''}
              width={533}
            />
          </Conditional>
          <Conditional isCondition={!_hasImage}>
            <Image
              alt={'Subcollection placeholder'}
              className={'size-full object-cover transition-transform duration-300 group-hover:scale-105'}
              height={400}
              src={CLOUDINARY_PATHS.PLACEHOLDERS.SUBCOLLECTION_COVER}
              width={533}
            />
          </Conditional>
        </div>
      </Link>

      {/* Card Content Section */}
      <CardContent className={'p-4'}>
        {/* Header with Title, Badge, and Actions */}
        <div className={'mb-2 flex items-start justify-between gap-2'}>
          <div className={'min-w-0 flex-1'}>
            <Link
              data-slot={'subcollection-card-title-link'}
              data-testid={generateTestId('feature', 'subcollection-card-title-link', subcollection.id)}
              href={subcollectionUrl}
            >
              <h3
                className={cn(
                  'line-clamp-1 font-semibold transition-colors hover:text-primary',
                  'flex min-h-[44px] items-center',
                )}
                data-slot={'subcollection-card-title'}
              >
                {subcollection.name}
              </h3>
            </Link>
          </div>

          {/* Badge and Actions */}
          <div className={'flex flex-shrink-0 items-center gap-1'}>
            <Badge variant={'secondary'}>
              {subcollection.bobbleheadCount} {subcollection.bobbleheadCount === 1 ? 'item' : 'items'}
            </Badge>

            {/* Owner Actions */}
            <Conditional isCondition={isOwner}>
              <SubcollectionActions subcollection={subcollection} />
            </Conditional>
          </div>
        </div>

        {/* Description Preview */}
        <Conditional isCondition={_hasDescription}>
          <p className={'line-clamp-2 text-sm text-muted-foreground'}>{subcollection.description}</p>
        </Conditional>
      </CardContent>
    </Card>
  );
};
