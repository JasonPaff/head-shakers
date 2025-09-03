import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { ChevronRightIcon, EyeIcon, LockIcon, MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { CollectionCreateButton } from '@/app/(app)/dashboard/collection/(collection)/components/collection-create-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCollectionsDashboardDataAsync } from '@/lib/queries/collections.queries';

export const CollectionList = async () => {
  const { userId } = await auth();
  if (!userId) redirect($path({ route: '/' }));

  const collections = (await getCollectionsDashboardDataAsync(userId)) || [];

  const _totalCollectionCount = collections?.length || 0;
  const _totalBobbleheadCount = collections?.reduce((acc, col) => acc + col.totalBobbleheadCount, 0) || 0;

  return (
    <div className={'container mx-auto px-4 py-8'}>
      {/* Collection Stats */}
      <div className={'mb-6 flex items-center justify-between'}>
        <div>
          <h2 className={'text-lg font-semibold text-foreground'}>Collections</h2>
          <div className={'text-sm text-muted-foreground'}>
            {_totalCollectionCount} Collections • {_totalBobbleheadCount} Bobbleheads
          </div>
        </div>

        {/* Create Collection Button */}
        <CollectionCreateButton />
      </div>

      <div className={'grid gap-6 md:grid-cols-2 lg:grid-cols-3'}>
        {collections.map((collection) => (
          <Card className={'relative flex flex-col'} key={collection.id}>
            {/* Collection Header */}
            <CardHeader className={'pb-3'}>
              <div className={'flex items-start justify-between'}>
                {/* Title */}
                <CardTitle className={'text-lg font-semibold text-balance'}>{collection.name}</CardTitle>

                {/* Privacy Icon */}
                <div className={'mr-8 flex gap-1'}>
                  <Conditional isCondition={collection.isPublic}>
                    <EyeIcon aria-hidden className={'size-4 text-muted-foreground'} />
                  </Conditional>
                  <Conditional isCondition={!collection.isPublic}>
                    <LockIcon aria-hidden className={'size-4 text-muted-foreground'} />
                  </Conditional>
                </div>
              </div>

              {/* Collection Description */}
              <p className={'text-sm text-pretty text-muted-foreground'}>{collection.description}</p>

              {/* Collection Actions */}
              <div className={'absolute top-4 right-4'}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size={'sm'} variant={'ghost'}>
                      <MoreVerticalIcon aria-hidden className={'size-4'} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={'end'}>
                    <DropdownMenuItem>
                      <PencilIcon aria-hidden className={'mr-2 size-4'} />
                      Edit Collection
                    </DropdownMenuItem>
                    <DropdownMenuItem variant={'destructive'}>
                      <Trash2Icon aria-hidden className={'mr-2 size-4'} />
                      Delete Collection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className={'flex flex-1 flex-col'}>
              <div className={'flex-1 space-y-4'}>
                {/* Collection Stats */}
                <div className={'flex items-center gap-4 text-sm'}>
                  <Badge variant={'secondary'}>{collection.bobbleheadCount} bobbleheads</Badge>
                  <Conditional isCondition={collection.subCollectionCount > 0}>
                    <Badge variant={'outline'}>{collection.subCollectionCount} subcollections</Badge>
                  </Conditional>
                </div>

                {/* Subcollections */}
                <Conditional isCondition={collection.subCollections.length > 0}>
                  <div className={'space-y-2'}>
                    <h4 className={'text-sm font-medium text-foreground'}>Subcollections</h4>
                    <div className={'max-h-32 space-y-1 overflow-y-auto'}>
                      {collection.subCollections.map((sub) => (
                        <div className={'flex items-center justify-between text-sm'} key={sub.id}>
                          <span className={'text-muted-foreground'}>{sub.name}</span>
                          <span className={'rounded bg-muted px-2 py-1 text-xs'}>{sub.bobbleheadCount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Conditional>
              </div>

              {/* View Collection Link */}
              <Button asChild className={'mt-4'} variant={'outline'}>
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
        ))}
      </div>
    </div>
  );
};
