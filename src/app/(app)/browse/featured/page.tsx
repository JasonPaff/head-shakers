import type { Metadata } from 'next';

import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment, Suspense } from 'react';

import { FeaturedHeroAsync } from '@/app/(app)/browse/featured/components/async/featured-hero-async';
import { FeaturedTabbedContentAsync } from '@/app/(app)/browse/featured/components/async/featured-tabbed-content-async';
import { FeaturedHeroSkeleton } from '@/app/(app)/browse/featured/components/skeletons/featured-hero-skeleton';
import { FeaturedTabbedContentSkeleton } from '@/app/(app)/browse/featured/components/skeletons/featured-tabbed-content-skeleton';
import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary/error-boundary';
import { generateCollectionPageSchema } from '@/lib/seo/jsonld.utils';
import { generatePageMetadata, serializeJsonLd } from '@/lib/seo/metadata.utils';
import { DEFAULT_SITE_METADATA } from '@/lib/seo/seo.constants';
import { getUserIdAsync } from '@/utils/auth-utils';

export default async function FeaturedPage() {
  const currentUserId = await getUserIdAsync();

  // Generate JSON-LD schema for the featured content listing page
  const collectionPageSchema = generateCollectionPageSchema({
    description: 'Discover the best collections, bobbleheads, and collectors from our community showcase',
    name: 'Featured Collections & Bobbleheads',
    url: `${DEFAULT_SITE_METADATA.url}/browse/featured`,
  });

  return (
    <Fragment>
      {/* JSON-LD Structured Data */}
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionPageSchema) }}
        type={'application/ld+json'}
      />

      <div className={'container mx-auto px-4 py-8'}>
        {/* Static Header - renders immediately */}
        <div className={'mb-8'}>
          <h1 className={'text-3xl font-bold tracking-tight'}>Featured Content</h1>
          <p className={'mt-2 text-muted-foreground'}>
            Discover the best collections, bobbleheads, and collectors from our community
          </p>
        </div>

        <div className={'space-y-8'}>
          {/* Hero Banner Section with Suspense */}
          <ErrorBoundary name={'featured-hero'}>
            <Suspense fallback={<FeaturedHeroSkeleton />}>
              <FeaturedHeroAsync currentUserId={currentUserId} isTrackViews={true} />
            </Suspense>
          </ErrorBoundary>

          {/* Tabbed Content Section with Suspense */}
          <ErrorBoundary name={'featured-tabbed-content'}>
            <Suspense fallback={<FeaturedTabbedContentSkeleton />}>
              <FeaturedTabbedContentAsync currentUserId={currentUserId} isTrackViews={true} />
            </Suspense>
          </ErrorBoundary>

          {/* Static Call to Action - renders immediately */}
          <section className={'rounded-lg bg-muted/30 p-8 text-center'}>
            <h3 className={'mb-2 text-xl font-semibold'}>Want to be featured?</h3>
            <p className={'mb-4 text-muted-foreground'}>
              Share your amazing collections and connect with other collectors to get noticed by our community
            </p>
            <div className={'flex justify-center gap-3'}>
              <AuthContent
                fallback={
                  <div className={'space-x-2'}>
                    <Button asChild>
                      <SignInButton mode={'modal'}>Sign In</SignInButton>
                    </Button>
                    <Button asChild>
                      <SignUpButton mode={'modal'}>Sign Up</SignUpButton>
                    </Button>
                  </div>
                }
              >
                <Button asChild>
                  <Link href={$path({ route: '/dashboard/collection' })}>Create Collection</Link>
                </Button>
                <Button asChild variant={'outline'}>
                  <Link href={$path({ route: '/dashboard/collection', searchParams: { add: true } })}>
                    Add Bobblehead
                  </Link>
                </Button>
              </AuthContent>
            </div>
          </section>
        </div>
      </div>
    </Fragment>
  );
}

export function generateMetadata(): Metadata {
  return generatePageMetadata(
    'collection',
    {
      description:
        'Discover featured bobblehead collections, rare items, and top collectors in our community showcase',
      title: 'Featured Collections & Bobbleheads',
      url: `${DEFAULT_SITE_METADATA.url}/browse/featured`,
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
