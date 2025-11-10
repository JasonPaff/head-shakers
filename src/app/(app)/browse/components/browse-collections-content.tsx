'use client';

import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { useEffect, useState, useTransition } from 'react';

import type { BrowseCollectionsResult } from '@/lib/queries/collections/collections.query';

import { BrowseCollectionsFilters } from '@/app/(app)/browse/components/browse-collections-filters';
import { BrowseCollectionsPagination } from '@/app/(app)/browse/components/browse-collections-pagination';
import { BrowseCollectionsTable } from '@/app/(app)/browse/components/browse-collections-table';
import { Spinner } from '@/components/ui/spinner';
import { browseCollectionsAction } from '@/lib/actions/collections/collections.actions';
import { CONFIG } from '@/lib/constants';
import { BROWSE_COLLECTIONS_SORT_BY, BROWSE_COLLECTIONS_SORT_ORDER } from '@/lib/validations/browse-collections.validation';

export function BrowseCollectionsContent() {
  // State
  const [browseResults, setBrowseResults] = useState<BrowseCollectionsResult | null>(null);
  const [error, setError] = useState<null | string>(null);

  // Transitions
  const [isPending, startTransition] = useTransition();

  // URL state management with Nuqs
  const [queryParams, setQueryParams] = useQueryStates(
    {
      category: parseAsString,
      dateFrom: parseAsString,
      dateTo: parseAsString,
      owner: parseAsString,
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(CONFIG.PAGINATION.COLLECTIONS.DEFAULT),
      q: parseAsString.withDefault(''),
      sortBy: parseAsStringEnum([...BROWSE_COLLECTIONS_SORT_BY]).withDefault('createdAt'),
      sortOrder: parseAsStringEnum([...BROWSE_COLLECTIONS_SORT_ORDER]).withDefault('desc'),
    },
    {
      clearOnDefault: true,
      history: 'push',
    },
  );

  // Fetch data when params change
  useEffect(() => {
    const executeBrowse = () => {
      startTransition(async () => {
        try {
          const result = await browseCollectionsAction({
            filters: {
              categoryId: queryParams.category || undefined,
              dateFrom: queryParams.dateFrom ? new Date(queryParams.dateFrom) : undefined,
              dateTo: queryParams.dateTo ? new Date(queryParams.dateTo) : undefined,
              ownerId: queryParams.owner || undefined,
              query: queryParams.q || undefined,
            },
            pagination: {
              page: queryParams.page,
              pageSize: queryParams.pageSize,
            },
            sort: {
              sortBy: queryParams.sortBy,
              sortOrder: queryParams.sortOrder,
            },
          });

          if (result?.data) {
            setBrowseResults(result.data);
            setError(null);
          } else if (result?.serverError) {
            setError(result.serverError);
            setBrowseResults(null);
          } else {
            setError('Failed to load collections');
            setBrowseResults(null);
          }
        } catch {
          setError('An unexpected error occurred while browsing collections');
          setBrowseResults(null);
        }
      });
    };

    executeBrowse();
  }, [
    queryParams.q,
    queryParams.category,
    queryParams.owner,
    queryParams.dateFrom,
    queryParams.dateTo,
    queryParams.sortBy,
    queryParams.sortOrder,
    queryParams.page,
    queryParams.pageSize,
  ]);

  // Event handlers
  const handleSearchChange = (search: string) => {
    void setQueryParams({ page: 1, q: search });
  };

  const handleFiltersChange = (filters: {
    categoryId?: string;
    dateFrom?: string;
    dateTo?: string;
    ownerId?: string;
  }) => {
    void setQueryParams({
      category: filters.categoryId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      owner: filters.ownerId,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    void setQueryParams({ page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    void setQueryParams({ page: 1, pageSize });
  };

  const handleClearFilters = () => {
    void setQueryParams({
      category: null,
      dateFrom: null,
      dateTo: null,
      owner: null,
      page: 1,
      q: '',
    });
  };

  return (
    <div className={'space-y-6'}>
      {/* Filters */}
      <BrowseCollectionsFilters
        categoryId={queryParams.category || undefined}
        dateFrom={queryParams.dateFrom || undefined}
        dateTo={queryParams.dateTo || undefined}
        onClearFilters={handleClearFilters}
        onFiltersChange={handleFiltersChange}
        onSearchChange={handleSearchChange}
        ownerId={queryParams.owner || undefined}
        searchQuery={queryParams.q}
      />

      {/* Loading State */}
      {isPending && (
        <div className={'flex min-h-[400px] items-center justify-center'}>
          <Spinner className={'size-16'} />
        </div>
      )}

      {/* Error State */}
      {error && !isPending && (
        <div className={'rounded-lg border border-destructive bg-destructive/10 p-4'}>
          <p className={'text-sm text-destructive'}>{error}</p>
        </div>
      )}

      {/* Results */}
      {browseResults && !isPending && (
        <div className={'space-y-6'}>
          <BrowseCollectionsTable collections={browseResults.collections} />

          <BrowseCollectionsPagination
            currentPage={browseResults.pagination.currentPage}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSize={browseResults.pagination.pageSize}
            totalCount={browseResults.pagination.totalCount}
            totalPages={browseResults.pagination.totalPages}
          />
        </div>
      )}
    </div>
  );
}
