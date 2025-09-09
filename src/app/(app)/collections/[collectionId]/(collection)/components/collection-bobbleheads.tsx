import 'server-only';
import { DollarSignIcon, PlusIcon, RulerIcon, StarIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { ENUMS } from '@/lib/constants';
import { CollectionsFacade } from '@/lib/queries/collections/collections-facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

interface CollectionBobbleheadsProps {
  collectionId: string;
  isOwner?: boolean;
}

// TODO: add a nice empty state when there are no bobbleheads

export const CollectionBobbleheads = async ({
  collectionId,
  isOwner = false,
}: CollectionBobbleheadsProps) => {
  const currentUserId = await getOptionalUserId();
  const bobbleheads = await CollectionsFacade.getCollectionBobbleheadsWithPhotos(collectionId, currentUserId || undefined);

  return (
    <div>
      <div className={'mb-6 flex items-center justify-between'}>
        <h2 className={'text-2xl font-bold text-foreground'}>Bobbleheads in this Collection</h2>
        <Conditional isCondition={isOwner}>
          <Button asChild size={'sm'} variant={'outline'}>
            <Link
              href={$path({
                route: '/bobbleheads/add',
                searchParams: { collectionId },
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
          <Card className={'group transition-shadow hover:shadow-lg'} key={bobblehead.id}>
            <CardHeader className={'pb-3'}>
              <div className={'relative mb-4 aspect-square overflow-hidden rounded-lg bg-muted'}>
                <img
                  alt={bobblehead.name || 'Bobblehead'}
                  className={'object-cover transition-transform duration-300 group-hover:scale-105'}
                  src={bobblehead.featurePhoto || '/placeholder.svg'}
                />
                {bobblehead.isFeatured && (
                  <div className={'absolute top-2 right-2'}>
                    <Badge className={'bg-accent text-accent-foreground'}>
                      <StarIcon className={'mr-1 size-3'} />
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
              <CardTitle className={'text-lg text-balance'}>{bobblehead.name}</CardTitle>
            </CardHeader>
            <CardContent className={'space-y-3 pt-0'}>
              <div className={'space-y-2'}>
                <div className={'flex items-center gap-2 text-sm'}>
                  <span className={'font-medium'}>Character:</span>
                  <span className={'text-muted-foreground'}>{bobblehead.characterName}</span>
                </div>
                <div className={'flex items-center gap-2 text-sm'}>
                  <span className={'font-medium'}>Manufacturer:</span>
                  <span className={'text-muted-foreground'}>{bobblehead.manufacturer}</span>
                </div>
                <div className={'flex items-center gap-2 text-sm'}>
                  <RulerIcon aria-hidden className={'size-4'} />
                  <span className={'text-muted-foreground'}>{bobblehead.height}</span>
                </div>
              </div>

              <div className={'flex items-center justify-between pt-2'}>
                <Badge
                  variant={bobblehead.condition === ENUMS.BOBBLEHEAD.CONDITION[0] ? 'default' : 'secondary'}
                >
                  {bobblehead.condition}
                </Badge>
                <div className={'flex items-center gap-1 text-sm text-muted-foreground'}>
                  <DollarSignIcon aria-hidden className={'size-4'} />
                  {bobblehead.purchasePrice}
                </div>
              </div>

              <div className={'pt-2'}>
                <Button asChild className={'w-full'} size={'sm'}>
                  <Link
                    href={$path({
                      route: '/bobbleheads/[bobbleheadId]',
                      routeParams: { bobbleheadId: bobblehead.id },
                    })}
                  >
                    View Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
