'use client';

import { EyeIcon, LockIcon } from 'lucide-react';
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
  id: string;
  isCollectionPublic: boolean;
  name: string;
}

interface GroupedSubcollections {
  [collectionId: string]: {
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
                    {/* Collection Title and Info */}
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

                    {/* Expand/Collapse Icon */}
                    <Button size={'sm'} variant={'ghost'}>
                      {openGroups[collectionId] ? '▼' : '▶'}
                    </Button>
                  </div>
                </CollapsibleTrigger>
              </CardHeader>

              {/* Subcollections List */}
              <CollapsibleContent>
                <SubcollectionsListItem collection={group} searchTerm={searchTerm} />
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
