'use client';

import { ArrowDownIcon, ArrowUpIcon, ExternalLinkIcon, EyeIcon, TimerIcon, UsersIcon } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/utils/tailwind-utils';

interface TrendingContentItem {
  averageViewDuration?: number; // in seconds
  rank: number;
  targetId: string;
  targetType: 'bobblehead' | 'collection' | 'user';
  title: string; // will be fetched separately based on targetType and targetId
  totalViews: number;
  trendDirection: 'down' | 'stable' | 'up'; // calculated client-side
  trendPercentage: number; // calculated client-side
  uniqueViewers: number;
}

interface TrendingContentTableProps {
  className?: string;
  data: Array<TrendingContentItem>;
  timeRange: string;
}

export const TrendingContentTable = ({ className, data, timeRange }: TrendingContentTableProps) => {
  const [sortBy, setSortBy] = useState<'duration' | 'trend' | 'viewers' | 'views'>('views');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'bobblehead' | 'collection' | 'user'>('all');

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const getTypeColor = (type: TrendingContentItem['targetType']) => {
    switch (type) {
      case 'bobblehead':
        return 'bg-green-100 text-green-800';
      case 'collection':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (direction: TrendingContentItem['trendDirection'], percentage: number) => {
    const isPositive = percentage > 0;
    const IconComponent =
      direction === 'up' ? ArrowUpIcon
      : direction === 'down' ? ArrowDownIcon
      : null;

    if (!IconComponent) return null;

    return (
      <div className={cn('flex items-center gap-1', isPositive ? 'text-green-600' : 'text-red-600')}>
        <IconComponent aria-hidden className={'size-3'} />
        <span className={'text-xs font-medium'}>{Math.abs(percentage).toFixed(1)}%</span>
      </div>
    );
  };

  const filteredData = data.filter((item) => filterType === 'all' || item.targetType === filterType);

  const sortedData = [...filteredData].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortBy) {
      case 'duration':
        aValue = a.averageViewDuration || 0;
        bValue = b.averageViewDuration || 0;
        break;
      case 'trend':
        aValue = a.trendPercentage;
        bValue = b.trendPercentage;
        break;
      case 'viewers':
        aValue = a.uniqueViewers;
        bValue = b.uniqueViewers;
        break;
      case 'views':
        aValue = a.totalViews;
        bValue = b.totalViews;
        break;
      default:
        aValue = a.totalViews;
        bValue = b.totalViews;
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleViewContent = (item: TrendingContentItem) => {
    // in real implementation, this would navigate to the content
    console.log('Viewing content:', item);
  };

  return (
    <div className={className}>
      {/* Filters and Controls */}
      <div className={'mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'}>
        <div className={'flex items-center gap-2'}>
          <span className={'text-sm font-medium'}>Filter by type:</span>
          <Select
            onValueChange={(value: typeof filterType) => {
              setFilterType(value);
            }}
            value={filterType}
          >
            <SelectTrigger className={'w-[130px]'}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={'all'}>All Content</SelectItem>
              <SelectItem value={'collection'}>Collections</SelectItem>
              <SelectItem value={'bobblehead'}>Bobbleheads</SelectItem>
              <SelectItem value={'user'}>User Profiles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={'text-sm text-muted-foreground'}>
          Showing {sortedData.length} trending items for{' '}
          {timeRange.replace(/(\d+)/, '$1 ').replace('days', 'days').replace('day', 'day')}
        </div>
      </div>

      {/* Data Table */}
      <div className={'overflow-x-auto'}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={'w-[50px]'}>#</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>
                <Button
                  className={'h-auto p-0 font-medium hover:bg-transparent'}
                  onClick={() => {
                    handleSort('views');
                  }}
                  size={'sm'}
                  variant={'ghost'}
                >
                  <EyeIcon aria-hidden className={'mr-1 size-3'} />
                  Views
                  {sortBy === 'views' &&
                    (sortOrder === 'desc' ?
                      <ArrowDownIcon aria-hidden className={'ml-1 size-3'} />
                    : <ArrowUpIcon aria-hidden className={'ml-1 size-3'} />)}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  className={'h-auto p-0 font-medium hover:bg-transparent'}
                  onClick={() => {
                    handleSort('viewers');
                  }}
                  size={'sm'}
                  variant={'ghost'}
                >
                  <UsersIcon aria-hidden className={'mr-1 size-3'} />
                  Viewers
                  {sortBy === 'viewers' &&
                    (sortOrder === 'desc' ?
                      <ArrowDownIcon aria-hidden className={'ml-1 size-3'} />
                    : <ArrowUpIcon aria-hidden className={'ml-1 size-3'} />)}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  className={'h-auto p-0 font-medium hover:bg-transparent'}
                  onClick={() => {
                    handleSort('duration');
                  }}
                  size={'sm'}
                  variant={'ghost'}
                >
                  <TimerIcon aria-hidden className={'mr-1 size-3'} />
                  Avg Duration
                  {sortBy === 'duration' &&
                    (sortOrder === 'desc' ?
                      <ArrowDownIcon aria-hidden className={'ml-1 size-3'} />
                    : <ArrowUpIcon aria-hidden className={'ml-1 size-3'} />)}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  className={'h-auto p-0 font-medium hover:bg-transparent'}
                  onClick={() => {
                    handleSort('trend');
                  }}
                  size={'sm'}
                  variant={'ghost'}
                >
                  Trend
                  {sortBy === 'trend' &&
                    (sortOrder === 'desc' ?
                      <ArrowDownIcon aria-hidden className={'ml-1 size-3'} />
                    : <ArrowUpIcon aria-hidden className={'ml-1 size-3'} />)}
                </Button>
              </TableHead>
              <TableHead className={'w-[100px]'}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ?
              <TableRow>
                <TableCell className={'py-8 text-center text-muted-foreground'} colSpan={7}>
                  No trending content found for the selected criteria.
                </TableCell>
              </TableRow>
            : sortedData.map((item, index) => (
                <TableRow className={'hover:bg-muted/50'} key={item.targetId}>
                  <TableCell className={'font-medium'}>
                    <div
                      className={
                        'flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold'
                      }
                    >
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={'space-y-1'}>
                      <div className={'font-medium'}>{item.title}</div>
                      <div>
                        <Badge className={getTypeColor(item.targetType)} variant={'secondary'}>
                          {item.targetType}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={'font-medium'}>{item.totalViews.toLocaleString()}</TableCell>
                  <TableCell className={'font-medium'}>{item.uniqueViewers.toLocaleString()}</TableCell>
                  <TableCell className={'font-medium'}>
                    {formatDuration(item.averageViewDuration || 0)}
                  </TableCell>
                  <TableCell>{getTrendIcon(item.trendDirection, item.trendPercentage)}</TableCell>
                  <TableCell>
                    <Button
                      className={'h-8 px-2'}
                      onClick={() => {
                        handleViewContent(item);
                      }}
                      size={'sm'}
                      variant={'ghost'}
                    >
                      <ExternalLinkIcon aria-hidden className={'size-3'} />
                      <span className={'sr-only'}>View {item.title}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      {sortedData.length > 0 && (
        <div className={'mt-4 rounded-lg bg-muted/30 p-4'}>
          <div className={'grid gap-4 sm:grid-cols-3'}>
            <div className={'text-center'}>
              <div className={'text-2xl font-bold text-primary'}>
                {sortedData.reduce((sum, item) => sum + item.totalViews, 0).toLocaleString()}
              </div>
              <div className={'text-sm text-muted-foreground'}>Total Views</div>
            </div>
            <div className={'text-center'}>
              <div className={'text-2xl font-bold text-primary'}>
                {sortedData.reduce((sum, item) => sum + item.uniqueViewers, 0).toLocaleString()}
              </div>
              <div className={'text-sm text-muted-foreground'}>Total Viewers</div>
            </div>
            <div className={'text-center'}>
              <div className={'text-2xl font-bold text-primary'}>
                {formatDuration(
                  Math.round(
                    sortedData.reduce((sum, item) => sum + (item.averageViewDuration || 0), 0) /
                      sortedData.length,
                  ),
                )}
              </div>
              <div className={'text-sm text-muted-foreground'}>Avg Duration</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
