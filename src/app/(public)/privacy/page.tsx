import type { Metadata } from 'next';

import { $path } from 'next-typesafe-url';
import { Fragment } from 'react';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://headshakers.com';

export const metadata: Metadata = {
  alternates: {
    canonical: $path({ route: '/privacy' }),
  },
  description:
    'Read the Privacy Policy for Head Shakers. Learn how we collect, use, protect, and manage your personal data on our bobblehead collection platform.',
  openGraph: {
    description:
      'Read the Privacy Policy for Head Shakers. Learn how we collect, use, protect, and manage your personal data on our bobblehead collection platform.',
    locale: 'en_US',
    siteName: 'Head Shakers',
    title: 'Privacy Policy',
    type: 'website',
    url: `${siteUrl}${$path({ route: '/privacy' })}`,
  },
  robots: 'index, follow',
  title: 'Privacy',
  twitter: {
    card: 'summary_large_image',
    description:
      'Read the Privacy Policy for Head Shakers. Learn how we collect, use, protect, and manage your personal data on our bobblehead collection platform.',
    title: 'Privacy Policy',
  },
};

export default function PrivacyPage() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    dateModified: '2025-11-13',
    datePublished: '2025-11-13',
    description:
      'Read the Privacy Policy for Head Shakers. Learn how we collect, use, protect, and manage your personal data on our bobblehead collection platform.',
    name: 'Privacy Policy',
    url: `${siteUrl}${$path({ route: '/privacy' })}`,
  };

  return (
    <Fragment>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
        id={'webpage-schema'}
        type={'application/ld+json'}
      />
      <div>Privacy Page</div>
    </Fragment>
  );
}
