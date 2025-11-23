import type { Metadata } from 'next';
import type { z } from 'zod';

import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { Suspense } from 'react';

import type { PageProps } from '@/app/(app)/browse/search/route-type';

import { SearchPageContent } from '@/app/(app)/browse/search/components/search-page-content';
import { SearchPageSkeleton } from '@/app/(app)/browse/search/components/search-skeletons';
import { Route } from '@/app/(app)/browse/search/route-type';

type GenerateMetadataProps = {
  searchParams: Promise<SearchParamsType>;
};

type SearchPageProps = PageProps;

// Infer the search params type from the Route schema
type SearchParamsType = z.infer<(typeof Route)['searchParams']>;

export const generateMetadata = async ({ searchParams }: GenerateMetadataProps): Promise<Metadata> => {
  const params = await searchParams;

  // Build dynamic description based on search context
  const query = params?.q ?? '';
  const category = params?.category ?? '';
  const entityTypes = params?.entityTypes ?? [];

  const _hasQuery = Boolean(query);
  const _hasCategory = Boolean(category);
  const _isFilteredByEntityType = entityTypes.length > 0 && entityTypes.length < 3;

  // Base title and description
  let title = 'Search';
  let description = 'Search for collections, subcollections, and bobbleheads in the Head Shakers community';

  // Enhance title with query if present
  if (_hasQuery) {
    title = `Search: ${query}`;
    description = `Search results for "${query}" in Head Shakers`;
  }

  // Add entity type context to description when filtered to specific types
  if (_isFilteredByEntityType) {
    const entityLabels: Record<string, string> = {
      bobblehead: 'bobbleheads',
      collection: 'collections',
      subcollection: 'subcollections',
    };
    const formattedTypes = entityTypes.map((type) => entityLabels[type] ?? type);
    const entityLabel = formattedTypes.join(', ');
    description =
      _hasQuery ?
        `${entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)} matching "${query}" in Head Shakers`
      : `Browse ${entityLabel} in Head Shakers`;
  }

  // Add category context
  if (_hasCategory) {
    description += ` in ${category}`;
  }

  return {
    description,
    openGraph: {
      description,
      siteName: 'Head Shakers',
      title,
      type: 'website',
    },
    title,
    twitter: {
      card: 'summary',
      description,
      title,
    },
  };
};

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  // Await searchParams to satisfy Next.js 15 async params
  await searchParams;

  return (
    <main
      aria-label={'Search page'}
      className={'container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8'}
      data-slot={'search-page'}
    >
      {/* Page Header Section */}
      <header className={'mb-6 sm:mb-8'} data-slot={'search-page-header'}>
        <h1 className={'text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl'}>Search</h1>
        <p className={'mt-1.5 text-sm text-muted-foreground sm:mt-2 sm:text-base'}>
          Discover collections, subcollections, and bobbleheads from the community
        </p>
      </header>

      {/* Search Content Section */}
      <section aria-label={'Search results'} data-slot={'search-page-content'}>
        <Suspense fallback={<SearchPageSkeleton resultCount={6} viewMode={'grid'} />}>
          <SearchPageContent />
        </Suspense>
      </section>
    </main>
  );
};

export default withParamValidation(SearchPage, Route);
