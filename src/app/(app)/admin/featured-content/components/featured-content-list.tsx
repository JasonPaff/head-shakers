'use client';

import { EditIcon, EyeIcon, EyeOffIcon, MoreHorizontalIcon, Trash2Icon, TrendingUpIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Fragment, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

import type { AdminFeaturedContent } from '@/lib/facades/admin-facade';

import { ConfirmDeleteAlertDialog } from '@/components/ui/alert-dialogs/confirm-delete-alert-dialog';
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
import { useToggle } from '@/hooks/use-toggle';
import {
  deleteFeaturedContentAction,
  toggleFeaturedContentActiveAction,
} from '@/lib/actions/admin/featured-content.actions';

interface FeaturedContentListProps {
  initialData: Array<AdminFeaturedContent>;
  onEdit: (contentId: string) => void;
}

const formatDate = (date: Date | null) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

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

type SortBy = 'date' | 'priority' | 'views';

export const FeaturedContentList = ({ initialData, onEdit }: FeaturedContentListProps) => {
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useToggle();

  const [isPending, startTransition] = useTransition();

  const router = useRouter();

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
        case 'priority':
          return a.priority - b.priority;
        case 'views':
          return b.viewCount - a.viewCount;
        case 'date':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return filtered;
  }, [initialData, searchTerm, filterType, filterStatus, sortBy]);

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleFeaturedContentActiveAction({
        id,
        isActive: !currentStatus,
      });

      if (result?.serverError) {
        toast.error(result.serverError);
      } else if (result?.data?.success) {
        toast.success(result.data.message);
        router.refresh();
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteFeaturedContentAction({ id });

      if (result?.serverError) {
        toast.error(result.serverError);
      } else if (result?.data?.success) {
        toast.success(result.data.message);
        router.refresh();
      }
    });
  };

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
        {filteredContent.map((content) => (
          <Card key={content.id}>
            <CardContent className={'p-6'}>
              <div className={'flex items-center justify-between'}>
                <div className={'flex-1'}>
                  <div className={'mb-2 flex items-center gap-2'}>
                    <h3 className={'text-lg font-semibold'}>
                      {content.title || content.contentTitle || 'Untitled'}
                    </h3>
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
                    <span>Curator: {content.curatorName || 'System'}</span>
                  </div>
                  <div className={'mt-1 flex items-center gap-4 text-xs text-muted-foreground'}>
                    <span>Start: {formatDate(content.startDate) || 'Not set'}</span>
                    {content.endDate && <span>End: {formatDate(content.endDate)}</span>}
                    <span>Updated: {formatDate(content.updatedAt)}</span>
                  </div>
                </div>
                <div className={'flex items-center gap-2'}>
                  <Button
                    className={'gap-1'}
                    disabled={isPending}
                    onClick={() => {
                      handleToggleActive(content.id, content.isActive);
                    }}
                    size={'sm'}
                    variant={content.isActive ? 'outline' : 'default'}
                  >
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
                      <DropdownMenuItem
                        className={'text-destructive'}
                        onClick={setIsConfirmDeleteDialogOpen.on}
                      >
                        <Trash2Icon aria-hidden className={'mr-2 size-4'} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Confirm Delete Dialog */}
              <ConfirmDeleteAlertDialog
                description={`This action cannot be undone. This will permanently 
                  delete this featured content entry.`}
                isOpen={isConfirmDeleteDialogOpen}
                onClose={setIsConfirmDeleteDialogOpen.off}
                onDelete={() => {
                  handleDelete(content.id);
                }}
              />
            </CardContent>
          </Card>
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
