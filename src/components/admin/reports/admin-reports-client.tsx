'use client';

import type { ComponentProps } from 'react';

import { useCallback, useState } from 'react';

import type { ContentReportReason, ContentReportStatus } from '@/lib/constants/enums';
import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { SelectContentReportWithSlugs } from '@/lib/validations/moderation.validation';

import { ReportDetailDialog } from '@/components/admin/reports/report-detail-dialog';
import { ReportFilters } from '@/components/admin/reports/report-filters';
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
  getAdminReportsAction,
  updateReportStatusAction,
} from '@/lib/actions/admin/admin-content-reports.actions';
import { cn } from '@/utils/tailwind-utils';

export type ReportFiltersState = {
  dateFrom?: Date | null;
  dateTo?: Date | null;
  reason?: Array<ContentReportReason> | null;
  status?: Array<ContentReportStatus> | null;
  targetType?: Array<'bobblehead' | 'collection' | 'comment'> | null;
};

type AdminReportsClientProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    initialData: Array<SelectContentReportWithSlugs>;
    onFiltersChange?: (filters: ReportFiltersState) => void;
  };

// Input type for server action - dates are serialized as ISO strings
type AdminReportsFilterInput = {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  moderatorId?: string;
  offset?: number;
  reason?: Array<ContentReportReason> | ContentReportReason;
  reporterId?: string;
  status?: Array<ContentReportStatus> | ContentReportStatus;
  targetType?: 'bobblehead' | 'collection' | 'comment' | Array<'bobblehead' | 'collection' | 'comment'>;
};

type PendingAction = {
  reportIds: Array<string>;
  status: ReportActionStatus;
};

type ReportActionStatus = 'dismissed' | 'resolved' | 'reviewed';

export const AdminReportsClient = ({ className, initialData, testId, ...props }: AdminReportsClientProps) => {
  // useState hooks
  const [reports, setReports] = useState<Array<SelectContentReportWithSlugs>>(initialData);
  const [currentFilters, setCurrentFilters] = useState<ReportFiltersState>({});
  const [selectedReport, setSelectedReport] = useState<null | SelectContentReportWithSlugs>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | PendingAction>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Server action hooks
  const { executeAsync: fetchReports } = useServerAction(getAdminReportsAction, {
    isDisableToast: true,
  });

  const { executeAsync: executeUpdateStatus } = useServerAction(updateReportStatusAction, {
    loadingMessage: 'Updating report status...',
  });

  const { executeAsync: executeBulkUpdate } = useServerAction(bulkUpdateReportsAction, {
    loadingMessage: 'Updating reports...',
  });

  // Event handlers
  const handleRefresh = useCallback(
    async (filters?: ReportFiltersState) => {
      const filtersToUse = filters ?? currentFilters;

      // Build filter options for the server action
      const filterOptions: AdminReportsFilterInput = {};

      if (filtersToUse.status && filtersToUse.status.length > 0) {
        filterOptions.status =
          filtersToUse.status.length === 1 ? filtersToUse.status[0] : filtersToUse.status;
      }

      if (filtersToUse.targetType && filtersToUse.targetType.length > 0) {
        filterOptions.targetType =
          filtersToUse.targetType.length === 1 ? filtersToUse.targetType[0] : filtersToUse.targetType;
      }

      if (filtersToUse.reason && filtersToUse.reason.length > 0) {
        filterOptions.reason =
          filtersToUse.reason.length === 1 ? filtersToUse.reason[0] : filtersToUse.reason;
      }

      if (filtersToUse.dateFrom) {
        filterOptions.dateFrom = filtersToUse.dateFrom.toISOString();
      }

      if (filtersToUse.dateTo) {
        filterOptions.dateTo = filtersToUse.dateTo.toISOString();
      }

      const result = await fetchReports(filterOptions);

      if (
        result &&
        typeof result === 'object' &&
        'data' in result &&
        result.data &&
        typeof result.data === 'object' &&
        'success' in result.data &&
        result.data.success === true &&
        'data' in result.data &&
        result.data.data
      ) {
        const responseData = result.data.data as { reports: Array<SelectContentReportWithSlugs> };
        setReports(responseData.reports);
      }
    },
    [currentFilters, fetchReports],
  );

  const handleFiltersChange = useCallback(
    (filters: ReportFiltersState) => {
      setCurrentFilters(filters);
      void handleRefresh(filters);
    },
    [handleRefresh],
  );

  const handleViewDetails = useCallback(
    (reportId: string) => {
      const report = reports.find((r) => r.id === reportId);
      if (report) {
        setSelectedReport(report);
        setIsDetailDialogOpen(true);
      }
    },
    [reports],
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
        await handleRefresh();
        handleCloseDetailDialog();
      } finally {
        setIsLoading(false);
      }
    },
    [executeUpdateStatus, handleRefresh, handleCloseDetailDialog],
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
        await handleRefresh();
      } finally {
        setIsLoading(false);
      }
    },
    [executeUpdateStatus, executeBulkUpdate, handleRefresh],
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
      await handleRefresh();
      handleCloseDetailDialog();
    } finally {
      setIsLoading(false);
      setIsConfirmDialogOpen(false);
      setPendingAction(null);
    }
  }, [pendingAction, executeUpdateStatus, executeBulkUpdate, handleRefresh, handleCloseDetailDialog]);

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
      {/* Filters */}
      <ReportFilters onFiltersChange={handleFiltersChange} />

      {/* Reports Table */}
      <ReportsTable data={reports} onBulkAction={handleBulkAction} onViewDetails={handleViewDetails} />

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
