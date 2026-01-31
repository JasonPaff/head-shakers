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
interface JoinCommunitySectionProps {
  username?: null | string;
}

export const JoinCommunitySection = ({ username }: JoinCommunitySectionProps) => {
  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br from-muted via-background to-background
        py-16 sm:py-20 lg:py-24
        dark:from-secondary dark:via-background dark:to-background`}
    >
      {/* Animated Background Elements */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0
          bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
          from-orange-200/40 via-transparent to-transparent
          dark:from-orange-900/20`}
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
        className={`pointer-events-none absolute top-20 left-1/4 size-64 rounded-full bg-gradient-to-r
          from-orange-300/40 to-amber-300/40 blur-3xl
          sm:size-96
          dark:from-orange-500/20 dark:to-amber-500/20`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute right-1/4 bottom-20 size-64 rounded-full bg-gradient-to-l
          from-amber-300/30 to-orange-300/30 blur-3xl
          sm:size-96
          dark:from-amber-500/15 dark:to-orange-500/15`}
      />

      <div className={'relative container mx-auto px-4 sm:px-6'}>
        {/* Section Header */}
        <div className={'mb-10 flex flex-col items-center text-center sm:mb-12'}>
          <div
            className={`mb-4 flex size-14 items-center justify-center rounded-full
              bg-gradient-to-br from-orange-100 to-amber-100 shadow-sm
              transition-transform duration-300 hover:scale-110
              sm:size-16
              dark:from-orange-900/30 dark:to-amber-900/30`}
          >
            <UsersIcon aria-hidden className={'size-7 text-primary sm:size-8'} />
          </div>
          <h2
            className={`text-3xl font-bold tracking-tight text-foreground
              sm:text-4xl md:text-5xl`}
          >
            Join the Community
          </h2>
          <p className={'mt-3 max-w-2xl text-base text-muted-foreground sm:mt-4 sm:text-lg'}>
            Connect with fellow collectors, share your finds, and discover new additions to your collection.
          </p>
        </div>

        {/* Feature Cards */}
        <div className={'grid gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 md:gap-8'}>
          {/* Connect Card */}
          <div
            className={`rounded-xl border border-border/40 bg-card p-5 text-center shadow-sm
              transition-all duration-300 ease-out
              hover:-translate-y-1 hover:border-border/60 hover:shadow-lg
              sm:rounded-2xl sm:p-6 sm:hover:-translate-y-2 sm:hover:shadow-xl
              dark:border-border/50 dark:bg-secondary dark:hover:border-border/70`}
          >
            <div
              className={`mx-auto mb-3 flex size-12 items-center justify-center rounded-full
                bg-gradient-to-br from-orange-100 to-amber-100 shadow-sm
                transition-transform duration-300 group-hover:scale-110
                sm:mb-4 sm:size-16
                dark:from-orange-900/30 dark:to-amber-900/30`}
            >
              <UsersIcon aria-hidden className={'size-6 text-primary sm:size-8'} />
            </div>
            <h3 className={'mb-1.5 text-base font-semibold text-foreground sm:mb-2 sm:text-lg'}>Connect</h3>
            <p className={'text-sm text-muted-foreground'}>Follow other collectors and build your network</p>
          </div>

          {/* Discover Card */}
          <div
            className={`rounded-xl border border-border/40 bg-card p-5 text-center shadow-sm
              transition-all duration-300 ease-out
              hover:-translate-y-1 hover:border-border/60 hover:shadow-lg
              sm:rounded-2xl sm:p-6 sm:hover:-translate-y-2 sm:hover:shadow-xl
              dark:border-border/50 dark:bg-secondary dark:hover:border-border/70`}
          >
            <div
              className={`mx-auto mb-3 flex size-12 items-center justify-center rounded-full
                bg-gradient-to-br from-amber-100 to-yellow-100 shadow-sm
                transition-transform duration-300 group-hover:scale-110
                sm:mb-4 sm:size-16
                dark:from-amber-900/30 dark:to-yellow-900/30`}
            >
              <TrendingUpIcon aria-hidden className={'size-6 text-warning sm:size-8'} />
            </div>
            <h3 className={'mb-1.5 text-base font-semibold text-foreground sm:mb-2 sm:text-lg'}>Discover</h3>
            <p className={'text-sm text-muted-foreground'}>Find trending bobbleheads and rare collectibles</p>
          </div>

          {/* Share Card */}
          <div
            className={`rounded-xl border border-border/40 bg-card p-5 text-center shadow-sm
              transition-all duration-300 ease-out
              hover:-translate-y-1 hover:border-border/60 hover:shadow-lg
              sm:col-span-2 sm:rounded-2xl sm:p-6 sm:hover:-translate-y-2 sm:hover:shadow-xl
              md:col-span-1
              dark:border-border/50 dark:bg-secondary dark:hover:border-border/70`}
          >
            <div
              className={`mx-auto mb-3 flex size-12 items-center justify-center rounded-full
                bg-gradient-to-br from-red-100 to-orange-100 shadow-sm
                transition-transform duration-300 group-hover:scale-110
                sm:mb-4 sm:size-16
                dark:from-red-900/30 dark:to-orange-900/30`}
            >
              <HeartIcon aria-hidden className={'size-6 text-trending sm:size-8'} />
            </div>
            <h3 className={'mb-1.5 text-base font-semibold text-foreground sm:mb-2 sm:text-lg'}>Share</h3>
            <p className={'text-sm text-muted-foreground'}>Showcase your collection and get feedback</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className={'mt-10 text-center sm:mt-12'}>
          <AuthContent
            fallback={
              <div className={'space-y-4'}>
                {/* Sign Up Push */}
                <div
                  className={`mx-auto mb-5 inline-flex items-center gap-2 rounded-full border
                    border-primary/30 bg-accent/80 px-3.5 py-1.5 shadow-sm backdrop-blur-sm
                    transition-all duration-300 hover:border-primary/50 hover:shadow-md
                    sm:mb-6 sm:px-4 sm:py-2
                    dark:border-primary/30 dark:bg-primary/10 dark:hover:border-primary/50`}
                >
                  <SparklesIcon aria-hidden className={'size-3.5 text-primary sm:size-4'} />
                  <span className={'text-xs font-medium text-primary sm:text-sm'}>
                    Create your free account today
                  </span>
                </div>
                <div className={'flex flex-col justify-center gap-3 sm:flex-row sm:gap-4'}>
                  <Button
                    asChild
                    className={`bg-gradient-to-r from-gradient-from to-gradient-to px-6 text-base
                      font-semibold text-primary-foreground shadow-lg shadow-primary/25
                      transition-all duration-300
                      hover:scale-[1.02] hover:from-orange-600 hover:to-amber-600 hover:shadow-xl hover:shadow-primary/30
                      active:scale-[0.98]
                      sm:px-8 sm:text-lg`}
                    size={'lg'}
                  >
                    <SignUpButton mode={'modal'}>Get Started Free</SignUpButton>
                  </Button>
                  <Button
                    asChild
                    className={`border-primary/30 bg-card/80 px-6 text-base text-foreground
                      shadow-sm backdrop-blur-sm
                      transition-all duration-300 hover:border-primary/50 hover:bg-accent hover:shadow-md
                      active:scale-[0.98]
                      sm:px-8 sm:text-lg
                      dark:border-border dark:bg-secondary/50 dark:hover:bg-secondary`}
                    size={'lg'}
                    variant={'outline'}
                  >
                    <Link href={$path({ route: '/browse' })}>Explore Collections</Link>
                  </Button>
                </div>
              </div>
            }
            loadingSkeleton={
              <div className={'flex flex-col justify-center gap-3 sm:flex-row sm:gap-4'}>
                <Skeleton className={'h-11 w-full rounded-md sm:w-44'} />
                <Skeleton className={'h-11 w-full rounded-md sm:w-44'} />
              </div>
            }
          >
            <div className={'flex flex-col justify-center gap-3 sm:flex-row sm:gap-4'}>
              {username && (
                <Button
                  asChild
                  className={`group bg-gradient-to-r from-gradient-from to-gradient-to px-6 text-base
                    font-semibold text-primary-foreground shadow-lg shadow-primary/25
                    transition-all duration-300
                    hover:scale-[1.02] hover:from-orange-600 hover:to-amber-600 hover:shadow-xl hover:shadow-primary/30
                    active:scale-[0.98]
                    sm:px-8 sm:text-lg`}
                  size={'lg'}
                >
                  <Link
                    href={$path({
                      route: '/user/[username]/dashboard/collection',
                      routeParams: { username },
                    })}
                  >
                    <span>My Collection</span>
                    <ArrowRightIcon
                      aria-hidden
                      className={
                        'ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1 sm:size-5'
                      }
                    />
                  </Link>
                </Button>
              )}
              <Button
                asChild
                className={`border-primary/30 bg-card/80 px-6 text-base text-foreground
                  shadow-sm backdrop-blur-sm
                  transition-all duration-300 hover:border-primary/50 hover:bg-accent hover:shadow-md
                  active:scale-[0.98]
                  sm:px-8 sm:text-lg
                  dark:border-border dark:bg-secondary/50 dark:hover:bg-secondary`}
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
