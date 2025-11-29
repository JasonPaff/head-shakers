'use client';

import type { ComponentPropsWithRef } from 'react';

import { Loader2Icon, XIcon } from 'lucide-react';
import { Fragment, useState } from 'react';

import type { SelectContentReport } from '@/lib/validations/moderation.validation';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { bulkUpdateReportsAction } from '@/lib/actions/admin/admin-content-reports.actions';
import { cn } from '@/utils/tailwind-utils';

interface BulkActionConfig {
  description: string;
  isConfirmationRequired: boolean;
  status: SelectContentReport['status'];
  title: string;
  variant: 'default' | 'destructive';
}

interface BulkActionsToolbarProps extends ComponentPropsWithRef<'div'> {
  onBulkComplete?: () => void;
  onClearSelection: () => void;
  selectedRowIds: Array<string>;
}

type BulkActionType = 'dismissed' | 'resolved' | 'reviewed';

const BULK_ACTIONS: Record<BulkActionType, BulkActionConfig> = {
  dismissed: {
    description:
      'This will dismiss all selected reports. Dismissed reports indicate the content was reviewed but no action was necessary.',
    isConfirmationRequired: true,
    status: 'dismissed',
    title: 'Dismiss Reports',
    variant: 'destructive',
  },
  resolved: {
    description:
      'This will mark all selected reports as resolved. Resolved reports indicate appropriate action was taken on the reported content.',
    isConfirmationRequired: true,
    status: 'resolved',
    title: 'Resolve Reports',
    variant: 'default',
  },
  reviewed: {
    description: 'This will mark all selected reports as reviewed for your records.',
    isConfirmationRequired: false,
    status: 'reviewed',
    title: 'Mark as Reviewed',
    variant: 'default',
  },
} as const;

export const BulkActionsToolbar = ({
  className,
  onBulkComplete,
  onClearSelection,
  selectedRowIds,
  ...props
}: BulkActionsToolbarProps) => {
  // useState hooks
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<BulkActionType | null>(null);

  // Other hooks
  const { executeAsync: executeBulkUpdate, isExecuting } = useServerAction(bulkUpdateReportsAction, {
    loadingMessage: 'Updating reports...',
    onSuccess: () => {
      onBulkComplete?.();
      onClearSelection();
      setIsConfirmDialogOpen(false);
      setPendingAction(null);
    },
  });

  // Event handlers
  const handleBulkAction = (action: BulkActionType) => {
    const actionConfig = BULK_ACTIONS[action];

    if (actionConfig.isConfirmationRequired) {
      setPendingAction(action);
      setIsConfirmDialogOpen(true);
    } else {
      void executeBulkUpdate({
        reportIds: selectedRowIds,
        status: actionConfig.status,
      });
    }
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;

    const actionConfig = BULK_ACTIONS[pendingAction];
    void executeBulkUpdate({
      reportIds: selectedRowIds,
      status: actionConfig.status,
    });
  };

  const handleCancelConfirmation = () => {
    setIsConfirmDialogOpen(false);
    setPendingAction(null);
  };

  // Derived variables for conditional rendering
  const _selectedCount = selectedRowIds.length;
  const _hasSelection = _selectedCount > 0;
  const _pendingActionConfig = pendingAction ? BULK_ACTIONS[pendingAction] : null;
  const _isConfirmationOpen = isConfirmDialogOpen && !!_pendingActionConfig;

  return (
    <Fragment>
      {/* Bulk Actions Toolbar */}
      <Conditional isCondition={_hasSelection}>
        <div
          className={cn('flex items-center justify-between rounded-lg border bg-muted/50 p-4', className)}
          {...props}
        >
          {/* Selection Count */}
          <div className={'flex items-center gap-2'}>
            <Badge className={'text-sm'} variant={'secondary'}>
              {_selectedCount} selected
            </Badge>
            <span className={'text-sm text-muted-foreground'}>
              {_selectedCount === 1 ? 'report' : 'reports'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className={'flex items-center gap-2'}>
            {/* Bulk Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isExecuting} size={'sm'} variant={'outline'}>
                  <Conditional isCondition={isExecuting}>
                    <Loader2Icon className={'mr-2 size-4 animate-spin'} />
                  </Conditional>
                  {isExecuting ? 'Processing...' : 'Bulk Actions'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={'end'}>
                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    handleBulkAction('reviewed');
                  }}
                >
                  Mark as Reviewed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleBulkAction('resolved');
                  }}
                >
                  Mark as Resolved
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={'text-destructive focus:text-destructive'}
                  onClick={() => {
                    handleBulkAction('dismissed');
                  }}
                >
                  Dismiss Reports
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Selection Button */}
            <Button disabled={isExecuting} onClick={onClearSelection} size={'sm'} variant={'ghost'}>
              <XIcon className={'size-4'} />
              <span className={'sr-only'}>Clear selection</span>
            </Button>
          </div>
        </div>
      </Conditional>

      {/* Confirmation Dialog */}
      <AlertDialog onOpenChange={setIsConfirmDialogOpen} open={_isConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{_pendingActionConfig?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to update {_selectedCount} {_selectedCount === 1 ? 'report' : 'reports'}.
              <br />
              <br />
              {_pendingActionConfig?.description}
              <br />
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isExecuting} onClick={handleCancelConfirmation}>
              Cancel
            </AlertDialogCancel>
            <Button
              asChild
              disabled={isExecuting}
              onClick={() => {
                void handleConfirmAction();
              }}
              variant={_pendingActionConfig?.variant ?? 'default'}
            >
              <AlertDialogAction>
                <Conditional isCondition={isExecuting}>
                  <Loader2Icon className={'mr-2 size-4 animate-spin'} />
                </Conditional>
                {isExecuting ? 'Processing...' : 'Continue'}
              </AlertDialogAction>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
};
