import type { Metadata } from 'next';

import { SignInButton } from '@clerk/nextjs';
import { HeartIcon, RocketIcon, SparklesIcon, UsersIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/tailwind-utils';

export default function ComingSoonPage() {
  return (
    <div className={'container mx-auto min-h-screen px-4 py-12'}>
      {/* Hero Section */}
      <section className={'flex min-h-[80vh] flex-col items-center justify-center py-12 text-center'}>
        {/* Animated Badge */}
        <div className={'mb-6 animate-pulse'}>
          <Badge className={'text-sm font-semibold'} variant={'outline'}>
            <SparklesIcon aria-hidden className={'mr-2 size-4'} />
            Coming Soon
          </Badge>
        </div>

        {/* Main Heading */}
        <h1 className={'mb-6 text-5xl font-bold text-balance md:text-7xl'}>
          Head <span className={'text-primary'}>Shakers</span>
        </h1>

        {/* Subheading */}
        <p className={'mb-4 text-2xl font-semibold text-balance text-muted-foreground md:text-3xl'}>
          Collect, Share, and Discover Bobbleheads
        </p>

        {/* Description */}
        <p className={'mx-auto mb-12 max-w-2xl text-lg text-pretty text-muted-foreground'}>
          We&apos;re building the ultimate digital platform for bobblehead collectors worldwide. Connect with
          fellow enthusiasts, showcase your prized collections, and discover rare finds from around the globe.
        </p>

        {/* Launch Info */}
        <div className={'mb-12 rounded-2xl border border-primary/20 bg-primary/5 p-6'}>
          <div className={'mb-2 flex items-center justify-center gap-2'}>
            <RocketIcon aria-hidden className={'size-5 text-primary'} />
            <h2 className={'text-xl font-semibold'}>Launching Soon</h2>
          </div>
          <p className={'text-muted-foreground'}>
            We&apos;re putting the final touches on the platform. Stay tuned for the official launch!
          </p>
        </div>

        {/* Feature Preview Cards */}
        <div className={'grid w-full max-w-4xl gap-6 md:grid-cols-3'}>
          <Card className={'transition-shadow hover:shadow-lg'}>
            <CardHeader>
              <div
                className={'mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10'}
              >
                <UsersIcon aria-hidden className={'size-6 text-primary'} />
              </div>
              <CardTitle className={'text-center'}>Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className={'text-center'}>
                Build your network by following other collectors and sharing your passion for bobbleheads
              </CardDescription>
            </CardContent>
          </Card>

          <Card className={'transition-shadow hover:shadow-lg'}>
            <CardHeader>
              <div
                className={'mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10'}
              >
                <HeartIcon aria-hidden className={'size-6 text-primary'} />
              </div>
              <CardTitle className={'text-center'}>Showcase</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className={'text-center'}>
                Catalog your entire collection with photos, details, and custom organization
              </CardDescription>
            </CardContent>
          </Card>

          <Card className={'transition-shadow hover:shadow-lg'}>
            <CardHeader>
              <div
                className={'mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10'}
              >
                <SparklesIcon aria-hidden className={'size-6 text-primary'} />
              </div>
              <CardTitle className={'text-center'}>Discover</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className={'text-center'}>
                Explore trending collections, rare finds, and connect with collectors worldwide
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Footer Message */}
        <div className={'mt-16 space-y-4'}>
          <p className={'text-sm text-muted-foreground'}>
            Questions? Reach out to us at{' '}
            <a className={'font-semibold text-primary hover:underline'} href={'mailto:hello@headshakers.com'}>
              hello@headshakers.com
            </a>
          </p>
          {/* Admin Access */}
          <div className={'border-t pt-4'}>
            <SignInButton mode={'modal'}>
              <Button size={'sm'} variant={'ghost'}>
                Admin Access
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* Background Decoration */}
      <div
        className={cn(
          'pointer-events-none fixed inset-0 -z-10 opacity-30',
          'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]',
          'from-primary/20 via-background to-background',
        )}
      />
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    description: 'Head Shakers - A digital platform for bobblehead collectors. Coming soon!',
    title: 'Coming Soon',
  };
}
