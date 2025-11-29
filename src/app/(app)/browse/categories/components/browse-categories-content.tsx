'use client';

import * as Sentry from '@sentry/nextjs';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { useEffect, useState, useTransition } from 'react';

import type { BrowseCategoriesResult, CategoryRecord } from '@/lib/queries/collections/collections.query';

import { BrowseCollectionsFilters } from '@/app/(app)/browse/components/browse-collections-filters';
import { BrowseCollectionsPagination } from '@/app/(app)/browse/components/browse-collections-pagination';
import { BrowseCollectionsTable } from '@/app/(app)/browse/components/browse-collections-table';
import { Spinner } from '@/components/ui/spinner';
import { browseCategoriesAction, getCategoriesAction } from '@/lib/actions/collections/collections.actions';
import { CONFIG } from '@/lib/constants';
import {
  BROWSE_CATEGORIES_SORT_BY,
  BROWSE_CATEGORIES_SORT_ORDER,
} from '@/lib/validations/browse-categories.validation';

interface BrowseCategoriesContentProps {
  defaultCategory?: string;
}

export function BrowseCategoriesContent({ defaultCategory }: BrowseCategoriesContentProps) {
  // State
  const [browseResults, setBrowseResults] = useState<BrowseCategoriesResult | null>(null);
  const [categories, setCategories] = useState<Array<CategoryRecord>>([]);
  const [error, setError] = useState<null | string>(null);

  // Transitions
  const [isPending, startTransition] = useTransition();

  // URL state management with Nuqs
  const [queryParams, setQueryParams] = useQueryStates(
    {
      category: parseAsString.withDefault(defaultCategory || ''),
      dateFrom: parseAsString,
      dateTo: parseAsString,
      owner: parseAsString,
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(CONFIG.PAGINATION.COLLECTIONS.DEFAULT),
      q: parseAsString.withDefault(''),
      sortBy: parseAsStringEnum([...BROWSE_CATEGORIES_SORT_BY]).withDefault('createdAt'),
      sortOrder: parseAsStringEnum([...BROWSE_CATEGORIES_SORT_ORDER]).withDefault('desc'),
    },
    {
      clearOnDefault: true,
      history: 'push',
    },
  );

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getCategoriesAction();
        if (result?.data?.wasSuccess) {
          setCategories(result.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    void fetchCategories();
  }, []);

  // Fetch data when params change
  useEffect(() => {
    const executeBrowse = () => {
      startTransition(async () => {
        const actionStartTime = performance.now();
        const activeFilters: Array<string> = [];
        if (queryParams.q) activeFilters.push('search');
        if (queryParams.category) activeFilters.push('category');
        if (queryParams.owner) activeFilters.push('owner');
        if (queryParams.dateFrom || queryParams.dateTo) activeFilters.push('dateRange');

        try {
          Sentry.addBreadcrumb({
            category: 'browse_categories_action',
            data: {
              activeFilters,
              page: queryParams.page,
              pageSize: queryParams.pageSize,
              sortBy: queryParams.sortBy,
              sortOrder: queryParams.sortOrder,
            },
            level: 'debug',
            message: `Executing browse categories action with filters: ${activeFilters.join(', ') || 'none'}`,
          });

          const result = await browseCategoriesAction({
            filters: {
              category: queryParams.category || undefined,
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

          const actionDuration = performance.now() - actionStartTime;

          if (result?.data?.wasSuccess) {
            setBrowseResults(result.data.data);
            setError(null);

            Sentry.addBreadcrumb({
              category: 'browse_categories_success',
              data: {
                activeFilters,
                durationMs: actionDuration,
                page: queryParams.page,
                resultCount: result.data.data.collections.length,
                totalCount: result.data.data.pagination.totalCount,
              },
              level: 'info',
              message: `Browse categories successful: ${result.data.data.collections.length} results loaded in ${actionDuration.toFixed(2)}ms`,
            });

            // Track slow action responses
            if (actionDuration > 1000) {
              Sentry.captureMessage('Browse categories action slow response', {
                level: 'info',
                tags: {
                  activeFilters: activeFilters.join(','),
                  resultCount: result.data.data.collections.length.toString(),
                },
              });
            }
          } else if (result?.serverError) {
            setError(result.serverError);
            setBrowseResults(null);

            Sentry.captureMessage('Browse categories action server error', {
              contexts: {
                browse_categories: {
                  activeFilters,
                  error: result.serverError,
                  page: queryParams.page,
                },
              },
              level: 'warning',
              tags: {
                activeFilters: activeFilters.join(','),
                errorType: 'server_error',
              },
            });
          } else {
            const errorMessage = 'Failed to load collections by category';
            setError(errorMessage);
            setBrowseResults(null);

            Sentry.captureMessage(errorMessage, {
              contexts: {
                browse_categories: {
                  activeFilters,
                  page: queryParams.page,
                },
              },
              level: 'warning',
              tags: {
                activeFilters: activeFilters.join(','),
                errorType: 'unknown_error',
              },
            });
          }
        } catch (err) {
          const errorMessage = 'An unexpected error occurred while browsing categories';
          setError(errorMessage);
          setBrowseResults(null);

          const actionDuration = performance.now() - actionStartTime;

          Sentry.captureException(err, {
            contexts: {
              browse_categories: {
                activeFilters,
                durationMs: actionDuration,
                page: queryParams.page,
              },
            },
            tags: {
              activeFilters: activeFilters.join(','),
              component: 'BrowseCategoriesContent',
              errorType: 'client_error',
            },
          });

          Sentry.captureMessage('Browse categories action failed', {
            level: 'error',
            tags: {
              activeFilters: activeFilters.join(','),
              errorType: err instanceof Error ? err.constructor.name : 'unknown',
            },
          });
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

  const handleCategoryChange = (category: string) => {
    void setQueryParams({
      category,
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
        categories={categories}
        categoryId={queryParams.category || undefined}
        dateFrom={queryParams.dateFrom || undefined}
        dateTo={queryParams.dateTo || undefined}
        onCategoryChange={handleCategoryChange}
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
