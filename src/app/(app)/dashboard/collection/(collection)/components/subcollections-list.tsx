'use client';

import { EyeIcon, LockIcon, MoreVerticalIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface GroupedSubcollections {
  [collectionId: string]: {
    collectionName: string;
    isCollectionPublic: boolean;
    subcollections: Array<SubcollectionData>;
  };
}

interface SubcollectionData {
  bobbleheadCount: number;
  collectionId: string;
  collectionName: string;
  id: string;
  isCollectionPublic: boolean;
  name: string;
}

interface SubcollectionsListProps {
  groupedSubcollections: GroupedSubcollections;
}

export const SubcollectionsList = ({ groupedSubcollections }: SubcollectionsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (collectionId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [collectionId]: !prev[collectionId],
    }));
  };

  const filteredGroups = Object.entries(groupedSubcollections).filter(([, group]) => {
    if (!searchTerm) return true;
    return (
      group.collectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.subcollections.some((sub) => sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className={'space-y-6'}>
      <div className={'flex items-center justify-between'}>
        <h3 className={'text-lg font-semibold'}>All Subcollections</h3>
        <div className={'w-72'}>
          <Input
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            placeholder={'Search collections or subcollections...'}
            value={searchTerm}
          />
        </div>
      </div>

      <div className={'space-y-4'}>
        {filteredGroups.map(([collectionId, group]) => (
          <Card key={collectionId}>
            <Collapsible
              onOpenChange={() => {
                toggleGroup(collectionId);
              }}
              open={openGroups[collectionId]}
            >
              <CardHeader className={'pb-3'}>
                <CollapsibleTrigger asChild>
                  <div
                    className={
                      '-mx-4 flex cursor-pointer items-center justify-between rounded-md px-4 py-2 hover:bg-muted/50'
                    }
                  >
                    <div className={'flex items-center gap-3'}>
                      <CardTitle className={'text-base font-medium'}>{group.collectionName}</CardTitle>
                      <div className={'flex items-center gap-2'}>
                        <Badge variant={'outline'}>
                          {group.subcollections.length} subcollection
                          {group.subcollections.length !== 1 ? 's' : ''}
                        </Badge>
                        <Conditional isCondition={group.isCollectionPublic}>
                          <EyeIcon className={'size-4 text-muted-foreground'} />
                        </Conditional>
                        <Conditional isCondition={!group.isCollectionPublic}>
                          <LockIcon className={'size-4 text-muted-foreground'} />
                        </Conditional>
                      </div>
                    </div>
                    <Button size={'sm'} variant={'ghost'}>
                      {openGroups[collectionId] ? '▼' : '▶'}
                    </Button>
                  </div>
                </CollapsibleTrigger>
              </CardHeader>

              <CollapsibleContent>
                <CardContent className={'pt-0'}>
                  <div className={'space-y-2'}>
                    {group.subcollections
                      .filter(
                        (sub) =>
                          !searchTerm ||
                          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          group.collectionName.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((subcollection) => (
                        <div
                          className={
                            'flex items-center justify-between rounded-md border p-3 hover:bg-muted/50'
                          }
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
                                <PlusIcon className={'mr-2 size-4'} />
                                Add Bobblehead
                              </Link>
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size={'sm'} variant={'ghost'}>
                                  <MoreVerticalIcon className={'size-4'} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={'end'}>
                                <DropdownMenuItem>
                                  <PencilIcon className={'mr-2 size-4'} />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant={'destructive'}>
                                  <Trash2Icon className={'mr-2 size-4'} />
                                  Delete Subcollection
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                  </div>

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
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      <Conditional isCondition={filteredGroups.length === 0}>
        <div className={'py-8 text-center text-muted-foreground'}>
          <p>No subcollections match your search criteria.</p>
        </div>
      </Conditional>
    </div>
  );
};
