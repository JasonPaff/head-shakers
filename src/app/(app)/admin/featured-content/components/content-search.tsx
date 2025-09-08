'use client';

import { ChevronDown, ChevronRight, Image as ImageIcon, Search } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import type { ContentType } from '@/lib/validations/system.validation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToggle } from '@/hooks/use-toggle';
import {
  searchBobbleheadsForFeaturingAction,
  searchCollectionsForFeaturingAction,
  searchUsersForFeaturingAction,
} from '@/lib/actions/content-search.actions';

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
  const [isSearching, setIsSearching] = useToggle();
  const [isPending, startTransition] = useTransition();

  const { executeAsync: searchCollections } = useAction(searchCollectionsForFeaturingAction);
  const { executeAsync: searchBobbleheads } = useAction(searchBobbleheadsForFeaturingAction);
  const { executeAsync: searchUsers } = useAction(searchUsersForFeaturingAction);

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

  return (
    <div className={'space-y-4'}>
      <div className={'relative'}>
        <Search className={'absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground'} />
        <Input
          className={'pl-10'}
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
          placeholder={`Search ${contentType}s...`}
          value={query}
        />
      </div>

      {(isSearching || isPending) && (
        <div className={'space-y-2'}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div className={'flex items-center space-x-3 rounded-lg border p-3'} key={i}>
              <Skeleton className={'h-10 w-10 rounded'} />
              <div className={'flex-1 space-y-1'}>
                <Skeleton className={'h-4 w-3/4'} />
                <Skeleton className={'h-3 w-1/2'} />
              </div>
            </div>
          ))}
        </div>
      )}

      {(() => {
        const shouldShowNoResults = !isSearching && !isPending && query && results.length === 0;
        const shouldShowResults = !isSearching && !isPending && results.length > 0;

        if (shouldShowNoResults) {
          return (
            <Card>
              <CardContent className={'py-6 text-center'}>
                <p className={'text-muted-foreground'}>
                  No {contentType}s found matching &quot;{query}&quot;
                </p>
              </CardContent>
            </Card>
          );
        }

        if (shouldShowResults) {
          return (
            <div className={'space-y-2'}>
              {results.map((result) => (
                <BobbleheadSearchResult
                  contentType={contentType}
                  key={result.id}
                  onSelect={onSelect}
                  result={result}
                  selectedContentId={selectedContentId}
                />
              ))}
            </div>
          );
        }

        return null;
      })()}

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
  const [isExpanded, setIsExpanded] = useState(false);

  // For bobbleheads, prioritize primary photo, then first photo, then placeholder
  const primaryPhoto = result.photos?.find((p) => p.isPrimary) || result.photos?.[0];
  const defaultImageUrl = primaryPhoto?.url || '/placeholder.jpg';

  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(defaultImageUrl);

  const handleSelect = (imageUrl?: string) => {
    onSelect(result.id, result.name, imageUrl || selectedImageUrl);
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
  };

  // For non-bobbleheads, use the simple card layout
  if (contentType !== 'bobblehead') {
    return (
      <Card
        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
          selectedContentId === result.id ? 'ring-2 ring-primary' : ''
        }`}
      >
        <CardContent className={'p-3'}>
          <div className={'flex items-start justify-between'}>
            <div className={'flex-1'}>
              <CardTitle className={'text-sm font-medium'}>{result.name}</CardTitle>
              {result.description && (
                <CardDescription className={'mt-1 line-clamp-2 text-xs'}>
                  {result.description}
                </CardDescription>
              )}
              {result.ownerName && (
                <p className={'mt-1 text-xs text-muted-foreground'}>
                  by {result.ownerName} (@{result.ownerUsername})
                </p>
              )}
              {result.additionalInfo && (
                <p className={'mt-1 text-xs text-muted-foreground'}>{result.additionalInfo}</p>
              )}
            </div>
            <Button
              onClick={() => handleSelect()}
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

  // For bobbleheads with photos, show expandable interface
  const _hasMultiplePhotos = result.photos && result.photos.length > 1;

  return (
    <Card className={`transition-colors ${selectedContentId === result.id ? 'ring-2 ring-primary' : ''}`}>
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
            {result.description && (
              <CardDescription className={'mt-1 line-clamp-2 text-xs'}>{result.description}</CardDescription>
            )}
            {result.ownerName && (
              <p className={'mt-1 text-xs text-muted-foreground'}>
                by {result.ownerName} (@{result.ownerUsername})
              </p>
            )}
            {result.additionalInfo && (
              <p className={'mt-1 text-xs text-muted-foreground'}>{result.additionalInfo}</p>
            )}
          </div>

          {/* Actions */}
          <div className={'flex flex-col gap-2'}>
            <Button
              onClick={() => handleSelect(selectedImageUrl)}
              size={'sm'}
              variant={selectedContentId === result.id ? 'default' : 'outline'}
            >
              {selectedContentId === result.id ? 'Selected' : 'Select'}
            </Button>

            {_hasMultiplePhotos && (
              <Button
                className={'h-8 px-2'}
                onClick={() => setIsExpanded(!isExpanded)}
                size={'sm'}
                variant={'ghost'}
              >
                {isExpanded ?
                  <ChevronDown className={'h-3 w-3'} />
                : <ChevronRight className={'h-3 w-3'} />}
                <ImageIcon className={'ml-1 h-3 w-3'} />
                {result.photos?.length}
              </Button>
            )}
          </div>
        </div>

        {/* Expandable Image Selection */}
        {isExpanded && _hasMultiplePhotos && (
          <div className={'mt-3 border-t pt-3'}>
            <p className={'mb-2 text-xs text-muted-foreground'}>Choose feature image:</p>
            <div className={'grid grid-cols-4 gap-2'}>
              {result.photos?.map((photo) => {
                const _isSelected = selectedImageUrl === photo.url;
                const _photoTitle = photo.altText || `Photo ${photo.sortOrder}`;
                return (
                  <button
                    className={`relative h-16 w-16 cursor-pointer overflow-hidden rounded-md ring-offset-2 transition-all ${
                      _isSelected ? 'ring-2 ring-primary' : 'ring-muted-foreground hover:ring-1'
                    }`}
                    key={photo.url}
                    onClick={() => handleImageSelect(photo.url)}
                    title={_photoTitle}
                    type={'button'}
                  >
                    <img
                      alt={photo.altText || result.name}
                      className={'object-cover'}
                      sizes={'64px'}
                      src={photo.url}
                    />
                    {photo.isPrimary && (
                      <div
                        className={
                          'absolute top-0 right-0 rounded-bl bg-primary px-1 text-xs text-primary-foreground'
                        }
                      >
                        1st
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
