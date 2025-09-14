'use client';

import { ChevronRightIcon, FolderIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { SubcollectionActions } from '@/components/feature/subcollections/subcollection-actions';
import { Badge } from '@/components/ui/badge';
import { Conditional } from '@/components/ui/conditional';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CollectionSubcollectionsListProps {
  collectionId: string;
  isOwner: boolean;
  subcollections: SubcollectionForList[];
}

interface SubcollectionForList {
  bobbleheadCount: number;
  description: null | string;
  id: string;
  name: string;
}

export const CollectionSubcollectionsList = ({
  collectionId,
  isOwner,
  subcollections,
}: CollectionSubcollectionsListProps) => {
  const hasSubcollections = subcollections.length > 0;

  if (!hasSubcollections) {
    return <p className={'text-sm text-muted-foreground'}>This collection has no subcollections.</p>;
  }

  return (
    <ul className={'space-y-3'}>
      {subcollections.map((subcollection) => (
        <li className={'group relative'} key={subcollection.id}>
          <div className={'flex items-start gap-2'}>
            <Link
              className={`flex flex-1 items-center gap-3 rounded-lg border border-border bg-card
                p-3 shadow-sm transition-all hover:bg-accent hover:shadow-md`}
              href={$path({
                route: '/collections/[collectionId]/subcollection/[subcollectionId]',
                routeParams: {
                  collectionId,
                  subcollectionId: subcollection.id,
                },
              })}
            >
              {/* Folder Icon */}
              <div className={'flex-shrink-0'}>
                <FolderIcon className={'size-5 text-primary'} />
              </div>

              {/* Content */}
              <div className={'min-w-0 flex-1'}>
                <div className={'mb-1 flex items-center justify-between gap-2'}>
                  <h4 className={'truncate text-sm font-medium'}>{subcollection.name}</h4>
                  <Badge className={'flex-shrink-0 text-xs'} variant={'secondary'}>
                    {subcollection.bobbleheadCount}
                  </Badge>
                </div>
                <Conditional isCondition={!!subcollection.description}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className={'line-clamp-2 cursor-help text-xs text-muted-foreground'}>
                        {subcollection.description}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className={'max-w-sm'} side={'bottom'} sideOffset={5}>
                      <p className={'text-xs'}>{subcollection.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </Conditional>
              </div>

              {/* Chevron Icon */}
              <div className={'flex-shrink-0'}>
                <ChevronRightIcon
                  className={'size-4 text-muted-foreground transition-colors group-hover:text-foreground'}
                />
              </div>
            </Link>

            {/* Actions Menu */}
            <Conditional isCondition={isOwner}>
              <div className={'opacity-0 transition-opacity group-hover:opacity-100'}>
                <SubcollectionActions subcollection={subcollection} />
              </div>
            </Conditional>
          </div>
        </li>
      ))}
    </ul>
  );
};
