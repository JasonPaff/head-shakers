'use client';

import type { ColumnDef, RowSelectionState, SortingState } from '@tanstack/react-table';
import type { ComponentPropsWithRef } from 'react';

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  CheckIcon,
  ExternalLinkIcon,
  EyeIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';

import type { SelectContentReportWithSlugs } from '@/lib/validations/moderation.validation';

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/utils/tailwind-utils';

interface ReportsTableProps extends ComponentPropsWithRef<'div'> {
  data: Array<SelectContentReportWithSlugs>;
  onBulkAction?: (reportIds: Array<string>, action: 'dismissed' | 'resolved' | 'reviewed') => void;
  onViewDetails?: (reportId: string) => void;
}

// Helper function to check if content link is available
const isContentLinkAvailable = (report: SelectContentReportWithSlugs): boolean => {
  // Comments have no direct route
  if (report.targetType === 'comment') {
    return false;
  }

  // Content must exist and have the required slug data
  if (!report.contentExists) {
    return false;
  }

  // Bobbleheads and collections need targetSlug
  if (report.targetType === 'bobblehead' || report.targetType === 'collection') {
    return !!report.targetSlug;
  }

  // Users use targetId directly, always available if content exists
  if (report.targetType === 'user') {
    return true;
  }

  return false;
};

// Helper function to generate content link based on target type
const getContentLink = (report: SelectContentReportWithSlugs): null | string => {
  if (!isContentLinkAvailable(report)) {
    return null;
  }

  switch (report.targetType) {
    case 'bobblehead':
      return $path({
        route: '/bobbleheads/[bobbleheadSlug]',
        routeParams: { bobbleheadSlug: report.targetSlug! },
      });
    case 'collection':
      return $path({
        route: '/collections/[collectionSlug]',
        routeParams: { collectionSlug: report.targetSlug! },
      });
    case 'user':
      return $path({
        route: '/users/[userId]',
        routeParams: { userId: report.targetId },
      });
    default:
      return null;
  }
};

// Helper function to get tooltip message for disabled links
const getDisabledTooltipMessage = (report: SelectContentReportWithSlugs): string => {
  if (report.targetType === 'comment') {
    return 'Comments cannot be viewed directly';
  }
  if (!report.contentExists) {
    return 'Content no longer exists';
  }
  return 'Link unavailable';
};

