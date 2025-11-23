'use client';

import type { ChangeEvent, ComponentProps, KeyboardEvent } from 'react';

import { ArrowRightIcon, SearchIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  BobbleheadSearchResult,
  CollectionSearchResult,
  SubcollectionSearchResult,
} from '@/lib/queries/content-search/content-search.query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
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

type SearchAutocompleteProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    initialQuery?: string;
    onSearch?: (query: string) => void;
  };

export const SearchAutocomplete = ({
  className,
  initialQuery = '',
  onSearch,
  testId,
  ...props
}: SearchAutocompleteProps) => {
  // 1. useState hooks
  const [isOpen, setIsOpen] = useToggle();
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // 2. Other hooks (useContext, useQuery, etc.)
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { execute, isExecuting, result } = useServerAction(getPublicSearchDropdownAction);

  // 3. useMemo hooks
  const searchResultsData = useMemo(() => result?.data, [result?.data]);

  // Track previous results to detect changes for resetting selection
  const prevResultsRef = useRef<typeof searchResultsData>(null);

  const flattenedResults = useMemo(() => {
    if (!searchResultsData) return [];

    const results: Array<{
      entityType: 'bobblehead' | 'collection' | 'subcollection';
      item: BobbleheadSearchResult | CollectionSearchResult | SubcollectionSearchResult;
    }> = [];

    searchResultsData.collections.forEach((collection) => {
      results.push({ entityType: 'collection', item: collection });
    });

    searchResultsData.subcollections.forEach((subcollection) => {
      results.push({ entityType: 'subcollection', item: subcollection });
    });

    searchResultsData.bobbleheads.forEach((bobblehead) => {
      results.push({ entityType: 'bobblehead', item: bobblehead });
    });

    return results;
  }, [searchResultsData]);

  // Reset selection when results change - compare by reference to avoid effect
  if (prevResultsRef.current !== searchResultsData) {
    prevResultsRef.current = searchResultsData;
    if (selectedIndex !== -1) {
      setSelectedIndex(-1);
    }
  }

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

  useEffect(() => {
    if (debouncedQuery.length >= CONFIG.SEARCH.MIN_QUERY_LENGTH && (isExecuting || result)) {
      setIsOpen.on();
    } else if (debouncedQuery.length < CONFIG.SEARCH.MIN_QUERY_LENGTH) {
      setIsOpen.off();
    }
  }, [debouncedQuery, isExecuting, result, setIsOpen]);

  // 5. Utility functions
  const getEntityUrl = (
    entityType: 'bobblehead' | 'collection' | 'subcollection',
    item: BobbleheadSearchResult | CollectionSearchResult | SubcollectionSearchResult,
  ): string => {
    if (entityType === 'collection') {
      return $path({ route: '/collections/[collectionSlug]', routeParams: { collectionSlug: item.slug } });
    }
    if (entityType === 'subcollection') {
      return $path({
        route: '/collections/[collectionSlug]/subcollection/[subcollectionSlug]',
        routeParams: {
          collectionSlug: (item as SubcollectionSearchResult).collectionSlug,
          subcollectionSlug: item.slug,
        },
      });
    }
    return $path({ route: '/bobbleheads/[bobbleheadSlug]', routeParams: { bobbleheadSlug: item.slug } });
  };

  const getViewAllUrl = (searchQuery: string): string => {
    return $path({ route: '/browse/search', searchParams: { q: searchQuery } });
  };

  const getDisplayName = (
    item: BobbleheadSearchResult | CollectionSearchResult | SubcollectionSearchResult,
  ): string => {
    if ('name' in item && item.name) return item.name;
    if ('characterName' in item && item.characterName) return item.characterName;
    return 'Unknown';
  };

  const getEntityLabel = (entityType: 'bobblehead' | 'collection' | 'subcollection'): string => {
    if (entityType === 'collection') return 'Collection';
    if (entityType === 'subcollection') return 'Subcollection';
    return 'Bobblehead';
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
    setSelectedIndex(-1);
  }, [setIsOpen]);

  const handleResultClick = useCallback(() => {
    setIsOpen.off();
  }, [setIsOpen]);

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsOpen.off();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < flattenedResults.length - 1 ? prev + 1 : prev));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const selected = flattenedResults[selectedIndex];
        if (selectedIndex >= 0 && selectedIndex < flattenedResults.length && selected) {
          const url = getEntityUrl(selected.entityType, selected.item);
          router.push(url);
          setIsOpen.off();
        } else if (query.trim().length >= CONFIG.SEARCH.MIN_QUERY_LENGTH) {
          onSearch?.(query.trim());
          router.push(getViewAllUrl(query.trim()));
          setIsOpen.off();
        }
      }
    },
    [flattenedResults, onSearch, query, router, selectedIndex, setIsOpen],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) setIsOpen.off();
    },
    [setIsOpen],
  );

  const handleViewAllClick = useCallback(() => {
    onSearch?.(query.trim());
    setIsOpen.off();
  }, [onSearch, query, setIsOpen]);

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
  const _hasCollections = searchResultsData && searchResultsData.collections.length > 0;
  const _hasSubcollections = searchResultsData && searchResultsData.subcollections.length > 0;
  const _hasBobbleheads = searchResultsData && searchResultsData.bobbleheads.length > 0;

  const searchAutocompleteTestId = testId || generateTestId('feature', 'search-command', 'autocomplete');
  const inputTestId = generateTestId('feature', 'search-command', 'autocomplete-input');
  const popoverContentTestId = generateTestId('feature', 'search-command', 'autocomplete-popover');
  const viewAllLinkTestId = generateTestId('feature', 'search-command', 'autocomplete-view-all');
  const loadingTestId = generateTestId('feature', 'search-command', 'autocomplete-loading');
  const emptyTestId = generateTestId('feature', 'search-command', 'autocomplete-empty');

  return (
    <div
      className={cn('relative w-full', className)}
      data-slot={'search-autocomplete'}
      data-testid={searchAutocompleteTestId}
      {...props}
    >
      <Popover onOpenChange={handleOpenChange} open={isOpen}>
        <PopoverAnchor asChild>
          <div className={'relative w-full'}>
            <SearchIcon
              aria-hidden
              className={'absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground'}
            />
            <Input
              aria-autocomplete={'list'}
              aria-expanded={isOpen}
              aria-haspopup={'listbox'}
              aria-label={'Search collections, subcollections, and bobbleheads'}
              className={'w-full pr-4 pl-9'}
              isClearable
              onChange={handleInputChange}
              onClear={handleInputClear}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
              placeholder={'Search...'}
              ref={inputRef}
              role={'combobox'}
              testId={inputTestId}
              value={query}
            />
          </div>
        </PopoverAnchor>

        <Conditional isCondition={isOpen && _isQueryValid}>
          <PopoverContent
            align={'start'}
            className={'w-[var(--radix-popover-trigger-width)] p-0'}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              inputRef.current?.focus();
            }}
            sideOffset={8}
            testId={popoverContentTestId}
          >
            <Command
              className={'rounded-lg border shadow-md'}
              shouldFilter={false}
            >
              <CommandList>
                {/* Loading State */}
                <Conditional isCondition={_isLoading}>
                  <div className={'flex flex-col gap-2 p-2'} data-testid={loadingTestId}>
                    <Skeleton className={'h-12 w-full'} />
                    <Skeleton className={'h-12 w-full'} />
                    <Skeleton className={'h-12 w-full'} />
                  </div>
                </Conditional>

                {/* Search Results */}
                <Conditional isCondition={_shouldShowResults}>
                  {/* Collections Group */}
                  <Conditional isCondition={_hasCollections}>
                    <CommandGroup heading={'Collections'}>
                      {searchResultsData?.collections.map((collection, index) => {
                        const resultIndex = index;
                        const _isSelected = selectedIndex === resultIndex;

                        return (
                          <CommandItem
                            aria-selected={_isSelected}
                            asChild
                            className={cn(_isSelected && 'bg-accent')}
                            key={collection.id}
                            onSelect={() => handleResultClick()}
                            value={`collection-${collection.id}`}
                          >
                            <Link
                              className={'flex w-full cursor-pointer items-center gap-2'}
                              href={getEntityUrl('collection', collection)}
                            >
                              <span className={'flex-1 truncate'}>{getDisplayName(collection)}</span>
                              <span className={'text-xs text-muted-foreground'}>
                                {getEntityLabel('collection')}
                              </span>
                            </Link>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </Conditional>

                  {/* Subcollections Group */}
                  <Conditional isCondition={_hasSubcollections}>
                    <CommandGroup heading={'Subcollections'}>
                      {searchResultsData?.subcollections.map((subcollection, index) => {
                        const resultIndex = (searchResultsData?.collections.length || 0) + index;
                        const _isSelected = selectedIndex === resultIndex;

                        return (
                          <CommandItem
                            aria-selected={_isSelected}
                            asChild
                            className={cn(_isSelected && 'bg-accent')}
                            key={subcollection.id}
                            onSelect={() => handleResultClick()}
                            value={`subcollection-${subcollection.id}`}
                          >
                            <Link
                              className={'flex w-full cursor-pointer items-center gap-2'}
                              href={getEntityUrl('subcollection', subcollection)}
                            >
                              <span className={'flex-1 truncate'}>{getDisplayName(subcollection)}</span>
                              <span className={'text-xs text-muted-foreground'}>
                                {getEntityLabel('subcollection')}
                              </span>
                            </Link>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </Conditional>

                  {/* Bobbleheads Group */}
                  <Conditional isCondition={_hasBobbleheads}>
                    <CommandGroup heading={'Bobbleheads'}>
                      {searchResultsData?.bobbleheads.map((bobblehead, index) => {
                        const resultIndex =
                          (searchResultsData?.collections.length || 0) +
                          (searchResultsData?.subcollections.length || 0) +
                          index;
                        const _isSelected = selectedIndex === resultIndex;

                        return (
                          <CommandItem
                            aria-selected={_isSelected}
                            asChild
                            className={cn(_isSelected && 'bg-accent')}
                            key={bobblehead.id}
                            onSelect={() => handleResultClick()}
                            value={`bobblehead-${bobblehead.id}`}
                          >
                            <Link
                              className={'flex w-full cursor-pointer items-center gap-2'}
                              href={getEntityUrl('bobblehead', bobblehead)}
                            >
                              <span className={'flex-1 truncate'}>{getDisplayName(bobblehead)}</span>
                              <span className={'text-xs text-muted-foreground'}>
                                {getEntityLabel('bobblehead')}
                              </span>
                            </Link>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </Conditional>

                  {/* View All Results Link */}
                  <div className={'border-t p-2'}>
                    <Link
                      className={cn(
                        'flex items-center justify-center gap-2 rounded-md p-2',
                        'text-sm font-medium text-primary transition-colors',
                        'hover:bg-accent focus-visible:bg-accent focus-visible:outline-none',
                      )}
                      data-testid={viewAllLinkTestId}
                      href={getViewAllUrl(query)}
                      onClick={handleViewAllClick}
                    >
                      View All Results
                      <ArrowRightIcon aria-hidden className={'size-4'} />
                    </Link>
                  </div>
                </Conditional>

                {/* Empty State */}
                <Conditional isCondition={_shouldShowEmptyState}>
                  <CommandEmpty data-testid={emptyTestId}>
                    <div className={'flex flex-col items-center justify-center py-6 text-center'}>
                      <SearchIcon aria-hidden className={'mb-2 size-8 text-muted-foreground'} />
                      <p className={'text-sm font-medium text-foreground'}>No results found</p>
                      <p className={'mt-1 text-xs text-muted-foreground'}>Try adjusting your search query</p>
                    </div>
                  </CommandEmpty>
                </Conditional>
              </CommandList>
            </Command>
          </PopoverContent>
        </Conditional>
      </Popover>
    </div>
  );
};
