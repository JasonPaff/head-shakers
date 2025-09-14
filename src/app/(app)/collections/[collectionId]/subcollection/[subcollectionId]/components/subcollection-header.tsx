import 'server-only';
import { ArrowLeftIcon, CalendarIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import type { PublicSubcollection } from '@/lib/facades/collections/subcollections.facade';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { LikeIconButton } from '@/components/ui/like-button';

interface SubcollectionHeaderProps {
  likeData?: {
    isLiked: boolean;
    likeCount: number;
    likeId: null | string;
  };
  subcollection: PublicSubcollection;
}

export const SubcollectionHeader = ({ likeData, subcollection }: SubcollectionHeaderProps) => {
  if (!subcollection) throw new Error('Subcollection is required');

  return (
    <Fragment>
      <div className={'mb-6 flex items-center gap-4'}>
        {/* Back to Collections Button */}
        <Button asChild size={'sm'} variant={'outline'}>
          <Link
            href={$path({
              route: '/collections/[collectionId]',
              routeParams: { collectionId: subcollection.collectionId },
            })}
          >
            <ArrowLeftIcon aria-hidden className={'mr-2 size-4'} />
            Back to {subcollection.collectionName}
          </Link>
        </Button>
      </div>

      <div className={'flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'}>
        {/* Collection Info */}
        <div className={'flex-1'}>
          <h1 className={'mb-3 text-4xl font-bold text-balance text-primary'}>{subcollection.name}</h1>
          <p className={'max-w-3xl text-lg text-pretty text-muted-foreground'}>{subcollection.description}</p>
        </div>

        <div className={'flex flex-col justify-between gap-4 sm:flex-row lg:justify-normal'}>
          <div className={'flex flex-wrap items-center gap-4 text-sm text-muted-foreground'}>
            {/* Collection Metadata */}
            <div className={'flex items-center gap-2'}>
              <CalendarIcon aria-hidden className={'size-4'} />
              Created {subcollection.createdAt.toLocaleDateString()}
            </div>
            <div>{subcollection.bobbleheadCount} Bobbleheads</div>

            {/* Like Button */}
            <Conditional isCondition={!!likeData}>
              <LikeIconButton
                initialLikeCount={likeData?.likeCount ?? 0}
                isInitiallyLiked={likeData?.isLiked ?? false}
                targetId={subcollection.id}
                targetType={'subcollection'}
              />
            </Conditional>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
