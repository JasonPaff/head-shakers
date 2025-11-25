'use client';

import type { ColumnDef, RowSelectionState, SortingState } from '@tanstack/react-table';
import type { ComponentPropsWithRef } from 'react';

import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowDownIcon, ArrowUpIcon, EyeIcon, MoreVerticalIcon, UserMinusIcon } from 'lucide-react';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';

import type { NewsletterSignupRecord } from '@/lib/queries/newsletter/newsletter.queries';

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
import { cn } from '@/utils/tailwind-utils';

type NewsletterSubscribersTableProps = ComponentPropsWithRef<'div'> & {
  data: Array<NewsletterSignupRecord>;
  onBulkUnsubscribe?: (subscriberIds: Array<string>) => void;
  onUnsubscribe?: (subscriberId: string) => void;
  onViewDetails?: (subscriberId: string) => void;
  totalCount?: number;
};

type SubscriberAction = 'unsubscribe' | 'view-details';

export const NewsletterSubscribersTable = ({
  className,
  data,
  onBulkUnsubscribe,
  onUnsubscribe,
  onViewDetails,
  totalCount = 0,
  ...props
}: NewsletterSubscribersTableProps) => {
  // useState hooks
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([{ desc: true, id: 'subscribedAt' }]);

  // Other hooks
  const [urlState, setUrlState] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(25),
      search: parseAsString.withDefault(''),
      status: parseAsStringEnum<'active' | 'all' | 'unsubscribed'>([
        'active',
        'unsubscribed',
        'all',
      ]).withDefault('active'),
    },
    {
      clearOnDefault: true,
      history: 'push',
    },
  );

  // useMemo hooks
  const columns = useMemo<Array<ColumnDef<NewsletterSignupRecord>>>(
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
        accessorKey: 'email',
        cell: ({ row }) => {
          const email = row.original.email;
          return (
            <div className={'font-medium'} data-slot={'subscribers-table-email'}>
              {email}
            </div>
          );
        },
        enableSorting: true,
        header: 'Email',
        size: 250,
      },
      {
        accessorKey: 'subscribedAt',
        cell: ({ row }) => {
          const subscribedAt = row.original.subscribedAt;
          const _hasDate = !!subscribedAt;

          return (
            <div data-slot={'subscribers-table-subscribed-at'}>
              <Conditional isCondition={_hasDate}>
                <div className={'space-y-0.5'}>
                  <div className={'text-sm'}>{new Date(subscribedAt).toLocaleDateString()}</div>
                  <div className={'text-xs text-muted-foreground'}>
                    {new Date(subscribedAt).toLocaleTimeString()}
                  </div>
                </div>
              </Conditional>
              <Conditional isCondition={!_hasDate}>
                <span className={'text-sm text-muted-foreground'}>-</span>
              </Conditional>
            </div>
          );
        },
        enableSorting: true,
        header: 'Subscribed At',
        size: 150,
      },
      {
        cell: ({ row }) => {
          const subscriber = row.original;
          const _isUnsubscribed = subscriber.unsubscribedAt !== null;
          const _isActive = !_isUnsubscribed;

          return (
            <div className={'flex flex-wrap gap-1'} data-slot={'subscribers-table-status'}>
              <Conditional isCondition={_isActive}>
                <Badge
                  className={'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}
                  variant={'secondary'}
                >
                  Active
                </Badge>
              </Conditional>
              <Conditional isCondition={_isUnsubscribed}>
                <Badge
                  className={'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}
                  variant={'secondary'}
                >
                  Unsubscribed
                </Badge>
              </Conditional>
            </div>
          );
        },
        enableSorting: false,
        header: 'Status',
        id: 'status',
        size: 120,
      },
      {
        accessorKey: 'unsubscribedAt',
        cell: ({ row }) => {
          const unsubscribedAt = row.original.unsubscribedAt;
          const _hasDate = !!unsubscribedAt;

          return (
            <div data-slot={'subscribers-table-unsubscribed-at'}>
              <Conditional isCondition={_hasDate}>
                <div className={'space-y-0.5'}>
                  <div className={'text-sm'}>{new Date(unsubscribedAt!).toLocaleDateString()}</div>
                  <div className={'text-xs text-muted-foreground'}>
                    {new Date(unsubscribedAt!).toLocaleTimeString()}
                  </div>
                </div>
              </Conditional>
              <Conditional isCondition={!_hasDate}>
                <span className={'text-sm text-muted-foreground'}>-</span>
              </Conditional>
            </div>
          );
        },
        enableSorting: false,
        header: 'Unsubscribed At',
        size: 150,
      },
      {
        cell: ({ row }) => {
          const subscriber = row.original;
          const _isUnsubscribed = subscriber.unsubscribedAt !== null;

          const handleAction = (action: SubscriberAction) => {
            switch (action) {
              case 'unsubscribe':
                onUnsubscribe?.(subscriber.id);
                break;
              case 'view-details':
                onViewDetails?.(subscriber.id);
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
                <Conditional isCondition={!_isUnsubscribed}>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      handleAction('unsubscribe');
                    }}
                    variant={'destructive'}
                  >
                    <UserMinusIcon aria-hidden className={'mr-2 size-4'} />
                    Unsubscribe
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
    [onUnsubscribe, onViewDetails],
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
    pageCount: Math.ceil(totalCount / urlState.pageSize),
    state: {
      pagination: {
        pageIndex: urlState.page - 1,
        pageSize: urlState.pageSize,
      },
      rowSelection,
      sorting,
    },
  });

  // Event handlers
  const handlePageChange = (newPage: number) => {
    void setUrlState({ page: newPage });
    setRowSelection({});
  };

  const handlePageSizeChange = (newPageSize: number) => {
    void setUrlState({ page: 1, pageSize: newPageSize });
    setRowSelection({});
  };

  const handleBulkUnsubscribe = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const subscriberIds = selectedRows.map((row) => row.original.id);
    onBulkUnsubscribe?.(subscriberIds);
    setRowSelection({});
  };

  // Derived variables for conditional rendering
  const _hasNoResults = table.getRowModel().rows?.length === 0;
  const _hasSelectedRows = Object.keys(rowSelection).length > 0;
  const _selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const _totalPages = Math.ceil(totalCount / urlState.pageSize);
  const _hasPreviousPage = urlState.page > 1;
  const _hasNextPage = urlState.page < _totalPages;
  const _startIndex = (urlState.page - 1) * urlState.pageSize + 1;
  const _endIndex = Math.min(urlState.page * urlState.pageSize, totalCount);

  return (
    <div className={cn('space-y-4', className)} data-slot={'newsletter-subscribers-table'} {...props}>
      {/* Bulk Actions Bar */}
      <Conditional isCondition={_hasSelectedRows}>
        <div
          className={'flex items-center justify-between rounded-lg border bg-muted/50 p-4'}
          data-slot={'subscribers-table-bulk-actions'}
        >
          <div className={'text-sm font-medium'}>
            {_selectedCount} {_selectedCount === 1 ? 'subscriber' : 'subscribers'} selected
          </div>
          <div className={'flex gap-2'}>
            <Button
              onClick={() => {
                handleBulkUnsubscribe();
              }}
              size={'sm'}
              variant={'destructive'}
            >
              <UserMinusIcon aria-hidden className={'mr-2 size-4'} />
              Unsubscribe Selected
            </Button>
          </div>
        </div>
      </Conditional>

      {/* Data Table */}
      <div className={'overflow-x-auto rounded-md border'} data-slot={'subscribers-table-container'}>
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
                  No subscribers found.
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
        data-slot={'subscribers-table-pagination'}
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
                variant={urlState.pageSize === size ? 'default' : 'outline'}
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
              handlePageChange(urlState.page - 1);
            }}
            size={'sm'}
            variant={'outline'}
          >
            Previous
          </Button>
          <div className={'flex items-center gap-1'}>
            <span className={'text-sm font-medium'}>
              Page {urlState.page} of {_totalPages}
            </span>
          </div>
          <Button
            disabled={!_hasNextPage}
            onClick={() => {
              handlePageChange(urlState.page + 1);
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
