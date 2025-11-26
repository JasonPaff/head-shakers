import type { Metadata } from 'next';

import type { AdminUsersFilter, AdminUserStatus } from '@/lib/validations/admin-users.validation';

import { UserManagementClient } from '@/app/(app)/admin/users/components/user-management-client';
import { ENUMS } from '@/lib/constants';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { requireModerator } from '@/lib/utils/admin.utils';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

interface AdminUsersPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    role?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    status?: string;
  }>;
}

export function generateMetadata(): Metadata {
  return {
    description: 'Manage user accounts, roles, and permissions.',
    title: 'User Management - Admin',
  };
}

export default AdminUsersPage;

async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  // Verify admin/moderator access
  await requireModerator();

  // Await and parse search params
  const resolvedSearchParams = await searchParams;

  // Extract pagination parameters
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  const pageSize = resolvedSearchParams.pageSize ? parseInt(resolvedSearchParams.pageSize, 10) : 25;

  // Build filter options for the query
  const filterOptions: AdminUsersFilter = {
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };

  // Add search filter if provided
  if (resolvedSearchParams.search) {
    filterOptions.search = resolvedSearchParams.search;
  }

  // Add role filter if provided and valid
  if (
    resolvedSearchParams.role &&
    ENUMS.USER.ROLE.includes(resolvedSearchParams.role as 'admin' | 'moderator' | 'user')
  ) {
    filterOptions.role = resolvedSearchParams.role as 'admin' | 'moderator' | 'user';
  }

  // Add status filter if provided and valid
  const validStatuses: Array<AdminUserStatus> = ['active', 'locked'];
  if (resolvedSearchParams.status && validStatuses.includes(resolvedSearchParams.status as AdminUserStatus)) {
    filterOptions.status = resolvedSearchParams.status as AdminUserStatus;
  }

  // Add sort options if provided
  const validSortByFields = ['createdAt', 'updatedAt', 'username', 'email', 'lastActiveAt', 'role'] as const;
  if (
    resolvedSearchParams.sortBy &&
    validSortByFields.includes(resolvedSearchParams.sortBy as (typeof validSortByFields)[number])
  ) {
    filterOptions.sortBy = resolvedSearchParams.sortBy as (typeof validSortByFields)[number];
  }

  if (resolvedSearchParams.sortOrder && ['asc', 'desc'].includes(resolvedSearchParams.sortOrder)) {
    filterOptions.sortOrder = resolvedSearchParams.sortOrder as 'asc' | 'desc';
  }

  // Fetch initial user data
  const initialData = await UsersFacade.getUsersForAdminAsync(filterOptions);

  return (
    <div className={'container mx-auto py-8'}>
      {/* Page Header */}
      <div className={'mb-8'}>
        <h1 className={'text-3xl font-bold'}>User Management</h1>
        <p className={'mt-2 text-muted-foreground'}>Manage user accounts, roles, and permissions.</p>
      </div>

      {/* User Management Interface */}
      <UserManagementClient initialData={initialData} />
    </div>
  );
}
