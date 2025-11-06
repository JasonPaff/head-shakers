'use client';

import { AlertCircle, Search } from 'lucide-react';
import { parseAsArrayOf, parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { Fragment, useEffect, useState, useTransition } from 'react';

import type { PublicSearchPageResponse } from '@/lib/facades/content-search/content-search.facade';

import { SearchFilters } from '@/app/(app)/browse/search/components/search-filters';
import { SearchPagination } from '@/app/(app)/browse/search/components/search-pagination';
import { SearchResultsGrid } from '@/app/(app)/browse/search/components/search-results-grid';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { searchPublicContentAction } from '@/lib/actions/content-search/content-search.actions';
import { CONFIG, ENUMS } from '@/lib/constants';

export const SearchPageContent = () => {
  // useState hooks
  const [searchResults, setSearchResults] = useState<null | PublicSearchPageResponse>(null);
  const [error, setError] = useState<null | string>(null);

  // Other hooks
  const [isPending, startTransition] = useTransition();

  const [queryParams, setQueryParams] = useQueryStates(
    {
      entityTypes: parseAsArrayOf(
        parseAsStringEnum(['collection', 'subcollection', 'bobblehead'] as const),
      ).withDefault(['collection', 'subcollection', 'bobblehead']),
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(CONFIG.PAGINATION.SEARCH_RESULTS.DEFAULT),
      q: parseAsString.withDefault(''),
      sortBy: parseAsStringEnum([...ENUMS.SEARCH.SORT_BY]).withDefault('relevance'),
      sortOrder: parseAsStringEnum([...ENUMS.SEARCH.SORT_ORDER]).withDefault('desc'),
      tagIds: parseAsArrayOf(parseAsString).withDefault([]),
    },
    {
      clearOnDefault: true,
      history: 'push',
    },
  );

  // useEffect hooks
  useEffect(() => {
    const executeSearch = () => {
      // Don't search if query is empty or too short
      if (!queryParams.q || queryParams.q.length < CONFIG.SEARCH.MIN_QUERY_LENGTH) {
        setSearchResults(null);
        setError(null);
        return;
      }

      startTransition(async () => {
        try {
          const result = await searchPublicContentAction({
            filters: {
              entityTypes: queryParams.entityTypes,
              sortBy: queryParams.sortBy,
              sortOrder: queryParams.sortOrder,
              tagIds: queryParams.tagIds,
            },
            pagination: {
              page: queryParams.page,
              pageSize: queryParams.pageSize,
            },
            query: queryParams.q,
          });

          if (result?.data) {
            setSearchResults(result.data);
            setError(null);
          } else if (result?.serverError) {
            setError(result.serverError);
            setSearchResults(null);
          }
        } catch {
          setError('An unexpected error occurred while searching');
          setSearchResults(null);
        }
      });
    };

    executeSearch();
  }, [
    queryParams.q,
    queryParams.entityTypes,
    queryParams.tagIds,
    queryParams.sortBy,
    queryParams.sortOrder,
    queryParams.page,
    queryParams.pageSize,
  ]);

  // Event handlers
  const handleQueryChange = (query: string) => {
    void setQueryParams({ page: 1, q: query });
  };

  const handleFiltersChange = (filters: {
    entityTypes?: Array<'bobblehead' | 'collection' | 'subcollection'>;
    sortBy?: (typeof ENUMS.SEARCH.SORT_BY)[number];
    sortOrder?: (typeof ENUMS.SEARCH.SORT_ORDER)[number];
    tagIds?: Array<string>;
  }) => {
    void setQueryParams({ ...filters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    void setQueryParams({ page });
  };

  // Derived variables for conditional rendering
  const _hasQuery = queryParams.q.length >= CONFIG.SEARCH.MIN_QUERY_LENGTH;
  const _isLoading = isPending;
  const _hasError = !!error;
  const _hasResults = searchResults && searchResults.counts.total > 0;
  const _hasNoResults = searchResults && searchResults.counts.total === 0;
  const _isShowEmptyState = !_hasQuery && !_isLoading && !searchResults;
  const _isShowResultsWithPagination = _hasResults && !_isLoading && searchResults;

  return (
    <div className={'space-y-6'}>
      {/* Search Filters */}
      <SearchFilters
        entityTypes={queryParams.entityTypes}
        onFiltersChange={handleFiltersChange}
        onQueryChange={handleQueryChange}
        query={queryParams.q}
        sortBy={queryParams.sortBy}
        sortOrder={queryParams.sortOrder}
        tagIds={queryParams.tagIds}
      />

      {/* Loading State */}
      {_isLoading && (
        <div className={'flex min-h-[400px] items-center justify-center'}>
          <Spinner className={'size-16'} />
        </div>
      )}

      {/* Error State */}
      {_hasError && !_isLoading && (
        <EmptyState description={error || 'Please try again'} icon={AlertCircle} title={'Search Error'} />
      )}

      {/* Empty State - No Query */}
      {_isShowEmptyState && (
        <EmptyState
          description={'Enter a search query to find collections, subcollections, and bobbleheads'}
          icon={Search}
          title={'Start Searching'}
        />
      )}

      {/* No Results State */}
      {_hasNoResults && !_isLoading && (
        <EmptyState
          description={'Try different keywords or adjust your filters'}
          icon={Search}
          title={'No Results Found'}
        />
      )}

      {/* Search Results */}
      {_isShowResultsWithPagination && (
        <Fragment>
          {/* Results Grid */}
          <SearchResultsGrid
            bobbleheads={searchResults.bobbleheads}
            collections={searchResults.collections}
            counts={searchResults.counts}
            subcollections={searchResults.subcollections}
          />

          {/* Pagination */}
          <SearchPagination
            hasNextPage={searchResults.pagination.hasNextPage}
            hasPreviousPage={searchResults.pagination.hasPreviousPage}
            onPageChange={handlePageChange}
            page={searchResults.pagination.page}
            totalPages={searchResults.pagination.totalPages}
          />
        </Fragment>
      )}
    </div>
  );
};
