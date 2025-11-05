'use client';

import type { ChangeEvent, ComponentProps, KeyboardEvent } from 'react';

import { ArrowRightIcon, SearchIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { SearchResultItem } from '@/components/feature/search/search-result-item';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { getPublicSearchDropdownAction } from '@/lib/actions/content-search/content-search.actions';
import { CONFIG } from '@/lib/constants';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type SearchDropdownProps = ComponentProps<'div'> & ComponentTestIdProps;

export const SearchDropdown = ({ className, testId, ...props }: SearchDropdownProps) => {
  // 1. useState hooks
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 2. Other hooks (useContext, useQuery, etc.)
  const { execute, isExecuting, result } = useAction(getPublicSearchDropdownAction);

  // 3. useMemo hooks
  const searchResultsData = useMemo(() => result?.data, [result?.data]);

  // 4. useEffect hooks
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, CONFIG.SEARCH.DEBOUNCE_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length >= CONFIG.SEARCH.MIN_QUERY_LENGTH) {
      execute({ query: debouncedQuery });
    }
  }, [debouncedQuery, execute]);

  // 5. Utility functions
  const getViewAllUrl = (searchQuery: string): string => {
    return `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  // 6. Event handlers
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length >= CONFIG.SEARCH.MIN_QUERY_LENGTH) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, []);

  const handleInputFocus = useCallback(() => {
    if (query.trim().length >= CONFIG.SEARCH.MIN_QUERY_LENGTH) {
      setIsOpen(true);
    }
  }, [query]);

  const handleInputClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setIsOpen(false);
  }, []);

  const handleResultClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleInputKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setIsOpen(false);
    }
  }, []);

  // 7. Derived variables for conditional rendering
  const _isQueryValid = query.trim().length >= CONFIG.SEARCH.MIN_QUERY_LENGTH;
  const _isLoading = isExecuting;
  const _hasResults =
    searchResultsData &&
    (searchResultsData.collections.length > 0 ||
      searchResultsData.subcollections.length > 0 ||
      searchResultsData.bobbleheads.length > 0);
  const _shouldShowEmptyState = !_isLoading && _isQueryValid && !_hasResults;
  const _shouldShowResults = !_isLoading && _hasResults;

  const searchDropdownTestId = testId || generateTestId('feature', 'search-command', 'dropdown');
  const inputTestId = generateTestId('feature', 'search-command', 'input');
  const popoverContentTestId = generateTestId('feature', 'search-command', 'popover-content');
  const viewAllLinkTestId = generateTestId('feature', 'search-command', 'view-all-link');

  return (
    <div
      className={cn('relative w-full', className)}
      data-slot={'search-dropdown'}
      data-testid={searchDropdownTestId}
      {...props}
    >
      <Popover onOpenChange={handleOpenChange} open={isOpen}>
        <PopoverTrigger asChild>
          <div className={'relative w-full'}>
            <SearchIcon
              aria-hidden
              className={'absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'}
            />
            <Input
              aria-label={'Search collections, subcollections, and bobbleheads'}
              className={'w-full pr-4 pl-9'}
              isClearable
              onChange={handleInputChange}
              onClear={handleInputClear}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
              placeholder={'Search...'}
              testId={inputTestId}
              type={'search'}
              value={query}
            />
          </div>
        </PopoverTrigger>

        <Conditional isCondition={isOpen && _isQueryValid}>
          <PopoverContent
            align={'start'}
            className={'w-[var(--radix-popover-trigger-width)] p-2'}
            sideOffset={8}
            testId={popoverContentTestId}
          >
            {/* Loading State */}
            <Conditional isCondition={_isLoading}>
              <div className={'flex flex-col gap-2'}>
                <Skeleton className={'h-16 w-full'} />
                <Skeleton className={'h-16 w-full'} />
                <Skeleton className={'h-16 w-full'} />
              </div>
            </Conditional>

            {/* Search Results */}
            <Conditional isCondition={_shouldShowResults}>
              <div className={'flex flex-col'}>
                {/* Collections Section */}
                <Conditional isCondition={!!searchResultsData && searchResultsData.collections.length > 0}>
                  {searchResultsData?.collections.map((collection) => (
                    <SearchResultItem
                      entityType={'collection'}
                      key={collection.id}
                      onClick={handleResultClick}
                      result={collection}
                    />
                  ))}
                </Conditional>

                {/* Subcollections Section */}
                <Conditional isCondition={!!searchResultsData && searchResultsData.subcollections.length > 0}>
                  {searchResultsData?.subcollections.map((subcollection) => (
                    <SearchResultItem
                      entityType={'subcollection'}
                      key={subcollection.id}
                      onClick={handleResultClick}
                      result={subcollection}
                    />
                  ))}
                </Conditional>

                {/* Bobbleheads Section */}
                <Conditional isCondition={!!searchResultsData && searchResultsData.bobbleheads.length > 0}>
                  {searchResultsData?.bobbleheads.map((bobblehead) => (
                    <SearchResultItem
                      entityType={'bobblehead'}
                      key={bobblehead.id}
                      onClick={handleResultClick}
                      result={bobblehead}
                    />
                  ))}
                </Conditional>

                {/* View All Results Link */}
                <Link
                  className={cn(
                    'mt-2 flex items-center justify-center gap-2 rounded-md border-t p-2 pt-3',
                    'text-sm font-medium text-primary transition-colors',
                    'hover:bg-accent focus-visible:bg-accent focus-visible:outline-none',
                  )}
                  data-testid={viewAllLinkTestId}
                  href={getViewAllUrl(query)}
                  onClick={handleResultClick}
                >
                  View All Results
                  <ArrowRightIcon aria-hidden className={'size-4'} />
                </Link>
              </div>
            </Conditional>

            {/* Empty State */}
            <Conditional isCondition={_shouldShowEmptyState}>
              <div className={'flex flex-col items-center justify-center py-8 text-center'}>
                <SearchIcon aria-hidden className={'mb-2 size-8 text-muted-foreground'} />
                <p className={'text-sm font-medium text-foreground'}>No results found</p>
                <p className={'mt-1 text-xs text-muted-foreground'}>Try adjusting your search query</p>
              </div>
            </Conditional>
          </PopoverContent>
        </Conditional>
      </Popover>
    </div>
  );
};
