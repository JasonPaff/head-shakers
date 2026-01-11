import type { Metadata } from 'next';

import * as Sentry from '@sentry/nextjs';
import { Suspense } from 'react';

import { BrowseCategoriesContent } from '@/app/(app)/browse/categories/components/browse-categories-content';
import { BrowseCollectionsSkeleton } from '@/app/(app)/browse/components/skeletons/browse-collections-skeleton';

export const dynamic = 'force-static';

export default function CategoriesPage() {
  // Set Sentry context for this page
  Sentry.setContext('browse_categories_page', {
    page: 'browse-categories',
    version: '1.0',
  });

  Sentry.addBreadcrumb({
    category: 'page-load',
    data: {
      page: 'browse-categories',
    },
    level: 'info',
    message: 'Browse categories page loaded',
  });

  return (
    <div className={'container mx-auto space-y-6 py-8'}>
      {/* Page Header */}
      <div className={'space-y-2'}>
        <h1 className={'text-3xl font-bold tracking-tight'}>Browse Categories</h1>
        <p className={'text-muted-foreground'}>Discover bobblehead collections organized by category</p>
      </div>

      {/* Browse Content */}
      <Suspense fallback={<BrowseCollectionsSkeleton />}>
        <BrowseCategoriesContent />
      </Suspense>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    description: 'Browse and discover bobblehead collections organized by category',
    title: 'Browse Categories',
  };
}
