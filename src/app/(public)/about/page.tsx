import type { Metadata } from 'next';

import { Camera, Globe, Heart, LayoutGrid, Search, Users } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import { Fragment } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FALLBACK_METADATA } from '@/lib/seo/seo.constants';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://headshakers.com';

export const metadata: Metadata = {
  alternates: {
    canonical: $path({ route: '/about' }),
  },
  description:
    'Learn about Head Shakers, the premier digital platform for bobblehead collectors. Discover how we help collectors catalog, share, and connect over their bobblehead collections.',
  openGraph: {
    description:
      'Learn about Head Shakers, the premier digital platform for bobblehead collectors. Discover how we help collectors catalog, share, and connect over their bobblehead collections.',
    images: [
      {
        height: 630,
        url: FALLBACK_METADATA.imageUrl,
        width: 1200,
      },
    ],
    locale: 'en_US',
    siteName: 'Head Shakers',
    title: 'About Head Shakers',
    type: 'website',
    url: `${siteUrl}${$path({ route: '/about' })}`,
  },
  robots: 'index, follow',
  title: 'About',
  twitter: {
    card: 'summary_large_image',
    description:
      'Learn about Head Shakers, the premier digital platform for bobblehead collectors. Discover how we help collectors catalog, share, and connect over their bobblehead collections.',
    images: [FALLBACK_METADATA.imageUrl],
    title: 'About Head Shakers',
  },
};

const features = [
  {
    description:
      'Build and organize your digital bobblehead collection with detailed metadata, photos, and custom fields.',
    icon: LayoutGrid,
    title: 'Collection Management',
  },
  {
    description:
      'Upload high-quality photos of your bobbleheads with automatic optimization and gallery views.',
    icon: Camera,
    title: 'Photo Galleries',
  },
  {
    description: 'Connect with fellow collectors, follow their collections, and engage with the community.',
    icon: Users,
    title: 'Social Features',
  },
  {
    description: 'Find specific bobbleheads across collections with powerful search and filtering tools.',
    icon: Search,
    title: 'Search & Discovery',
  },
  {
    description: 'Explore featured collections and trending bobbleheads from collectors around the world.',
    icon: Globe,
    title: 'Global Community',
  },
  {
    description:
      'Like and save your favorite bobbleheads to keep track of items you love or want to acquire.',
    icon: Heart,
    title: 'Favorites & Likes',
  },
];

export default function AboutPage() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    description:
      'A specialized platform for bobblehead collectors to showcase, track, and manage their collections with robust tracking capabilities, real-time interactions, and community engagement.',
    name: 'Head Shakers',
    url: siteUrl,
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    description:
      'Learn about Head Shakers, the premier digital platform for bobblehead collectors. Discover how we help collectors catalog, share, and connect over their bobblehead collections.',
    name: 'About Head Shakers',
    url: `${siteUrl}${$path({ route: '/about' })}`,
  };

  return (
    <Fragment>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        id={'organization-schema'}
        type={'application/ld+json'}
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
        id={'webpage-schema'}
        type={'application/ld+json'}
      />
      <div className={'container mx-auto max-w-4xl px-4 py-12'}>
        {/* Header */}
        <div className={'mb-12 text-center'}>
          <h1 className={'mb-4 text-4xl font-bold md:text-5xl'}>About Head Shakers</h1>
          <p className={'mx-auto max-w-2xl text-lg text-muted-foreground'}>
            The premier digital platform for bobblehead collectors to catalog, share, and discover collections
            from around the world.
          </p>
        </div>

        {/* Mission */}
        <Card className={'mb-8'}>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={'text-muted-foreground'}>
              Head Shakers was created with a simple mission: to give bobblehead collectors a dedicated space
              to showcase and manage their collections. Whether you have a handful of treasured pieces or
              thousands of bobbleheads spanning decades, our platform helps you organize, document, and share
              your passion with a community that understands it.
            </p>
          </CardContent>
        </Card>

        {/* What We Offer */}
        <Card className={'mb-8'}>
          <CardHeader>
            <CardTitle>What We Offer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={'grid gap-6 md:grid-cols-2'}>
              {features.map((feature) => (
                <div className={'flex gap-4'} key={feature.title}>
                  <div
                    className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10'}
                  >
                    <feature.icon className={'h-5 w-5 text-primary'} />
                  </div>
                  <div>
                    <h3 className={'mb-1 font-semibold'}>{feature.title}</h3>
                    <p className={'text-sm text-muted-foreground'}>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Our Story */}
        <Card className={'mb-8'}>
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent className={'space-y-4'}>
            <p className={'text-muted-foreground'}>
              Head Shakers started from a simple observation: while bobblehead collecting has grown into a
              vibrant hobby with millions of enthusiasts worldwide, there was no dedicated platform designed
              specifically for this community.
            </p>
            <p className={'text-muted-foreground'}>
              Collectors were scattered across generic social media platforms, spreadsheets, and physical
              notebooks, making it difficult to properly document collections, connect with other collectors,
              or discover new pieces to add to their displays.
            </p>
            <p className={'text-muted-foreground'}>
              We built Head Shakers to change that. Our platform brings together the tools collectors need
              with the social features that make sharing your passion enjoyable. From sports legends to pop
              culture icons, from vintage rarities to modern releases, Head Shakers is the home for every
              bobblehead collection.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className={'mb-8'}>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={'text-muted-foreground'}>
              Have questions, suggestions, or just want to say hello? We would love to hear from you. Reach
              out to us at{' '}
              <a
                className={'font-semibold text-primary hover:underline'}
                href={'mailto:hello@head-shakers.com'}
              >
                hello@head-shakers.com
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </Fragment>
  );
}
