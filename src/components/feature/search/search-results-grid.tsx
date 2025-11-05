'use client';

import type {
  BobbleheadSearchResult,
  CollectionSearchResult,
  PublicSearchCounts,
  SubcollectionSearchResult,
} from '@/lib/queries/content-search/content-search.query';

import { SearchResultItem } from '@/components/feature/search/search-result-item';
import { Badge } from '@/components/ui/badge';
import { Conditional } from '@/components/ui/conditional';
import { Separator } from '@/components/ui/separator';

interface SearchResultsGridProps {
  bobbleheads: Array<BobbleheadSearchResult>;
  collections: Array<CollectionSearchResult>;
  counts: PublicSearchCounts;
  subcollections: Array<SubcollectionSearchResult>;
}

export const SearchResultsGrid = ({
  bobbleheads,
  collections,
  counts,
  subcollections,
}: SearchResultsGridProps) => {
  // Derived variables for conditional rendering
  const _hasCollections = collections.length > 0;
  const _hasSubcollections = subcollections.length > 0;
  const _hasBobbleheads = bobbleheads.length > 0;
  const _totalResults = counts.total;

  return (
    <div className={'space-y-8'}>
      {/* Results Summary */}
      <div className={'flex items-center justify-between'}>
        <div className={'flex items-center gap-2'}>
          <h2 className={'text-xl font-semibold'}>
            {_totalResults} {_totalResults === 1 ? 'Result' : 'Results'} Found
          </h2>
        </div>
        <div className={'flex gap-2'}>
          <Conditional isCondition={counts.collections > 0}>
            <Badge variant={'outline'}>{counts.collections} Collections</Badge>
          </Conditional>
          <Conditional isCondition={counts.subcollections > 0}>
            <Badge variant={'outline'}>{counts.subcollections} Subcollections</Badge>
          </Conditional>
          <Conditional isCondition={counts.bobbleheads > 0}>
            <Badge variant={'outline'}>{counts.bobbleheads} Bobbleheads</Badge>
          </Conditional>
        </div>
      </div>

      {/* Collections Section */}
      <Conditional isCondition={_hasCollections}>
        <div className={'space-y-4'}>
          <div className={'flex items-center gap-2'}>
            <h3 className={'text-lg font-semibold'}>Collections</h3>
            <Badge variant={'secondary'}>{collections.length}</Badge>
          </div>
          <div className={'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
            {collections.map((collection) => (
              <SearchResultItem entityType={'collection'} key={collection.id} result={collection} />
            ))}
          </div>
        </div>
      </Conditional>

      {/* Separator between sections */}
      <Conditional isCondition={_hasCollections && (_hasSubcollections || _hasBobbleheads)}>
        <Separator />
      </Conditional>

      {/* Subcollections Section */}
      <Conditional isCondition={_hasSubcollections}>
        <div className={'space-y-4'}>
          <div className={'flex items-center gap-2'}>
            <h3 className={'text-lg font-semibold'}>Subcollections</h3>
            <Badge variant={'secondary'}>{subcollections.length}</Badge>
          </div>
          <div className={'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
            {subcollections.map((subcollection) => (
              <SearchResultItem entityType={'subcollection'} key={subcollection.id} result={subcollection} />
            ))}
          </div>
        </div>
      </Conditional>

      {/* Separator between sections */}
      <Conditional isCondition={_hasSubcollections && _hasBobbleheads}>
        <Separator />
      </Conditional>

      {/* Bobbleheads Section */}
      <Conditional isCondition={_hasBobbleheads}>
        <div className={'space-y-4'}>
          <div className={'flex items-center gap-2'}>
            <h3 className={'text-lg font-semibold'}>Bobbleheads</h3>
            <Badge variant={'secondary'}>{bobbleheads.length}</Badge>
          </div>
          <div className={'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
            {bobbleheads.map((bobblehead) => (
              <SearchResultItem entityType={'bobblehead'} key={bobblehead.id} result={bobblehead} />
            ))}
          </div>
        </div>
      </Conditional>
    </div>
  );
};
