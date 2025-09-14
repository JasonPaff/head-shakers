import 'server-only';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionSubcollectionsAdd } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-subcollections-add';
import { CollectionSubcollectionsList } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-subcollections-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { SubcollectionsFacade } from '@/lib/facades/collections/subcollections.facade';
import { checkIsOwner, getOptionalUserId } from '@/utils/optional-auth-utils';

interface CollectionSidebarSubcollectionsProps {
  collection: NonNullable<PublicCollection>;
}

export const CollectionSidebarSubcollections = async ({
  collection,
}: CollectionSidebarSubcollectionsProps) => {
  const currentUserId = await getOptionalUserId();
  const isOwner = await checkIsOwner(collection.userId);

  const result = await SubcollectionsFacade.getSubCollectionsForPublicView(
    collection.id,
    currentUserId || undefined,
  );

  const subcollections = result?.subCollections ?? [];

  return (
    <Card>
      <CardHeader className={'flex-row items-center justify-between space-y-0 pb-3'}>
        <CardTitle>Subcollections</CardTitle>

        {/* Add Subcollection Button */}
        <Conditional isCondition={isOwner}>
          <CollectionSubcollectionsAdd />
        </Conditional>
      </CardHeader>

      {/* Subcollections List */}
      <CardContent>
        <CollectionSubcollectionsList
          collectionId={collection.id}
          isOwner={isOwner}
          subcollections={subcollections}
        />
      </CardContent>
    </Card>
  );
};
