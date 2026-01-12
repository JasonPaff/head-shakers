'use client';

import type { ComponentPropsWithRef } from 'react';

import { LoaderIcon, LockIcon, RefreshCwIcon, SearchIcon, ShieldAlertIcon, UsersIcon } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useCallback, useMemo, useState } from 'react';

import type { AdminUserListRecord } from '@/lib/queries/users/users.query';
import type { AdminUserStatus } from '@/lib/validations/admin-users.validation';

import { UserDetailsDialog } from '@/app/(app)/admin/users/components/user-details-dialog';
import { UserRoleDialog } from '@/app/(app)/admin/users/components/user-role-dialog';
import { UsersDataTable } from '@/app/(app)/admin/users/components/users-data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServerAction } from '@/hooks/use-server-action';
import {
  getAdminUsersAction,
  lockUserAction,
  unlockUserAction,
} from '@/lib/actions/admin/admin-users.actions';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type UserManagementClientProps = ComponentPropsWithRef<'div'> & {
  initialData: {
    total: number;
    users: Array<AdminUserListRecord>;
  };
};

/**
 * Role options for filtering
 */
const ROLE_OPTIONS = [
  { label: 'All Roles', value: 'all' },
  { label: 'User', value: 'user' },
  { label: 'Moderator', value: 'moderator' },
  { label: 'Admin', value: 'admin' },
] as const;

/**
 * Status options for filtering
 */
const STATUS_OPTIONS = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Locked', value: 'locked' },
  { label: 'Verified', value: 'verified' },
  { label: 'Unverified', value: 'unverified' },
] as const;

/**
 * User Management Client Component
 * Main client component that orchestrates the user management interface
 * Handles filtering, data display, and dialog management
 */
