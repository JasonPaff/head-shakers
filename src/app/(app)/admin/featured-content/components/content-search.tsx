'use client';

import { ChevronDownIcon, ChevronRightIcon, Image as ImageIcon, SearchIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import type { TagSuggestion } from '@/lib/facades/tags/tags.facade';
import type { TagRecord } from '@/lib/queries/tags/tags-query';
import type { ContentType } from '@/lib/validations/system.validation';

import { TagFilter } from '@/app/(app)/admin/featured-content/components/tag-filter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { FieldAria } from '@/components/ui/form/field-components/field-aria';
import { FieldError } from '@/components/ui/form/field-components/field-error';
import { FieldErrorBorder } from '@/components/ui/form/field-components/field-error-border';
import { FieldItem } from '@/components/ui/form/field-components/field-item';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TagList } from '@/components/ui/tag-badge';
import { useToggle } from '@/hooks/use-toggle';
import {
  getBobbleheadForFeaturingAction,
  getCollectionForFeaturingAction,
  getUserForFeaturingAction,
  searchBobbleheadsForFeaturingAction,
  searchCollectionsForFeaturingAction,
  searchUsersForFeaturingAction,
} from '@/lib/actions/content-search/content-search.actions';
import { getTagSuggestionsAction } from '@/lib/actions/tags/tags.actions';
import { cn } from '@/utils/tailwind-utils';

interface ContentSearchProps {
  contentType: ContentType;
  onSelect: (contentId: string, contentName: string, imageUrl?: string) => void;
  selectedContentId?: string;
}

interface SearchResult {
  additionalInfo?: string;
  description?: null | string;
  id: string;
  imageUrl?: null | string;
  name: string;
  ownerName?: string;
  ownerUsername?: string;
  photos?: Array<{
    altText: null | string;
    isPrimary: boolean;
    sortOrder: number;
    url: string;
  }>;
  tags?: Array<TagRecord>;
}

