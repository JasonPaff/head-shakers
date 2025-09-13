import 'server-only';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionSubcollectionsAdd } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-subcollections-add';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { SubcollectionsFacade } from '@/lib/facades/collections/subcollections.facade';
import { checkIsOwner, getOptionalUserId } from '@/utils/optional-auth-utils';

interface CollectionSubcollectionsProps {
  collection: NonNullable<PublicCollection>;
}

// TODO: add a nice empty state when there are no subcollections

export const CollectionSubcollections = async ({ collection }: CollectionSubcollectionsProps) => {
  const currentUserId = await getOptionalUserId();
  const isOwner = await checkIsOwner(collection.userId);

  const result = await SubcollectionsFacade.getSubCollectionsForPublicView(
    collection.id,
    currentUserId || undefined,
  );

  const subcollections = result?.subCollections ?? [];
  const hasItems = subcollections.length > 0;

  return (
    <Conditional isCondition={hasItems}>
      <div className={'mb-12'}>
        <div className={'mb-6 flex items-center justify-between'}>
          <h2 className={'text-2xl font-bold text-foreground'}>Subcollections</h2>

          {/* Add Subcollection Button */}
          <Conditional isCondition={isOwner}>
            <CollectionSubcollectionsAdd />
          </Conditional>
        </div>

        {/* Subcollections Grid */}
        <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
          {subcollections.map((subcollection) => (
            <Card className={'group'} key={subcollection.id}>
              <CardHeader className={'pb-3'}>
                {/* Subcollection Image */}
                <div className={'relative mb-4 aspect-square overflow-hidden rounded-lg bg-muted'}>
                  <img
                    alt={subcollection.name}
                    className={'object-cover transition-transform duration-300 group-hover:scale-105'}
                    src={subcollection.featurePhoto || '/placeholder.jpg'}
                  />
                </div>
                <CardTitle className={'text-lg text-balance'}>{subcollection.name}</CardTitle>
              </CardHeader>

              {/* Card Content */}
              <CardContent className={'pt-0'}>
                <p className={'mb-4 text-sm text-pretty text-muted-foreground'}>
                  {subcollection.description}
                </p>
                <div className={'flex items-center justify-between'}>
                  <Badge variant={'secondary'}>{subcollection.bobbleheadCount} items</Badge>

                  {/* View Subcollection Button */}
                  <Button asChild size={'sm'} variant={'outline'}>
                    <Link
                      href={$path({
                        route: '/collections/[collectionId]/subcollection/[subcollectionId]',
                        routeParams: {
                          collectionId: collection.id,
                          subcollectionId: subcollection.id,
                        },
                      })}
                      scroll
                    >
                      View Subcollection
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Conditional>
  );
};
