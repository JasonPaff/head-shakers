import type { Metadata } from 'next';

import { SignUpButton } from '@clerk/nextjs';
import { HeartIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { AuthContent } from '@/components/ui/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/tailwind-utils';

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Home',
  };
}

export default function HomePage() {
  return (
    <div className={'container mx-auto px-4 py-8'}>
      {/* Hero */}
      <section className={'py-12 text-center'}>
        <h1 className={'mb-6 text-5xl font-bold text-balance md:text-6xl'}>
          Collect, Share, and <span className={'text-primary'}>Discover</span> Bobbleheads
        </h1>
        <p className={'mx-auto mb-8 max-w-2xl text-xl text-muted-foreground'}>
          Build your digital bobblehead collection, connect with other collectors, and discover rare finds
          from around the world.
        </p>
        {/* Collections */}{' '}
        <div className={'flex justify-center gap-4'}>
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
        </div>
      </section>

      {/* Featured Collections */}
      <section className={'py-12'}>
        <h2 className={'mb-8 text-center text-3xl font-bold'}>Featured Collections</h2>
        <div className={'grid grid-cols-1 gap-6 md:grid-cols-3'}>
          <Card className={'transition-shadow hover:shadow-lg'}>
            <CardHeader>
              <CardTitle>Sports Legends</CardTitle>
              <CardDescription>Classic sports bobbleheads from the golden era</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  'mb-4 flex aspect-video items-center justify-center rounded-md',
                  'bg-gradient-to-br from-blue-100 to-blue-200',
                )}
              >
                <span className={'text-4xl'}>⚾</span>
              </div>
              <div className={'flex items-center justify-between'}>
                <p className={'text-sm text-muted-foreground'}>245 items • 12 collectors</p>
                <Badge variant={'secondary'}>Popular</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className={'transition-shadow hover:shadow-lg'}>
            <CardHeader>
              <CardTitle>Movie Characters</CardTitle>
              <CardDescription>Iconic characters from beloved films</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  'mb-4 flex aspect-video items-center justify-center rounded-md',
                  'bg-gradient-to-br from-purple-100 to-purple-200',
                )}
              >
                <span className={'text-4xl'}>🎬</span>
              </div>
              <div className={'flex items-center justify-between'}>
                <p className={'text-sm text-muted-foreground'}>189 items • 8 collectors</p>
                <Badge variant={'secondary'}>Trending</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className={'transition-shadow hover:shadow-lg'}>
            <CardHeader>
              <CardTitle>Vintage Finds</CardTitle>
              <CardDescription>Rare and unique vintage bobbleheads</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  'mb-4 flex aspect-video items-center justify-center rounded-md',
                  'bg-gradient-to-br from-amber-100 to-amber-200',
                )}
              >
                <span className={'text-4xl'}>🏆</span>
              </div>
              <div className={'flex items-center justify-between'}>
                <p className={'text-sm text-muted-foreground'}>67 items • 15 collectors</p>
                <Badge variant={'secondary'}>Rare</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

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
