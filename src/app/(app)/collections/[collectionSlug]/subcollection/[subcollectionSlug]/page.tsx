import type { Metadata } from 'next';

import { eq } from 'drizzle-orm';
import { $path } from 'next-typesafe-url';
import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import type { PageProps } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/route-type';

import { SubcollectionBobbleheadsAsync } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/async/subcollection-bobbleheads-async';
import { SubcollectionHeaderAsync } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/async/subcollection-header-async';
import { SubcollectionMetricsAsync } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/async/subcollection-metrics-async';
import { SubcollectionBobbleheadsSkeleton } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/skeletons/subcollection-bobbleheads-skeleton';
import { SubcollectionHeaderSkeleton } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/skeletons/subcollection-header-skeleton';
import { SubcollectionMetricsSkeleton } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/skeletons/subcollection-metrics-skeleton';
import { SubcollectionErrorBoundary } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/subcollection-error-boundary';
import { Route } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/route-type';
import { CollectionViewTracker } from '@/components/analytics/collection-view-tracker';
import { CommentSectionAsync } from '@/components/feature/comments/async/comment-section-async';
import { CommentSectionSkeleton } from '@/components/feature/comments/skeletons/comment-section-skeleton';
import { ContentLayout } from '@/components/layout/content-layout';
import { db } from '@/lib/db';
import { collections, subCollections } from '@/lib/db/schema';
import { SubcollectionsFacade } from '@/lib/facades/collections/subcollections.facade';
import { generateBreadcrumbSchema, generateCollectionPageSchema } from '@/lib/seo/jsonld.utils';
import { generatePageMetadata, serializeJsonLd } from '@/lib/seo/metadata.utils';
import { DEFAULT_SITE_METADATA, FALLBACK_METADATA } from '@/lib/seo/seo.constants';
import { extractPublicIdFromCloudinaryUrl, generateOpenGraphImageUrl } from '@/lib/utils/cloudinary.utils';

type SubcollectionPageProps = PageProps;

export default withParamValidation(SubcollectionPage, Route);

export async function generateMetadata({ routeParams }: SubcollectionPageProps): Promise<Metadata> {
  const { collectionSlug, subcollectionSlug } = await routeParams;

  // Fetch basic subcollection info
  const subcollectionResults = await db
    .select()
    .from(subCollections)
    .where(eq(subCollections.slug, subcollectionSlug))
    .limit(1);
  const subcollection = subcollectionResults[0];

  // Handle subcollection not found
  if (!subcollection) {
    return {
      description: 'Subcollection not found',
      robots: 'noindex, nofollow',
      title: 'Subcollection Not Found | Head Shakers',
    };
  }

  // Fetch parent collection info
  const collectionResults = await db
    .select()
    .from(collections)
    .where(eq(collections.id, subcollection.collectionId))
    .limit(1);
  const collection = collectionResults[0];

  if (!collection) {
    return {
      description: 'Collection not found',
      robots: 'noindex, nofollow',
      title: 'Collection Not Found | Head Shakers',
    };
  }

  // Fetch full subcollection data for SEO
  const seoData = await SubcollectionsFacade.getSubCollectionForPublicView(
    subcollection.collectionId,
    subcollection.id,
  );

  // Handle metadata not available
  if (!seoData) {
    return {
      description: 'Subcollection not found',
      robots: 'noindex, nofollow',
      title: 'Subcollection Not Found | Head Shakers',
    };
  }

  // Generate canonical URL for this subcollection
  const canonicalUrl = `${DEFAULT_SITE_METADATA.url}${$path({
    route: '/collections/[collectionSlug]/subcollection/[subcollectionSlug]',
    routeParams: { collectionSlug, subcollectionSlug },
  })}`;

  // Prepare cover image URL for social sharing
  let coverImage: string = FALLBACK_METADATA.imageUrl;

  if (seoData.coverImageUrl) {
    const publicId = extractPublicIdFromCloudinaryUrl(seoData.coverImageUrl);
    coverImage = generateOpenGraphImageUrl(publicId);
  } else if (seoData.featurePhoto) {
    const publicId = extractPublicIdFromCloudinaryUrl(seoData.featurePhoto);
    coverImage = generateOpenGraphImageUrl(publicId);
  }

  // Use subcollection description or fallback to a default
  const description =
    seoData.description ||
    `${seoData.name} - Part of ${seoData.collectionName} collection. Browse ${seoData.bobbleheadCount} bobbleheads in this subcollection`;

  // Private collections/subcollections should not be indexed
  const isPublic = collection.isPublic;

  // Generate page metadata with OG and Twitter cards
  return generatePageMetadata(
    'collection',
    {
      description,
      images: [coverImage],
      title: `${seoData.name} - ${seoData.collectionName}`,
      url: canonicalUrl,
    },
    {
      isIndexable: isPublic,
      isPublic,
      shouldIncludeOpenGraph: true,
      shouldIncludeTwitterCard: true,
      shouldUseTitleTemplate: true,
    },
  );
}

