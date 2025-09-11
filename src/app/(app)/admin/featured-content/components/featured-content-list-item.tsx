'use client';

import { EditIcon, EyeIcon, EyeOffIcon, MoreHorizontalIcon, Trash2Icon, TrendingUpIcon } from 'lucide-react';
import { Fragment } from 'react';

import type { FeaturedContentRecord } from '@/lib/queries/featured-content/featured-content-query';

import { ConfirmDeleteAlertDialog } from '@/components/ui/alert-dialogs/confirm-delete-alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import {
  deleteFeaturedContentAction,
  toggleFeaturedContentActiveAction,
} from '@/lib/actions/featured-content/featured-content.actions';

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

type FeaturedContentListItemProps = FeaturedContentRecord & {
  onEdit: (contentId: string) => void;
};

export const FeaturedContentListItem = ({ onEdit, ...content }: FeaturedContentListItemProps) => {
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useToggle();

  const {
    executeAsync: deleteAsync,
    input: deleteInput,
    isPending: isDeleting,
  } = useServerAction(deleteFeaturedContentAction, {
    toastMessages: {
      error: 'Failed to delete featured content. Please try again.',
      loading: 'Deleting featured content...',
      success: 'Featured content deleted successfully.',
    },
  });

  const {
    executeAsync: toggleAsync,
    input: toggleInput,
    isPending: isToggling,
  } = useServerAction(toggleFeaturedContentActiveAction, {
    toastMessages: {
      error: 'Failed to update featured content status. Please try again.',
      loading: content.isActive ? 'Deactivating featured content...' : 'Activating featured content...',
      success:
        content.isActive ?
          'Featured content deactivated successfully.'
        : 'Featured content activated successfully.',
    },
  });

  const handleEdit = () => {
    onEdit(content.id);
  };

  const handleDelete = async () => {
    await deleteAsync({ id: content.id });
  };

  const handleToggle = async () => {
    await toggleAsync({
      id: content.id,
      isActive: !content.isActive,
    });
  };

  const _isDeletingCurrent = isDeleting && deleteInput?.id === content.id;
  const _isTogglingCurrent = isToggling && toggleInput?.id === content.id;

  const _isActionsDisabled = isDeleting || isToggling || _isDeletingCurrent || _isTogglingCurrent;

  return (
    <Card key={content.id}>
      <CardContent className={'p-6'}>
        <div className={'flex items-center justify-between'}>
          <div className={'flex-1'}>
            {/* Title */}
            <div className={'mb-2 flex items-center gap-2'}>
              <h3 className={'text-lg font-semibold'}>
                {content.title || content.contentTitle || 'Untitled'}
              </h3>
              {/* Badges */}
              <Badge className={getContentTypeColor(content.contentType)}>{content.contentType}</Badge>
              <Badge variant={content.isActive ? 'default' : 'secondary'}>
                {content.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {/* Main Info */}
            <div className={'flex items-center gap-4 text-sm text-muted-foreground'}>
              <span>Feature: {getFeatureTypeLabel(content.featureType)}</span>
              <span className={'flex items-center gap-1'}>
                <TrendingUpIcon aria-hidden className={'size-4'} />
                {content.viewCount.toLocaleString()} views
              </span>
              <span>Priority: {content.priority}</span>
              <span>Curator: {content.curatorName || 'System'}</span>
            </div>

            {/* Dates Info */}
            <div className={'mt-1 flex items-center gap-4 text-xs text-muted-foreground'}>
              <span>Start: {formatDate(content.startDate) || 'Not set'}</span>
              <Conditional isCondition={!!content.endDate}>
                <span>End: {formatDate(content.endDate)}</span>
              </Conditional>
              <span>Updated: {formatDate(content.updatedAt)}</span>
            </div>
          </div>

          <div className={'flex items-center gap-2'}>
            {/* Activate/Deactivate Button */}
            <Button
              className={'gap-1'}
              disabled={_isActionsDisabled}
              onClick={handleToggle}
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

            {/* Actions Dropdown */}
            <DropdownMenu>
              {/* Menu Trigger */}
              <DropdownMenuTrigger asChild>
                <Button className={'size-8 p-0'} disabled={_isActionsDisabled} variant={'ghost'}>
                  <span className={'sr-only'}>Open menu</span>
                  <MoreHorizontalIcon aria-hidden className={'size-4'} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={'end'}>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {/* Edit Action */}
                <DropdownMenuItem onClick={handleEdit}>
                  <EditIcon aria-hidden className={'mr-2 size-4'} />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Delete Action */}
                <DropdownMenuItem className={'text-destructive'} onClick={setIsConfirmDeleteDialogOpen.on}>
                  <Trash2Icon aria-hidden className={'mr-2 size-4'} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Confirm Delete Dialog */}
        <ConfirmDeleteAlertDialog
          isOpen={isConfirmDeleteDialogOpen}
          onClose={setIsConfirmDeleteDialogOpen.off}
          onDeleteAsync={handleDelete}
        >
          This will permanently delete this featured content entry.
        </ConfirmDeleteAlertDialog>
      </CardContent>
    </Card>
  );
};
