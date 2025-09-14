import 'server-only';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionSubcollectionsAdd } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-subcollections-add';
import { SubcollectionActions } from '@/app/(app)/collections/[collectionId]/(collection)/components/subcollection-actions';
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
          <ul className={'space-y-3'}>
            {subcollections.map((subcollection) => (
              <li className={'group relative'} key={subcollection.id}>
                <div className={'flex items-start justify-between gap-2'}>
                  <Link
                    className={'flex-1 rounded-md p-2 transition-colors hover:bg-muted/50'}
                    href={$path({
                      route: '/collections/[collectionId]/subcollection/[subcollectionId]',
                      routeParams: {
                        collectionId: collection.id,
                        subcollectionId: subcollection.id,
                      },
                    })}
                  >
                    <div className={'flex flex-col space-y-1'}>
                      <div className={'flex items-center justify-between'}>
                        <span className={'text-sm font-medium'}>{subcollection.name}</span>
                        <Badge className={'text-xs'} variant={'secondary'}>
                          {subcollection.bobbleheadCount}
                        </Badge>
                      </div>
                      <Conditional isCondition={!!subcollection.description}>
                        <p className={'line-clamp-2 text-xs text-muted-foreground'}>
                          {subcollection.description}
                        </p>
                      </Conditional>
                    </div>
                  </Link>

                  <Conditional isCondition={isOwner}>
                    <div className={'opacity-0 transition-opacity group-hover:opacity-100'}>
                      <SubcollectionActions subcollection={subcollection} />
                    </div>
                  </Conditional>
                </div>
              </li>
            ))}
          </ul>
        </Conditional>
      </CardContent>
    </Card>
  );
};
