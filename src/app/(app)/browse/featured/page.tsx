import type { Metadata } from 'next';

import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Suspense } from 'react';

import { FeaturedHeroAsync } from '@/app/(app)/browse/featured/components/async/featured-hero-async';
import { FeaturedTabbedContentAsync } from '@/app/(app)/browse/featured/components/async/featured-tabbed-content-async';
import { FeaturedContentErrorBoundary } from '@/app/(app)/browse/featured/components/featured-content-error-boundary';
import { FeaturedHeroSkeleton } from '@/app/(app)/browse/featured/components/skeletons/featured-hero-skeleton';
import { FeaturedTabbedContentSkeleton } from '@/app/(app)/browse/featured/components/skeletons/featured-tabbed-content-skeleton';
import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

// enable ISR with 5-minute revalidation
export const revalidate = 300;

export default async function FeaturedPage() {
  const currentUserId = await getOptionalUserId();

  return (
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
        <FeaturedContentErrorBoundary section={'hero'}>
          <Suspense fallback={<FeaturedHeroSkeleton />}>
            <FeaturedHeroAsync currentUserId={currentUserId} isTrackViews={true} />
          </Suspense>
        </FeaturedContentErrorBoundary>

        {/* Tabbed Content Section with Suspense */}
        <FeaturedContentErrorBoundary section={'tabbed'}>
          <Suspense fallback={<FeaturedTabbedContentSkeleton />}>
            <FeaturedTabbedContentAsync currentUserId={currentUserId} isTrackViews={true} />
          </Suspense>
        </FeaturedContentErrorBoundary>

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
                <Link href={$path({ route: '/bobbleheads/add' })}>Add Bobblehead</Link>
              </Button>
            </AuthContent>
          </div>
        </section>
      </div>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    description:
      'Discover featured bobblehead collections, rare items, and top collectors in our community showcase',
    title: 'Featured Collections & Bobbleheads - Head Shakers',
  };
}
