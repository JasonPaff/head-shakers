import type { Metadata } from 'next';

import { eq } from 'drizzle-orm';
import { $path } from 'next-typesafe-url';
import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import type { PageProps } from '@/app/(app)/collections/[collectionSlug]/(collection)/route-type';

import { CollectionBobbleheadsAsync } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/async/collection-bobbleheads-async';
import { CollectionSidebarSubcollectionsAsync } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/async/collection-sidebar-subcollections-async';
import { CollectionStatsAsync } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/async/collection-stats-async';
import { CollectionErrorBoundary } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/collection-error-boundary';
import { CollectionHeader } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/collection-header';
import { CollectionBobbleheadsSkeleton } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/skeletons/collection-bobbleheads-skeleton';
import { CollectionHeaderSkeleton } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/skeletons/collection-header-skeleton';
import { CollectionStatsSkeleton } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/skeletons/collection-stats-skeleton';
import { SubcollectionsSkeleton } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/skeletons/subcollections-skeleton';
import { Route } from '@/app/(app)/collections/[collectionSlug]/(collection)/route-type';
import { CollectionViewTracker } from '@/components/analytics/collection-view-tracker';
import { CollectionStickyHeader } from '@/components/feature/collection/collection-sticky-header';
import { CommentSectionAsync } from '@/components/feature/comments/async/comment-section-async';
import { CommentSectionSkeleton } from '@/components/feature/comments/skeletons/comment-section-skeleton';
import { StickyHeaderWrapper } from '@/components/feature/sticky-header/sticky-header-wrapper';
import { ContentLayout } from '@/components/layout/content-layout';
import { db } from '@/lib/db';
import { collections } from '@/lib/db/schema';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { generateBreadcrumbSchema, generateCollectionPageSchema } from '@/lib/seo/jsonld.utils';
import { generatePageMetadata, serializeJsonLd } from '@/lib/seo/metadata.utils';
import { DEFAULT_SITE_METADATA, FALLBACK_METADATA } from '@/lib/seo/seo.constants';
import { extractPublicIdFromCloudinaryUrl, generateOpenGraphImageUrl } from '@/lib/utils/cloudinary.utils';
import { checkIsOwner, getOptionalUserId } from '@/utils/optional-auth-utils';

type CollectionPageProps = PageProps;

