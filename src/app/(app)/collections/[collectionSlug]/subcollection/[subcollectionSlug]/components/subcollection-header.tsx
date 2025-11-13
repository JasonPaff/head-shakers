import 'server-only';
import { ArrowLeftIcon, CalendarIcon, ShareIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import type { PublicSubcollection } from '@/lib/facades/collections/subcollections.facade';

import { SubCollectionCoverPhoto } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/subcollection-cover-photo';
import { SubcollectionEditSection } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/subcollection-edit-section';
import { ReportButton } from '@/components/feature/content-reports/report-button';
import { SubcollectionDelete } from '@/components/feature/subcollections/subcollection-delete';
import { SubcollectionShareMenu } from '@/components/feature/subcollections/subcollection-share-menu';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { LikeIconButton } from '@/components/ui/like-button';
import { checkIsOwner, getOptionalUserId } from '@/utils/optional-auth-utils';

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
  const currentUserId = await getOptionalUserId();

  return (
    <Fragment>
      <div className={'mb-6 flex items-center justify-between gap-4'}>
        {/* Back to Collections Button */}
        <Button asChild size={'sm'} variant={'outline'}>
          <Link
            href={$path({
              route: '/collections/[collectionSlug]',
              routeParams: { collectionId: subcollection.collectionId },
            })}
          >
            <ArrowLeftIcon aria-hidden className={'mr-2 size-4'} />
            Back to {subcollection.collectionName}
          </Link>
        </Button>

        <div className={'flex items-center gap-2'}>
          {/* Share Button */}
          <SubcollectionShareMenu
            collectionId={subcollection.collectionId}
            subcollectionId={subcollection.id}
          >
            <Button size={'sm'} variant={'outline'}>
              <ShareIcon aria-hidden className={'mr-2 size-4'} />
              Share
            </Button>
          </SubcollectionShareMenu>

          {/* Owner Actions */}
          <Conditional isCondition={isOwner}>
            <Fragment>
              {/* Edit Subcollection Button */}
              <SubcollectionEditSection isOwner={isOwner} subcollection={subcollection} />

              {/* Delete Button */}
              <SubcollectionDelete subcollectionId={subcollection.id}>Delete</SubcollectionDelete>
            </Fragment>
          </Conditional>

          {/* Non-Owner Actions */}
          <Conditional isCondition={!isOwner && !!currentUserId}>
            <ReportButton targetId={subcollection.id} targetType={'subcollection'} variant={'outline'} />
          </Conditional>
        </div>
      </div>

      {/* Cover Photo */}
      <SubCollectionCoverPhoto subcollection={subcollection} />

      <div className={'flex flex-col gap-6'}>
        {/* Subcollection Info */}
        <div>
          <h1 className={'mb-3 text-4xl font-bold text-balance text-primary'}>{subcollection.name}</h1>
          <p className={'text-lg text-pretty text-muted-foreground'}>{subcollection.description}</p>
        </div>

        {/* Subcollection Metadata & Like Button */}
        <div className={'flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground'}>
          {/* Like Button */}
          <Conditional isCondition={!!likeData}>
            <LikeIconButton
              initialLikeCount={likeData?.likeCount ?? 0}
              isInitiallyLiked={likeData?.isLiked ?? false}
              targetId={subcollection.id}
              targetType={'subcollection'}
            />
          </Conditional>

          <div className={'flex items-center gap-4'}>
            {/* Bobblehead Count */}
            <div>{subcollection.bobbleheadCount} Bobbleheads</div>

            {/* Creation Date */}
            <div className={'flex items-center gap-2'}>
              <CalendarIcon aria-hidden className={'size-4'} />
              Created {subcollection.createdAt.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
