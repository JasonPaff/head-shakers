import 'server-only';

import type { Metadata } from 'next';

import { $path } from 'next-typesafe-url';
import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { notFound } from 'next/navigation';
import { Fragment, Suspense } from 'react';

import type { LayoutVariant } from '@/app/(app)/user/[username]/collection/[collectionSlug]/components/bobblehead-grid';
import type { PageProps } from '@/app/(app)/user/[username]/collection/[collectionSlug]/route-type';

import { CollectionBobbleheadsAsync } from '@/app/(app)/user/[username]/collection/[collectionSlug]/components/async/collection-bobbleheads-async';
import { CollectionHeader } from '@/app/(app)/user/[username]/collection/[collectionSlug]/components/collection-header';
import { CollectionPageClientWrapper } from '@/app/(app)/user/[username]/collection/[collectionSlug]/components/collection-page-client-wrapper';
import { LayoutToggle } from '@/app/(app)/user/[username]/collection/[collectionSlug]/components/layout-toggle';
import { CollectionBobbleheadsSkeleton } from '@/app/(app)/user/[username]/collection/[collectionSlug]/components/skeletons/collection-bobbleheads-skeleton';
import { CollectionHeaderSkeleton } from '@/app/(app)/user/[username]/collection/[collectionSlug]/components/skeletons/collection-header-skeleton';
import { Route } from '@/app/(app)/user/[username]/collection/[collectionSlug]/route-type';
import { CommentSectionAsync } from '@/components/feature/comments/async/comment-section-async';
import { CommentSectionSkeleton } from '@/components/feature/comments/skeletons/comment-section-skeleton';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { generateBreadcrumbSchema, generateCollectionPageSchema } from '@/lib/seo/jsonld.utils';
import { generatePageMetadata, serializeJsonLd } from '@/lib/seo/metadata.utils';
import { DEFAULT_SITE_METADATA, FALLBACK_METADATA } from '@/lib/seo/seo.constants';
import { extractPublicIdFromCloudinaryUrl, generateOpenGraphImageUrl } from '@/lib/utils/cloudinary.utils';
import { getIsOwnerAsync, getUserIdAsync } from '@/utils/auth-utils';

type CollectionPageProps = PageProps;

export default withParamValidation(CollectionPage, Route);

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collectionSlug: string; username: string }>;
}): Promise<Metadata> {
  const { collectionSlug, username } = await params;

  // Fetch collection by username and slug
  const result = await CollectionsFacade.getCollectionByUsernameAndSlugAsync(username, collectionSlug);

  // Handle collection not found
  if (!result) {
    return {
      description: 'Collection not found',
      robots: 'noindex, nofollow',
      title: 'Collection Not Found | Head Shakers',
    };
  }

  // Fetch full SEO metadata
  const seoData = await CollectionsFacade.getCollectionSeoMetadata(collectionSlug, result.user.id);

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

  // Extract layout from search params with default
  const layoutVariant: LayoutVariant = resolvedSearchParams?.layout || 'grid';

  const currentUserId = await getUserIdAsync();

  // Fetch collection by username and slug
  const result = await CollectionsFacade.getCollectionByUsernameAndSlugAsync(
    username,
    collectionSlug,
    currentUserId || undefined,
  );

  if (!result || !result.collection) {
    notFound();
  }

  const { collection, user } = result;
  const collectionId = collection.id;

  // Fetch like data
  const likeData = await SocialFacade.getContentLikeDataAsync(
    collectionId,
    'collection',
    currentUserId || undefined,
  );

  // Compute permission flags
  const isOwner = await getIsOwnerAsync(collection.userId);

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
    { name: username, url: `${DEFAULT_SITE_METADATA.url}/user/${username}` },
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

      <CollectionPageClientWrapper collection={collection} collectionId={collectionId}>
        {/* Header Section with Suspense */}
        <Suspense fallback={<CollectionHeaderSkeleton />}>
          <CollectionHeader
            collection={collection}
            isOwner={isOwner}
            likeData={likeData}
            user={{ avatarUrl: user.avatarUrl, username: user.username }}
          />
        </Suspense>

        {/* Layout Toggle */}
        <LayoutToggle className={'mb-6'} />

        {/* Bobbleheads Section with Suspense */}
        <Suspense fallback={<CollectionBobbleheadsSkeleton />}>
          <CollectionBobbleheadsAsync
            collectionId={collectionId}
            collectionSlug={collectionSlug}
            isOwner={isOwner}
            layoutVariant={layoutVariant}
            searchParams={resolvedSearchParams}
          />
        </Suspense>

        {/* Comments Section with Suspense */}
        <Suspense fallback={<CommentSectionSkeleton />}>
          <CommentSectionAsync targetId={collectionId} targetType={'collection'} />
        </Suspense>
      </CollectionPageClientWrapper>
    </Fragment>
  );
}
