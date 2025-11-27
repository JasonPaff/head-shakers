import type { Metadata } from 'next';

import { AwardIcon, HeartIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';
import { Suspense } from 'react';

import { FeaturedBobbleheadsAsync } from '@/app/(app)/(home)/components/async/featured-bobbleheads-async';
import { FeaturedCollectionsAsync } from '@/app/(app)/(home)/components/async/featured-collections-async';
import { FeaturedCollectionsErrorBoundary } from '@/app/(app)/(home)/components/error/featured-collections-error-boundary';
import { HeroSection } from '@/app/(app)/(home)/components/hero-section';
import { FeaturedBobbleheadsSkeleton } from '@/app/(app)/(home)/components/skeletons/featured-bobbleheads-skeleton';
import { FeaturedCollectionsSkeleton } from '@/app/(app)/(home)/components/skeletons/featured-collections-skeleton';
import { UsernameOnboardingProvider } from '@/components/feature/users/username-onboarding-provider';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { serializeJsonLd } from '@/lib/seo/metadata.utils';
import {
  DEFAULT_SITE_METADATA,
  FALLBACK_METADATA,
  ORGANIZATION_SCHEMA,
  WEBSITE_SCHEMA,
} from '@/lib/seo/seo.constants';
import { getUserIdAsync } from '@/utils/optional-auth-utils';

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
  const currentUserId = await getUserIdAsync();

  // Check if user needs username onboarding
  let shouldShowOnboarding = false;
  let currentUsername = '';
  if (currentUserId) {
    const user = await UsersFacade.getUserByIdAsync(currentUserId);
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
      <HeroSection />

      {/* Featured Collections Section */}
      <section className={'bg-card px-4 py-8'}>
        <div className={'container mx-auto max-w-7xl'}>
          <div className={'mb-10 flex flex-col items-center justify-center gap-3 text-center'}>
            <div
              className={'flex size-14 items-center justify-center rounded-full bg-orange-200/50 shadow-sm'}
            >
              <AwardIcon aria-hidden={'true'} className={'size-7 text-orange-700 dark:text-primary'} />
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
            'pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-orange-100/10 to-transparent'
          }
        />

        <div className={'container mx-auto max-w-7xl'}>
          <div className={'mb-10 flex flex-col items-center justify-center gap-3 text-center'}>
            <div
              className={'flex size-14 items-center justify-center rounded-full bg-orange-200/50 shadow-sm'}
            >
              <AwardIcon aria-hidden={'true'} className={'size-7 text-orange-700 dark:text-primary'} />
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
              'overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100/60 via-orange-100/40 to-orange-200/50 p-8 shadow-lg md:p-12 dark:from-amber-700/40 dark:via-orange-700/30 dark:to-orange-800/35'
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
                  'rounded-2xl bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md'
                }
              >
                <div
                  className={
                    'mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-100/70 shadow-sm'
                  }
                >
                  <UsersIcon aria-hidden={'true'} className={'size-8 text-amber-700'} />
                </div>
                <h3 className={'mb-2 text-lg font-semibold text-foreground'}>Connect</h3>
                <p className={'text-sm text-muted-foreground'}>
                  Follow other collectors and build your network
                </p>
              </div>

              {/* Discover Card */}
              <div
                className={
                  'rounded-2xl bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md'
                }
              >
                <div
                  className={
                    'mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-orange-100/70 shadow-sm'
                  }
                >
                  <TrendingUpIcon aria-hidden={'true'} className={'size-8 text-orange-600'} />
                </div>
                <h3 className={'mb-2 text-lg font-semibold text-foreground'}>Discover</h3>
                <p className={'text-sm text-muted-foreground'}>
                  Find trending bobbleheads and rare collectibles
                </p>
              </div>

              {/* Share Card */}
              <div
                className={
                  'rounded-2xl bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md'
                }
              >
                <div
                  className={
                    'mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-orange-200/70 shadow-sm'
                  }
                >
                  <HeartIcon aria-hidden={'true'} className={'size-8 text-orange-700'} />
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
