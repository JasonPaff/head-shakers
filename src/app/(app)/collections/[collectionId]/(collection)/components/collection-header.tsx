import 'server-only';
import { ArrowLeftIcon, CalendarIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { LikeIconButton } from '@/components/ui/like-button';
import { checkIsOwner } from '@/utils/optional-auth-utils';

interface CollectionHeaderProps {
  collection: PublicCollection;
  likeData?: {
    isLiked: boolean;
    likeCount: number;
    likeId: null | string;
  };
}

export const CollectionHeader = async ({ collection, likeData }: CollectionHeaderProps) => {
  if (!collection) throw new Error('Collection is required');

  const isOwner = await checkIsOwner(collection.userId);

  return (
    <Fragment>
      {/* Back to Collections Button */}
      <div className={'mb-6 flex items-center gap-4'}>
        <Conditional isCondition={isOwner}>
          <Button asChild size={'sm'} variant={'outline'}>
            <Link href={$path({ route: '/dashboard/collection' })}>
              <ArrowLeftIcon aria-hidden className={'mr-2 size-4'} />
              Back to Collections
            </Link>
          </Button>
        </Conditional>
      </div>

      <div className={'flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'}>
        {/* Collection Info */}
        <div className={'flex-1'}>
          <h1 className={'mb-3 text-4xl font-bold text-balance text-primary'}>{collection.name}</h1>
          <p className={'max-w-3xl text-lg text-pretty text-muted-foreground'}>{collection.description}</p>
        </div>

        <div className={'flex flex-col justify-between gap-4 sm:flex-row lg:justify-normal'}>
          {/* Collection Metadata & Like Button */}
          <div className={'flex flex-wrap items-center gap-4 text-sm text-muted-foreground'}>
            {/* Creation Date */}
            <div className={'flex items-center gap-2'}>
              <CalendarIcon aria-hidden className={'size-4'} />
              Created {collection.createdAt.toLocaleDateString()}
            </div>

            {/* Bobblehead Count */}
            <div>{collection.totalBobbleheadCount} Bobbleheads</div>

            {/* Like Button */}
            <Conditional isCondition={!!likeData}>
              <LikeIconButton
                initialLikeCount={likeData?.likeCount ?? 0}
                isInitiallyLiked={likeData?.isLiked ?? false}
                targetId={collection.id}
                targetType={'collection'}
              />
            </Conditional>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
