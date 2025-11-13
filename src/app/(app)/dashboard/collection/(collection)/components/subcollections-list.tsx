'use client';

import { ChevronDownIcon, ChevronRightIcon, EyeIcon, FolderIcon, LockIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { SubcollectionsListItem } from '@/app/(app)/dashboard/collection/(collection)/components/subcollections-list-item';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';

export interface SubcollectionData {
  bobbleheadCount: number;
  collectionId: string;
  collectionName: string;
  collectionSlug: string;
  description: null | string;
  id: string;
  isCollectionPublic: boolean;
  name: string;
  slug: string;
}

interface GroupedSubcollections {
  [collectionId: string]: {
    collectionDescription: null | string;
    collectionName: string;
    isCollectionPublic: boolean;
    subcollections: Array<SubcollectionData>;
  };
}

interface SubcollectionsListProps {
  groupedSubcollections: GroupedSubcollections;
}

export const SubcollectionsList = ({ groupedSubcollections }: SubcollectionsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const collectionIds = useMemo(() => Object.keys(groupedSubcollections), [groupedSubcollections]);
  const allExpanded = useMemo(() => collectionIds.every((id) => openGroups[id]), [collectionIds, openGroups]);

  const filteredGroups = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();
    return Object.entries(groupedSubcollections).filter(([, group]) => {
      if (!searchTerm) return true;
      return (
        group.collectionName.toLowerCase().includes(searchTermLower) ||
        group.subcollections.some((sub) => sub.name.toLowerCase().includes(searchTermLower))
      );
    });
  }, [groupedSubcollections, searchTerm]);

  const collapseAll = () => {
    setOpenGroups({});
  };

  const expandAll = () => {
    const newOpenGroups: Record<string, boolean> = {};
    collectionIds.forEach((id) => {
      newOpenGroups[id] = true;
    });
    setOpenGroups(newOpenGroups);
  };

  const toggleGroup = (collectionId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [collectionId]: !prev[collectionId],
    }));
  };

  return (
    <div className={'space-y-6'}>
      <div className={'flex items-center justify-between'}>
        <h3 className={'text-lg font-semibold'}>All Subcollections</h3>
        <div className={'flex items-center gap-3'}>
          <div className={'flex items-center gap-2'}>
            {/* Expand/Collapse All Button */}
            <Button onClick={allExpanded ? collapseAll : expandAll} size={'sm'} variant={'outline'}>
              {allExpanded ? 'Collapse All' : 'Expand All'}
            </Button>
          </div>

          {/* Search Input */}
          <div className={'w-72'}>
            <Input
              isClearable
              isSearch
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              placeholder={'Search collections or subcollections...'}
              value={searchTerm}
            />
          </div>
        </div>
      </div>

      <div className={'space-y-4'}>
        {filteredGroups.map(([collectionId, group]) => (
          <Card className={'border-border/50 shadow-sm transition-shadow hover:shadow-md'} key={collectionId}>
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
                      {/* Collection Name and Description */}
                      <div className={'flex flex-col gap-1'}>
                        <div className={'flex items-center gap-2'}>
                          <FolderIcon aria-hidden className={'size-5 text-primary'} />
                          <CardTitle className={'text-base font-medium text-foreground'}>
                            {group.collectionName}
                          </CardTitle>
                        </div>
                        <Conditional isCondition={!!group.collectionDescription}>
                          <p className={'ml-7 line-clamp-2 text-sm text-muted-foreground'}>
                            {group.collectionDescription}
                          </p>
                        </Conditional>
                      </div>

                      {/* Subcollection Count and Visibility */}
                      <div className={'flex items-center gap-2'}>
                        <Badge
                          className={'border-primary/20 bg-primary/10 text-primary'}
                          variant={'secondary'}
                        >
                          {group.subcollections.length} subcollection
                          {group.subcollections.length !== 1 ? 's' : ''}
                        </Badge>
                        <Conditional isCondition={group.isCollectionPublic}>
                          <EyeIcon className={'size-4 text-green-600'} />
                        </Conditional>
                        <Conditional isCondition={!group.isCollectionPublic}>
                          <LockIcon className={'size-4 text-amber-600'} />
                        </Conditional>
                      </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <Button
                      className={'text-muted-foreground hover:text-foreground'}
                      size={'sm'}
                      variant={'ghost'}
                    >
                      <Conditional
                        fallback={<ChevronRightIcon className={'size-4'} />}
                        isCondition={openGroups[collectionId]}
                      >
                        <ChevronDownIcon className={'size-4'} />
                      </Conditional>
                    </Button>
                  </div>
                </CollapsibleTrigger>
              </CardHeader>

              {/* Subcollections List */}
              <CollapsibleContent>
                <SubcollectionsListItem
                  collection={group}
                  collectionId={collectionId}
                  searchTerm={searchTerm}
                />
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* No Results Found */}
      <Conditional isCondition={filteredGroups.length === 0}>
        <div className={'py-8 text-center text-muted-foreground'}>
          <p>No subcollections match your search criteria.</p>
        </div>
      </Conditional>
    </div>
  );
};
