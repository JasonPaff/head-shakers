import type { Metadata } from 'next';

import { ArrowRightIcon, FlameIcon, HeartIcon, LayersIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Suspense } from 'react';

import { FeaturedCollectionsAsync } from '@/app/(app)/(home)/components/async/featured-collections-async';
import { TrendingBobbleheadsAsync } from '@/app/(app)/(home)/components/async/trending-bobbleheads-async';
import { HeroSection } from '@/app/(app)/(home)/components/hero-section';
import { FeaturedCollectionsSkeleton } from '@/app/(app)/(home)/components/skeleton/featured-collections-skeleton';
import { TrendingBobbleheadsSkeleton } from '@/app/(app)/(home)/components/skeleton/trending-bobbleheads-skeleton';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary/error-boundary';
import { serializeJsonLd } from '@/lib/seo/metadata.utils';
import {
  DEFAULT_SITE_METADATA,
  FALLBACK_METADATA,
  ORGANIZATION_SCHEMA,
  WEBSITE_SCHEMA,
} from '@/lib/seo/seo.constants';

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

export default function HomePage() {
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

      {/* Hero Section */}
      <HeroSection />

      {/* Featured Collections Section */}
      <section className={'bg-white py-20 dark:bg-slate-950'}>
        <div className={'container mx-auto px-6'}>
          <div className={'mb-12 flex flex-col items-center text-center'}>
            <div
              className={`mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br
                from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30`}
            >
              <LayersIcon aria-hidden className={'size-8 text-orange-600 dark:text-orange-400'} />
            </div>
            <h2 className={'text-4xl font-bold tracking-tight text-slate-900 md:text-5xl dark:text-white'}>
              Featured Collections
            </h2>
            <p className={'mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400'}>
              Explore curated collections from our most passionate collectors
            </p>
          </div>

          <ErrorBoundary name={'featured-collections'}>
            <Suspense fallback={<FeaturedCollectionsSkeleton />}>
              <FeaturedCollectionsAsync />
            </Suspense>
          </ErrorBoundary>

          {/* View All Button */}
          <div className={'mt-12 text-center'}>
            <Button
              asChild
              className={`group border-orange-500/30 text-orange-600 hover:bg-orange-50
                hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/50`}
              size={'lg'}
              variant={'outline'}
            >
              <Link href={$path({ route: '/browse' })}>
                View All Collections
                <ArrowRightIcon
                  aria-hidden
                  className={'ml-2 size-5 transition-transform group-hover:translate-x-1'}
                />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Bobbleheads Section */}
      <section
        className={
          'bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/30 py-20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900'
        }
      >
        <div className={'container mx-auto px-6'}>
          {/* Section Header */}
          <div className={'mb-12 flex flex-col items-center text-center'}>
            <div
              className={
                'mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30'
              }
            >
              <FlameIcon aria-hidden className={'size-8 text-red-600 dark:text-red-400'} />
            </div>
            <h2 className={'text-4xl font-bold tracking-tight text-slate-900 md:text-5xl dark:text-white'}>
              Trending Now
            </h2>
            <p className={'mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400'}>
              The most popular bobbleheads this week from collectors worldwide
            </p>
          </div>

          {/* Trending Bobbleheads Grid */}
          <ErrorBoundary name={'trending-bobbleheads'}>
            <Suspense fallback={<TrendingBobbleheadsSkeleton />}>
              <TrendingBobbleheadsAsync />
            </Suspense>
          </ErrorBoundary>

          {/* View All Button */}
          <div className={'mt-12 text-center'}>
            <Button
              asChild
              className={
                'group bg-gradient-to-r from-orange-500 to-red-500 px-8 text-lg font-semibold shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-red-600'
              }
              size={'lg'}
            >
              <Link href={$path({ route: '/browse/search' })}>
                Explore All Bobbleheads
                <ArrowRightIcon
                  aria-hidden
                  className={'ml-2 size-5 transition-transform group-hover:translate-x-1'}
                />
              </Link>
            </Button>
          </div>
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
