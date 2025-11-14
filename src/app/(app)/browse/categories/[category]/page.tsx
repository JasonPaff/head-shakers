import type { Metadata } from 'next';

import * as Sentry from '@sentry/nextjs';
import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { Fragment, Suspense } from 'react';

import type { PageProps } from '@/app/(app)/browse/categories/[category]/route-type';

import { Route } from '@/app/(app)/browse/categories/[category]/route-type';
import { BrowseCategoriesContent } from '@/app/(app)/browse/categories/components/browse-categories-content';
import { Spinner } from '@/components/ui/spinner';
import { generateCollectionPageSchema } from '@/lib/seo/jsonld.utils';
import { generatePageMetadata, serializeJsonLd } from '@/lib/seo/metadata.utils';
import { DEFAULT_SITE_METADATA } from '@/lib/seo/seo.constants';

type CategoryPageProps = PageProps;

// enable ISR with 15-minute revalidation for category pages
export const revalidate = 900;

export async function generateMetadata({ routeParams }: CategoryPageProps): Promise<Metadata> {
  const { category } = await routeParams;

  // Capitalize first letter for display
  const categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1);

  return generatePageMetadata(
    'collection',
    {
      description: `Browse bobblehead collections in the ${categoryDisplay} category. Discover ${categoryDisplay.toLowerCase()} bobbleheads from collectors around the world.`,
      title: `${categoryDisplay} Bobblehead Collections`,
      url: `${DEFAULT_SITE_METADATA.url}/browse/categories/${category}`,
    },
    {
      isIndexable: true,
      isPublic: true,
      shouldIncludeOpenGraph: true,
      shouldIncludeTwitterCard: true,
      shouldUseTitleTemplate: true,
    },
  );
}

export default withParamValidation(CategoryPage, Route);

async function CategoryPage({ routeParams }: CategoryPageProps) {
  const { category } = await routeParams;

  // Capitalize first letter for display
  const categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1);

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

  // Generate JSON-LD schema for the category listing page
  const collectionPageSchema = generateCollectionPageSchema({
    description: `Browse bobblehead collections in the ${categoryDisplay} category`,
    name: `${categoryDisplay} Bobblehead Collections`,
    url: `${DEFAULT_SITE_METADATA.url}/browse/categories/${category}`,
  });

  return (
    <Fragment>
      {/* JSON-LD Structured Data */}
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionPageSchema) }}
        type={'application/ld+json'}
      />

      <div className={'container mx-auto space-y-6 py-8'}>
        {/* Page Header */}
        <div className={'space-y-2'}>
          <h1 className={'text-3xl font-bold tracking-tight'}>{categoryDisplay} Collections</h1>
          <p className={'text-muted-foreground'}>
            Browse bobblehead collections in the {categoryDisplay.toLowerCase()} category
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
    </Fragment>
  );
}
