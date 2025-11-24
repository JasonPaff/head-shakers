import type { Metadata } from 'next';

import type { ContentReportReason, ContentReportStatus } from '@/lib/constants/enums';
import type { AdminReportsFilterOptions } from '@/lib/queries/content-reports/content-reports.query';

import { AdminReportsClient } from '@/components/admin/reports/admin-reports-client';
import { Card } from '@/components/ui/card';
import { ContentReportsFacade } from '@/lib/facades/content-reports/content-reports.facade';
import { getCurrentUserWithRole, requireModerator } from '@/lib/utils/admin.utils';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

interface AdminReportsPageProps {
  searchParams: Promise<{
    dateFrom?: string;
    dateTo?: string;
    page?: string;
    pageSize?: string;
    reason?: Array<string> | string;
    status?: Array<string> | string;
    targetType?: Array<string> | string;
  }>;
}

export function generateMetadata(): Metadata {
  return {
    description: 'Review and manage user-reported content for moderation',
    title: 'Content Reports - Admin',
  };
}

export default AdminReportsPage;

async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  // Verify admin/moderator access
  await requireModerator();

  // Get current user for facade calls
  const currentUser = await getCurrentUserWithRole();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Await and parse search params
  const resolvedSearchParams = await searchParams;

  // Build filter options for the query
  // Note: Pagination is handled client-side in the table component
  // We fetch all data matching the filters without pagination
  const filterOptions: AdminReportsFilterOptions = {};

  // Extract filter values (nuqs returns comma-separated strings for multi-select)
  if (resolvedSearchParams.status) {
    const statusArray =
      Array.isArray(resolvedSearchParams.status) ?
        resolvedSearchParams.status
      : resolvedSearchParams.status.split(',');
    if (statusArray.length > 0) {
      filterOptions.status =
        statusArray.length === 1 ?
          (statusArray[0] as ContentReportStatus)
        : (statusArray as Array<ContentReportStatus>);
    }
  }

  if (resolvedSearchParams.targetType) {
    const targetTypeArray =
      Array.isArray(resolvedSearchParams.targetType) ?
        resolvedSearchParams.targetType
      : resolvedSearchParams.targetType.split(',');
    if (targetTypeArray.length > 0) {
      filterOptions.targetType =
        targetTypeArray.length === 1 ?
          (targetTypeArray[0] as 'bobblehead' | 'collection' | 'subcollection')
        : (targetTypeArray as Array<'bobblehead' | 'collection' | 'subcollection'>);
    }
  }

  if (resolvedSearchParams.reason) {
    const reasonArray =
      Array.isArray(resolvedSearchParams.reason) ?
        resolvedSearchParams.reason
      : resolvedSearchParams.reason.split(',');
    if (reasonArray.length > 0) {
      filterOptions.reason =
        reasonArray.length === 1 ?
          (reasonArray[0] as ContentReportReason)
        : (reasonArray as Array<ContentReportReason>);
    }
  }

  // Extract date filter values
  if (resolvedSearchParams.dateFrom) {
    filterOptions.dateFrom = new Date(resolvedSearchParams.dateFrom);
  }

  if (resolvedSearchParams.dateTo) {
    filterOptions.dateTo = new Date(resolvedSearchParams.dateTo);
  }

  // Fetch reports data and stats with slug data for content linking
  const { reports, stats } = await ContentReportsFacade.getAllReportsWithSlugsForAdminAsync(
    filterOptions,
    currentUser.id,
  );

  return (
    <div className={'container mx-auto py-8'}>
      {/* Page Header */}
      <div className={'mb-8'}>
        <h1 className={'text-3xl font-bold'}>Content Reports</h1>
        <p className={'mt-2 text-muted-foreground'}>Review and manage user reports and content moderation.</p>
      </div>

      {/* Quick Stats */}
      <div className={'mb-6 grid gap-4 md:grid-cols-5'}>
        <Card className={'p-4'}>
          <div className={'text-sm font-medium text-muted-foreground'}>Total Reports</div>
          <div className={'mt-2 text-2xl font-bold'}>{stats.total}</div>
        </Card>
        <Card className={'p-4'}>
          <div className={'text-sm font-medium text-muted-foreground'}>Pending</div>
          <div className={'mt-2 text-2xl font-bold text-yellow-600'}>{stats.pending}</div>
        </Card>
        <Card className={'p-4'}>
          <div className={'text-sm font-medium text-muted-foreground'}>Reviewed</div>
          <div className={'mt-2 text-2xl font-bold text-blue-600'}>{stats.reviewed}</div>
        </Card>
        <Card className={'p-4'}>
          <div className={'text-sm font-medium text-muted-foreground'}>Resolved</div>
          <div className={'mt-2 text-2xl font-bold text-green-600'}>{stats.resolved}</div>
        </Card>
        <Card className={'p-4'}>
          <div className={'text-sm font-medium text-muted-foreground'}>Dismissed</div>
          <div className={'mt-2 text-2xl font-bold text-gray-600'}>{stats.dismissed}</div>
        </Card>
      </div>

      {/* Reports Section - Filters and Table */}
      <AdminReportsClient initialData={reports} />
    </div>
  );
}
