import type { Metadata } from 'next';

import { $path } from 'next-typesafe-url';
import { Fragment } from 'react';

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
    title: 'About Head Shakers',
  },
};

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
      <div>About Page</div>
    </Fragment>
  );
}
