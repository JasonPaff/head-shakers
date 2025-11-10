import type { Metadata } from 'next';

import * as Sentry from '@sentry/nextjs';
import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { Suspense } from 'react';

import type { PageProps } from '@/app/(app)/browse/categories/[category]/route-type';

import { Route } from '@/app/(app)/browse/categories/[category]/route-type';
import { BrowseCategoriesContent } from '@/app/(app)/browse/categories/components/browse-categories-content';
import { Spinner } from '@/components/ui/spinner';

type CategoryPageProps = PageProps;

export async function generateMetadata({ routeParams }: CategoryPageProps): Promise<Metadata> {
  const { category } = await routeParams;

  return {
    description: `Browse bobblehead collections in the ${category} category`,
    title: `${category} Category`,
  };
}

export default withParamValidation(CategoryPage, Route);

async function CategoryPage({ routeParams }: CategoryPageProps) {
  const { category } = await routeParams;

  // Set Sentry context for this page
  Sentry.setContext('browse_category_page', {
    category,
    page: 'browse-category-specific',
    version: '1.0',
  });

  Sentry.addBreadcrumb({
    category: 'page-load',
    data: {
      category,
      page: 'browse-category-specific',
    },
    level: 'info',
    message: `Browse category page loaded: ${category}`,
  });

  return (
    <div className={'container mx-auto space-y-6 py-8'}>
      {/* Page Header */}
      <div className={'space-y-2'}>
        <h1 className={'text-3xl font-bold tracking-tight'}>
          {category} Collections
        </h1>
        <p className={'text-muted-foreground'}>
          Browse bobblehead collections in the {category} category
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
        <BrowseCategoriesContent defaultCategory={category} />
      </Suspense>
    </div>
  );
}
