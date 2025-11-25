'use client';

import type { ColumnDef, ExpandedState, SortingState } from '@tanstack/react-table';
import type { ComponentPropsWithRef } from 'react';

import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  MoreVerticalIcon,
} from 'lucide-react';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { Fragment, useMemo, useState } from 'react';

import type { NewsletterSendRecord } from '@/lib/queries/newsletter/newsletter.queries';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/utils/tailwind-utils';

type NewsletterSendHistoryTableProps = ComponentPropsWithRef<'div'> & {
  data: Array<NewsletterSendRecord>;
  onViewDetails?: (sendId: string) => void;
  totalCount?: number;
};

type SendAction = 'view-details';

export const NewsletterSendHistoryTable = ({
  className,
  data,
  onViewDetails,
  totalCount = 0,
  ...props
}: NewsletterSendHistoryTableProps) => {
  // useState hooks
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [sorting, setSorting] = useState<SortingState>([{ desc: true, id: 'sentAt' }]);

  // Other hooks
  const [urlState, setUrlState] = useQueryStates(
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
  const columns = useMemo<Array<ColumnDef<NewsletterSendRecord>>>(
    () => [
      {
        cell: ({ row }) => {
          const _hasErrors = row.original.errorDetails !== null && row.original.failureCount > 0;

          return (
            <div className={'flex items-center'} data-slot={'send-history-table-expand'}>
              <Conditional isCondition={_hasErrors}>
                <Button
                  className={'h-8 w-8 p-0'}
                  onClick={() => {
                    row.toggleExpanded();
                  }}
                  size={'sm'}
                  variant={'ghost'}
                >
                  <span className={'sr-only'}>{row.getIsExpanded() ? 'Collapse' : 'Expand'}</span>
                  <Conditional isCondition={row.getIsExpanded()}>
                    <ChevronDownIcon aria-hidden className={'size-4'} />
                  </Conditional>
                  <Conditional isCondition={!row.getIsExpanded()}>
                    <ChevronRightIcon aria-hidden className={'size-4'} />
                  </Conditional>
                </Button>
              </Conditional>
            </div>
          );
        },
        enableSorting: false,
        header: '',
        id: 'expand',
        size: 50,
      },
      {
        accessorKey: 'sentAt',
        cell: ({ row }) => {
          const sentAt = row.original.sentAt;

          return (
            <div className={'space-y-0.5'} data-slot={'send-history-table-sent-at'}>
              <div className={'text-sm font-medium'}>{new Date(sentAt).toLocaleDateString()}</div>
              <div className={'text-xs text-muted-foreground'}>{new Date(sentAt).toLocaleTimeString()}</div>
            </div>
          );
        },
        enableSorting: true,
        header: 'Sent At',
        size: 150,
      },
      {
        accessorKey: 'subject',
        cell: ({ row }) => {
          const subject = row.original.subject;
          return (
            <div className={'font-medium'} data-slot={'send-history-table-subject'}>
              {subject}
            </div>
          );
        },
        enableSorting: false,
        header: 'Subject',
        size: 300,
      },
      {
        accessorKey: 'recipientCount',
        cell: ({ row }) => {
          const recipientCount = row.original.recipientCount;
          return (
            <div className={'text-center'} data-slot={'send-history-table-recipient-count'}>
              {recipientCount}
            </div>
          );
        },
        enableSorting: false,
        header: 'Recipients',
        size: 100,
      },
      {
        accessorKey: 'successCount',
        cell: ({ row }) => {
          const successCount = row.original.successCount;
          return (
            <div
              className={'text-center text-green-600 dark:text-green-400'}
              data-slot={'send-history-table-success-count'}
            >
              {successCount}
            </div>
          );
        },
        enableSorting: false,
        header: 'Success',
        size: 100,
      },
      {
        accessorKey: 'failureCount',
        cell: ({ row }) => {
          const failureCount = row.original.failureCount;
          const _hasFailures = failureCount > 0;
          return (
            <div className={'text-center'} data-slot={'send-history-table-failure-count'}>
              <Conditional isCondition={_hasFailures}>
                <span className={'text-red-600 dark:text-red-400'}>{failureCount}</span>
              </Conditional>
              <Conditional isCondition={!_hasFailures}>
                <span className={'text-muted-foreground'}>{failureCount}</span>
              </Conditional>
            </div>
          );
        },
        enableSorting: false,
        header: 'Failed',
        size: 100,
      },
      {
        cell: ({ row }) => {
          const send = row.original;
          const status = send.status;

          const _isCompleted = status === 'completed';
          const _isFailed = status === 'failed';
          const _isSending = status === 'sending';
          const _isPending = status === 'pending';

          return (
            <div data-slot={'send-history-table-status'}>
              <Conditional isCondition={_isCompleted}>
                <Badge
                  className={'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}
                  variant={'secondary'}
                >
                  Completed
                </Badge>
              </Conditional>
              <Conditional isCondition={_isFailed}>
                <Badge
                  className={'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}
                  variant={'secondary'}
                >
                  Failed
                </Badge>
              </Conditional>
              <Conditional isCondition={_isSending}>
                <Badge
                  className={'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}
                  variant={'secondary'}
                >
                  Sending
                </Badge>
              </Conditional>
              <Conditional isCondition={_isPending}>
                <Badge
                  className={'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}
                  variant={'secondary'}
                >
                  Pending
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
        accessorKey: 'sentBy',
        cell: ({ row }) => {
          const sentBy = row.original.sentBy;
          const _truncatedId = sentBy.substring(0, 8) + '...';

          return (
            <div
              className={'font-mono text-xs text-muted-foreground'}
              data-slot={'send-history-table-sent-by'}
            >
              {_truncatedId}
            </div>
          );
        },
        enableSorting: false,
        header: 'Sent By',
        size: 120,
      },
      {
        cell: ({ row }) => {
          const send = row.original;

          const handleAction = (action: SendAction) => {
            switch (action) {
              case 'view-details':
                onViewDetails?.(send.id);
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
    [onViewDetails],
  );

  // TanStack Table instance - React Compiler warning is expected for this library
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    pageCount: Math.ceil(totalCount / urlState.pageSize),
    state: {
      expanded,
      pagination: {
        pageIndex: urlState.page - 1,
        pageSize: urlState.pageSize,
      },
      sorting,
    },
  });

  // Event handlers
  const handlePageChange = (newPage: number) => {
    void setUrlState({ page: newPage });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    void setUrlState({ page: 1, pageSize: newPageSize });
  };

  // Derived variables for conditional rendering
  const _hasNoResults = table.getRowModel().rows?.length === 0;
  const _totalPages = Math.ceil(totalCount / urlState.pageSize);
  const _hasPreviousPage = urlState.page > 1;
  const _hasNextPage = urlState.page < _totalPages;
  const _startIndex = (urlState.page - 1) * urlState.pageSize + 1;
  const _endIndex = Math.min(urlState.page * urlState.pageSize, totalCount);

  return (
    <div className={cn('space-y-4', className)} data-slot={'newsletter-send-history-table'} {...props}>
      {/* Data Table */}
      <div className={'overflow-x-auto rounded-md border'} data-slot={'send-history-table-container'}>
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
                  No send history found.
                </TableCell>
              </TableRow>
            </Conditional>
            <Conditional isCondition={!_hasNoResults}>
              {table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow className={'hover:bg-muted/50'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {/* Expandable Error Details Row */}
                  <Conditional isCondition={row.getIsExpanded()}>
                    <TableRow key={`${row.id}-expanded`}>
                      <TableCell colSpan={columns.length}>
                        <div
                          className={'rounded-md bg-red-50 p-4 dark:bg-red-950/20'}
                          data-slot={'send-history-error-details'}
                        >
                          <div className={'mb-2 text-sm font-semibold text-red-800 dark:text-red-200'}>
                            Error Details
                          </div>
                          <div className={'text-sm whitespace-pre-wrap text-red-700 dark:text-red-300'}>
                            {row.original.errorDetails || 'No error details available'}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </Conditional>
                </Fragment>
              ))}
            </Conditional>
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div
        className={'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'}
        data-slot={'send-history-table-pagination'}
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
