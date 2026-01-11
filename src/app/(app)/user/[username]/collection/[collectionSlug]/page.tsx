/**
 * User Collection View Page (Server Component)
 *
 * Public view for a specific user's collection at /user/[username]/collection/[collectionSlug].
 * This page displays collection metadata, bobblehead grid, and search/sort controls.
 *
 * Features:
 * - Server-side data fetching via facades
 * - SEO metadata generation with OG/Twitter cards
 * - ISR with 60-second revalidation
 * - Suspense streaming for progressive loading
 * - Type-safe routing with next-typesafe-url
 */
import type { Metadata } from 'next';

import { $path } from 'next-typesafe-url';
import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { notFound } from 'next/navigation';
import { Fragment, Suspense } from 'react';

import type { PageProps } from '@/app/(app)/user/[username]/collection/[collectionSlug]/route-type';

import { CollectionBobbleheadsAsync } from '@/app/(app)/user/[username]/collection/[collectionSlug]/components/async/collection-bobbleheads-async';
import { CollectionHeaderAsync } from '@/app/(app)/user/[username]/collection/[collectionSlug]/components/async/collection-header-async';
import { CollectionBobbleheadsSkeleton } from '@/app/(app)/user/[username]/collection/[collectionSlug]/components/skeletons/collection-bobbleheads-skeleton';
import { CollectionHeaderSkeleton } from '@/app/(app)/user/[username]/collection/[collectionSlug]/components/skeletons/collection-header-skeleton';
import { Route } from '@/app/(app)/user/[username]/collection/[collectionSlug]/route-type';
import { CommentSectionAsync } from '@/components/feature/comments/async/comment-section-async';
import { CommentSectionSkeleton } from '@/components/feature/comments/skeletons/comment-section-skeleton';
import { ContentLayout } from '@/components/layout/content-layout';
import { ErrorBoundary } from '@/components/ui/error-boundary/error-boundary';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { generateBreadcrumbSchema, generateCollectionPageSchema } from '@/lib/seo/jsonld.utils';
import { generatePageMetadata, serializeJsonLd } from '@/lib/seo/metadata.utils';
import { DEFAULT_SITE_METADATA, FALLBACK_METADATA } from '@/lib/seo/seo.constants';
import { extractPublicIdFromCloudinaryUrl, generateOpenGraphImageUrl } from '@/lib/utils/cloudinary.utils';

type CollectionPageProps = PageProps;

export const revalidate = 60;

export default withParamValidation(CollectionPage, Route);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collectionSlug: string; username: string }>;
}): Promise<Metadata> {
  const { collectionSlug, username } = await params;

  // Resolve username to user
  const user = await UsersFacade.getUserByUsername(username);

  if (!user) {
    return {
      description: 'Collection not found',
      robots: 'noindex, nofollow',
      title: 'Collection Not Found | Head Shakers',
    };
  }

  // Fetch collection SEO metadata
  const seoData = await CollectionsFacade.getCollectionSeoMetadata(collectionSlug, user.id);

  if (!seoData) {
    return {
      description: 'Collection not found',
      robots: 'noindex, nofollow',
      title: 'Collection Not Found | Head Shakers',
    };
  }

  // Generate canonical URL for this collection
  const canonicalUrl = `${DEFAULT_SITE_METADATA.url}${$path({
    route: '/user/[username]/collection/[collectionSlug]',
    routeParams: { collectionSlug, username },
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
    `${seoData.name} by ${seoData.owner.username} - Browse ${seoData.itemCount} bobbleheads in this collection`;

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
  const { collectionSlug, username } = await routeParams;
  const resolvedSearchParams = await searchParams;

  // Resolve username to user
  const user = await UsersFacade.getUserByUsername(username);

  if (!user) {
    notFound();
  }

  // Get collection by slug
  const collection = await CollectionsFacade.getCollectionBySlug(collectionSlug, user.id);

  if (!collection) {
    notFound();
  }

  const collectionId = collection.id;

  // Fetch SEO data for JSON-LD schemas
  const seoData = await CollectionsFacade.getCollectionSeoMetadata(collectionSlug, user.id);

  // Generate canonical URL for JSON-LD schemas
  const collectionUrl = `${DEFAULT_SITE_METADATA.url}${$path({
    route: '/user/[username]/collection/[collectionSlug]',
    routeParams: { collectionSlug, username },
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
    { name: seoData?.name || collection.name },
  ]);

  return (
    <Fragment>
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

      {/* Page Content */}
      <div className={'container mx-auto max-w-7xl px-4 py-8'}>
        {/* Header Section with Suspense */}
        <Suspense fallback={<CollectionHeaderSkeleton />}>
          <CollectionHeaderAsync collectionId={collectionId} userId={user.id} />
        </Suspense>

        {/* Bobbleheads Grid with Suspense */}
        <Suspense fallback={<CollectionBobbleheadsSkeleton />}>
          <CollectionBobbleheadsAsync
            collectionId={collectionId}
            collectionSlug={collectionSlug}
            ownerUsername={username}
            searchParams={{
              search: resolvedSearchParams.search,
              sortBy: resolvedSearchParams.sort,
            }}
          />
        </Suspense>

        {/* Comments Section */}
        <div className={'mt-8'}>
          <ContentLayout>
            <ErrorBoundary name={'collection-comments'}>
              <Suspense fallback={<CommentSectionSkeleton />}>
                <CommentSectionAsync targetId={collectionId} targetType={'collection'} />
              </Suspense>
            </ErrorBoundary>
          </ContentLayout>
        </div>
      </div>
    </Fragment>
  );
}
