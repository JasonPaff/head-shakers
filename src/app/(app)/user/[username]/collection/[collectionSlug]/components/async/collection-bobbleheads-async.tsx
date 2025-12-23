import 'server-only';

import type { LayoutVariant } from '@/app/(app)/user/[username]/collection/[collectionSlug]/components/bobblehead-grid';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { BobbleheadGrid } from '@/app/(app)/user/[username]/collection/[collectionSlug]/components/bobblehead-grid';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { generateTestId } from '@/lib/test-ids';
import { getUserIdAsync } from '@/utils/auth-utils';

interface CollectionBobbleheadsAsyncProps extends ComponentTestIdProps {
  collectionId: string;
  collectionSlug: string;
  isOwner: boolean;
  layoutVariant: LayoutVariant;
  searchParams: { search?: string; sort?: string };
}

export const CollectionBobbleheadsAsync = async ({
  collectionId,
  collectionSlug,
  isOwner,
  layoutVariant,
  searchParams,
  testId,
}: CollectionBobbleheadsAsyncProps) => {
  const bobbleheadsAsyncTestId = testId || generateTestId('feature', 'collection-bobbleheads-async');

  const currentUserId = await getUserIdAsync();

  const searchTerm = searchParams?.search || undefined;
  const sortBy = searchParams?.sort || 'newest';

  const options = {
    searchTerm,
    sortBy,
  };

  const bobbleheads = await CollectionsFacade.getAllCollectionBobbleheadsWithPhotosAsync(
    collectionId,
    currentUserId || undefined,
    options,
  );

  return (
    <div data-slot={'collection-bobbleheads-async'} data-testid={bobbleheadsAsyncTestId}>
      <BobbleheadGrid
        bobbleheads={bobbleheads}
        collectionSlug={collectionSlug}
        isOwner={isOwner}
        layoutVariant={layoutVariant}
      />
    </div>
  );
};
