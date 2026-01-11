import type { Metadata } from 'next';

import { $path } from 'next-typesafe-url';
import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { notFound } from 'next/navigation';
import { Fragment, Suspense } from 'react';

import { CommentSectionAsync } from '@/components/feature/comments/async/comment-section-async';
import { CommentSectionSkeleton } from '@/components/feature/comments/skeletons/comment-section-skeleton';
import { ContentLayout } from '@/components/layout/content-layout';
import { ErrorBoundary } from '@/components/ui/error-boundary/error-boundary';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { generateBreadcrumbSchema, generateProductSchema } from '@/lib/seo/jsonld.utils';
import { generatePageMetadata, serializeJsonLd } from '@/lib/seo/metadata.utils';
import { DEFAULT_SITE_METADATA, FALLBACK_METADATA } from '@/lib/seo/seo.constants';
import { extractPublicIdFromCloudinaryUrl, generateOpenGraphImageUrl } from '@/lib/utils/cloudinary.utils';
import { getIsOwnerAsync, getUserIdAsync } from '@/utils/auth-utils';

import type { PageProps } from './route-type';

import { BobbleheadFeatureCardAsync } from './components/async/bobblehead-feature-card-async';
import { BobbleheadHeaderAsync } from './components/async/bobblehead-header-async';
import { BobbleheadNavigationAsync } from './components/async/bobblehead-navigation-async';
import { BobbleheadPhotoGalleryAsync } from './components/async/bobblehead-photo-gallery-async';
import { BobbleheadPageClientWrapper } from './components/bobblehead-page-client-wrapper';
import { BobbleheadFeatureCardSkeleton } from './components/skeletons/bobblehead-feature-card-skeleton';
import { BobbleheadHeaderSkeleton } from './components/skeletons/bobblehead-header-skeleton';
import { BobbleheadNavigationSkeleton } from './components/skeletons/bobblehead-navigation-skeleton';
import { BobbleheadPhotoGallerySkeleton } from './components/skeletons/bobblehead-photo-gallery-skeleton';
import { Route } from './route-type';

type BobbleheadPageProps = PageProps;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bobbleheadSlug: string; collectionSlug: string; username: string }>;
}): Promise<Metadata> {
  const { bobbleheadSlug, collectionSlug, username } = await params;

  // Resolve username to user
  const user = await UsersFacade.getUserByUsername(username);

  if (!user) {
    return {
      description: 'Bobblehead not found',
      robots: 'noindex, nofollow',
      title: 'Bobblehead Not Found | Head Shakers',
    };
  }

  // Fetch bobblehead SEO metadata
  const bobblehead = await BobbleheadsFacade.getBobbleheadSeoMetadata(bobbleheadSlug);

  // Handle bobblehead not found
  if (!bobblehead) {
    return {
      description: 'Bobblehead not found',
      robots: 'noindex, nofollow',
      title: 'Bobblehead Not Found | Head Shakers',
    };
  }

  // Generate canonical URL for this bobblehead
  const canonicalUrl = `${DEFAULT_SITE_METADATA.url}${$path({
    route: '/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]',
    routeParams: { bobbleheadSlug, collectionSlug, username },
    searchParams: {},
  })}`;

  // Prepare primary image URL for social sharing
  let productImage: string = FALLBACK_METADATA.imageUrl;

  if (bobblehead.primaryImage) {
    // Extract Cloudinary public ID from image URL and optimize for Open Graph
    const publicId = extractPublicIdFromCloudinaryUrl(bobblehead.primaryImage);
    productImage = generateOpenGraphImageUrl(publicId);
  }

  // Use description or generate fallback with owner attribution
  const description =
    bobblehead.description ||
    `${bobblehead.name} - From ${bobblehead.owner.username}'s collection on Head Shakers`;

  // Generate page metadata with OG and Twitter cards
  return generatePageMetadata(
    'bobblehead',
    {
      category: bobblehead.category || undefined,
      description,
      images: [productImage],
      title: bobblehead.name,
      url: canonicalUrl,
    },
    {
      isPublic: true,
      shouldIncludeOpenGraph: true,
      shouldIncludeTwitterCard: true,
      shouldUseTitleTemplate: true,
    },
  );
}

export const revalidate = 60;

