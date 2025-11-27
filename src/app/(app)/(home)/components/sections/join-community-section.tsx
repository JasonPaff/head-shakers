import { SignUpButton } from '@clerk/nextjs';
import { ArrowRightIcon, HeartIcon, SparklesIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Join the Community section for home page
 *
 * Server-side component that displays:
 * - Animated background with gradient orbs and grid pattern
 * - Section header with icon and compelling copy
 * - Three feature cards (Connect, Discover, Share)
 * - Auth-aware CTA button
 *
 * Light mode: white/cream background with orange accents
 * Dark mode: dark slate background with orange accents
 */
export const JoinCommunitySection = () => {
  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br from-slate-50 via-orange-50/30
        to-amber-50/30 py-20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900`}
    >
      {/* Animated Background Elements */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0
          bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
        from-orange-200/40 via-transparent to-transparent dark:from-orange-900/20`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0
          bg-[linear-gradient(to_right,#f9731620_1px,transparent_1px),linear-gradient(to_bottom,#f9731620_1px,transparent_1px)]
          bg-[size:24px_24px]
          dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute top-20 left-1/4 size-96 rounded-full bg-gradient-to-r
          from-orange-300/40 to-amber-300/40 blur-3xl dark:from-orange-500/20 dark:to-amber-500/20`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute right-1/4 bottom-20 size-96 rounded-full bg-gradient-to-l
          from-amber-300/30 to-orange-300/30 blur-3xl dark:from-amber-500/15 dark:to-orange-500/15`}
      />

      <div className={'relative container mx-auto px-6'}>
        {/* Section Header */}
        <div className={'mb-12 flex flex-col items-center text-center'}>
          <div
            className={`mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br
              from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30`}
          >
            <UsersIcon aria-hidden className={'size-8 text-orange-600 dark:text-orange-400'} />
          </div>
          <h2 className={'text-4xl font-bold tracking-tight text-slate-900 md:text-5xl dark:text-white'}>
            Join the Community
          </h2>
          <p className={'mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400'}>
            Connect with fellow collectors, share your finds, and discover new additions to your collection.
          </p>
        </div>

        {/* Feature Cards */}
        <div className={'grid gap-6 md:grid-cols-3 md:gap-8'}>
          {/* Connect Card */}
          <div
            className={`rounded-2xl border border-slate-200/50 bg-white p-6 text-center shadow-md
              transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
              dark:border-slate-700/50 dark:bg-slate-800`}
          >
            <div
              className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-full
                bg-gradient-to-br from-orange-100 to-amber-100
                dark:from-orange-900/30 dark:to-amber-900/30`}
            >
              <UsersIcon aria-hidden className={'size-8 text-orange-600 dark:text-orange-400'} />
            </div>
            <h3 className={'mb-2 text-lg font-semibold text-slate-900 dark:text-white'}>Connect</h3>
            <p className={'text-sm text-slate-600 dark:text-slate-400'}>
              Follow other collectors and build your network
            </p>
          </div>

          {/* Discover Card */}
          <div
            className={`rounded-2xl border border-slate-200/50 bg-white p-6 text-center shadow-md
              transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
              dark:border-slate-700/50 dark:bg-slate-800`}
          >
            <div
              className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-full
                bg-gradient-to-br from-amber-100 to-yellow-100
                dark:from-amber-900/30 dark:to-yellow-900/30`}
            >
              <TrendingUpIcon aria-hidden className={'size-8 text-amber-600 dark:text-amber-400'} />
            </div>
            <h3 className={'mb-2 text-lg font-semibold text-slate-900 dark:text-white'}>Discover</h3>
            <p className={'text-sm text-slate-600 dark:text-slate-400'}>
              Find trending bobbleheads and rare collectibles
            </p>
          </div>

          {/* Share Card */}
          <div
            className={`rounded-2xl border border-slate-200/50 bg-white p-6 text-center shadow-md
              transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
              dark:border-slate-700/50 dark:bg-slate-800`}
          >
            <div
              className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-full
                bg-gradient-to-br from-red-100 to-orange-100
                dark:from-red-900/30 dark:to-orange-900/30`}
            >
              <HeartIcon aria-hidden className={'size-8 text-red-600 dark:text-red-400'} />
            </div>
            <h3 className={'mb-2 text-lg font-semibold text-slate-900 dark:text-white'}>Share</h3>
            <p className={'text-sm text-slate-600 dark:text-slate-400'}>
              Showcase your collection and get feedback
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className={'mt-12 text-center'}>
          <AuthContent
            fallback={
              <div className={'space-y-4'}>
                {/* Sign Up Push */}
                <div
                  className={`mx-auto mb-6 inline-flex items-center gap-2 rounded-full border
                    border-orange-300 bg-orange-100/80 px-4 py-2 backdrop-blur-sm
                    dark:border-orange-500/30 dark:bg-orange-500/10`}
                >
                  <SparklesIcon aria-hidden className={'size-4 text-orange-600 dark:text-orange-400'} />
                  <span className={'text-sm font-medium text-orange-700 dark:text-orange-300'}>
                    Create your free account today
                  </span>
                </div>
                <div className={'flex flex-wrap justify-center gap-4'}>
                  <Button
                    asChild
                    className={`bg-gradient-to-r from-orange-500 to-amber-500 px-8 text-lg
                      font-semibold text-white shadow-lg shadow-orange-500/25
                      hover:from-orange-600 hover:to-amber-600`}
                    size={'lg'}
                  >
                    <SignUpButton mode={'modal'}>Get Started Free</SignUpButton>
                  </Button>
                  <Button
                    asChild
                    className={`border-orange-300 bg-white/80 px-8 text-lg text-slate-700
                      backdrop-blur-sm hover:bg-orange-50 dark:border-slate-600
                      dark:bg-slate-800/50 dark:text-white dark:hover:bg-slate-700/50`}
                    size={'lg'}
                    variant={'outline'}
                  >
                    <Link href={$path({ route: '/browse' })}>Explore Collections</Link>
                  </Button>
                </div>
              </div>
            }
            loadingSkeleton={
              <div className={'flex flex-wrap justify-center gap-4'}>
                <Skeleton className={'h-11 w-44 rounded-md'} />
                <Skeleton className={'h-11 w-44 rounded-md'} />
              </div>
            }
          >
            <div className={'flex flex-wrap justify-center gap-4'}>
              <Button
                asChild
                className={`group bg-gradient-to-r from-orange-500 to-amber-500 px-8 text-lg
                  font-semibold text-white shadow-lg shadow-orange-500/25
                  hover:from-orange-600 hover:to-amber-600`}
                size={'lg'}
              >
                <Link href={$path({ route: '/dashboard/collection' })}>
                  <span>My Collection</span>
                  <ArrowRightIcon
                    aria-hidden
                    className={'ml-2 size-5 transition-transform group-hover:translate-x-1'}
                  />
                </Link>
              </Button>
              <Button
                asChild
                className={`border-orange-300 bg-white/80 px-8 text-lg text-slate-700
                  backdrop-blur-sm hover:bg-orange-50 dark:border-slate-600
                  dark:bg-slate-800/50 dark:text-white dark:hover:bg-slate-700/50`}
                size={'lg'}
                variant={'outline'}
              >
                <Link href={$path({ route: '/browse' })}>Explore Collections</Link>
              </Button>
            </div>
          </AuthContent>
        </div>
      </div>
    </section>
  );
};
