import type { Metadata } from 'next';

import { $path } from 'next-typesafe-url';
import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { notFound } from 'next/navigation';
import { Fragment, Suspense } from 'react';

import type { PageProps } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/route-type';

import { BobbleheadFeatureCardAsync } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-feature-card-async';
import { BobbleheadHeaderAsync } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-header-async';
import { BobbleheadNavigationAsync } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-navigation-async';
import { BobbleheadPhotoGalleryAsync } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-photo-gallery-async';
import { BobbleheadErrorBoundary } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-error-boundary';
import { BobbleheadPageClientWrapper } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-page-client-wrapper';
import { BobbleheadFeatureCardSkeleton } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-feature-card-skeleton';
import { BobbleheadHeaderSkeleton } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-header-skeleton';
import { BobbleheadNavigationSkeleton } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-navigation-skeleton';
import { BobbleheadPhotoGallerySkeleton } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-photo-gallery-skeleton';
import { Route } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/route-type';
import { CommentSectionAsync } from '@/components/feature/comments/async/comment-section-async';
import { CommentSectionSkeleton } from '@/components/feature/comments/skeletons/comment-section-skeleton';
import { ContentLayout } from '@/components/layout/content-layout';
import { Conditional } from '@/components/ui/conditional';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { generateBreadcrumbSchema, generateProductSchema } from '@/lib/seo/jsonld.utils';
import { generatePageMetadata, serializeJsonLd } from '@/lib/seo/metadata.utils';
import { DEFAULT_SITE_METADATA, FALLBACK_METADATA } from '@/lib/seo/seo.constants';
import { extractPublicIdFromCloudinaryUrl, generateOpenGraphImageUrl } from '@/lib/utils/cloudinary.utils';
import { getIsOwnerAsync, getUserIdAsync } from '@/utils/optional-auth-utils';

type ItemPageProps = PageProps;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bobbleheadSlug: string }>;
}): Promise<Metadata> {
  const { bobbleheadSlug } = await params;

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
  const canonicalUrl = `${DEFAULT_SITE_METADATA.url}${$path({ route: '/bobbleheads/[bobbleheadSlug]', routeParams: { bobbleheadSlug } })}`;

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

async function ItemPage({ routeParams, searchParams }: ItemPageProps) {
  const { bobbleheadSlug } = await routeParams;
  const { collectionId } = await searchParams;
  const currentUserId = await getUserIdAsync();

  const basicBobblehead = await BobbleheadsFacade.getBobbleheadBySlug(
    bobbleheadSlug,
    currentUserId ?? undefined,
  );

  if (!basicBobblehead) {
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
  const canEdit = isOwner;
  const canDelete = isOwner;

  // Fetch user collections for edit dialog (only if owner)
  let collections: Array<{ id: string; name: string }> = [];
  if (isOwner && currentUserId) {
    const userCollections =
      (await CollectionsFacade.getCollectionsByUser(currentUserId, {}, currentUserId)) ?? [];
    collections = userCollections.map((collection) => ({
      id: collection.id,
      name: collection.name,
    }));
  }

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
        { name: 'Bobbleheads', url: `${DEFAULT_SITE_METADATA.url}/bobbleheads` },
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
        canDelete={canDelete}
        canEdit={canEdit}
        collectionId={basicBobblehead.collectionId ?? undefined}
        collections={collections}
        isOwner={isOwner}
        likeData={likeData}
      >
        {/* Header Section */}
        <div className={'border-b border-border'}>
          <ContentLayout>
            <BobbleheadErrorBoundary section={'header'}>
              <Suspense fallback={<BobbleheadHeaderSkeleton />}>
                <BobbleheadHeaderAsync bobbleheadId={bobbleheadId} />
              </Suspense>
            </BobbleheadErrorBoundary>
          </ContentLayout>
        </div>

        {/* Navigation Section */}
        <Conditional isCondition={!!collectionId}>
          <div className={'mt-4'}>
            <ContentLayout>
              <BobbleheadErrorBoundary section={'navigation'}>
                <Suspense fallback={<BobbleheadNavigationSkeleton />}>
                  <BobbleheadNavigationAsync
                    bobbleheadId={bobbleheadId}
                    collectionId={collectionId ?? null}
                  />
                </Suspense>
              </BobbleheadErrorBoundary>
            </ContentLayout>
          </div>
        </Conditional>

        {/* Feature Card Section */}
        <div className={'mt-4'}>
          <ContentLayout>
            <BobbleheadErrorBoundary section={'feature'}>
              <Suspense fallback={<BobbleheadFeatureCardSkeleton />}>
                <BobbleheadFeatureCardAsync bobbleheadId={bobbleheadId} />
              </Suspense>
            </BobbleheadErrorBoundary>
          </ContentLayout>
        </div>

        {/* Photo Gallery Section */}
        <ContentLayout>
          <BobbleheadErrorBoundary section={'gallery'}>
            <Suspense fallback={<BobbleheadPhotoGallerySkeleton />}>
              <BobbleheadPhotoGalleryAsync bobbleheadId={bobbleheadId} />
            </Suspense>
          </BobbleheadErrorBoundary>
        </ContentLayout>

        {/* Comments Section */}
        <div className={'mt-8'}>
          <ContentLayout>
            <BobbleheadErrorBoundary section={'comments'}>
              <Suspense fallback={<CommentSectionSkeleton />}>
                <CommentSectionAsync targetId={bobbleheadId} targetType={'bobblehead'} />
              </Suspense>
            </BobbleheadErrorBoundary>
          </ContentLayout>
        </div>

        {/* Bottom Navigation Section */}
        <Conditional isCondition={!!collectionId}>
          <div className={'mt-8'}>
            <ContentLayout>
              <BobbleheadErrorBoundary section={'navigation'}>
                <Suspense fallback={<BobbleheadNavigationSkeleton />}>
                  <BobbleheadNavigationAsync
                    bobbleheadId={bobbleheadId}
                    collectionId={collectionId ?? null}
                    isKeyboardNavigationEnabled={false}
                  />
                </Suspense>
              </BobbleheadErrorBoundary>
            </ContentLayout>
          </div>
        </Conditional>
      </BobbleheadPageClientWrapper>
    </Fragment>
  );
}

export default withParamValidation(ItemPage, Route);
