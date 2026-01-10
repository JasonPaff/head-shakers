'use client';

import type { ColumnDef, RowSelectionState, SortingState } from '@tanstack/react-table';
import type { ComponentPropsWithRef } from 'react';

import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  LockIcon,
  MoreVerticalIcon,
  ShieldIcon,
  UnlockIcon,
} from 'lucide-react';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';

import type { AdminUserListRecord } from '@/lib/queries/users/users-query';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateOnly, formatTimeOnly } from '@/lib/utils/date.utils';
import { cn } from '@/utils/tailwind-utils';

type UserAction = 'change-role' | 'lock' | 'unlock' | 'view-details';

type UsersDataTableProps = ComponentPropsWithRef<'div'> & {
  data: Array<AdminUserListRecord>;
  onBulkAction?: (userIds: Array<string>, action: 'lock' | 'unlock') => void;
  onChangeRole?: (userId: string) => void;
  onLockAccount?: (userId: string) => void;
  onUnlockAccount?: (userId: string) => void;
  onViewDetails?: (userId: string) => void;
  totalCount?: number;
};

export const UsersDataTable = ({
  className,
  data,
  onBulkAction,
  onChangeRole,
  onLockAccount,
  onUnlockAccount,
  onViewDetails,
  totalCount = 0,
  ...props
}: UsersDataTableProps) => {
  // useState hooks
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([{ desc: true, id: 'createdAt' }]);

  // Other hooks
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(25),
    },
    {
      clearOnDefault: true,
      history: 'push',
    },
  );

  // useMemo hooks
  const columns = useMemo<Array<ColumnDef<AdminUserListRecord>>>(
    () => [
      {
        cell: ({ row }) => (
          <Checkbox
            aria-label={'Select row'}
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
            }}
          />
        ),
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            aria-label={'Select all'}
            checked={
              table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
            }}
          />
        ),
        id: 'select',
        size: 50,
      },
      {
        accessorKey: 'username',
        cell: ({ row }) => {
          const username = row.original.username;
          return (
            <div className={'font-medium'} data-slot={'users-table-username'}>
              {username}
            </div>
          );
        },
        enableSorting: true,
        header: 'Username',
        size: 150,
      },
      {
        accessorKey: 'email',
        cell: ({ row }) => {
          const email = row.original.email;
          return (
            <div className={'text-sm text-muted-foreground'} data-slot={'users-table-email'}>
              {email}
            </div>
          );
        },
        enableSorting: false,
        header: 'Email',
        size: 200,
      },
      {
        accessorKey: 'role',
        cell: ({ row }) => {
          const role = row.original.role;
          const _isUser = role === 'user';
          const _isModerator = role === 'moderator';
          const _isAdmin = role === 'admin';

          return (
            <Badge
              className={cn(
                _isUser && 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
                _isModerator && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                _isAdmin && 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
              )}
              data-slot={'users-table-role-badge'}
              variant={'secondary'}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
          );
        },
        enableSorting: true,
        header: 'Role',
        size: 120,
      },
      {
        cell: ({ row }) => {
          const user = row.original;
          const now = new Date();
          const _isLocked = user.lockedUntil && new Date(user.lockedUntil) > now;
          const _isActive = !_isLocked;

          return (
            <div className={'flex flex-wrap gap-1'} data-slot={'users-table-status'}>
              <Conditional isCondition={_isActive && !_isLocked}>
                <Badge
                  className={'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}
                  variant={'secondary'}
                >
                  Active
                </Badge>
              </Conditional>
              <Conditional isCondition={!!_isLocked}>
                <Badge
                  className={'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}
                  variant={'secondary'}
                >
                  Locked
                </Badge>
              </Conditional>
            </div>
          );
        },
        enableSorting: false,
        header: 'Status',
        id: 'status',
        size: 180,
      },
      {
        accessorKey: 'createdAt',
        cell: ({ row }) => {
          const createdAt = row.original.createdAt;
          const _hasDate = !!createdAt;

          return (
            <div data-slot={'users-table-created-at'}>
              <Conditional isCondition={_hasDate}>
                <div className={'space-y-0.5'}>
                  <div className={'text-sm'}>{formatDateOnly(createdAt)}</div>
                  <div className={'text-xs text-muted-foreground'}>{formatTimeOnly(createdAt)}</div>
                </div>
              </Conditional>
              <Conditional isCondition={!_hasDate}>
                <span className={'text-sm text-muted-foreground'}>-</span>
              </Conditional>
            </div>
          );
        },
        enableSorting: true,
        header: 'Created',
        size: 150,
      },
      {
        accessorKey: 'lastActiveAt',
        cell: ({ row }) => {
          const lastActiveAt = row.original.lastActiveAt;
          const _hasDate = !!lastActiveAt;

          return (
            <div data-slot={'users-table-last-active'}>
              <Conditional isCondition={_hasDate}>
                <div className={'space-y-0.5'}>
                  <div className={'text-sm'}>{formatDateOnly(lastActiveAt)}</div>
                  <div className={'text-xs text-muted-foreground'}>{formatTimeOnly(lastActiveAt)}</div>
                </div>
              </Conditional>
              <Conditional isCondition={!_hasDate}>
                <span className={'text-sm text-muted-foreground'}>Never</span>
              </Conditional>
            </div>
          );
        },
        enableSorting: true,
        header: 'Last Active',
        size: 150,
      },
      {
        cell: ({ row }) => {
          const user = row.original;
          const now = new Date();
          const _isLocked = user.lockedUntil && new Date(user.lockedUntil) > now;

          const handleAction = (action: UserAction) => {
            switch (action) {
              case 'change-role':
                onChangeRole?.(user.id);
                break;
              case 'lock':
                onLockAccount?.(user.id);
                break;
              case 'unlock':
                onUnlockAccount?.(user.id);
                break;
              case 'view-details':
                onViewDetails?.(user.id);
                break;
            }
          };

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className={'h-8 w-8 p-0'} variant={'ghost'}>
                  <span className={'sr-only'}>Open menu</span>
                  <MoreVerticalIcon aria-hidden className={'size-4'} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={'end'}>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    handleAction('view-details');
                  }}
                >
                  <EyeIcon aria-hidden className={'mr-2 size-4'} />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    handleAction('change-role');
                  }}
                >
                  <ShieldIcon aria-hidden className={'mr-2 size-4'} />
                  Change Role
                </DropdownMenuItem>
                <Conditional isCondition={!_isLocked}>
                  <DropdownMenuItem
                    onClick={() => {
                      handleAction('lock');
                    }}
                    variant={'destructive'}
                  >
                    <LockIcon aria-hidden className={'mr-2 size-4'} />
                    Lock Account
                  </DropdownMenuItem>
                </Conditional>
                <Conditional isCondition={!!_isLocked}>
                  <DropdownMenuItem
                    onClick={() => {
                      handleAction('unlock');
                    }}
                  >
                    <UnlockIcon aria-hidden className={'mr-2 size-4'} />
                    Unlock Account
                  </DropdownMenuItem>
                </Conditional>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        header: 'Actions',
        id: 'actions',
        size: 80,
      },
    ],
    [onChangeRole, onLockAccount, onUnlockAccount, onViewDetails],
  );

  // TanStack Table instance - React Compiler warning is expected for this library
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.pageSize,
      },
      rowSelection,
      sorting,
    },
  });

  // Event handlers
  const handlePageChange = (newPage: number) => {
    void setPagination({ page: newPage });
    setRowSelection({});
  };

  const handlePageSizeChange = (newPageSize: number) => {
    void setPagination({ page: 1, pageSize: newPageSize });
    setRowSelection({});
  };

  const handleBulkAction = (action: 'lock' | 'unlock') => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const userIds = selectedRows.map((row) => row.original.id);
    onBulkAction?.(userIds, action);
    setRowSelection({});
  };

  // Derived variables for conditional rendering
  const _hasNoResults = table.getRowModel().rows?.length === 0;
  const _hasSelectedRows = Object.keys(rowSelection).length > 0;
  const _selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const _totalPages = Math.ceil(totalCount / pagination.pageSize);
  const _hasPreviousPage = pagination.page > 1;
  const _hasNextPage = pagination.page < _totalPages;
  const _startIndex = (pagination.page - 1) * pagination.pageSize + 1;
  const _endIndex = Math.min(pagination.page * pagination.pageSize, totalCount);

  return (
    <div className={cn('space-y-4', className)} data-slot={'users-data-table'} {...props}>
      {/* Bulk Actions Bar */}
      <Conditional isCondition={_hasSelectedRows}>
        <div
          className={'flex items-center justify-between rounded-lg border bg-muted/50 p-4'}
          data-slot={'users-table-bulk-actions'}
        >
          <div className={'text-sm font-medium'}>
            {_selectedCount} {_selectedCount === 1 ? 'user' : 'users'} selected
          </div>
          <div className={'flex gap-2'}>
            <Button
              onClick={() => {
                handleBulkAction('lock');
              }}
              size={'sm'}
              variant={'outline'}
            >
              <LockIcon aria-hidden className={'mr-2 size-4'} />
              Lock Selected
            </Button>
            <Button
              onClick={() => {
                handleBulkAction('unlock');
              }}
              size={'sm'}
              variant={'outline'}
            >
              <UnlockIcon aria-hidden className={'mr-2 size-4'} />
              Unlock Selected
            </Button>
          </div>
        </div>
      </Conditional>

      {/* Data Table */}
      <div className={'overflow-x-auto rounded-md border'} data-slot={'users-table-container'}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const _canSort = header.column.getCanSort();
                  const _isSorted = header.column.getIsSorted();

                  return (
                    <TableHead key={header.id} style={{ width: header.getSize() }}>
                      <Conditional isCondition={_canSort}>
                        <Button
                          className={'h-auto p-0 font-medium hover:bg-transparent'}
                          onClick={() => {
                            header.column.toggleSorting();
                          }}
                          size={'sm'}
                          variant={'ghost'}
                        >
                          {header.isPlaceholder ? null : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                          {_isSorted === 'desc' ?
                            <ArrowDownIcon aria-hidden className={'ml-1 size-3'} />
                          : _isSorted === 'asc' ?
                            <ArrowUpIcon aria-hidden className={'ml-1 size-3'} />
                          : null}
                        </Button>
                      </Conditional>
                      <Conditional isCondition={!_canSort}>
                        {header.isPlaceholder ? null : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </Conditional>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <Conditional isCondition={_hasNoResults}>
              <TableRow>
                <TableCell className={'h-24 text-center text-muted-foreground'} colSpan={columns.length}>
                  No users found.
                </TableCell>
              </TableRow>
            </Conditional>
            <Conditional isCondition={!_hasNoResults}>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  className={'hover:bg-muted/50'}
                  data-state={row.getIsSelected() && 'selected'}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </Conditional>
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div
        className={'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'}
        data-slot={'users-table-pagination'}
      >
        {/* Results Info */}
        <div className={'text-sm text-muted-foreground'}>
          Showing {_startIndex} to {_endIndex} of {totalCount} results
        </div>

        {/* Page Size Selector */}
        <div className={'flex items-center gap-2'}>
          <span className={'text-sm font-medium'}>Rows per page:</span>
          <div className={'flex gap-1'}>
            {[10, 25, 50, 100].map((size) => (
              <Button
                className={cn('h-8 min-w-[2.5rem] px-2')}
                key={size}
                onClick={() => {
                  handlePageSizeChange(size);
                }}
                size={'sm'}
                variant={pagination.pageSize === size ? 'default' : 'outline'}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        {/* Page Navigation */}
        <div className={'flex items-center gap-2'}>
          <Button
            disabled={!_hasPreviousPage}
            onClick={() => {
              handlePageChange(pagination.page - 1);
            }}
            size={'sm'}
            variant={'outline'}
          >
            Previous
          </Button>
          <div className={'flex items-center gap-1'}>
            <span className={'text-sm font-medium'}>
              Page {pagination.page} of {_totalPages}
            </span>
          </div>
          <Button
            disabled={!_hasNextPage}
            onClick={() => {
              handlePageChange(pagination.page + 1);
            }}
            size={'sm'}
            variant={'outline'}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