export const UserManagementClient = ({ className, initialData, ...props }: UserManagementClientProps) => {
  // useState hooks
  const [users, setUsers] = useState<Array<AdminUserListRecord>>(initialData.users);
  const [totalCount, setTotalCount] = useState(initialData.total);
  const [roleDialogUser, setRoleDialogUser] = useState<AdminUserListRecord | null>(null);
  const [detailsDialogUserId, setDetailsDialogUserId] = useState<null | string>(null);

  // URL state management with nuqs
  const [filters, setFilters] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(25),
      role: parseAsString.withDefault(''),
      search: parseAsString.withDefault(''),
      status: parseAsString.withDefault(''),
    },
    {
      clearOnDefault: true,
      history: 'push',
    },
  );

  // Server actions
  const { executeAsync: fetchUsers, isPending: isRefreshing } = useServerAction(getAdminUsersAction, {
    isDisableToast: true,
  });

  const { executeAsync: lockUser, isPending: isLocking } = useServerAction(lockUserAction, {
    loadingMessage: 'Locking user account...',
    onSuccess: () => {
      void handleRefresh();
    },
  });

  const { executeAsync: unlockUser, isPending: isUnlocking } = useServerAction(unlockUserAction, {
    loadingMessage: 'Unlocking user account...',
    onSuccess: () => {
      void handleRefresh();
    },
  });

  // useMemo hooks for statistics
  const totalUsers = useMemo(() => {
    return totalCount;
  }, [totalCount]);

  const moderatorsCount = useMemo(() => {
    return users.filter((user) => {
      return user.role === 'moderator';
    }).length;
  }, [users]);

  const lockedAccountsCount = useMemo(() => {
    const now = new Date();
    return users.filter((user) => {
      return user.lockedUntil && new Date(user.lockedUntil) > now;
    }).length;
  }, [users]);

  // Event handlers
  const handleRefresh = useCallback(async () => {
    const roleFilter = filters.role && filters.role !== 'all' ? filters.role : undefined;
    const statusFilter = filters.status && filters.status !== 'all' ? filters.status : undefined;

    const result = await fetchUsers({
      limit: filters.pageSize,
      offset: (filters.page - 1) * filters.pageSize,
      role: roleFilter as 'admin' | 'moderator' | 'user' | undefined,
      search: filters.search || undefined,
      status: statusFilter as AdminUserStatus | undefined,
    });

    // Type guard to safely access result data
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
      const responseData = result.data.data as { total: number; users: Array<AdminUserListRecord> };
      setUsers(responseData.users);
      setTotalCount(responseData.total);
    }
  }, [fetchUsers, filters]);

  const handleSearchChange = useCallback(
    (value: string) => {
      void setFilters({ page: 1, search: value });
    },
    [setFilters],
  );

  const handleRoleFilterChange = useCallback(
    (value: string) => {
      void setFilters({ page: 1, role: value === 'all' ? '' : value });
    },
    [setFilters],
  );

  const handleStatusFilterChange = useCallback(
    (value: string) => {
      void setFilters({ page: 1, status: value === 'all' ? '' : value });
    },
    [setFilters],
  );

  const handleViewDetails = useCallback((userId: string) => {
    setDetailsDialogUserId(userId);
  }, []);

  const handleChangeRole = useCallback(
    (userId: string) => {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setRoleDialogUser(user);
      }
    },
    [users],
  );

  const handleLockAccount = useCallback(
    async (userId: string) => {
      await lockUser({ userId });
    },
    [lockUser],
  );

  const handleUnlockAccount = useCallback(
    async (userId: string) => {
      await unlockUser({ userId });
    },
    [unlockUser],
  );

  const handleBulkAction = useCallback(
    async (userIds: Array<string>, action: 'lock' | 'unlock') => {
      // Execute actions sequentially to avoid overwhelming the server
      for (const userId of userIds) {
        if (action === 'lock') {
          await lockUser({ userId });
        } else {
          await unlockUser({ userId });
        }
      }
    },
    [lockUser, unlockUser],
  );

  const handleRoleDialogClose = useCallback(() => {
    setRoleDialogUser(null);
  }, []);

  const handleRoleDialogSuccess = useCallback(() => {
    setRoleDialogUser(null);
    void handleRefresh();
  }, [handleRefresh]);

  const handleDetailsDialogClose = useCallback(() => {
    setDetailsDialogUserId(null);
  }, []);

  const handleDetailsDialogSuccess = useCallback(() => {
    void handleRefresh();
  }, [handleRefresh]);

  // Derived variables for conditional rendering
  const _isLoading = isRefreshing || isLocking || isUnlocking;
  const _isRoleDialogOpen = !!roleDialogUser;
  const _isDetailsDialogOpen = !!detailsDialogUserId;
  const _currentRoleFilter = filters.role || 'all';
  const _currentStatusFilter = filters.status || 'all';

  // Test IDs
  const containerTestId = generateTestId('feature', 'admin-dashboard', 'user-management');

  return (
    <div
      className={cn('space-y-6', className)}
      data-slot={'user-management-client'}
      data-testid={containerTestId}
      {...props}
    >
      {/* Quick Stats */}
      <div className={'grid gap-4 md:grid-cols-2 lg:grid-cols-4'} data-slot={'user-management-stats'}>
        <Card>
          <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
            <CardTitle className={'text-sm font-medium'}>Total Users</CardTitle>
            <UsersIcon aria-hidden className={'size-4 text-muted-foreground'} />
          </CardHeader>
          <CardContent>
            <div className={'text-2xl font-bold'}>{totalUsers.toLocaleString()}</div>
            <p className={'text-xs text-muted-foreground'}>Registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
            <CardTitle className={'text-sm font-medium'}>Moderators</CardTitle>
            <ShieldAlertIcon aria-hidden className={'size-4 text-muted-foreground'} />
          </CardHeader>
          <CardContent>
            <div className={'text-2xl font-bold'}>{moderatorsCount}</div>
            <p className={'text-xs text-muted-foreground'}>Active moderators</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
            <CardTitle className={'text-sm font-medium'}>Locked Accounts</CardTitle>
            <LockIcon aria-hidden className={'size-4 text-muted-foreground'} />
          </CardHeader>
          <CardContent>
            <div className={'text-2xl font-bold'}>{lockedAccountsCount}</div>
            <p className={'text-xs text-muted-foreground'}>Currently locked</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <div
        className={'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'}
        data-slot={'user-management-filters'}
      >
        <div className={'flex flex-1 flex-col gap-4 sm:flex-row sm:items-center'}>
          {/* Search Input */}
          <div className={'relative w-full sm:max-w-sm'}>
            <Input
              className={'pl-8'}
              isClearable
              onChange={(e) => {
                handleSearchChange(e.target.value);
              }}
              onClear={() => {
                handleSearchChange('');
              }}
              placeholder={'Search users...'}
              value={filters.search}
            />
            <SearchIcon
              aria-hidden
              className={'absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground'}
            />
          </div>

          {/* Role Filter */}
          <Select onValueChange={handleRoleFilterChange} value={_currentRoleFilter}>
            <SelectTrigger className={'w-full sm:w-[160px]'}>
              <SelectValue placeholder={'Filter by role'} />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select onValueChange={handleStatusFilterChange} value={_currentStatusFilter}>
            <SelectTrigger className={'w-full sm:w-[160px]'}>
              <SelectValue placeholder={'Filter by status'} />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Refresh Button */}
        <Button
          disabled={_isLoading}
          onClick={() => {
            void handleRefresh();
          }}
          size={'sm'}
          variant={'outline'}
        >
          <Conditional isCondition={_isLoading}>
            <LoaderIcon aria-hidden className={'mr-2 size-4 animate-spin'} />
          </Conditional>
          <Conditional isCondition={!_isLoading}>
            <RefreshCwIcon aria-hidden className={'mr-2 size-4'} />
          </Conditional>
          Refresh
        </Button>
      </div>

      {/* Users Data Table */}
      <UsersDataTable
        data={users}
        onBulkAction={(userIds, action) => {
          void handleBulkAction(userIds, action);
        }}
        onChangeRole={handleChangeRole}
        onLockAccount={(userId) => {
          void handleLockAccount(userId);
        }}
        onUnlockAccount={(userId) => {
          void handleUnlockAccount(userId);
        }}
        onViewDetails={handleViewDetails}
        totalCount={totalCount}
      />

      {/* Role Dialog */}
      <UserRoleDialog
        isOpen={_isRoleDialogOpen}
        onClose={handleRoleDialogClose}
        onSuccess={handleRoleDialogSuccess}
        user={roleDialogUser}
      />

      {/* Details Dialog */}
      <UserDetailsDialog
        isOpen={_isDetailsDialogOpen}
        onClose={handleDetailsDialogClose}
        onSuccess={handleDetailsDialogSuccess}
        userId={detailsDialogUserId}
      />
    </div>
  );
};

UserManagementClient.displayName = 'UserManagementClient';
