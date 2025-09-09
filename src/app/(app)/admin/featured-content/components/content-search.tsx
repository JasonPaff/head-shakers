'use client';

import { ChevronDownIcon, ChevronRightIcon, Image as ImageIcon, SearchIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import type { ContentType } from '@/lib/validations/system.validation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToggle } from '@/hooks/use-toggle';
import {
  getBobbleheadForFeaturingAction,
  getCollectionForFeaturingAction,
  getUserForFeaturingAction,
  searchBobbleheadsForFeaturingAction,
  searchCollectionsForFeaturingAction,
  searchUsersForFeaturingAction,
} from '@/lib/actions/content-search.actions';
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
}

export const ContentSearch = ({ contentType, onSelect, selectedContentId }: ContentSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<SearchResult>>([]);
  const [selectedItem, setSelectedItem] = useState<null | SearchResult>(null);

  const [isLoadingSelected, setIsLoadingSelected] = useToggle();
  const [isPending, startTransition] = useTransition();
  const [isSearching, setIsSearching] = useToggle();

  const { executeAsync: searchCollections } = useAction(searchCollectionsForFeaturingAction);
  const { executeAsync: searchBobbleheads } = useAction(searchBobbleheadsForFeaturingAction);
  const { executeAsync: searchUsers } = useAction(searchUsersForFeaturingAction);
  const { executeAsync: getCollection } = useAction(getCollectionForFeaturingAction);
  const { executeAsync: getBobblehead } = useAction(getBobbleheadForFeaturingAction);
  const { executeAsync: getUser } = useAction(getUserForFeaturingAction);

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
            if (response?.data?.collection) {
              const collection = response.data.collection;
              setSelectedItem({
                additionalInfo: `${collection.totalItems} items`,
                description: collection.description,
                id: collection.id,
                imageUrl: collection.coverImageUrl,
                name: collection.name,
                ownerName: collection.ownerName,
                ownerUsername: collection.ownerUsername,
              });
            }
          } else if (contentType === 'bobblehead') {
            const response = await getBobblehead({ id: selectedContentId });
            if (response?.data?.bobblehead) {
              const bobblehead = response.data.bobblehead;
              setSelectedItem({
                additionalInfo: `${bobblehead.manufacturer}${bobblehead.series ? ` - ${bobblehead.series}` : ''}${bobblehead.year ? ` (${bobblehead.year})` : ''}`,
                description: bobblehead.description,
                id: bobblehead.id,
                imageUrl: bobblehead.primaryPhotoUrl || '/placeholder.jpg',
                name: bobblehead.name,
                ownerName: bobblehead.ownerName,
                ownerUsername: bobblehead.ownerUsername,
                photos: bobblehead.photos || [],
              });
            }
          } else if (contentType === 'user') {
            const response = await getUser({ id: selectedContentId });
            if (response?.data?.user) {
              const user = response.data.user;
              setSelectedItem({
                additionalInfo: `Member since ${new Date(user.memberSince).getFullYear()}${user.isVerified ? ' ✓' : ''}`,
                description: user.bio,
                id: user.id,
                imageUrl: user.avatarUrl,
                name: user.displayName,
                ownerName: undefined,
                ownerUsername: user.username,
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

  const performSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching.on();

    try {
      let searchResults: Array<SearchResult> = [];

      if (contentType === 'collection') {
        const response = await searchCollections({ query: searchQuery });

        if (response?.data?.collections) {
          searchResults = response.data.collections.map((collection) => ({
            additionalInfo: `${collection.totalItems} items`,
            description: collection.description,
            id: collection.id,
            imageUrl: collection.coverImageUrl,
            name: collection.name,
            ownerName: collection.ownerName,
            ownerUsername: collection.ownerUsername,
          }));
        }
      } else if (contentType === 'bobblehead') {
        const response = await searchBobbleheads({ query: searchQuery });
        if (response?.data?.bobbleheads) {
          searchResults = response.data.bobbleheads.map((bobblehead) => ({
            additionalInfo: `${bobblehead.manufacturer}${bobblehead.series ? ` - ${bobblehead.series}` : ''}${bobblehead.year ? ` (${bobblehead.year})` : ''}`,
            description: bobblehead.description,
            id: bobblehead.id,
            imageUrl: bobblehead.primaryPhotoUrl || '/placeholder.jpg',
            name: bobblehead.name,
            ownerName: bobblehead.ownerName,
            ownerUsername: bobblehead.ownerUsername,
            photos: bobblehead.photos || [],
          }));
        }
      } else if (contentType === 'user') {
        const response = await searchUsers({ query: searchQuery });
        if (response?.data?.users) {
          searchResults = response.data.users.map((user) => ({
            additionalInfo: `Member since ${new Date(user.memberSince).getFullYear()}${user.isVerified ? ' ✓' : ''}`,
            description: user.bio,
            id: user.id,
            imageUrl: user.avatarUrl,
            name: user.displayName,
            ownerName: undefined,
            ownerUsername: user.username,
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
  }, 300);

  const handleSearch = (value: string) => {
    setQuery(value);
    startTransition(() => {
      void performSearch(value);
    });
  };

  const _shouldShowNoResults = !isSearching && !isPending && !!query && results.length === 0;
  const _shouldShowResults = !isSearching && !isPending && results.length > 0;

  return (
    <div className={'space-y-4'}>
      {/* Search Input */}
      <div className={'relative'}>
        <SearchIcon
          aria-hidden
          className={'absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground'}
        />
        <Input
          className={'pl-10'}
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
          placeholder={`Search ${contentType}s...`}
          value={query}
        />
      </div>

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
            key={selectedItem!.id}
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
              No {contentType}s found matching &quot;{query}&quot;
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
      <Conditional isCondition={!query}>
        <Card>
          <CardHeader>
            <CardTitle className={'text-sm'}>Search Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={'text-sm text-muted-foreground'}>
              Search for {contentType}s to feature by name, description, or owner. The search will find public
              content that can be highlighted in the featured section.
            </p>
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

  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(primaryPhoto?.url ?? '/placeholder.jpg');

  const handleSelect = (imageUrl?: string) => {
    onSelect(result.id, result.name, imageUrl || selectedImageUrl);
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
  };

  const _hasMultiplePhotos = result.photos && result.photos.length > 1;

  if (contentType !== 'bobblehead') {
    return (
      <Card
        className={cn(
          'cursor-pointer transition-colors hover:bg-muted/50',
          selectedContentId === result.id && 'ring-2 ring-primary',
        )}
      >
        <CardContent className={'p-3'}>
          <div className={'flex items-start justify-between'}>
            <div className={'flex-1'}>
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
            </div>
            <Button
              onClick={() => {
                handleSelect();
              }}
              size={'sm'}
              variant={selectedContentId === result.id ? 'default' : 'outline'}
            >
              {selectedContentId === result.id ? 'Selected' : 'Select'}
            </Button>
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