async function BobbleheadPage({ routeParams }: BobbleheadPageProps) {
  const { bobbleheadSlug, collectionSlug, username } = await routeParams;
  const currentUserId = await getUserIdAsync();

  // Resolve username to user
  const user = await UsersFacade.getUserByUsername(username);

  if (!user) {
    notFound();
  }

  // Get collection by slug and owner
  const collection = await CollectionsFacade.getCollectionBySlug(collectionSlug, user.id);

  if (!collection) {
    notFound();
  }

  const collectionId = collection.id;

  // Get the bobblehead
  const basicBobblehead = await BobbleheadsFacade.getBobbleheadBySlug(
    bobbleheadSlug,
    currentUserId ?? undefined,
  );

  if (!basicBobblehead) {
    notFound();
  }

  // Validate bobblehead belongs to this collection
  if (basicBobblehead.collectionId !== collectionId) {
    notFound();
  }

  const bobbleheadId = basicBobblehead.id;

  // Fetch bobblehead with relations and like data for sticky header
  const [bobblehead, likeData] = await Promise.all([
    BobbleheadsFacade.getBobbleheadWithRelations(bobbleheadId, currentUserId || undefined),
    SocialFacade.getContentLikeData(bobbleheadId, 'bobblehead', currentUserId || undefined),
  ]);

  if (!bobblehead) {
    notFound();
  }

  // Compute permission flags
  const isOwner = await getIsOwnerAsync(bobblehead.userId);

  // Fetch SEO metadata for JSON-LD schemas
  const seoMetadata = await BobbleheadsFacade.getBobbleheadSeoMetadata(bobbleheadSlug);

  // Generate Product schema for bobblehead
  const productSchema =
    seoMetadata ?
      generateProductSchema({
        category: seoMetadata.category || undefined,
        dateCreated:
          seoMetadata.createdAt instanceof Date ? seoMetadata.createdAt.toISOString()
          : typeof seoMetadata.createdAt === 'string' ? seoMetadata.createdAt
          : new Date(seoMetadata.createdAt).toISOString(),
        description: seoMetadata.description || undefined,
        image: seoMetadata.primaryImage ? [seoMetadata.primaryImage] : undefined,
        name: seoMetadata.name,
      })
    : null;

  // Generate Breadcrumb schema for navigation context
  const breadcrumbSchema =
    seoMetadata ?
      generateBreadcrumbSchema([
        { name: 'Home', url: DEFAULT_SITE_METADATA.url },
        {
          name: collection.name,
          url: `${DEFAULT_SITE_METADATA.url}${$path({
            route: '/user/[username]/collection/[collectionSlug]',
            routeParams: { collectionSlug, username },
          })}`,
        },
        { name: seoMetadata.name }, // Current page - no URL
      ])
    : null;

  return (
    <Fragment>
      {/* JSON-LD structured data */}
      {productSchema && (
        <script
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(productSchema) }}
          type={'application/ld+json'}
        />
      )}
      {breadcrumbSchema && (
        <script
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
          type={'application/ld+json'}
        />
      )}

      <BobbleheadPageClientWrapper
        bobblehead={bobblehead}
        bobbleheadId={bobbleheadId}
        bobbleheadSlug={bobbleheadSlug}
        collectionId={collectionId}
        collectionSlug={collectionSlug}
        isOwner={isOwner}
        likeData={likeData}
        ownerUsername={username}
      >
        {/* Header Section */}
        <div className={'border-b border-border'}>
          <ContentLayout>
            <ErrorBoundary name={'bobblehead-header'}>
              <Suspense fallback={<BobbleheadHeaderSkeleton />}>
                <BobbleheadHeaderAsync bobbleheadId={bobbleheadId} />
              </Suspense>
            </ErrorBoundary>
          </ContentLayout>
        </div>

        {/* Navigation Section - Always shown since we're in collection context */}
        <div className={'mt-4'}>
          <ContentLayout>
            <ErrorBoundary name={'bobblehead-navigation'}>
              <Suspense fallback={<BobbleheadNavigationSkeleton />}>
                <BobbleheadNavigationAsync
                  bobbleheadId={bobbleheadId}
                  collectionId={collectionId}
                  collectionSlug={collectionSlug}
                  ownerUsername={username}
                />
              </Suspense>
            </ErrorBoundary>
          </ContentLayout>
        </div>

        {/* Feature Card Section */}
        <div className={'mt-4'}>
          <ContentLayout>
            <ErrorBoundary name={'bobblehead-feature'}>
              <Suspense fallback={<BobbleheadFeatureCardSkeleton />}>
                <BobbleheadFeatureCardAsync bobbleheadId={bobbleheadId} />
              </Suspense>
            </ErrorBoundary>
          </ContentLayout>
        </div>

        {/* Photo Gallery Section */}
        <ContentLayout>
          <ErrorBoundary name={'bobblehead-gallery'}>
            <Suspense fallback={<BobbleheadPhotoGallerySkeleton />}>
              <BobbleheadPhotoGalleryAsync bobbleheadId={bobbleheadId} />
            </Suspense>
          </ErrorBoundary>
        </ContentLayout>

        {/* Comments Section */}
        <div className={'mt-8'}>
          <ContentLayout>
            <ErrorBoundary name={'bobblehead-comments'}>
              <Suspense fallback={<CommentSectionSkeleton />}>
                <CommentSectionAsync targetId={bobbleheadId} targetType={'bobblehead'} />
              </Suspense>
            </ErrorBoundary>
          </ContentLayout>
        </div>
      </BobbleheadPageClientWrapper>
    </Fragment>
  );
}

export default withParamValidation(BobbleheadPage, Route);
