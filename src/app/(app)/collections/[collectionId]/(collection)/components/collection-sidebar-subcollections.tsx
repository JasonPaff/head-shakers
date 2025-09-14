import 'server-only';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionSubcollectionsAdd } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-subcollections-add';
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
  const hasSubcollections = subcollections.length > 0;

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
        {/* No Subcollections Message */}
        <Conditional isCondition={!hasSubcollections}>
          <p className={'text-sm text-muted-foreground'}>This collection has no subcollections.</p>
        </Conditional>

        {/* Subcollections */}
        <Conditional isCondition={hasSubcollections}>
          <ul className={'space-y-2'}>
            {subcollections.map((subcollection) => (
              <li key={subcollection.id}>
                <Link
                  className={'block rounded-md p-2 transition-colors hover:bg-muted/50'}
                  href={$path({
                    route: '/collections/[collectionId]/subcollection/[subcollectionId]',
                    routeParams: {
                      collectionId: collection.id,
                      subcollectionId: subcollection.id,
                    },
                  })}
                >
                  <div className={'flex items-center justify-between'}>
                    <span className={'text-sm font-medium'}>{subcollection.name}</span>
                    <Badge className={'text-xs'} variant={'secondary'}>
                      {subcollection.bobbleheadCount}
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Conditional>
      </CardContent>
    </Card>
  );
};
