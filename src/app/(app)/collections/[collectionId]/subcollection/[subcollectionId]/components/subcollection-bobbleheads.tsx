import 'server-only';
import { HeartIcon, MessageCircle, PlusIcon, Share2Icon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { SubcollectionsFacade } from '@/lib/facades/collections/subcollections.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';
import { cn } from '@/utils/tailwind-utils';

interface SubcollectionBobbleheadsProps {
  collectionId: string;
  isOwner?: boolean;
  subcollectionId: string;
}

// TODO: add a nice empty state when there are no bobbleheads

export const SubcollectionBobbleheads = async ({
  collectionId,
  isOwner = false,
  subcollectionId,
}: SubcollectionBobbleheadsProps) => {
  const currentUserId = await getOptionalUserId();
  const bobbleheads = await SubcollectionsFacade.getSubcollectionBobbleheadsWithPhotos(
    subcollectionId,
    currentUserId || undefined,
  );

  return (
    <div>
      <div className={'mb-6 flex items-center justify-between'}>
        <h2 className={'text-2xl font-bold text-foreground'}>Bobbleheads in this Subcollection</h2>
        {/* Add Bobblehead Button */}
        <Conditional isCondition={isOwner}>
          <Button asChild size={'sm'} variant={'outline'}>
            <Link
              href={$path({
                route: '/bobbleheads/add',
                searchParams: { collectionId, subcollectionId },
              })}
            >
              <PlusIcon aria-hidden className={'mr-2 size-4'} />
              Add Bobblehead
            </Link>
          </Button>
        </Conditional>
      </div>

      <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
        {bobbleheads.map((bobblehead) => (
          <Link
            href={$path({
              route: '/bobbleheads/[bobbleheadId]',
              routeParams: { bobbleheadId: bobblehead.id },
            })}
            key={bobblehead.id}
          >
            <Card
              className={cn(
                'group cursor-pointer border-border bg-card',
                'transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
              )}
            >
              <CardContent className={'p-0'}>
                <div className={'relative overflow-hidden rounded-t-lg'}>
                  <img
                    alt={bobblehead.name || 'Bobblehead'}
                    className={cn(
                      'h-64 w-full object-cover transition-transform',
                      'duration-300 group-hover:scale-105',
                    )}
                    src={bobblehead.featurePhoto || '/placeholder.jpg'}
                  />

                  <div
                    className={cn(
                      'absolute inset-0 bg-black/0 transition-colors',
                      'duration-300 group-hover:bg-black/10',
                    )}
                  />
                </div>

                <div className={'p-4'}>
                  <h3 className={'mb-2 text-lg font-semibold text-balance text-card-foreground'}>
                    {bobblehead.name}
                  </h3>

                  <p className={'mb-4 line-clamp-2 text-sm text-pretty text-muted-foreground'}>
                    {bobblehead.description}
                  </p>

                  <div className={'flex items-center justify-between'}>
                    <div className={'flex items-center gap-4'}>
                      <Button
                        className={`flex items-center gap-1 transition-colors`}
                        size={'sm'}
                        variant={'ghost'}
                      >
                        <HeartIcon aria-hidden className={`size-4 transition-all duration-200`} />
                        <span className={'text-sm'}>{5}</span>
                      </Button>

                      <Button
                        className={'flex items-center gap-1 text-muted-foreground hover:text-primary'}
                        size={'sm'}
                        variant={'ghost'}
                      >
                        <MessageCircle aria-hidden className={'size-4'} />
                        <span className={'text-sm'}>{34}</span>
                      </Button>
                    </div>

                    <Button
                      className={'text-muted-foreground hover:text-primary'}
                      size={'sm'}
                      variant={'ghost'}
                    >
                      <Share2Icon aria-hidden className={'size-4'} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