export const ContentSearch = ({ contentType, onSelect, selectedContentId }: ContentSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<SearchResult>>([]);
  const [selectedItem, setSelectedItem] = useState<null | SearchResult>(null);
  const [includeTags, setIncludeTags] = useState<Array<string>>([]);
  const [excludeTags, setExcludeTags] = useState<Array<string>>([]);

  const [isLoadingSelected, setIsLoadingSelected] = useToggle();
  const [isPending, startTransition] = useTransition();
  const [isSearching, setIsSearching] = useToggle();

  const { executeAsync: searchCollections } = useAction(searchCollectionsForFeaturingAction);
  const { executeAsync: searchBobbleheads } = useAction(searchBobbleheadsForFeaturingAction);
  const { executeAsync: searchUsers } = useAction(searchUsersForFeaturingAction);
  const { executeAsync: getCollection } = useAction(getCollectionForFeaturingAction);
  const { executeAsync: getBobblehead } = useAction(getBobbleheadForFeaturingAction);
  const { executeAsync: getUser } = useAction(getUserForFeaturingAction);
  const { executeAsync: getTagSuggestions } = useAction(getTagSuggestionsAction);

  const filteredResults = useMemo(() => {
    return results.filter((result) => result.id !== selectedContentId);
  }, [results, selectedContentId]);

  // fetch selected item when selectedContentId changes
  useEffect(() => {
    if (selectedContentId && (!selectedItem || selectedItem.id !== selectedContentId)) {
      setIsLoadingSelected.on();

      const fetchSelectedItem = async () => {
        try {
          if (contentType === 'collection') {
            const response = await getCollection({ id: selectedContentId });
            if (response?.data?.data?.collection) {
              const collection = response.data.data.collection;
              setSelectedItem({
                additionalInfo: `${collection.totalItems} items`,
                description: collection.description,
                id: collection.id,
                imageUrl: collection.coverImageUrl,
                name: collection.name,
                ownerName: collection.ownerName || undefined,
                ownerUsername: collection.ownerUsername || undefined,
                tags: collection.tags || [],
              });
            }
          } else if (contentType === 'bobblehead') {
            const response = await getBobblehead({ id: selectedContentId });
            if (response?.data?.data?.bobblehead) {
              const bobblehead = response.data.data.bobblehead;
              setSelectedItem({
                additionalInfo: `${bobblehead.manufacturer}${bobblehead.series ? ` - ${bobblehead.series}` : ''}${bobblehead.year ? ` (${bobblehead.year})` : ''}`,
                description: bobblehead.description,
                id: bobblehead.id,
                imageUrl: bobblehead.primaryPhotoUrl || '/placeholder.jpg',
                name: bobblehead.name || '',
                ownerName: bobblehead.ownerName || undefined,
                ownerUsername: bobblehead.ownerUsername || undefined,
                photos: bobblehead.photos || [],
                tags: bobblehead.tags || [],
              });
            }
          } else if (contentType === 'user') {
            const response = await getUser({ id: selectedContentId });
            if (response?.data?.data?.user) {
              const user = response.data.data.user;
              setSelectedItem({
                additionalInfo: user.location ?? undefined,
                description: user.bio,
                id: user.id,
                imageUrl: user.avatarUrl,
                name: user.username || '',
                ownerName: undefined,
                ownerUsername: user.username || undefined,
              });
            }
          }
        } catch (error) {
          console.error('Failed to fetch selected item:', error);
          setSelectedItem(null);
        } finally {
          setIsLoadingSelected.off();
        }
      };

      void fetchSelectedItem();
    } else if (!selectedContentId) {
      setSelectedItem(null);
    }
  }, [
    selectedContentId,
    contentType,
    selectedItem,
    getCollection,
    getBobblehead,
    getUser,
    setIsLoadingSelected,
  ]);

  const performSearch = useDebouncedCallback(
    async (searchQuery: string, includeTagIds?: Array<string>, excludeTagIds?: Array<string>) => {
      const hasQuery = searchQuery.trim().length > 0;
      const hasTags =
        (includeTagIds && includeTagIds.length > 0) || (excludeTagIds && excludeTagIds.length > 0);

      if (!hasQuery && !hasTags) {
        setResults([]);
        return;
      }

      setIsSearching.on();

      try {
        let searchResults: Array<SearchResult> = [];
        const searchParams = {
          excludeTags: excludeTagIds,
          includeTags: includeTagIds,
          limit: 20,
          query: hasQuery ? searchQuery : undefined,
        };

        if (contentType === 'collection') {
          const response = await searchCollections(searchParams);

          if (response?.data?.data?.collections) {
            searchResults = response.data.data.collections.map((collection) => ({
              additionalInfo: `${collection.totalItems} items`,
              description: collection.description,
              id: collection.id,
              imageUrl: collection.coverImageUrl,
              name: collection.name,
              ownerName: collection.ownerName || undefined,
              ownerUsername: collection.ownerUsername || undefined,
              tags: collection.tags || [],
            }));
          }
        } else if (contentType === 'bobblehead') {
          const response = await searchBobbleheads(searchParams);
          if (response?.data?.data?.bobbleheads) {
            searchResults = response.data.data.bobbleheads.map((bobblehead) => ({
              additionalInfo: `${bobblehead.manufacturer}${bobblehead.series ? ` - ${bobblehead.series}` : ''}${bobblehead.year ? ` (${bobblehead.year})` : ''}`,
              description: bobblehead.description,
              id: bobblehead.id,
              imageUrl: bobblehead.primaryPhotoUrl || '/placeholder.jpg',
              name: bobblehead.name || '',
              ownerName: bobblehead.ownerName || undefined,
              ownerUsername: bobblehead.ownerUsername || undefined,
              photos: bobblehead.photos || [],
              tags: bobblehead.tags || [],
            }));
          }
        } else if (contentType === 'user') {
          const response = await searchUsers({ query: searchQuery || '' });
          if (response?.data?.data?.users) {
            searchResults = response.data.data.users.map((user) => ({
              additionalInfo: user.location ?? undefined,
              description: user.bio,
              id: user.id,
              imageUrl: user.avatarUrl,
              name: user.username || '',
              ownerName: undefined,
              ownerUsername: user.username || undefined,
            }));
          }
        }

        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsSearching.off();
      }
    },
    300,
  );

  const handleSearch = (value: string) => {
    setQuery(value);
    startTransition(() => {
      void performSearch(value, includeTags, excludeTags);
    });
  };

  const handleTagFiltersChange = () => {
    startTransition(() => {
      void performSearch(query, includeTags, excludeTags);
    });
  };

  // Effect to trigger search when tag filters change
  useEffect(() => {
    if (includeTags.length > 0 || excludeTags.length > 0 || query.trim().length > 0) {
      handleTagFiltersChange();
    }
  }, [includeTags, excludeTags]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTagSuggestions = async (tagQuery: string) => {
    try {
      const response = await getTagSuggestions({ query: tagQuery });
      if (response?.data) {
        // The response structure is { data: { suggestions: TagSuggestion[] }, success: true }
        const data = response.data as unknown as { suggestions: Array<TagSuggestion> };
        if (data.suggestions) {
          return data.suggestions.map((suggestion) => ({
            color: suggestion.color,
            id: suggestion.id,
            name: suggestion.name,
          }));
        }
      }
      return [];
    } catch (error) {
      console.error('Failed to get tag suggestions:', error);
      return [];
    }
  };

  const hasSearchCriteria = query.trim().length > 0 || includeTags.length > 0 || excludeTags.length > 0;
  const _shouldShowNoResults = !isSearching && !isPending && hasSearchCriteria && results.length === 0;
  const _shouldShowResults = !isSearching && !isPending && results.length > 0;
  const _hasQueryText = Boolean(query);
  const _hasIncludeTags = includeTags.length > 0;
  const _hasExcludeTags = excludeTags.length > 0;
  const _includeTagsText = `with ${includeTags.length} include tag${includeTags.length === 1 ? '' : 's'}`;
  const _excludeTagsText = `excluding ${excludeTags.length} tag${excludeTags.length === 1 ? '' : 's'}`;
  const _showQueryText = _hasQueryText && ` for "${query}"`;
  const _showIncludeTagsText = _hasIncludeTags && ` ${_includeTagsText}`;
  const _showExcludeTagsText = _hasExcludeTags && ` ${_excludeTagsText}`;

  return (
    <div className={'space-y-4'}>
      {/* Tag Filter */}
      <TagFilter
        excludeTags={excludeTags}
        includeTags={includeTags}
        onExcludeTagsChange={setExcludeTags}
        onIncludeTagsChange={setIncludeTags}
        onTagSuggestionRequest={handleTagSuggestions}
      />

      {/* Search Input */}
      <FieldItem>
        <FieldAria>
          <FieldErrorBorder>
            <Input
              className={'pl-10'}
              isClearable
              leftIcon={<SearchIcon aria-hidden className={'size-4'} />}
              onChange={(e) => {
                handleSearch(e.target.value);
              }}
              placeholder={`Search ${contentType}s...`}
              value={query}
            />
          </FieldErrorBorder>
        </FieldAria>
        <FieldError />
      </FieldItem>

      {/* Loading Selected Item */}
      <Conditional isCondition={isLoadingSelected}>
        <div className={'space-y-2'}>
          <p className={'text-sm font-medium text-muted-foreground'}>Currently Selected Content:</p>
          <div className={'flex items-center space-x-3 rounded-lg border p-3'}>
            <Skeleton className={'size-10 rounded'} />
            <div className={'flex-1 space-y-1'}>
              <Skeleton className={'h-4 w-3/4'} />
              <Skeleton className={'h-3 w-1/2'} />
            </div>
          </div>
        </div>
      </Conditional>

      {/* Selected Item */}
      <Conditional isCondition={!isLoadingSelected && !!selectedItem}>
        <div className={'space-y-2'}>
          <p className={'text-sm font-medium text-muted-foreground'}>Currently Selected Content:</p>
          <BobbleheadSearchResult
            contentType={contentType}
            key={selectedItem?.id || 'selected-item'}
            onSelect={onSelect}
            result={selectedItem!}
            selectedContentId={selectedContentId}
          />
        </div>
      </Conditional>

      {/* Loading Search Results */}
      <Conditional isCondition={isSearching || isPending}>
        <div className={'space-y-2'}>
          <p className={'text-sm font-medium text-muted-foreground'}>Search Results:</p>
          {Array.from({ length: 3 }).map((_, i) => (
            <div className={'flex items-center space-x-3 rounded-lg border p-3'} key={i}>
              <Skeleton className={'size-10 rounded'} />
              <div className={'flex-1 space-y-1'}>
                <Skeleton className={'h-4 w-3/4'} />
                <Skeleton className={'h-3 w-1/2'} />
              </div>
            </div>
          ))}
        </div>
      </Conditional>

      {/* No Results Found */}
      <Conditional isCondition={_shouldShowNoResults}>
        <Card>
          <CardContent className={'py-6 text-center'}>
            <p className={'text-muted-foreground'}>
              No {contentType}s found matching your search criteria
              {_showQueryText}
              {_showIncludeTagsText}
              {_showExcludeTagsText}
            </p>
          </CardContent>
        </Card>
      </Conditional>

      {/* Search Results Found */}
      <Conditional isCondition={_shouldShowResults}>
        <div className={'space-y-2'}>
          <p className={'text-sm font-medium text-muted-foreground'}>Search Results:</p>
          {/* Search Results */}
          <Conditional isCondition={filteredResults.length > 0}>
            <div className={'space-y-2'}>
              {filteredResults.map((result) => (
                <BobbleheadSearchResult
                  contentType={contentType}
                  key={result.id}
                  onSelect={onSelect}
                  result={result}
                  selectedContentId={selectedContentId}
                />
              ))}
            </div>
          </Conditional>
          {/* No Search Results */}
          <Conditional isCondition={filteredResults.length === 0}>
            <Card>
              <CardContent className={'py-4 text-center'}>
                <p className={'text-sm text-muted-foreground'}>
                  No additional {contentType}s found matching &quot;{query}&quot;
                </p>
              </CardContent>
            </Card>
          </Conditional>
        </div>
      </Conditional>

      {/* Instructions */}
      <Conditional isCondition={!hasSearchCriteria}>
        <Card>
          <CardHeader>
            <CardTitle className={'text-sm'}>Search Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={'space-y-2 text-sm text-muted-foreground'}>
              <p>
                Search for {contentType}s to feature by name, description, or owner. You can also filter by
                tags.
              </p>
              <div className={'space-y-1'}>
                <p>
                  • <strong>Text search:</strong> Enter keywords to search across content
                </p>
                <p>
                  • <strong>Include tags:</strong> Show content that has ALL selected tags
                </p>
                <p>
                  • <strong>Exclude tags:</strong> Hide content that has ANY of the selected tags
                </p>
                <p>• Use both text search and tags together for precise filtering</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Conditional>
    </div>
  );
};

interface BobbleheadSearchResultProps {
  contentType: ContentType;
  onSelect: (contentId: string, contentName: string, imageUrl?: string) => void;
  result: SearchResult;
  selectedContentId?: string;
}

const BobbleheadSearchResult = ({
  contentType,
  onSelect,
  result,
  selectedContentId,
}: BobbleheadSearchResultProps) => {
  const [isExpanded, setIsExpanded] = useToggle();
  const primaryPhoto = useMemo(() => {
    return result.photos?.find((p) => p.isPrimary) || result.photos?.[0];
  }, [result.photos]);

  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(
    primaryPhoto?.url ?? result.imageUrl ?? '/placeholder.jpg',
  );

  const handleSelect = (imageUrl?: string) => {
    onSelect(result.id, result.name, imageUrl || selectedImageUrl);
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
  };

  const _hasMultiplePhotos = result.photos && result.photos.length > 1;

  if (contentType !== 'bobblehead') {
    return (
      <Card className={cn('transition-colors', selectedContentId === result.id && 'ring-2 ring-primary')}>
        <CardContent className={'p-3'}>
          <div className={'flex items-start gap-3'}>
            {/* Cover Image Preview */}
            <div className={'flex-shrink-0'}>
              <div
                className={
                  'relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-md bg-muted'
                }
              >
                {result.imageUrl ?
                  <img alt={result.name} className={'object-cover'} sizes={'64px'} src={result.imageUrl} />
                : <ImageIcon className={'size-6 text-muted-foreground'} />}
              </div>
            </div>

            {/* Content */}
            <div className={'min-w-0 flex-1'}>
              <CardTitle className={'text-sm font-medium'}>{result.name}</CardTitle>
              <Conditional isCondition={!!result.description}>
                <CardDescription className={'mt-1 line-clamp-2 text-xs'}>
                  {result.description}
                </CardDescription>
              </Conditional>
              <Conditional isCondition={!!result.ownerName}>
                <p className={'mt-1 text-xs text-muted-foreground'}>
                  by {result.ownerName} (@{result.ownerUsername})
                </p>
              </Conditional>
              <Conditional isCondition={!!result.additionalInfo}>
                <p className={'mt-1 text-xs text-muted-foreground'}>{result.additionalInfo}</p>
              </Conditional>
              <Conditional isCondition={!!result.tags && result.tags.length > 0}>
                <div className={'mt-2'}>
                  <TagList limit={5} size={'sm'} tags={result.tags || []} />
                </div>
              </Conditional>
            </div>

            {/* Actions */}
            <div className={'flex flex-col'}>
              <Button
                onClick={() => {
                  handleSelect(result.imageUrl || '/placeholder.jpg');
                }}
                size={'sm'}
                variant={selectedContentId === result.id ? 'default' : 'outline'}
              >
                {selectedContentId === result.id ? 'Selected' : 'Select'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('transition-colors', selectedContentId === result.id && 'ring-2 ring-primary')}>
      <CardContent className={'p-3'}>
        <div className={'flex items-start gap-3'}>
          {/* Image Preview */}
          <div className={'flex-shrink-0'}>
            <div className={'relative h-16 w-16 overflow-hidden rounded-md bg-muted'}>
              <img alt={result.name} className={'object-cover'} sizes={'64px'} src={selectedImageUrl} />
            </div>
          </div>

          {/* Content */}
          <div className={'min-w-0 flex-1'}>
            <CardTitle className={'text-sm font-medium'}>{result.name}</CardTitle>
            <Conditional isCondition={!!result.description}>
              <CardDescription className={'mt-1 line-clamp-2 text-xs'}>{result.description}</CardDescription>
            </Conditional>
            <Conditional isCondition={!!result.ownerName}>
              <p className={'mt-1 text-xs text-muted-foreground'}>
                by {result.ownerName} (@{result.ownerUsername})
              </p>
            </Conditional>
            <Conditional isCondition={!!result.additionalInfo}>
              <p className={'mt-1 text-xs text-muted-foreground'}>{result.additionalInfo}</p>
            </Conditional>
            <Conditional isCondition={!!result.tags && result.tags.length > 0}>
              <div className={'mt-2'}>
                <TagList limit={5} size={'sm'} tags={result.tags || []} />
              </div>
            </Conditional>
          </div>

          {/* Actions */}
          <div className={'flex flex-col gap-2'}>
            <Button
              onClick={() => {
                handleSelect(selectedImageUrl);
              }}
              size={'sm'}
              variant={selectedContentId === result.id ? 'default' : 'outline'}
            >
              {selectedContentId === result.id ? 'Selected' : 'Select'}
            </Button>

            <Conditional isCondition={_hasMultiplePhotos}>
              <Button className={'h-8 px-2'} onClick={setIsExpanded.toggle} size={'sm'} variant={'ghost'}>
                {isExpanded ?
                  <ChevronDownIcon aria-hidden className={'size-3'} />
                : <ChevronRightIcon aria-hidden className={'size-3'} />}
                <ImageIcon aria-hidden className={'ml-1 size-3'} />
                {result.photos?.length}
              </Button>
            </Conditional>
          </div>
        </div>

        {/* Expandable Image Selection */}
        <Conditional isCondition={isExpanded && _hasMultiplePhotos}>
          <div className={'mt-3 border-t pt-3'}>
            <p className={'mb-2 text-xs text-muted-foreground'}>Choose feature image:</p>
            <div className={'grid grid-cols-4 gap-2'}>
              {result.photos?.map((photo) => {
                const _isSelected = selectedImageUrl === photo.url;
                const _photoTitle = photo.altText || `Photo ${photo.sortOrder}`;
                return (
                  <button
                    className={cn(
                      'relative h-16 w-16 cursor-pointer overflow-hidden',
                      'rounded-md ring-offset-2 transition-all',
                      _isSelected ? 'ring-2 ring-primary' : 'ring-muted-foreground hover:ring-1',
                    )}
                    key={photo.url}
                    onClick={() => {
                      handleImageSelect(photo.url);
                    }}
                    title={_photoTitle}
                    type={'button'}
                  >
                    <img
                      alt={photo.altText || result.name}
                      className={'object-cover'}
                      sizes={'64px'}
                      src={photo.url}
                    />
                    <Conditional isCondition={photo.isPrimary}>
                      <div
                        className={cn(
                          'absolute top-0 right-0 rounded-bl bg-primary',
                          'px-1 text-xs text-primary-foreground',
                        )}
                      >
                        1st
                      </div>
                    </Conditional>
                  </button>
                );
              })}
            </div>
          </div>
        </Conditional>
      </CardContent>
    </Card>
  );
};