export const ReportsTable = ({
  className,
  data,
  onBulkAction,
  onViewDetails,
  ...props
}: ReportsTableProps) => {
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

  // useEffect hooks
  // Validate page number and clamp to valid range
  useEffect(() => {
    const maxPages = Math.ceil(data.length / pagination.pageSize);
    if (pagination.page > maxPages && maxPages > 0) {
      void setPagination({ page: maxPages });
    } else if (pagination.page < 1) {
      void setPagination({ page: 1 });
    }
  }, [pagination.page, pagination.pageSize, data.length, setPagination]);

  // useMemo hooks
  const columns = useMemo<Array<ColumnDef<SelectContentReportWithSlugs>>>(
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
        cell: ({ row }) => {
          const report = row.original;
          const _isPending = report.status === 'pending';
          const _isTerminal = report.status === 'resolved' || report.status === 'dismissed';

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className={'h-8 w-8 p-0'} variant={'ghost'}>
                  <span className={'sr-only'}>Open menu</span>
                  <MoreVerticalIcon className={'size-4'} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={'end'}>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    onViewDetails?.(report.id);
                  }}
                >
                  <EyeIcon className={'mr-2 size-4'} />
                  View Details
                </DropdownMenuItem>
                <Conditional isCondition={!_isTerminal}>
                  <DropdownMenuSeparator />
                  <Conditional isCondition={_isPending}>
                    <DropdownMenuItem
                      onClick={() => {
                        onBulkAction?.([report.id], 'reviewed');
                      }}
                    >
                      <CheckIcon className={'mr-2 size-4'} />
                      Mark as Reviewed
                    </DropdownMenuItem>
                  </Conditional>
                  <DropdownMenuItem
                    onClick={() => {
                      onBulkAction?.([report.id], 'resolved');
                    }}
                  >
                    <CheckCircleIcon className={'mr-2 size-4'} />
                    Mark as Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      onBulkAction?.([report.id], 'dismissed');
                    }}
                  >
                    <XCircleIcon className={'mr-2 size-4'} />
                    Dismiss Report
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
      {
        accessorKey: 'reason',
        cell: ({ row }) => {
          const reason = row.original.reason;
          return (
            <div className={'space-y-1'}>
              <div className={'font-medium capitalize'}>
                {reason
                  .split('_')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </div>
              <Conditional isCondition={!!row.original.description}>
                <div className={'line-clamp-1 text-xs text-muted-foreground'}>{row.original.description}</div>
              </Conditional>
            </div>
          );
        },
        enableSorting: true,
        header: 'Report Summary',
        size: 250,
      },
      {
        accessorKey: 'status',
        cell: ({ row }) => {
          const status = row.original.status;
          const _isPending = status === 'pending';
          const _isReviewed = status === 'reviewed';
          const _isResolved = status === 'resolved';
          const _isDismissed = status === 'dismissed';

          return (
            <Badge
              className={cn(
                _isPending && 'bg-yellow-100 text-yellow-800',
                _isReviewed && 'bg-blue-100 text-blue-800',
                _isResolved && 'bg-green-100 text-green-800',
                _isDismissed && 'bg-gray-100 text-gray-800',
              )}
              variant={'secondary'}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          );
        },
        enableSorting: true,
        header: 'Status',
        size: 120,
      },
      {
        accessorKey: 'targetType',
        cell: ({ row }) => {
          const targetType = row.original.targetType;
          const _isBobblehead = targetType === 'bobblehead';
          const _isCollection = targetType === 'collection';
          const _isComment = targetType === 'comment';

          return (
            <Badge
              className={cn(
                _isBobblehead && 'bg-green-100 text-green-800',
                _isCollection && 'bg-blue-100 text-blue-800',
                _isComment && 'bg-orange-100 text-orange-800',
              )}
              variant={'secondary'}
            >
              {targetType.charAt(0).toUpperCase() + targetType.slice(1)}
            </Badge>
          );
        },
        enableSorting: true,
        header: 'Content Type',
        size: 150,
      },
      {
        cell: ({ row }) => {
          const report = row.original;
          const _isLinkAvailable = isContentLinkAvailable(report);
          const _isComment = report.targetType === 'comment';
          const _hasCommentContent = _isComment && !!report.commentContent;
          const contentLink = getContentLink(report);

          {
            /* Link available (for non-comment content types) */
          }
          if (_isLinkAvailable && contentLink) {
            return (
              <Button aria-label={'View content'} asChild className={'h-8 w-8 p-0'} variant={'ghost'}>
                <Link href={contentLink}>
                  <ExternalLinkIcon aria-hidden className={'size-4'} />
                </Link>
              </Button>
            );
          }

          {
            /* Comment type with content available */
          }
          if (_hasCommentContent) {
            return (
              <Popover>
                <PopoverTrigger asChild>
                  <Button aria-label={'View comment content'} className={'h-8 w-8 p-0'} variant={'ghost'}>
                    <MessageSquareIcon aria-hidden className={'size-4'} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className={'max-h-80 w-80 overflow-y-auto'}>
                  <div className={'space-y-2'}>
                    <h4 className={'text-sm font-semibold'}>Reported Comment</h4>
                    <p className={'text-sm break-words text-muted-foreground'}>{report.commentContent}</p>
                  </div>
                </PopoverContent>
              </Popover>
            );
          }

          {
            /* Content unavailable (deleted content or comment without content) */
          }
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label={'View content unavailable'}
                  className={'h-8 w-8 cursor-not-allowed p-0 opacity-50'}
                  disabled
                  variant={'ghost'}
                >
                  {_isComment ?
                    <MessageSquareIcon aria-hidden className={'size-4'} />
                  : <ExternalLinkIcon aria-hidden className={'size-4'} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {_isComment ? 'Comment content unavailable' : getDisabledTooltipMessage(report)}
              </TooltipContent>
            </Tooltip>
          );
        },
        enableSorting: false,
        header: 'View',
        id: 'viewContent',
        size: 70,
      },
      {
        accessorKey: 'createdAt',
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <div className={'space-y-0.5'}>
              <div className={'text-sm'}>{date.toLocaleDateString()}</div>
              <div className={'text-xs text-muted-foreground'}>{date.toLocaleTimeString()}</div>
            </div>
          );
        },
        enableSorting: true,
        header: 'Submitted',
        size: 150,
      },
      {
        accessorKey: 'targetId',
        cell: ({ row }) => {
          const targetId = row.original.targetId;
          return (
            <div className={'max-w-[200px]'}>
              <div className={'truncate font-mono text-xs text-muted-foreground'}>{targetId}</div>
            </div>
          );
        },
        enableSorting: false,
        header: 'Content ID',
        size: 200,
      },
      {
        accessorKey: 'reporterId',
        cell: ({ row }) => {
          const reporterId = row.original.reporterId;
          return (
            <div className={'max-w-[200px]'}>
              <div className={'truncate font-mono text-xs'}>{reporterId}</div>
            </div>
          );
        },
        enableSorting: false,
        header: 'Reporter',
        size: 200,
      },
    ],
    [onBulkAction, onViewDetails],
  );

  // TanStack Table instance - React Compiler warning is expected for this library
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ?
          updater({ pageIndex: pagination.page - 1, pageSize: pagination.pageSize })
        : updater;

      void setPagination({
        page: newPagination.pageIndex + 1,
        pageSize: newPagination.pageSize,
      });
      setRowSelection({});
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
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
  const handleBulkAction = (action: 'dismissed' | 'resolved' | 'reviewed') => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const reportIds = selectedRows.map((row) => row.original.id);
    onBulkAction?.(reportIds, action);
    setRowSelection({});
  };

  const handleClearSelection = () => {
    setRowSelection({});
  };

  // Derived variables for conditional rendering
  const _hasNoResults = table.getRowModel().rows?.length === 0;
  const _hasSelectedRows = Object.keys(rowSelection).length > 0;
  const _selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const _totalPages = table.getPageCount();
  const _currentPage = table.getState().pagination.pageIndex + 1;
  const _currentPageSize = table.getState().pagination.pageSize;
  const _hasPreviousPage = table.getCanPreviousPage();
  const _hasNextPage = table.getCanNextPage();
  const _startIndex = data.length === 0 ? 0 : table.getState().pagination.pageIndex * _currentPageSize + 1;
  const _endIndex = Math.min(_currentPage * _currentPageSize, data.length);

  return (
    <div className={cn('space-y-4', className)} {...props}>
      {/* Bulk Actions Bar */}
      <Conditional isCondition={_hasSelectedRows}>
        <div className={'flex items-center justify-between rounded-lg border bg-muted/50 p-4'}>
          <div className={'flex items-center gap-3'}>
            <div className={'text-sm font-medium'}>
              {_selectedCount} {_selectedCount === 1 ? 'report' : 'reports'} selected
            </div>
            <Button
              aria-label={'Clear selection'}
              onClick={handleClearSelection}
              size={'sm'}
              variant={'ghost'}
            >
              <XIcon aria-hidden className={'mr-1 size-4'} />
              Clear
            </Button>
          </div>
          <div className={'flex gap-2'}>
            <Button
              onClick={() => {
                handleBulkAction('reviewed');
              }}
              size={'sm'}
              variant={'outline'}
            >
              Mark as Reviewed
            </Button>
            <Button
              onClick={() => {
                handleBulkAction('resolved');
              }}
              size={'sm'}
              variant={'outline'}
            >
              Mark as Resolved
            </Button>
            <Button
              onClick={() => {
                handleBulkAction('dismissed');
              }}
              size={'sm'}
              variant={'outline'}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </Conditional>

      {/* Data Table */}
      <div className={'overflow-x-auto rounded-md border'}>
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
                  No reports found.
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
      <div className={'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'}>
        {/* Results Info */}
        <div className={'text-sm text-muted-foreground'}>
          Showing {_startIndex} to {_endIndex} of {data.length} results
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
                  table.setPageSize(size);
                }}
                size={'sm'}
                variant={_currentPageSize === size ? 'default' : 'outline'}
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
              table.previousPage();
            }}
            size={'sm'}
            variant={'outline'}
          >
            Previous
          </Button>
          <div className={'flex items-center gap-1'}>
            <span className={'text-sm font-medium'}>
              Page {_currentPage} of {_totalPages}
            </span>
          </div>
          <Button
            disabled={!_hasNextPage}
            onClick={() => {
              table.nextPage();
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
