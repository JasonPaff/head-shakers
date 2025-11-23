import 'server-only';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionSubcollectionsAdd } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/collection-subcollections-add';
import { CollectionSubcollectionsList } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/collection-subcollections-list';
import { Badge } from '@/components/ui/badge';
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
      <CardHeader className={'flex-row items-center justify-between gap-2 space-y-0 pb-3'}>
        {/* Title and Count Badge */}
        <div className={'flex items-center gap-2'}>
          <CardTitle>Subcollections</CardTitle>
          <Badge variant={'secondary'}>{subcollections.length}</Badge>
        </div>

        {/* Add Subcollection Button */}
        <Conditional isCondition={isOwner}>
          <CollectionSubcollectionsAdd collectionId={collection.id} />
        </Conditional>
      </CardHeader>

      {/* Subcollections List */}
      <CardContent>
        <CollectionSubcollectionsList
          collectionSlug={collection.slug}
          isOwner={isOwner}
          subcollections={subcollections}
        />
      </CardContent>
    </Card>
  );
};
