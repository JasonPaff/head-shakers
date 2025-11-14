import type { Metadata } from 'next';

import { $path } from 'next-typesafe-url';
import { Fragment } from 'react';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://headshakers.com';

export const metadata: Metadata = {
  alternates: {
    canonical: $path({ route: '/terms' }),
  },
  description:
    'Read the Terms of Service for Head Shakers. Learn about your rights, responsibilities, and the rules governing the use of our bobblehead collection platform.',
  openGraph: {
    description:
      'Read the Terms of Service for Head Shakers. Learn about your rights, responsibilities, and the rules governing the use of our bobblehead collection platform.',
    locale: 'en_US',
    siteName: 'Head Shakers',
    title: 'Terms of Service',
    type: 'website',
    url: `${siteUrl}${$path({ route: '/terms' })}`,
  },
  robots: 'index, follow',
  title: 'Terms',
  twitter: {
    card: 'summary_large_image',
    description:
      'Read the Terms of Service for Head Shakers. Learn about your rights, responsibilities, and the rules governing the use of our bobblehead collection platform.',
    title: 'Terms of Service',
  },
};

export default function TermsPage() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    dateModified: '2025-11-13',
    datePublished: '2025-11-13',
    description:
      'Read the Terms of Service for Head Shakers. Learn about your rights, responsibilities, and the rules governing the use of our bobblehead collection platform.',
    name: 'Terms of Service',
    url: `${siteUrl}${$path({ route: '/terms' })}`,
  };

  return (
    <Fragment>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
        id={'webpage-schema'}
        type={'application/ld+json'}
      />
      <div>Terms Page</div>
    </Fragment>
  );
}
