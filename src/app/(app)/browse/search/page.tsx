import type { Metadata } from 'next';

import { Suspense } from 'react';

import { SearchPageContent } from '@/app/(app)/browse/search/components/search-page-content';
import { Skeleton } from '@/components/ui/skeleton';

export function generateMetadata(): Metadata {
  return {
    description: 'Search for collections, subcollections, and bobbleheads in the Head Shakers community',
    title: 'Search',
  };
}

export default function SearchPage() {
  return (
    <div className={'container mx-auto px-4 py-8'}>
      {/* Page Header */}
      <div className={'mb-8'}>
        <h1 className={'text-3xl font-bold tracking-tight'}>Search Results</h1>
        <p className={'mt-2 text-muted-foreground'}>Find collections, subcollections, and bobbleheads</p>
      </div>

      {/* Search Content */}
      <Suspense
        fallback={
          <div className={'space-y-8'}>
            <Skeleton className={'h-24 w-full'} />
            <div className={'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton className={'h-64 w-full'} key={i} />
              ))}
            </div>
          </div>
        }
      >
        <SearchPageContent />
      </Suspense>
    </div>
  );
}
