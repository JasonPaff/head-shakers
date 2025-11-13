'use client';

import { FilterIcon, MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import type { BobbleheadRecord } from '@/lib/queries/bobbleheads/bobbleheads-query';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/utils/tailwind-utils';

interface BobbleheadsManagementGridProps {
  bobbleheads: Array<BobbleheadRecord>;
}

export const BobbleheadsManagementGrid = ({ bobbleheads }: BobbleheadsManagementGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const categories = useMemo(
    () => Array.from(new Set(bobbleheads.map((b) => b.category).filter(Boolean))),
    [bobbleheads],
  );

  const filteredBobbleheads = useMemo(
    () =>
      bobbleheads.filter((bobblehead) => {
        const matchesSearch =
          !searchTerm ||
          bobblehead.characterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bobblehead.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());

        const isMatchingCategory = categoryFilter === 'all' || bobblehead.category === categoryFilter;

        const matchesVisibility =
          visibilityFilter === 'all' ||
          (visibilityFilter === 'public' && bobblehead.isPublic) ||
          (visibilityFilter === 'private' && !bobblehead.isPublic);

        return matchesSearch && isMatchingCategory && matchesVisibility;
      }),
    [bobbleheads, categoryFilter, searchTerm, visibilityFilter],
  );

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(filteredBobbleheads.map((b) => b.id)));
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);

    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);

    setSelectedIds(newSelected);
  };

  return (
    <div className={'space-y-6'}>
      <div className={'flex items-center justify-between'}>
        <h3 className={'text-lg font-semibold'}>All Bobbleheads ({filteredBobbleheads.length})</h3>

        {/* Bulk Actions */}
        <Conditional isCondition={selectedIds.size > 0}>
          <div className={'flex items-center gap-2'}>
            <span className={'text-sm text-muted-foreground'}>{selectedIds.size} selected</span>
            {/* Clear Selection Button */}
            <Button onClick={handleClearSelection} size={'sm'} variant={'outline'}>
              Clear
            </Button>
            {/* Delete Selected Button */}
            <Button size={'sm'} variant={'destructive'}>
              Delete Selected
            </Button>
          </div>
        </Conditional>
      </div>

      <div className={'flex flex-col gap-4 sm:flex-row sm:items-center'}>
        {/* Search Input */}
        <div className={'flex-1'}>
          <Input
            isClearable
            isSearch
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            placeholder={'Search bobbleheads...'}
            value={searchTerm}
          />
        </div>

        <div className={'flex gap-2'}>
          {/* Category Filter */}
          <Select onValueChange={setCategoryFilter} value={categoryFilter}>
            <SelectTrigger className={'w-32'}>
              <SelectValue placeholder={'Category'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={'all'}>All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category!}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Visibility Filter */}
          <Select onValueChange={setVisibilityFilter} value={visibilityFilter}>
            <SelectTrigger className={'w-24'}>
              <SelectValue placeholder={'Visibility'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={'all'}>All</SelectItem>
              <SelectItem value={'public'}>Public</SelectItem>
              <SelectItem value={'private'}>Private</SelectItem>
            </SelectContent>
          </Select>

          {/* Select All Button */}
          <Button onClick={handleSelectAll} size={'sm'} variant={'outline'}>
            <FilterIcon aria-hidden className={'mr-2 size-4'} />
            Select All
          </Button>
        </div>
      </div>

      <div className={'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
        {filteredBobbleheads.map((bobblehead) => (
          <Card
            className={cn(
              'relative cursor-pointer transition-all',
              selectedIds.has(bobblehead.id) && 'ring-2 ring-primary',
            )}
            key={bobblehead.id}
            onClick={() => {
              toggleSelect(bobblehead.id);
            }}
          >
            <CardHeader className={'pb-3'}>
              <div className={'flex items-start justify-between'}>
                {/* Name and Manufacturer */}
                <div className={'min-w-0 flex-1'}>
                  <h4 className={'truncate font-medium'}>
                    {bobblehead.characterName || 'Unnamed Bobblehead'}
                  </h4>
                  <p className={'truncate text-sm text-muted-foreground'}>{bobblehead.manufacturer}</p>
                </div>

                {/* Actions Dropdown */}
                <div className={'flex items-center gap-2'}>
                  {/* Selection Checkbox */}
                  <input
                    checked={selectedIds.has(bobblehead.id)}
                    className={'size-4'}
                    onChange={() => {
                      toggleSelect(bobblehead.id);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    type={'checkbox'}
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Button size={'sm'} variant={'ghost'}>
                        <MoreVerticalIcon aria-hidden className={'size-4'} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={'end'}>
                      {/* View Details Link */}
                      <DropdownMenuItem asChild>
                        <Link
                          href={$path({
                            route: '/bobbleheads/[bobbleheadSlug]',
                            routeParams: { bobbleheadSlug: bobblehead.slug },
                          })}
                        >
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        {/* Edit Link */}
                        <Link
                          href={$path({
                            route: '/bobbleheads/[bobbleheadSlug]/edit',
                            routeParams: { bobbleheadSlug: bobblehead.slug },
                          })}
                        >
                          <PencilIcon aria-hidden className={'mr-2 size-4'} />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {/* Delete Action */}
                      <DropdownMenuItem variant={'destructive'}>
                        <Trash2Icon aria-hidden className={'mr-2 size-4'} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            <CardContent className={'pt-0'}>
              <div className={'space-y-2'}>
                {/* Category and Visibility Badges */}
                <div className={'flex flex-wrap gap-2'}>
                  <Conditional isCondition={!!bobblehead.category}>
                    <Badge variant={'secondary'}>{bobblehead.category}</Badge>
                  </Conditional>
                  <Badge variant={bobblehead.isPublic ? 'default' : 'outline'}>
                    {bobblehead.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>

                {/* Acquisition Date */}
                <Conditional isCondition={!!bobblehead.acquisitionDate}>
                  <p className={'text-xs text-muted-foreground'}>
                    Added {new Date(bobblehead.acquisitionDate!).toLocaleDateString()}
                  </p>
                </Conditional>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results Found */}
      <Conditional isCondition={filteredBobbleheads.length === 0}>
        <div className={'py-8 text-center text-muted-foreground'}>
          <p>No bobbleheads match your search criteria.</p>
        </div>
      </Conditional>
    </div>
  );
};
