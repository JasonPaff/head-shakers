'use client';

import { useMemo, useState } from 'react';

import type { FeaturedContentRecord } from '@/lib/queries/featured-content/featured-content-query';

import { FeaturedContentListItem } from '@/app/(app)/admin/featured-content/components/featured-content-list-item';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FeaturedContentListProps {
  initialData: Array<FeaturedContentRecord>;
  onEdit: (contentId: string) => void;
}

type SortBy = 'date' | 'priority' | 'views';

export const FeaturedContentList = ({ initialData, onEdit }: FeaturedContentListProps) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('priority');

  const filteredContent = useMemo(() => {
    const filtered = initialData.filter((content) => {
      const displayTitle = content.title || content.contentTitle || 'Untitled';
      const matchesSearch = displayTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const isMatchesType = filterType === 'all' || content.contentType === filterType;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && content.isActive) ||
        (filterStatus === 'inactive' && !content.isActive);

      return matchesSearch && isMatchesType && matchesStatus;
    });

    // sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'priority':
          return a.priority - b.priority;
        case 'views':
          return b.viewCount - a.viewCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [initialData, searchTerm, filterType, filterStatus, sortBy]);

  return (
    <div className={'space-y-4'}>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={'flex gap-4'}>
            <div className={'flex-1'}>
              {/* Search Input */}
              <Input
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                placeholder={'Search featured content...'}
                value={searchTerm}
              />
            </div>

            {/* Content Type Filter */}
            <Select onValueChange={setFilterType} value={filterType}>
              <SelectTrigger className={'w-[180px]'}>
                <SelectValue placeholder={'Content Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={'all'}>All Types</SelectItem>
                <SelectItem value={'collection'}>Collections</SelectItem>
                <SelectItem value={'bobblehead'}>Bobbleheads</SelectItem>
                <SelectItem value={'user'}>Users</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setFilterStatus} value={filterStatus}>
              <SelectTrigger className={'w-[140px]'}>
                <SelectValue placeholder={'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={'all'}>All Status</SelectItem>
                <SelectItem value={'active'}>Active</SelectItem>
                <SelectItem value={'inactive'}>Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) => {
                setSortBy(value as SortBy);
              }}
              value={sortBy}
            >
              <SelectTrigger className={'w-[140px]'}>
                <SelectValue placeholder={'Sort by'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={'date'}>Date</SelectItem>
                <SelectItem value={'priority'}>Priority</SelectItem>
                <SelectItem value={'views'}>Views</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Featured Content List */}
      <div className={'space-y-4'}>
        {filteredContent.map((content, index) => (
          <FeaturedContentListItem key={index} onEdit={onEdit} {...content} />
        ))}
      </div>

      {/* No Results Found */}
      <Conditional isCondition={filteredContent.length === 0}>
        <Card>
          <CardContent className={'p-8 text-center'}>
            <p className={'text-muted-foreground'}>No featured content found matching your criteria.</p>
          </CardContent>
        </Card>
      </Conditional>
    </div>
  );
};
