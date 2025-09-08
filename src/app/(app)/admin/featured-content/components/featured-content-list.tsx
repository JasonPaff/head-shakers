'use client';

import { EditIcon, EyeIcon, EyeOffIcon, MoreHorizontalIcon, Trash2Icon, TrendingUpIcon } from 'lucide-react';
import { Fragment, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FeaturedContentListProps {
  onEdit: (contentId: string) => void;
}

// mock data - this would come from a server action in real implementation
const mockFeaturedContent = [
  {
    contentType: 'collection' as const,
    curator: 'Admin User',
    endDate: '2024-02-15',
    featureType: 'homepage_banner' as const,
    id: '1',
    isActive: true,
    priority: 1,
    startDate: '2024-01-15',
    title: 'Baseball Legends Collection',
    viewCount: 2543,
  },
  {
    contentType: 'bobblehead' as const,
    curator: 'Moderator User',
    endDate: null,
    featureType: 'editor_pick' as const,
    id: '2',
    isActive: true,
    priority: 2,
    startDate: '2024-01-10',
    title: 'Vintage Mickey Mouse Bobblehead',
    viewCount: 1842,
  },
  {
    contentType: 'user' as const,
    curator: 'Admin User',
    endDate: '2023-12-31',
    featureType: 'collection_of_week' as const,
    id: '3',
    isActive: false,
    priority: 3,
    startDate: '2023-12-01',
    title: 'Top Collector of the Month',
    viewCount: 967,
  },
];

const getFeatureTypeLabel = (type: string) => {
  switch (type) {
    case 'collection_of_week':
      return 'Collection of Week';
    case 'editor_pick':
      return 'Editor Pick';
    case 'homepage_banner':
      return 'Homepage Banner';
    case 'trending':
      return 'Trending';
    default:
      return type;
  }
};

const getContentTypeColor = (type: string) => {
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

export const FeaturedContentList = ({ onEdit }: FeaturedContentListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredContent = mockFeaturedContent.filter((content) => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase());
    const isMatchesType = filterType === 'all' || content.contentType === filterType;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && content.isActive) ||
      (filterStatus === 'inactive' && !content.isActive);

    return matchesSearch && isMatchesType && matchesStatus;
  });

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
              <Input
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                placeholder={'Search featured content...'}
                value={searchTerm}
              />
            </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Featured Content List */}
      <div className={'space-y-4'}>
        {filteredContent.map((content) => (
          <Card key={content.id}>
            <CardContent className={'p-6'}>
              <div className={'flex items-center justify-between'}>
                <div className={'flex-1'}>
                  <div className={'mb-2 flex items-center gap-2'}>
                    <h3 className={'text-lg font-semibold'}>{content.title}</h3>
                    <Badge className={getContentTypeColor(content.contentType)}>{content.contentType}</Badge>
                    <Badge variant={content.isActive ? 'default' : 'secondary'}>
                      {content.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className={'flex items-center gap-4 text-sm text-muted-foreground'}>
                    <span>Feature: {getFeatureTypeLabel(content.featureType)}</span>
                    <span className={'flex items-center gap-1'}>
                      <TrendingUpIcon aria-hidden className={'size-4'} />
                      {content.viewCount.toLocaleString()} views
                    </span>
                    <span>Priority: {content.priority}</span>
                    <span>Curator: {content.curator}</span>
                  </div>
                  <div className={'mt-1 flex items-center gap-4 text-xs text-muted-foreground'}>
                    <span>Start: {content.startDate}</span>
                    {content.endDate && <span>End: {content.endDate}</span>}
                  </div>
                </div>
                <div className={'flex items-center gap-2'}>
                  <Button className={'gap-1'} size={'sm'} variant={content.isActive ? 'outline' : 'default'}>
                    <Conditional isCondition={content.isActive}>
                      <Fragment>
                        <EyeOffIcon aria-hidden className={'size-4'} />
                        Deactivate
                      </Fragment>
                    </Conditional>
                    <Conditional isCondition={!content.isActive}>
                      <Fragment>
                        <EyeIcon aria-hidden className={'size-4'} />
                        Activate
                      </Fragment>
                    </Conditional>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className={'size-8 p-0'} variant={'ghost'}>
                        <span className={'sr-only'}>Open menu</span>
                        <MoreHorizontalIcon aria-hidden className={'size-4'} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={'end'}>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          onEdit(content.id);
                        }}
                      >
                        <EditIcon aria-hidden className={'mr-2 size-4'} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className={'text-destructive'}>
                        <Trash2Icon aria-hidden className={'mr-2 size-4'} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
