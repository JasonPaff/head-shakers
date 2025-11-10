import type { Metadata } from 'next';

import { SignUpButton } from '@clerk/nextjs';
import { ArrowRightIcon, HeartIcon, SearchIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Suspense } from 'react';

import { FeaturedCollectionsAsync } from '@/app/(app)/(home)/components/async/featured-collections-async';
import { FeaturedCollectionsErrorBoundary } from '@/app/(app)/(home)/components/featured-collections-error-boundary';
import { FeaturedCollectionsSkeleton } from '@/app/(app)/(home)/components/skeletons/featured-collections-skeleton';
import { UsernameOnboardingProvider } from '@/components/feature/users/username-onboarding-provider';
import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

export const revalidate = 300;

export function generateMetadata(): Metadata {
  return {
    description:
      'Build your digital bobblehead collection, connect with other collectors, and discover rare finds from around the world.',
    title: 'Home',
  };
}

export default async function HomePage() {
  const currentUserId = await getOptionalUserId();

  // Check if user needs username onboarding
  let shouldShowOnboarding = false;
  let currentUsername = '';
  if (currentUserId) {
    const user = await UsersFacade.getUserById(currentUserId);
    if (user) {
      currentUsername = user.username;
      shouldShowOnboarding = !user.usernameChangedAt;
    }
  }

  return (
    <div className={'container mx-auto px-4 py-8'}>
      {/* Username Onboarding */}
      {shouldShowOnboarding && (
        <UsernameOnboardingProvider currentUsername={currentUsername} shouldShow={shouldShowOnboarding} />
      )}
      {/* Hero */}
      <section className={'pt-12 text-center'}>
        <h1 className={'mb-6 text-5xl font-bold text-balance md:text-6xl'}>
          Collect, Share, and <span className={'text-primary'}>Discover</span> Bobbleheads
        </h1>
        <p className={'mx-auto mb-8 max-w-2xl text-xl text-muted-foreground'}>
          Build your digital bobblehead collection, connect with other collectors, and discover rare finds
          from around the world.
        </p>
        {/* Collections */}{' '}
        <div className={'flex flex-wrap justify-center gap-4'}>
          <AuthContent
            fallback={
              <Button asChild size={'lg'}>
                <SignUpButton mode={'modal'}>Start Collecting</SignUpButton>
              </Button>
            }
            loadingSkeleton={<Skeleton className={'h-11 w-32 rounded-md'} />}
          >
            <Button asChild size={'lg'}>
              <Link href={$path({ route: '/dashboard/collection' })}>My Collection</Link>
            </Button>
          </AuthContent>
          <Button asChild size={'lg'} variant={'outline'}>
            <Link href={$path({ route: '/browse' })}>Browse Collections</Link>
          </Button>
          <Button asChild size={'lg'} variant={'outline'}>
            <Link href={$path({ route: '/browse/search' })}>
              <SearchIcon className={'mr-2 size-5'} />
              Search
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Collections */}
      <section className={'py-12'}>
        <h2 className={'mb-8 text-center text-3xl font-bold'}>Featured Collections</h2>
        <FeaturedCollectionsErrorBoundary>
          <Suspense fallback={<FeaturedCollectionsSkeleton />}>
            <FeaturedCollectionsAsync currentUserId={currentUserId} />
          </Suspense>
        </FeaturedCollectionsErrorBoundary>

        {/* View All Featured Link */}
        <div className={'mt-8 flex justify-center'}>
          <Button asChild className={'group'} size={'lg'} variant={'outline'}>
            <Link href={$path({ route: '/browse/featured' })}>
              View All Featured Content
              <ArrowRightIcon className={'ml-2 size-5 transition-transform group-hover:translate-x-1'} />
            </Link>
          </Button>
        </div>
      </section>

      {/* Join the Community */}
      <section className={'py-12'}>
        {/* Call to Action */}
        <div className={'mt-8 rounded-2xl bg-primary/10 p-8'}>
          <div className={'mb-8 text-center'}>
            <h2 className={'mb-4 text-3xl font-bold'}>Join the Community</h2>
            <p className={'mx-auto max-w-2xl text-muted-foreground'}>
              Connect with fellow collectors, share your finds, and discover new additions to your collection.
            </p>
          </div>

          <div className={'grid gap-6 md:grid-cols-3'}>
            <div className={'text-center'}>
              <div
                className={'mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10'}
              >
                <UsersIcon className={'size-8 text-primary'} />
              </div>
              <h3 className={'mb-2 font-semibold'}>Connect</h3>
              <p className={'text-sm text-muted-foreground'}>
                Follow other collectors and build your network
              </p>
            </div>
            <div className={'text-center'}>
              <div
                className={'mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-secondary'}
              >
                <TrendingUpIcon className={'size-8 text-muted-foreground'} />
              </div>
              <h3 className={'mb-2 font-semibold'}>Discover</h3>
              <p className={'text-sm text-muted-foreground'}>
                Find trending bobbleheads and rare collectibles
              </p>
            </div>
            <div className={'text-center'}>
              <div
                className={
                  'mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/50'
                }
              >
                <HeartIcon className={'size-8 text-muted-foreground'} />
              </div>
              <h3 className={'mb-2 font-semibold'}>Share</h3>
              <p className={'text-sm text-muted-foreground'}>Showcase your collection and get feedback</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
