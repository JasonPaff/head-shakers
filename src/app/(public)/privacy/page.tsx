import type { Metadata } from 'next';

import { $path } from 'next-typesafe-url';
import { Fragment } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FALLBACK_METADATA } from '@/lib/seo/seo.constants';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://headshakers.com';
const lastUpdated = 'November 24, 2025';

export const metadata: Metadata = {
  alternates: {
    canonical: $path({ route: '/privacy' }),
  },
  description:
    'Read the Privacy Policy for Head Shakers. Learn how we collect, use, protect, and manage your personal data on our bobblehead collection platform.',
  openGraph: {
    description:
      'Read the Privacy Policy for Head Shakers. Learn how we collect, use, protect, and manage your personal data on our bobblehead collection platform.',
    images: [
      {
        height: 630,
        url: FALLBACK_METADATA.imageUrl,
        width: 1200,
      },
    ],
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
    images: [FALLBACK_METADATA.imageUrl],
    title: 'Privacy Policy',
  },
};

export default function PrivacyPage() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    dateModified: '2025-11-24',
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
      <div className={'container mx-auto max-w-4xl px-4 py-12'}>
        {/* Header */}
        <div className={'mb-12 text-center'}>
          <h1 className={'mb-4 text-4xl font-bold md:text-5xl'}>Privacy Policy</h1>
          <p className={'text-muted-foreground'}>Last updated: {lastUpdated}</p>
        </div>

        {/* Introduction */}
        <Card className={'mb-8'}>
          <CardContent className={'pt-6'}>
            <p className={'text-muted-foreground'}>
              At Head Shakers, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our bobblehead collection platform.
              Please read this policy carefully to understand our practices regarding your personal data.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className={'mb-8'}>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className={'space-y-4'}>
            <div>
              <h3 className={'mb-2 font-semibold'}>Personal Information</h3>
              <p className={'text-muted-foreground'}>
                When you create an account, we collect information you provide directly, including your name,
                email address, username, and profile picture. This information is managed through our
                authentication provider, Clerk.
              </p>
            </div>
            <div>
              <h3 className={'mb-2 font-semibold'}>Collection Data</h3>
              <p className={'text-muted-foreground'}>
                We store information about your bobblehead collections, including item details, photos,
                acquisition information, and any custom fields you choose to add.
              </p>
            </div>
            <div>
              <h3 className={'mb-2 font-semibold'}>Usage Information</h3>
              <p className={'text-muted-foreground'}>
                We automatically collect certain information when you use our platform, including your IP
                address, browser type, device information, and interactions with our services.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className={'mb-8'}>
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={'list-inside list-disc space-y-2 text-muted-foreground'}>
              <li>To provide and maintain our platform services</li>
              <li>To manage your account and authenticate your identity</li>
              <li>To enable social features like following other collectors and sharing collections</li>
              <li>To send you notifications about your account and platform updates</li>
              <li>To improve our services and develop new features</li>
              <li>To monitor and analyze usage patterns and trends</li>
              <li>To detect, prevent, and address technical issues or fraudulent activity</li>
            </ul>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card className={'mb-8'}>
          <CardHeader>
            <CardTitle>3. Information Sharing</CardTitle>
          </CardHeader>
          <CardContent className={'space-y-4'}>
            <p className={'text-muted-foreground'}>
              We do not sell your personal information. We may share your information in the following
              circumstances:
            </p>
            <ul className={'list-inside list-disc space-y-2 text-muted-foreground'}>
              <li>
                <span className={'font-medium text-foreground'}>Public Profile:</span> Your username, profile
                picture, and public collections are visible to other users
              </li>
              <li>
                <span className={'font-medium text-foreground'}>Service Providers:</span> We work with
                third-party services (Clerk for authentication, Cloudinary for image storage, Neon for
                database hosting) that help us operate our platform
              </li>
              <li>
                <span className={'font-medium text-foreground'}>Legal Requirements:</span> We may disclose
                information if required by law or to protect our rights and safety
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className={'mb-8'}>
          <CardHeader>
            <CardTitle>4. Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={'text-muted-foreground'}>
              We implement appropriate technical and organizational security measures to protect your personal
              information. This includes encryption of data in transit and at rest, secure authentication
              through Clerk, and regular security assessments. However, no method of transmission over the
              Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className={'mb-8'}>
          <CardHeader>
            <CardTitle>5. Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={'mb-4 text-muted-foreground'}>
              Depending on your location, you may have the right to:
            </p>
            <ul className={'list-inside list-disc space-y-2 text-muted-foreground'}>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your collection data</li>
              <li>Opt out of marketing communications</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
          </CardContent>
        </Card>

        {/* Cookies and Tracking */}
        <Card className={'mb-8'}>
          <CardHeader>
            <CardTitle>6. Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={'text-muted-foreground'}>
              We use cookies and similar tracking technologies to maintain your session, remember your
              preferences, and improve your experience. Essential cookies are required for the platform to
              function. We also use analytics tools to understand how users interact with our platform and to
              identify areas for improvement.
            </p>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className={'mb-8'}>
          <CardHeader>
            <CardTitle>7. Children&apos;s Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={'text-muted-foreground'}>
              Head Shakers is not intended for children under 13 years of age. We do not knowingly collect
              personal information from children under 13. If you are a parent or guardian and believe your
              child has provided us with personal information, please contact us so we can delete such
              information.
            </p>
          </CardContent>
        </Card>

        {/* Changes to This Policy */}
        <Card className={'mb-8'}>
          <CardHeader>
            <CardTitle>8. Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={'text-muted-foreground'}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new policy on this page and updating the &quot;Last updated&quot; date. We encourage
              you to review this policy periodically for any changes.
            </p>
          </CardContent>
        </Card>

        {/* Contact Us */}
        <Card className={'mb-8'}>
          <CardHeader>
            <CardTitle>9. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={'text-muted-foreground'}>
              If you have any questions about this Privacy Policy or our data practices, please contact us at{' '}
              <a
                className={'font-semibold text-primary hover:underline'}
                href={'mailto:privacy@head-shakers.com'}
              >
                privacy@head-shakers.com
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </Fragment>
  );
}
