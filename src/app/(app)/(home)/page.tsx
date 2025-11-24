import type { Metadata } from 'next';

import { SignUpButton } from '@clerk/nextjs';
import { AwardIcon, HeartIcon, SearchIcon, SparklesIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Suspense } from 'react';

import { FeaturedBobbleheadsAsync } from '@/app/(app)/(home)/components/async/featured-bobbleheads-async';
import { FeaturedCollectionsAsync } from '@/app/(app)/(home)/components/async/featured-collections-async';
import { FeaturedCollectionsErrorBoundary } from '@/app/(app)/(home)/components/featured-collections-error-boundary';
import { FeaturedBobbleheadsSkeleton } from '@/app/(app)/(home)/components/skeletons/featured-bobbleheads-skeleton';
import { FeaturedCollectionsSkeleton } from '@/app/(app)/(home)/components/skeletons/featured-collections-skeleton';
import { UsernameOnboardingProvider } from '@/components/feature/users/username-onboarding-provider';
import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { serializeJsonLd } from '@/lib/seo/metadata.utils';
import {
  DEFAULT_SITE_METADATA,
  FALLBACK_METADATA,
  ORGANIZATION_SCHEMA,
  WEBSITE_SCHEMA,
} from '@/lib/seo/seo.constants';
import { getOptionalUserId } from '@/utils/optional-auth-utils';
import { cn } from '@/utils/tailwind-utils';

export const revalidate = 300;

