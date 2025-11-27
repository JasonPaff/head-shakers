'use client';

import type { ColumnDef, SortingState } from '@tanstack/react-table';
import type { ComponentProps } from 'react';

import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowDownIcon, ArrowUpIcon, ExternalLinkIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import type {
  BobbleheadSearchResult,
  CollectionSearchResult,
} from '@/lib/queries/content-search/content-search.query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

type SearchResultEntityType = 'bobblehead' | 'collection';

type SearchResultListItem = {
  entityType: SearchResultEntityType;
  result: BobbleheadSearchResult | CollectionSearchResult;
};

type SearchResultsListProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    items: Array<SearchResultListItem>;
    onItemClick?: (item: SearchResultListItem) => void;
  };

export const SearchResultsList = ({
  className,
  items,
  onItemClick,
  testId,
  ...props
}: SearchResultsListProps) => {
  // useState hooks
  const [sorting, setSorting] = useState<SortingState>([]);

  // Generate testId
  const searchResultsListTestId = testId || generateTestId('feature', 'search-results', 'list');

  // useMemo hooks - Define columns
  const columns = useMemo<Array<ColumnDef<SearchResultListItem>>>(
    () => [
      {
        accessorFn: (row) => {
          const result = row.result;
          return (
            'primaryPhotoUrl' in result ? result.primaryPhotoUrl
            : 'coverImageUrl' in result ? result.coverImageUrl
            : null
          );
        },
        cell: ({ row }) => {
          const result = row.original.result;
          const imageUrl =
            'primaryPhotoUrl' in result ? result.primaryPhotoUrl
            : 'coverImageUrl' in result ? result.coverImageUrl
            : null;
          const displayName =
            'name' in result && result.name ? result.name
            : 'characterName' in result && result.characterName ? result.characterName
            : 'Unknown';

          const _hasValidImage = imageUrl && imageUrl !== '/placeholder.jpg';

          return (
            <div
              className={'relative size-12 shrink-0 overflow-hidden rounded-md bg-muted'}
              data-slot={'search-results-list-thumbnail'}
            >
              {_hasValidImage ?
                <CldImage
                  alt={displayName}
                  className={'size-full object-cover'}
                  crop={'fill'}
                  format={'auto'}
                  height={48}
                  quality={'auto:good'}
                  src={extractPublicIdFromCloudinaryUrl(imageUrl)}
                  width={48}
                />
              : <div className={'flex size-full items-center justify-center bg-muted'}>
                  <span className={'text-[10px] text-muted-foreground'}>No Image</span>
                </div>
              }
            </div>
          );
        },
        enableSorting: false,
        header: '',
        id: 'thumbnail',
        size: 64,
      },
      {
        accessorFn: (row) => {
          const result = row.result;
          return (
            'name' in result && result.name ? result.name
            : 'characterName' in result && result.characterName ? result.characterName
            : 'Unknown'
          );
        },
        cell: ({ row }) => {
          const result = row.original.result;
          const entityType = row.original.entityType;
          const displayName =
            'name' in result && result.name ? result.name
            : 'characterName' in result && result.characterName ? result.characterName
            : 'Unknown';
          const description = 'description' in result && result.description ? result.description : null;

          const entityUrl = getEntityUrl(entityType, result);

          return (
            <div className={'flex flex-col gap-0.5'} data-slot={'search-results-list-name-cell'}>
              <Link
                className={'font-medium text-foreground hover:text-primary hover:underline'}
                data-slot={'search-results-list-name-link'}
                href={entityUrl}
                onClick={(e) => {
                  if (onItemClick) {
                    e.preventDefault();
                    onItemClick(row.original);
                  }
                }}
              >
                {displayName}
              </Link>
              <Conditional isCondition={!!description}>
                <p className={'line-clamp-1 text-xs text-muted-foreground'}>{description}</p>
              </Conditional>
            </div>
          );
        },
        enableSorting: true,
        header: 'Name',
        id: 'name',
        size: 300,
      },
      {
        accessorFn: (row) => row.entityType,
        cell: ({ row }) => {
          const entityType = row.original.entityType;
          const _isCollection = entityType === 'collection';

          const badgeVariant = _isCollection ? 'default' : 'outline';
          const label = _isCollection ? 'Collection' : 'Bobblehead';

          return (
            <Badge data-slot={'search-results-list-type-badge'} variant={badgeVariant}>
              {label}
            </Badge>
          );
        },
        enableSorting: true,
        header: 'Type',
        id: 'entityType',
        size: 130,
      },
      {
        accessorFn: (row) => {
          const result = row.result;
          return (
            'ownerName' in result && result.ownerName ? result.ownerName
            : 'ownerUsername' in result && result.ownerUsername ? result.ownerUsername
            : 'Unknown'
          );
        },
        cell: ({ row }) => {
          const result = row.original.result;
          const owner =
            'ownerName' in result && result.ownerName ? result.ownerName
            : 'ownerUsername' in result && result.ownerUsername ? result.ownerUsername
            : 'Unknown';

          return (
            <span className={'text-sm text-muted-foreground'} data-slot={'search-results-list-owner'}>
              {owner}
            </span>
          );
        },
        enableSorting: true,
        header: 'Owner',
        id: 'owner',
        size: 150,
      },
      {
        cell: ({ row }) => {
          const result = row.original.result;
          const entityType = row.original.entityType;
          const entityUrl = getEntityUrl(entityType, result);

          return (
            <Button asChild data-slot={'search-results-list-view-button'} size={'sm'} variant={'ghost'}>
              <Link href={entityUrl}>
                <ExternalLinkIcon aria-hidden className={'size-4'} />
                <span className={'sr-only'}>View</span>
              </Link>
            </Button>
          );
        },
        enableSorting: false,
        header: '',
        id: 'actions',
        size: 60,
      },
    ],
    [onItemClick],
  );

  // TanStack Table instance - React Compiler warning is expected for this library
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data: items,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  // Derived variables for conditional rendering
  const _hasNoResults = table.getRowModel().rows?.length === 0;

  return (
    <div
      className={cn('space-y-4', className)}
      data-slot={'search-results-list'}
      data-testid={searchResultsListTestId}
      {...props}
    >
      {/* Data Table */}
      <div className={'overflow-x-auto rounded-md border'} data-slot={'search-results-list-table-container'}>
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
            {/* Empty State */}
            <Conditional isCondition={_hasNoResults}>
              <TableRow>
                <TableCell
                  className={'h-32 text-center'}
                  colSpan={columns.length}
                  data-slot={'search-results-list-empty-state'}
                >
                  <p className={'mb-2 text-muted-foreground'}>No results found.</p>
                  <p className={'text-sm text-muted-foreground/70'}>
                    Try adjusting your search terms or{' '}
                    <Link
                      className={'text-primary underline-offset-4 hover:underline'}
                      href={$path({ route: '/browse' })}
                    >
                      browse all content
                    </Link>
                    .
                  </p>
                </TableCell>
              </TableRow>
            </Conditional>

            {/* Results Rows */}
            <Conditional isCondition={!_hasNoResults}>
              {table.getRowModel().rows.map((row) => (
                <TableRow className={'hover:bg-muted/50'} key={row.id}>
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
    </div>
  );
};

/**
 * Helper function to generate entity URLs based on type
 */
const getEntityUrl = (
  entityType: SearchResultEntityType,
  result: BobbleheadSearchResult | CollectionSearchResult,
): string => {
  if (entityType === 'collection') {
    return $path({ route: '/collections/[collectionSlug]', routeParams: { collectionSlug: result.slug } });
  }

  return $path({ route: '/bobbleheads/[bobbleheadSlug]', routeParams: { bobbleheadSlug: result.slug } });
};
