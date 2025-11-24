'use client';

import type { ComponentProps } from 'react';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { SelectContentReportWithSlugs } from '@/lib/validations/moderation.validation';

import { ReportDetailDialog } from '@/components/admin/reports/report-detail-dialog';
import { ReportsTable } from '@/components/admin/reports/reports-table';
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
import { Conditional } from '@/components/ui/conditional';
import { useServerAction } from '@/hooks/use-server-action';
import {
  bulkUpdateReportsAction,
  updateReportStatusAction,
} from '@/lib/actions/admin/admin-content-reports.actions';
import { cn } from '@/utils/tailwind-utils';

type AdminReportsClientProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    initialData: Array<SelectContentReportWithSlugs>;
  };

type PendingAction = {
  reportIds: Array<string>;
  status: ReportActionStatus;
};

type ReportActionStatus = 'dismissed' | 'resolved' | 'reviewed';

export const AdminReportsClient = ({ className, initialData, testId, ...props }: AdminReportsClientProps) => {
  // useState hooks
  const [selectedReport, setSelectedReport] = useState<null | SelectContentReportWithSlugs>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | PendingAction>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Other hooks
  const router = useRouter();

  const { executeAsync: executeUpdateStatus } = useServerAction(updateReportStatusAction, {
    toastMessages: {
      error: 'Failed to update report status',
      loading: 'Updating report status...',
      success: 'Report status updated successfully',
    },
  });

  const { executeAsync: executeBulkUpdate } = useServerAction(bulkUpdateReportsAction, {
    toastMessages: {
      error: 'Failed to update reports',
      loading: 'Updating reports...',
      success: (data) => {
        const result = data as { data?: { data?: Array<unknown> } };
        const count = result?.data?.data?.length ?? 0;
        return `Successfully updated ${count} report${count === 1 ? '' : 's'}`;
      },
    },
  });

  // Event handlers
  const handleViewDetails = useCallback(
    (reportId: string) => {
      const report = initialData.find((r) => r.id === reportId);
      if (report) {
        setSelectedReport(report);
        setIsDetailDialogOpen(true);
      }
    },
    [initialData],
  );

  const handleCloseDetailDialog = useCallback(() => {
    setIsDetailDialogOpen(false);
    setSelectedReport(null);
  }, []);

  const handleStatusChangeFromDialog = useCallback(
    async (reportId: string, status: ReportActionStatus) => {
      // For resolved and dismissed, show confirmation dialog
      if (status === 'resolved' || status === 'dismissed') {
        setPendingAction({ reportIds: [reportId], status });
        setIsConfirmDialogOpen(true);
        return;
      }

      // For reviewed, execute directly
      setIsLoading(true);
      try {
        await executeUpdateStatus({ reportId, status });
        router.refresh();
        handleCloseDetailDialog();
      } finally {
        setIsLoading(false);
      }
    },
    [executeUpdateStatus, router, handleCloseDetailDialog],
  );

  const handleBulkAction = useCallback(
    async (reportIds: Array<string>, action: ReportActionStatus) => {
      // For resolved and dismissed, show confirmation dialog
      if (action === 'resolved' || action === 'dismissed') {
        setPendingAction({ reportIds, status: action });
        setIsConfirmDialogOpen(true);
        return;
      }

      // For reviewed status, execute directly
      setIsLoading(true);
      try {
        const firstReportId = reportIds[0];
        if (reportIds.length === 1 && firstReportId) {
          await executeUpdateStatus({ reportId: firstReportId, status: action });
        } else {
          await executeBulkUpdate({ reportIds, status: action });
        }
        router.refresh();
      } finally {
        setIsLoading(false);
      }
    },
    [executeUpdateStatus, executeBulkUpdate, router],
  );

  const handleConfirmAction = useCallback(async () => {
    if (!pendingAction) return;

    setIsLoading(true);
    try {
      const firstPendingReportId = pendingAction.reportIds[0];
      if (pendingAction.reportIds.length === 1 && firstPendingReportId) {
        await executeUpdateStatus({
          reportId: firstPendingReportId,
          status: pendingAction.status,
        });
      } else {
        await executeBulkUpdate({
          reportIds: pendingAction.reportIds,
          status: pendingAction.status,
        });
      }
      router.refresh();
      handleCloseDetailDialog();
    } finally {
      setIsLoading(false);
      setIsConfirmDialogOpen(false);
      setPendingAction(null);
    }
  }, [pendingAction, executeUpdateStatus, executeBulkUpdate, router, handleCloseDetailDialog]);

  const handleCancelConfirm = useCallback(() => {
    setIsConfirmDialogOpen(false);
    setPendingAction(null);
  }, []);

  // Derived variables for conditional rendering
  const _actionDescription =
    pendingAction?.status === 'resolved' ?
      'This will mark the report as resolved and close the case.'
    : 'This will dismiss the report without taking action.';
  const _actionTitle =
    pendingAction?.status === 'resolved' ? 'Resolve Report'
    : pendingAction?.status === 'dismissed' ? 'Dismiss Report'
    : 'Confirm Action';
  const _reportCount = pendingAction?.reportIds.length ?? 0;
  const _isBulkAction = _reportCount > 1;

  const adminReportsClientTestId = testId ?? 'admin-reports-client';

  return (
    <div
      className={cn('space-y-6', className)}
      data-slot={'admin-reports-client'}
      data-testid={adminReportsClientTestId}
      {...props}
    >
      {/* Reports Table */}
      <ReportsTable data={initialData} onBulkAction={handleBulkAction} onViewDetails={handleViewDetails} />

      {/* Report Detail Dialog */}
      <ReportDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={handleCloseDetailDialog}
        onStatusChange={handleStatusChangeFromDialog}
        report={selectedReport}
      />

      {/* Confirmation Dialog for Resolve/Dismiss Actions */}
      <AlertDialog onOpenChange={handleCancelConfirm} open={isConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{_actionTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              <Conditional isCondition={_isBulkAction}>
                You are about to {pendingAction?.status} {_reportCount} reports. {_actionDescription}
              </Conditional>
              <Conditional isCondition={!_isBulkAction}>
                Are you sure you want to {pendingAction?.status} this report? {_actionDescription}
              </Conditional>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmAction();
              }}
            >
              {isLoading ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