export default withParamValidation(CollectionPage, Route);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collectionSlug: string }>;
}): Promise<Metadata> {
  const { collectionSlug } = await params;

  // Fetch basic collection info to get userId
  const results = await db.select().from(collections).where(eq(collections.slug, collectionSlug)).limit(1);
  const collection = results[0];

  // Handle collection not found
  if (!collection) {
    return {
      description: 'Collection not found',
      robots: 'noindex, nofollow',
      title: 'Collection Not Found | Head Shakers',
    };
  }

  // Fetch full SEO metadata
  const seoData = await CollectionsFacade.getCollectionSeoMetadata(collectionSlug, collection.userId);

  // Handle metadata not available
  if (!seoData) {
    return {
      description: 'Collection not found',
      robots: 'noindex, nofollow',
      title: 'Collection Not Found | Head Shakers',
    };
  }

  // Generate canonical URL for this collection
  const canonicalUrl = `${DEFAULT_SITE_METADATA.url}${$path({
    route: '/collections/[collectionSlug]',
    routeParams: { collectionSlug },
  })}`;

  // Prepare cover image URL for social sharing
  let coverImage: string = FALLBACK_METADATA.imageUrl;

  if (seoData.coverImage) {
    const publicId = extractPublicIdFromCloudinaryUrl(seoData.coverImage);
    coverImage = generateOpenGraphImageUrl(publicId);
  }

  // Use collection description or fallback to a default
  const description =
    seoData.description ||
    `${seoData.name} by ${seoData.owner.displayName} - Browse ${seoData.itemCount} bobbleheads in this collection`;

  // Private collections should not be indexed
  const isPublic = seoData.isPublic;

  // Generate page metadata with OG and Twitter cards
  return generatePageMetadata(
    'collection',
    {
      creatorHandle: seoData.owner.username ? `@${seoData.owner.username}` : undefined,
      description,
      images: [coverImage],
      title: seoData.name,
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

async function CollectionPage({ routeParams, searchParams }: CollectionPageProps) {
  const { collectionSlug } = await routeParams;
  const resolvedSearchParams = await searchParams;

  // only fetch basic collection info for the initial render to verify it exists
  // Note: slugs are globally unique, so we can query by slug alone
  // TODO: Add a proper getCollectionBySlugOnly method to the facade
  const results = await db.select().from(collections).where(eq(collections.slug, collectionSlug)).limit(1);
  const collection = results[0];

  if (!collection) {
    notFound();
  }

  const collectionId = collection.id;
  const currentUserId = await getOptionalUserId();

  // Fetch collection data and like data for both headers
  const [publicCollection, likeData] = await Promise.all([
    CollectionsFacade.getCollectionForPublicView(collectionId, currentUserId || undefined),
    SocialFacade.getContentLikeData(collectionId, 'collection', currentUserId || undefined),
  ]);

  if (!publicCollection) {
    notFound();
  }

  // Compute permission flags
  const isOwner = await checkIsOwner(publicCollection.userId);
  const canEdit = isOwner;
  const canDelete = isOwner;

  // Fetch SEO data for JSON-LD schemas
  const seoData = await CollectionsFacade.getCollectionSeoMetadata(collectionSlug, collection.userId);

  // Generate canonical URL for JSON-LD schemas
  const collectionUrl = `${DEFAULT_SITE_METADATA.url}${$path({
    route: '/collections/[collectionSlug]',
    routeParams: { collectionSlug },
  })}`;

  // Generate CollectionPage schema
  const collectionPageSchema =
    seoData ?
      generateCollectionPageSchema({
        description: seoData.description || undefined,
        itemsCount: seoData.itemCount,
        name: seoData.name,
        url: collectionUrl,
      })
    : null;

  // Generate Breadcrumb schema for navigation context
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: DEFAULT_SITE_METADATA.url },
    { name: 'Collections', url: `${DEFAULT_SITE_METADATA.url}/collections` },
    { name: seoData?.name || collection.name },
  ]);

  return (
    <CollectionViewTracker collectionId={collectionId} collectionSlug={collectionSlug}>
      {/* JSON-LD structured data */}
      {collectionPageSchema && (
        <script
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionPageSchema) }}
          type={'application/ld+json'}
        />
      )}
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
        type={'application/ld+json'}
      />

      <StickyHeaderWrapper>
        {(isSticky) => (
          <div>
            {/* Sticky Header - shown when scrolling */}
            {isSticky && (
              <CollectionStickyHeader
                canDelete={canDelete}
                canEdit={canEdit}
                collection={publicCollection}
                collectionId={publicCollection.id}
                collectionSlug={publicCollection.slug}
                isLiked={likeData?.isLiked ?? false}
                isOwner={isOwner}
                likeCount={likeData?.likeCount ?? 0}
                title={publicCollection.name}
              />
            )}

            {/* Header Section with Suspense */}
            <div className={'mt-3 border-b border-border'}>
              <ContentLayout>
                <CollectionErrorBoundary section={'header'}>
                  <Suspense fallback={<CollectionHeaderSkeleton />}>
                    <CollectionHeader collection={publicCollection} likeData={likeData} />
                  </Suspense>
                </CollectionErrorBoundary>
              </ContentLayout>
            </div>

            {/* Main Content */}
            <div className={'mt-4'}>
              <ContentLayout>
                <div className={'grid grid-cols-1 gap-8 lg:grid-cols-12'}>
                  {/* Main Content Area */}
                  <div className={'lg:col-span-9'}>
                    <CollectionErrorBoundary section={'bobbleheads'}>
                      <Suspense fallback={<CollectionBobbleheadsSkeleton />}>
                        <CollectionBobbleheadsAsync
                          collectionId={collectionId}
                          searchParams={resolvedSearchParams}
                        />
                      </Suspense>
                    </CollectionErrorBoundary>
                  </div>

                  {/* Sidebar */}
                  <aside className={'flex flex-col gap-6 lg:col-span-3'}>
                    <CollectionErrorBoundary section={'stats'}>
                      <Suspense fallback={<CollectionStatsSkeleton />}>
                        <CollectionStatsAsync collectionId={collectionId} />
                      </Suspense>
                    </CollectionErrorBoundary>

                    <CollectionErrorBoundary section={'subcollections'}>
                      <Suspense fallback={<SubcollectionsSkeleton />}>
                        <CollectionSidebarSubcollectionsAsync collectionId={collectionId} />
                      </Suspense>
                    </CollectionErrorBoundary>
                  </aside>
                </div>
              </ContentLayout>
            </div>

            {/* Comments Section */}
            <div className={'mt-8'}>
              <ContentLayout>
                <CollectionErrorBoundary section={'comments'}>
                  <Suspense fallback={<CommentSectionSkeleton />}>
                    <CommentSectionAsync targetId={collectionId} targetType={'collection'} />
                  </Suspense>
                </CollectionErrorBoundary>
              </ContentLayout>
            </div>
          </div>
        )}
      </StickyHeaderWrapper>
    </CollectionViewTracker>
  );
}
