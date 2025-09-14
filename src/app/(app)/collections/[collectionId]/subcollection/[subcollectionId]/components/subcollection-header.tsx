import 'server-only';
import { ArrowLeftIcon, CalendarIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import type { PublicSubcollection } from '@/lib/facades/collections/subcollections.facade';

import { SubcollectionEditSection } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-edit-section';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { LikeIconButton } from '@/components/ui/like-button';
import { checkIsOwner } from '@/utils/optional-auth-utils';

interface SubcollectionHeaderProps {
  likeData?: {
    isLiked: boolean;
    likeCount: number;
    likeId: null | string;
  };
  subcollection: PublicSubcollection;
}

export const SubcollectionHeader = async ({ likeData, subcollection }: SubcollectionHeaderProps) => {
  if (!subcollection) throw new Error('Subcollection is required');

  const isOwner = await checkIsOwner(subcollection.userId);

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
        <SubcollectionEditSection isOwner={isOwner} subcollection={subcollection} />
      </div>

      <div className={'flex flex-col gap-6'}>
        {/* Subcollection Info */}
        <div>
          <h1 className={'mb-3 text-4xl font-bold text-balance text-primary'}>{subcollection.name}</h1>
          <p className={'text-lg text-pretty text-muted-foreground'}>{subcollection.description}</p>
        </div>

        {/* Subcollection Metadata & Like Button */}
        <div className={'flex flex-wrap items-center gap-4 text-sm text-muted-foreground'}>
          {/* Creation Date */}
          <div className={'flex items-center gap-2'}>
            <CalendarIcon aria-hidden className={'size-4'} />
            Created {subcollection.createdAt.toLocaleDateString()}
          </div>

          {/* Bobblehead Count */}
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
    </Fragment>
  );
};
