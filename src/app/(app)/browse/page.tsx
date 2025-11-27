import type { Metadata } from 'next';

import * as Sentry from '@sentry/nextjs';
import { Suspense } from 'react';

import { BrowseCollectionsContent } from '@/app/(app)/browse/components/browse-collections-content';
import { Spinner } from '@/components/ui/spinner';

export const dynamic = 'force-static';

export default function BrowsePage() {
  // Set Sentry context for this page
  Sentry.setContext('browse_page', {
    page: 'browse-collections',
    version: '1.0',
  });

  Sentry.addBreadcrumb({
    category: 'page-load',
    data: {
      page: 'browse-collections',
    },
    level: 'info',
    message: 'Browse collections page loaded',
  });

  return (
    <div className={'container mx-auto space-y-6 py-8'}>
      {/* Page Header */}
      <div className={'space-y-2'}>
        <h1 className={'text-3xl font-bold tracking-tight'}>Browse Collections</h1>
        <p className={'text-muted-foreground'}>
          Discover amazing bobblehead collections from collectors around the world
        </p>
      </div>

      {/* Browse Content */}
      <Suspense
        fallback={
          <div className={'flex min-h-[400px] items-center justify-center'}>
            <Spinner className={'size-16'} />
          </div>
        }
      >
        <BrowseCollectionsContent />
      </Suspense>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    description: 'Browse and discover bobblehead collections from collectors around the world',
    title: 'Browse Collections',
  };
}
