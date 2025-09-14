'use client';

import { MoreVerticalIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { SubcollectionData } from '@/app/(app)/dashboard/collection/(collection)/components/subcollections-list';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SubcollectionsListItemProps = {
  collection: {
    collectionName: string;
    isCollectionPublic: boolean;
    subcollections: Array<SubcollectionData>;
  };
  searchTerm: string;
};

export const SubcollectionsListItem = ({ collection, searchTerm }: SubcollectionsListItemProps) => {
  const subcollections =
    collection.subcollections.filter(
      (subcollection) =>
        !searchTerm ||
        subcollection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subcollection.collectionName.toLowerCase().includes(searchTerm.toLowerCase()),
    ) ?? [];

  return (
    <CardContent className={'pt-0'}>
      <div className={'space-y-2'}>
        {subcollections.map((subcollection) => (
          <div
            className={'flex items-center justify-between rounded-md border p-3 hover:bg-muted/50'}
            key={subcollection.id}
          >
            <div className={'flex items-center gap-3'}>
              <Link
                className={'font-medium text-foreground hover:text-primary'}
                href={$path({
                  route: '/collections/[collectionId]/subcollections/[subcollectionId]',
                  routeParams: {
                    collectionId: subcollection.collectionId,
                    subcollectionId: subcollection.id,
                  },
                })}
              >
                {subcollection.name}
              </Link>
              <Badge variant={'secondary'}>
                {subcollection.bobbleheadCount} bobblehead
                {subcollection.bobbleheadCount !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className={'flex items-center gap-2'}>
              {/* Add Bobblehead Button */}
              <Button asChild size={'sm'} variant={'outline'}>
                <Link
                  href={$path({
                    route: '/bobbleheads/add',
                    searchParams: {
                      collectionId: subcollection.collectionId,
                      subcollectionId: subcollection.id,
                    },
                  })}
                >
                  <PlusIcon aria-hidden className={'mr-2 size-4'} />
                  Add Bobblehead
                </Link>
              </Button>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size={'sm'} variant={'ghost'}>
                    <MoreVerticalIcon aria-hidden className={'size-4'} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={'end'}>
                  <DropdownMenuItem>
                    <PencilIcon aria-hidden className={'mr-2 size-4'} />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant={'destructive'}>
                    <Trash2Icon aria-hidden className={'mr-2 size-4'} />
                    Delete Subcollection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Add Subcollection Button */}
      <div className={'mt-4 border-t pt-4'}>
        <Button asChild className={'w-full'} size={'sm'} variant={'outline'}>
          <Link
            href={$path({
              route: '/collections/[collectionId]/subcollections/create',
              routeParams: { collectionId: collectionId },
            })}
          >
            <PlusIcon aria-hidden className={'mr-2 size-4'} />
            Add Subcollection to {group.collectionName}
          </Link>
        </Button>
      </div>
    </CardContent>
  );
};
