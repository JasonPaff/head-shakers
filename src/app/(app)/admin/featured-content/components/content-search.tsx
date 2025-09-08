'use client';

import { Search } from 'lucide-react';
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
  onSelect: (contentId: string, contentName: string) => void;
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
            imageUrl: bobblehead.primaryPhotoUrl,
            name: bobblehead.name,
            ownerName: bobblehead.ownerName,
            ownerUsername: bobblehead.ownerUsername,
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
                <Card
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedContentId === result.id ? 'ring-2 ring-primary' : ''
                  }`}
                  key={result.id}
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
                        onClick={() => {
                          onSelect(result.id, result.name);
                        }}
                        size={'sm'}
                        variant={selectedContentId === result.id ? 'default' : 'outline'}
                      >
                        {selectedContentId === result.id ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
