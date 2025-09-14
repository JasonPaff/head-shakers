'use client';

import { ChevronDownIcon, ChevronRightIcon, EyeIcon, LockIcon, PlusIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { CollectionDashboardData } from '@/lib/facades/collections/collections.facade';

import { CollectionActions } from '@/app/(app)/dashboard/collection/(collection)/components/collection-actions';
import { SubcollectionCreateDialog } from '@/components/feature/subcollections/subcollection-create-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Conditional } from '@/components/ui/conditional';
import { useToggle } from '@/hooks/use-toggle';

interface CollectionCardProps {
  collection: CollectionDashboardData;
}

export const CollectionCard = ({ collection }: CollectionCardProps) => {
  const [isSubcollectionsOpen, setIsSubcollectionsOpen] = useToggle();
  const [isCreateSubcollectionDialogOpen, setIsCreateSubcollectionDialogOpen] = useToggle();

  const hasSubcollections = collection.subCollections.length > 0;

  return (
    <Card className={'relative flex flex-col'}>
      <CardHeader className={'pb-3'}>
        {/* Title and Privacy Status */}
        <div className={'flex items-start justify-between'}>
          <CardTitle className={'text-lg font-semibold text-balance'}>{collection.name}</CardTitle>
          <div className={'mr-8 flex gap-1'}>
            <Conditional isCondition={collection.isPublic}>
              <EyeIcon aria-hidden className={'size-4 text-muted-foreground'} />
            </Conditional>
            <Conditional isCondition={!collection.isPublic}>
              <LockIcon aria-hidden className={'size-4 text-muted-foreground'} />
            </Conditional>
          </div>
        </div>

        {/* Description */}
        <p className={'text-sm text-pretty text-muted-foreground'}>{collection.description}</p>

        {/* Actions Menu */}
        <div className={'absolute top-4 right-4'}>
          <CollectionActions collection={collection} />
        </div>
      </CardHeader>

      <CardContent className={'flex flex-1 flex-col'}>
        <div className={'flex-1 space-y-4'}>
          {/* Metrics Badges */}
          <div className={'flex items-center gap-4 text-sm'}>
            <Badge variant={'secondary'}>{collection.metrics.totalBobbleheads} bobbleheads</Badge>
            <Conditional isCondition={hasSubcollections}>
              <Badge variant={'outline'}>{collection.subCollections.length} subcollections</Badge>
            </Conditional>
          </div>

          <Conditional isCondition={hasSubcollections}>
            <Collapsible onOpenChange={setIsSubcollectionsOpen.update} open={isSubcollectionsOpen}>
              {/* Trigger Button */}
              <CollapsibleTrigger asChild>
                <Button className={'w-full justify-between'} size={'sm'} variant={'ghost'}>
                  <span className={'text-sm font-medium'}>Subcollections</span>
                  <Conditional isCondition={isSubcollectionsOpen}>
                    <ChevronDownIcon aria-hidden className={'size-4'} />
                  </Conditional>
                  <Conditional isCondition={!isSubcollectionsOpen}>
                    <ChevronRightIcon aria-hidden className={'size-4'} />
                  </Conditional>
                </Button>
              </CollapsibleTrigger>

              {/* Subcollections List */}
              <CollapsibleContent className={'space-y-2 pt-2'}>
                <div className={'max-h-32 space-y-1 overflow-y-auto'}>
                  {collection.subCollections.map((sub) => (
                    <div className={'flex items-center justify-between text-sm'} key={sub.id}>
                      <Link
                        className={'text-muted-foreground hover:text-foreground'}
                        href={$path({
                          route: '/collections/[collectionId]/subcollection/[subcollectionId]',
                          routeParams: {
                            collectionId: collection.id,
                            subcollectionId: sub.id,
                          },
                        })}
                      >
                        {sub.name}
                      </Link>
                      <span className={'rounded bg-muted px-2 py-1 text-xs'}>{sub.bobbleheadCount}</span>
                    </div>
                  ))}
                </div>

                {/* Add Subcollection Button */}
                <Button
                  className={'w-full'}
                  onClick={setIsCreateSubcollectionDialogOpen.on}
                  size={'sm'}
                  variant={'outline'}
                >
                  <PlusIcon aria-hidden className={'mr-2 size-4'} />
                  Add Subcollection
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </Conditional>

          {/* Add Subcollection Button */}
          <Conditional isCondition={!hasSubcollections}>
            <Button
              className={'w-full'}
              onClick={setIsCreateSubcollectionDialogOpen.on}
              size={'sm'}
              variant={'outline'}
            >
              <PlusIcon aria-hidden className={'mr-2 size-4'} />
              Add Subcollection
            </Button>
          </Conditional>
        </div>

        {/* Create Subcollection Dialog */}
        <SubcollectionCreateDialog
          collectionId={collection.id}
          isOpen={isCreateSubcollectionDialogOpen}
          onClose={setIsCreateSubcollectionDialogOpen.off}
        />

        {/* View Collection Button */}
        <Button asChild className={'mt-4'}>
          <Link
            href={$path({
              route: '/collections/[collectionId]',
              routeParams: { collectionId: collection.id },
            })}
          >
            View Collection
            <ChevronRightIcon aria-hidden className={'ml-2 size-4'} />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