async function SubcollectionPage({ routeParams, searchParams }: SubcollectionPageProps) {
  const { collectionSlug, subcollectionSlug } = await routeParams;
  const resolvedSearchParams = await searchParams;

  // TODO: Add SubcollectionsFacade.getSubcollectionBySlug method
  // For now, query subcollection directly by slug since slugs are globally unique
  const results = await db
    .select()
    .from(subCollections)
    .where(eq(subCollections.slug, subcollectionSlug))
    .limit(1);
  const basicSubcollection = results[0];

  if (!basicSubcollection) {
    notFound();
  }

  const subcollectionId = basicSubcollection.id;
  const collectionId = basicSubcollection.collectionId;

  // Fetch parent collection info for breadcrumb
  const collectionResults = await db
    .select()
    .from(collections)
    .where(eq(collections.id, collectionId))
    .limit(1);
  const collection = collectionResults[0];

  // Fetch SEO data for JSON-LD schemas
  const seoData = await SubcollectionsFacade.getSubCollectionForPublicView(collectionId, subcollectionId);

  // Generate canonical URL for JSON-LD schemas
  const subcollectionUrl = `${DEFAULT_SITE_METADATA.url}${$path({
    route: '/collections/[collectionSlug]/subcollection/[subcollectionSlug]',
    routeParams: { collectionSlug, subcollectionSlug },
  })}`;

  // Generate CollectionPage schema for subcollection
  const subcollectionPageSchema =
    seoData ?
      generateCollectionPageSchema({
        description: seoData.description || undefined,
        itemsCount: seoData.bobbleheadCount,
        name: seoData.name,
        url: subcollectionUrl,
      })
    : null;

  // Generate Breadcrumb schema including parent collection
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: DEFAULT_SITE_METADATA.url },
    { name: 'Collections', url: `${DEFAULT_SITE_METADATA.url}/collections` },
    {
      name: seoData?.collectionName || collection?.name || 'Collection',
      url: `${DEFAULT_SITE_METADATA.url}${$path({
        route: '/collections/[collectionSlug]',
        routeParams: { collectionSlug },
      })}`,
    },
    { name: seoData?.name || basicSubcollection.name },
  ]);

  return (
    <CollectionViewTracker
      collectionId={collectionId}
      collectionSlug={collectionSlug}
      subcollectionId={subcollectionId}
      subcollectionSlug={subcollectionSlug}
    >
      {/* JSON-LD structured data */}
      {subcollectionPageSchema && (
        <script
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(subcollectionPageSchema) }}
          type={'application/ld+json'}
        />
      )}
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
        type={'application/ld+json'}
      />

      <div>
        {/* Header Section with Suspense */}
        <div className={'mt-3 border-b border-border'}>
          <ContentLayout>
            <SubcollectionErrorBoundary section={'header'}>
              <Suspense fallback={<SubcollectionHeaderSkeleton />}>
                <SubcollectionHeaderAsync collectionId={collectionId} subcollectionId={subcollectionId} />
              </Suspense>
            </SubcollectionErrorBoundary>
          </ContentLayout>
        </div>

        {/* Main Content */}
        <div className={'mt-4'}>
          <ContentLayout>
            <div className={'grid grid-cols-1 gap-8 lg:grid-cols-12'}>
              {/* Main Content Area */}
              <div className={'order-2 lg:order-1 lg:col-span-9'}>
                <SubcollectionErrorBoundary section={'bobbleheads'}>
                  <Suspense fallback={<SubcollectionBobbleheadsSkeleton />}>
                    <SubcollectionBobbleheadsAsync
                      collectionId={collectionId}
                      searchParams={resolvedSearchParams}
                      subcollectionId={subcollectionId}
                    />
                  </Suspense>
                </SubcollectionErrorBoundary>
              </div>

              {/* Sidebar */}
              <aside className={'order-1 flex flex-col gap-6 lg:order-2 lg:col-span-3'}>
                <SubcollectionErrorBoundary section={'metrics'}>
                  <Suspense fallback={<SubcollectionMetricsSkeleton />}>
                    <SubcollectionMetricsAsync
                      collectionId={collectionId}
                      subcollectionId={subcollectionId}
                    />
                  </Suspense>
                </SubcollectionErrorBoundary>
              </aside>
            </div>
          </ContentLayout>
        </div>

        {/* Comments Section */}
        <div className={'mt-8'}>
          <ContentLayout>
            <SubcollectionErrorBoundary section={'comments'}>
              <Suspense fallback={<CommentSectionSkeleton />}>
                <CommentSectionAsync targetId={subcollectionId} targetType={'subcollection'} />
              </Suspense>
            </SubcollectionErrorBoundary>
          </ContentLayout>
        </div>
      </div>
    </CollectionViewTracker>
  );
}
