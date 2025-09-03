import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { ChevronRightIcon, EyeIcon, LockIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
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
        <h2 className={'text-lg font-semibold text-foreground'}>Collections</h2>
        <div className={'text-sm text-muted-foreground'}>
          {_totalCollectionCount} Collections • {_totalBobbleheadCount} Bobbleheads
        </div>
      </div>

      <div className={'grid gap-6 md:grid-cols-2 lg:grid-cols-3'}>
        {collections.map((collection) => (
          <Card className={'group flex flex-col transition-shadow hover:shadow-lg'} key={collection.id}>
            {/* Collection Header */}
            <CardHeader className={'pb-3'}>
              <div className={'flex items-start justify-between'}>
                <CardTitle className={'text-lg font-semibold text-balance'}>{collection.name}</CardTitle>
                <div className={'flex gap-1'}>
                  <Conditional isCondition={collection.isPublic}>
                    <EyeIcon aria-hidden className={'size-4 text-muted-foreground'} />
                  </Conditional>
                  <Conditional isCondition={!collection.isPublic}>
                    <LockIcon aria-hidden className={'size-4 text-muted-foreground'} />
                  </Conditional>
                </div>
              </div>
              <p className={'text-sm text-pretty text-muted-foreground'}>{collection.description}</p>
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
              <Button asChild variant={'outline'}>
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
