import 'server-only';
import { ArrowLeftIcon, CalendarIcon, ShareIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionCoverPhoto } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/collection-cover-photo';
import { CollectionEditSection } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/collection-edit-section';
import { CollectionDelete } from '@/components/feature/collections/collection-delete';
import { CollectionShareMenu } from '@/components/feature/collections/collection-share-menu';
import { ReportButton } from '@/components/feature/content-reports/report-button';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { LikeIconButton } from '@/components/ui/like-button';
import { checkIsOwner, getOptionalUserId } from '@/utils/optional-auth-utils';

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

  const currentUserId = await getOptionalUserId();
  const isOwner = await checkIsOwner(collection.userId);

  return (
    <Fragment>
      {/* Back to Collections Button and Edit Button */}
      <div className={'mb-6 flex items-center justify-between gap-4'}>
        <Conditional isCondition={isOwner}>
          <Button asChild size={'sm'} variant={'outline'}>
            <Link href={$path({ route: '/dashboard/collection' })}>
              <ArrowLeftIcon aria-hidden className={'mr-2 size-4'} />
              Back to Collections
            </Link>
          </Button>
        </Conditional>

        {/* Share, Edit Collection Button and Delete Button */}
        <div className={'flex items-center gap-2'}>
          {/* Share Collection Button */}
          <CollectionShareMenu collectionSlug={collection.slug}>
            <Button size={'sm'} variant={'outline'}>
              <ShareIcon aria-hidden className={'mr-2 size-4'} />
              Share
            </Button>
          </CollectionShareMenu>

          {/* Owner Actions */}
          <Conditional isCondition={isOwner}>
            <Fragment>
              {/* Edit Collection Button */}
              <CollectionEditSection collection={collection} isOwner={isOwner} />

              {/* Delete Collection Button */}
              <CollectionDelete collectionId={collection.id}>Delete</CollectionDelete>
            </Fragment>
          </Conditional>

          {/* Non-Owner Actions */}
          <Conditional isCondition={!isOwner && !!currentUserId}>
            <ReportButton targetId={collection.id} targetType={'collection'} variant={'outline'} />
          </Conditional>
        </div>
      </div>

      {/* Cover Photo */}
      <CollectionCoverPhoto collection={collection} />

      <div className={'flex flex-col gap-6'}>
        {/* Collection Info */}
        <div>
          <h1 className={'mb-3 text-4xl font-bold text-balance text-primary'}>{collection.name}</h1>
          <p className={'text-lg text-pretty text-muted-foreground'}>{collection.description}</p>
        </div>
        {/* Collection Metadata & Like Button */}{' '}
        <div className={'flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground'}>
          {/* Like Button */}
          <Conditional isCondition={!!likeData}>
            <LikeIconButton
              initialLikeCount={likeData?.likeCount ?? 0}
              isInitiallyLiked={likeData?.isLiked ?? false}
              targetId={collection.id}
              targetType={'collection'}
            />
          </Conditional>

          <div className={'flex items-center gap-4'}>
            {/* Bobblehead Count */}
            <div>{collection.totalBobbleheadCount} Bobbleheads</div>

            {/* Creation Date */}
            <div className={'flex items-center gap-2'}>
              <CalendarIcon aria-hidden className={'size-4'} />
              Created {new Date(collection.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
