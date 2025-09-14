import 'server-only';
import { notFound } from 'next/navigation';

import type { SubcollectionSearchParams } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/route-type';

import { SubcollectionBobbleheads } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-bobbleheads';
import { SubcollectionHeader } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-header';
import { SubcollectionMetrics } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-metrics';
import { SubcollectionsFacade } from '@/lib/facades/collections/subcollections.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

interface SubcollectionProps {
  collectionId: string;
  searchParams?: SubcollectionSearchParams;
  subcollectionId: string;
}

export const Subcollection = async ({ collectionId, searchParams, subcollectionId }: SubcollectionProps) => {
  const currentUserId = await getOptionalUserId();
  const subcollection = await SubcollectionsFacade.getSubCollectionForPublicView(
    collectionId,
    subcollectionId,
    currentUserId || undefined,
  );

  if (!subcollection) {
    notFound();
  }

  const likeResult = await SocialFacade.getContentLikeData(
    subcollectionId,
    'subcollection',
    currentUserId ?? undefined,
  );

  return (
    <div>
      {/* Header Section */}
      <div className={'border-b border-border'}>
        <div className={'mx-auto max-w-7xl p-2'}>
          <SubcollectionHeader likeData={likeResult} subcollection={subcollection} />
        </div>
      </div>

      {/* Main Content */}
      <div className={'mx-auto mt-4 max-w-7xl p-2'}>
        <div className={'grid grid-cols-1 gap-8 lg:grid-cols-12'}>
          {/* Main Content Area */}
          <div className={'order-2 lg:order-1 lg:col-span-9'}>
            <SubcollectionBobbleheads
              collectionId={collectionId}
              searchParams={searchParams}
              subcollection={subcollection}
            />
          </div>

          {/* Sidebar */}
          <aside className={'order-1 flex flex-col gap-6 lg:order-2 lg:col-span-3'}>
            <SubcollectionMetrics subcollection={subcollection} />
          </aside>
        </div>
      </div>
    </div>
  );
};
