import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { ChevronRightIcon, EyeIcon, LockIcon, StarIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCollectionsByUserAsync } from '@/lib/queries/collections.queries';
import { getUserByClerkIdAsync } from '@/lib/queries/users.queries';

export const CollectionList = async () => {
  const { userId: clerkUserId } = await auth();

  const dbUser = await getUserByClerkIdAsync(clerkUserId!);
  if (!dbUser) redirect($path({ route: '/' }));

  const items = await getCollectionsByUserAsync(dbUser.id);

  const _totalItems = items?.reduce((acc, item) => acc + item.totalItems, 0) || 0;
  const _totalCollections = items?.length || 0;

  return (
    <div className={'container mx-auto px-4 py-8'}>
      <div className={'mb-6 flex items-center justify-between'}>
        <h2 className={'text-lg font-semibold text-foreground'}>Collections</h2>
        <div className={'text-sm text-muted-foreground'}>
          {_totalCollections} Collections • {_totalItems} Bobbleheads
        </div>
      </div>

      <div className={'grid gap-6 md:grid-cols-2 lg:grid-cols-3'}>
        {items.map((collection) => (
          <Card className={'group flex flex-col transition-shadow hover:shadow-lg'} key={collection.id}>
            <CardHeader className={'pb-3'}>
              <div className={'flex items-start justify-between'}>
                <CardTitle className={'text-lg font-semibold text-balance'}>{collection.name}</CardTitle>
                <div className={'flex gap-1'}>
                  {collection.some((b) => b.isFeatured) && (
                    <StarIcon aria-hidden className={'h-4 w-4 fill-accent text-accent'} />
                  )}
                  {collection.featuredBobbleheads.some((b) => b.isPublic) ?
                    <EyeIcon aria-hidden className={'h-4 w-4 text-muted-foreground'} />
                  : <LockIcon aria-hidden className={'h-4 w-4 text-muted-foreground'} />}
                </div>
              </div>
              <p className={'text-sm text-pretty text-muted-foreground'}>{collection.description}</p>
            </CardHeader>

            <CardContent className={'flex flex-1 flex-col'}>
              <div className={'flex-1 space-y-4'}>
                {/* Collection Stats */}
                <div className={'flex items-center gap-4 text-sm'}>
                  <Badge variant={'secondary'}>{collection.bobbleheadCount} bobbleheads</Badge>
                  {collection.subcollections.length > 0 && (
                    <Badge variant={'outline'}>{collection.subcollections.length} subcollections</Badge>
                  )}
                </div>

                {/* Subcollections */}
                {collection.subcollections.length > 0 && (
                  <div className={'space-y-2'}>
                    <h4 className={'text-sm font-medium text-foreground'}>Subcollections</h4>
                    <div className={'max-h-32 space-y-1 overflow-y-auto'}>
                      {collection.subcollections.map((sub) => (
                        <div className={'flex items-center justify-between text-sm'} key={sub.id}>
                          <span className={'text-muted-foreground'}>{sub.name}</span>
                          <span className={'rounded bg-muted px-2 py-1 text-xs'}>{sub.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Bobbleheads Preview */}
                {collection.featuredBobbleheads.length > 0 && (
                  <div className={'space-y-2'}>
                    <h4 className={'text-sm font-medium text-foreground'}>Featured Items</h4>
                    <div className={'grid grid-cols-2 gap-2'}>
                      {collection.featuredBobbleheads.slice(0, 2).map((bobblehead) => (
                        <div className={'group/item relative'} key={bobblehead.id}>
                          <img
                            alt={bobblehead.name}
                            className={'h-24 w-full rounded-md bg-muted object-cover'}
                            src={bobblehead.photos[0] || '/placeholder.svg'}
                          />
                          <div
                            className={
                              'absolute inset-0 flex items-center justify-center rounded-md bg-black/60 opacity-0 transition-opacity group-hover/item:opacity-100'
                            }
                          >
                            <span className={'px-2 text-center text-xs font-medium text-white'}>
                              {bobblehead.characterName}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link href={`/collections/${collection.id}`}>
                <Button
                  className={
                    'mt-4 w-full bg-transparent transition-colors group-hover:bg-primary group-hover:text-primary-foreground'
                  }
                  variant={'outline'}
                >
                  View Collection
                  <ChevronRightIcon aria-hidden className={'ml-2 size-4'} />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
