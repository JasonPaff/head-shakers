'use client';

import type { ChangeEvent, ComponentProps, KeyboardEvent } from 'react';

import { ArrowRightIcon, SearchIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { SearchResultItem } from '@/components/feature/search/search-result-item';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { getPublicSearchDropdownAction } from '@/lib/actions/content-search/content-search.actions';
import { CONFIG } from '@/lib/constants';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type SearchDropdownProps = ComponentProps<'div'> & ComponentTestIdProps;

export const SearchDropdown = ({ className, testId, ...props }: SearchDropdownProps) => {
  // 1. useState hooks
  const [isOpen, setIsOpen] = useToggle();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 2. Other hooks (useContext, useQuery, etc.)
  const inputRef = useRef<HTMLInputElement>(null);
  const { execute, isExecuting, result } = useServerAction(getPublicSearchDropdownAction);

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

  // open popover when the search executes or has results (after debouncing)
  useEffect(() => {
    if (debouncedQuery.length >= CONFIG.SEARCH.MIN_QUERY_LENGTH && (isExecuting || result)) {
      setIsOpen.on();
    } else if (debouncedQuery.length < CONFIG.SEARCH.MIN_QUERY_LENGTH) {
      setIsOpen.off();
    }
  }, [debouncedQuery, isExecuting, result, setIsOpen]);

  // 5. Utility functions
  const getViewAllUrl = (searchQuery: string): string => {
    return $path({ route: '/browse/search', searchParams: { q: searchQuery } });
  };

  // 6. Event handlers
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  }, []);

  const handleInputFocus = useCallback(() => {
    if (debouncedQuery.length >= CONFIG.SEARCH.MIN_QUERY_LENGTH) {
      setIsOpen.on();
    }
  }, [debouncedQuery, setIsOpen]);

  const handleInputClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setIsOpen.off();
  }, [setIsOpen]);

  const handleResultClick = useCallback(() => {
    setIsOpen.off();
  }, [setIsOpen]);

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') setIsOpen.off();
    },
    [setIsOpen],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) setIsOpen.off();
    },
    [setIsOpen],
  );

  // 7. Derived variables for conditional rendering
  const _isQueryValid = query.trim().length >= CONFIG.SEARCH.MIN_QUERY_LENGTH;
  const _isLoading = isExecuting;
  const _hasResults =
    searchResultsData?.wasSuccess &&
    (searchResultsData.data.collections.length > 0 || searchResultsData.data.bobbleheads.length > 0);
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
        <PopoverAnchor asChild>
          <div className={'relative w-full'}>
            <SearchIcon
              aria-hidden
              className={'absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'}
            />
            <Input
              aria-label={'Search collections and bobbleheads'}
              className={'w-full pr-4 pl-9'}
              isClearable
              onChange={handleInputChange}
              onClear={handleInputClear}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
              placeholder={'Search...'}
              ref={inputRef}
              testId={inputTestId}
              value={query}
            />
          </div>
        </PopoverAnchor>

        <Conditional isCondition={isOpen && _isQueryValid}>
          <PopoverContent
            align={'start'}
            className={'w-96 p-2'}
            onOpenAutoFocus={(e) => {
              // Prevent popover from stealing focus from the search input
              e.preventDefault();
              // Refocus the input to ensure it stays focused
              inputRef.current?.focus();
            }}
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
                <Conditional
                  isCondition={
                    !!searchResultsData?.wasSuccess && searchResultsData.data.collections.length > 0
                  }
                >
                  {searchResultsData?.data?.collections.map((collection) => (
                    <SearchResultItem
                      entityType={'collection'}
                      key={collection.id}
                      onClick={handleResultClick}
                      result={collection}
                    />
                  ))}
                </Conditional>

                {/* Bobbleheads Section */}
                <Conditional
                  isCondition={
                    !!searchResultsData?.wasSuccess && searchResultsData.data.bobbleheads.length > 0
                  }
                >
                  {searchResultsData?.data?.bobbleheads?.map((bobblehead) => (
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