export function generateMetadata(): Metadata {
  return {
    alternates: {
      canonical: DEFAULT_SITE_METADATA.url,
    },
    description: DEFAULT_SITE_METADATA.description,
    openGraph: {
      description: DEFAULT_SITE_METADATA.description,
      images: [
        {
          height: 630,
          url: FALLBACK_METADATA.imageUrl,
          width: 1200,
        },
      ],
      locale: DEFAULT_SITE_METADATA.locale,
      siteName: DEFAULT_SITE_METADATA.siteName,
      title: DEFAULT_SITE_METADATA.title,
      type: 'website',
      url: DEFAULT_SITE_METADATA.url,
    },
    robots: 'index, follow',
    title: 'Home',
    twitter: {
      card: 'summary_large_image',
      creator: DEFAULT_SITE_METADATA.twitterHandle,
      description: DEFAULT_SITE_METADATA.description,
      images: [FALLBACK_METADATA.imageUrl],
      site: DEFAULT_SITE_METADATA.twitterHandle,
      title: DEFAULT_SITE_METADATA.title,
    },
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
    <div className={'min-h-screen'}>
      {/* JSON-LD structured data for homepage */}
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(ORGANIZATION_SCHEMA) }}
        type={'application/ld+json'}
      />
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(WEBSITE_SCHEMA) }}
        type={'application/ld+json'}
      />

      {/* Username Onboarding */}
      {shouldShowOnboarding && (
        <UsernameOnboardingProvider currentUsername={currentUsername} shouldShow={shouldShowOnboarding} />
      )}

      {/* Hero Section */}
      <section className={'relative overflow-hidden px-4 py-12 text-center'}>
        {/* Decorative Background Elements */}
        <div
          aria-hidden={'true'}
          className={
            'pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-warm-amber-light/30 via-transparent to-transparent'
          }
        />
        <div
          aria-hidden={'true'}
          className={
            'pointer-events-none absolute top-20 left-1/4 -z-10 size-64 rounded-full bg-warm-coral-light/20 blur-3xl'
          }
        />
        <div
          aria-hidden={'true'}
          className={
            'pointer-events-none absolute top-40 right-1/4 -z-10 size-48 rounded-full bg-warm-orange-light/20 blur-3xl'
          }
        />

        <div className={'container mx-auto max-w-4xl'}>
          {/* Hero Badge */}
          <div
            className={cn(
              'mb-6 inline-flex items-center gap-2 rounded-full border border-warm-amber/30',
              'bg-warm-amber-light/40 px-4 py-1.5 text-sm font-medium text-warm-amber-dark',
              'dark:border-warm-amber/50 dark:bg-warm-amber-dark/30 dark:text-warm-amber-light',
            )}
          >
            <SparklesIcon aria-hidden={'true'} className={'size-4'} />
            <span>The Premier Bobblehead Community</span>
          </div>

          <h1
            className={
              'mb-6 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl md:text-6xl'
            }
          >
            Collect, Share, and <span className={'text-gradient-sunset-start'}>Discover</span> Bobbleheads
          </h1>
          <p className={'mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl'}>
            Build your digital bobblehead collection, connect with other collectors, and discover rare finds
            from around the world.
          </p>

          {/* CTA Buttons */}
          <div className={'flex flex-wrap justify-center gap-4'}>
            <AuthContent
              fallback={
                <Button
                  asChild
                  className={'shadow-warm-md transition-card hover:shadow-warm-hover'}
                  size={'lg'}
                >
                  <SignUpButton mode={'modal'}>Start Collecting</SignUpButton>
                </Button>
              }
              loadingSkeleton={<Skeleton className={'h-11 w-36 rounded-md'} />}
            >
              <Button
                asChild
                className={'shadow-warm-md transition-card hover:shadow-warm-hover'}
                size={'lg'}
              >
                <Link href={$path({ route: '/dashboard/collection' })}>My Collection</Link>
              </Button>
            </AuthContent>
            <Button asChild className={'transition-all-smooth'} size={'lg'} variant={'outline'}>
              <Link href={$path({ route: '/browse' })}>Browse Collections</Link>
            </Button>
            <Button asChild className={'transition-all-smooth'} size={'lg'} variant={'outline'}>
              <Link href={$path({ route: '/browse/search' })}>
                <SearchIcon aria-hidden={'true'} className={'mr-2 size-5'} />
                Search
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Collections Section */}
      <section className={'bg-card px-4 py-8'}>
        <div className={'container mx-auto max-w-7xl'}>
          <div className={'mb-10 flex flex-col items-center justify-center gap-3 text-center'}>
            <div
              className={
                'flex size-14 items-center justify-center rounded-full bg-warm-orange-light/50 shadow-warm-sm'
              }
            >
              <AwardIcon
                aria-hidden={'true'}
                className={'size-7 text-warm-orange-dark dark:text-warm-orange'}
              />
            </div>
            <h2 className={'mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl'}>
              Featured Collections
            </h2>
            <p className={'mx-auto max-w-2xl text-muted-foreground'}>
              Explore handpicked collections from our community of passionate collectors
            </p>
          </div>

          <FeaturedCollectionsErrorBoundary>
            <Suspense fallback={<FeaturedCollectionsSkeleton />}>
              <FeaturedCollectionsAsync currentUserId={currentUserId} />
            </Suspense>
          </FeaturedCollectionsErrorBoundary>
        </div>
      </section>

      {/* Featured Bobbleheads Section */}
      <section className={'relative px-4 py-8'}>
        {/* Subtle Background Accent */}
        <div
          aria-hidden={'true'}
          className={
            'pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-warm-coral-light/10 to-transparent'
          }
        />

        <div className={'container mx-auto max-w-7xl'}>
          <div className={'mb-10 flex flex-col items-center justify-center gap-3 text-center'}>
            <div
              className={
                'flex size-14 items-center justify-center rounded-full bg-warm-orange-light/50 shadow-warm-sm'
              }
            >
              <AwardIcon
                aria-hidden={'true'}
                className={'size-7 text-warm-orange-dark dark:text-warm-orange'}
              />
            </div>
            <h2 className={'text-3xl font-bold tracking-tight text-foreground md:text-4xl'}>
              Featured Bobbleheads
            </h2>
            <p className={'max-w-2xl text-muted-foreground'}>
              Discover standout pieces that collectors are showcasing this week
            </p>
          </div>

          <Suspense fallback={<FeaturedBobbleheadsSkeleton />}>
            <FeaturedBobbleheadsAsync currentUserId={currentUserId} />
          </Suspense>
        </div>
      </section>

      {/* Join the Community Section */}
      <section className={'bg-card px-4 py-16 md:py-20'}>
        <div className={'container mx-auto max-w-6xl'}>
          {/* Call to Action Card */}
          <div
            className={
              'overflow-hidden rounded-3xl bg-gradient-to-br from-warm-amber-light/60 via-warm-coral-light/40 to-warm-orange-light/50 p-8 shadow-warm-lg md:p-12 dark:from-warm-amber-dark/40 dark:via-warm-coral-dark/30 dark:to-warm-orange-dark/35'
            }
          >
            <div className={'mb-10 text-center'}>
              <h2 className={'mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl'}>
                Join the Community
              </h2>
              <p className={'mx-auto max-w-2xl text-muted-foreground'}>
                Connect with fellow collectors, share your finds, and discover new additions to your
                collection.
              </p>
            </div>

            {/* Feature Cards */}
            <div className={'grid gap-6 md:grid-cols-3 md:gap-8'}>
              {/* Connect Card */}
              <div
                className={
                  'rounded-2xl bg-card/80 p-6 text-center shadow-warm-sm backdrop-blur-sm transition-card hover:shadow-warm-md'
                }
              >
                <div
                  className={
                    'mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-warm-amber-light/70 shadow-warm-sm'
                  }
                >
                  <UsersIcon aria-hidden={'true'} className={'size-8 text-warm-amber-dark'} />
                </div>
                <h3 className={'mb-2 text-lg font-semibold text-foreground'}>Connect</h3>
                <p className={'text-sm text-muted-foreground'}>
                  Follow other collectors and build your network
                </p>
              </div>

              {/* Discover Card */}
              <div
                className={
                  'rounded-2xl bg-card/80 p-6 text-center shadow-warm-sm backdrop-blur-sm transition-card hover:shadow-warm-md'
                }
              >
                <div
                  className={
                    'mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-warm-coral-light/70 shadow-warm-sm'
                  }
                >
                  <TrendingUpIcon aria-hidden={'true'} className={'size-8 text-warm-coral-dark'} />
                </div>
                <h3 className={'mb-2 text-lg font-semibold text-foreground'}>Discover</h3>
                <p className={'text-sm text-muted-foreground'}>
                  Find trending bobbleheads and rare collectibles
                </p>
              </div>

              {/* Share Card */}
              <div
                className={
                  'rounded-2xl bg-card/80 p-6 text-center shadow-warm-sm backdrop-blur-sm transition-card hover:shadow-warm-md'
                }
              >
                <div
                  className={
                    'mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-warm-orange-light/70 shadow-warm-sm'
                  }
                >
                  <HeartIcon aria-hidden={'true'} className={'size-8 text-warm-orange-dark'} />
                </div>
                <h3 className={'mb-2 text-lg font-semibold text-foreground'}>Share</h3>
                <p className={'text-sm text-muted-foreground'}>Showcase your collection and get feedback</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
