import type { Metadata } from 'next';

import { $path } from 'next-typesafe-url';
import { Fragment } from 'react';

import { FALLBACK_METADATA } from '@/lib/seo/seo.constants';

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
    images: [
      {
        height: 630,
        url: FALLBACK_METADATA.imageUrl,
        width: 1200,
      },
    ],
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
    images: [FALLBACK_METADATA.imageUrl],
    title: 'Terms of Service',
  },
};

export default function TermsPage() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    dateModified: '2025-11-24',
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
      <div className={'mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8'}>
        <h1 className={'mb-8 text-4xl font-bold tracking-tight'}>Terms of Service</h1>
        <p className={'mb-8 text-muted-foreground'}>Last updated: November 24, 2025</p>

        <div className={'prose prose-neutral dark:prose-invert max-w-none space-y-8'}>
          <section>
            <h2 className={'mb-4 text-2xl font-semibold'}>1. Acceptance of Terms</h2>
            <p className={'mb-4 leading-relaxed text-muted-foreground'}>
              Welcome to Head Shakers. By accessing or using our website, mobile application, or any other
              services we provide (collectively, the &quot;Service&quot;), you agree to be bound by these
              Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use our
              Service.
            </p>
            <p className={'leading-relaxed text-muted-foreground'}>
              We reserve the right to modify these Terms at any time. We will notify you of any changes by
              posting the new Terms on this page and updating the &quot;Last updated&quot; date. Your
              continued use of the Service after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className={'mb-4 text-2xl font-semibold'}>2. Eligibility</h2>
            <p className={'leading-relaxed text-muted-foreground'}>
              You must be at least 13 years of age to use our Service. By using the Service, you represent and
              warrant that you meet this age requirement. If you are under 18, you represent that you have
              your parent or guardian&apos;s permission to use the Service.
            </p>
          </section>

          <section>
            <h2 className={'mb-4 text-2xl font-semibold'}>3. User Accounts</h2>
            <p className={'mb-4 leading-relaxed text-muted-foreground'}>
              To access certain features of our Service, you must create an account. When creating an account,
              you agree to:
            </p>
            <ul className={'mb-4 list-disc space-y-2 pl-6 text-muted-foreground'}>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            <p className={'leading-relaxed text-muted-foreground'}>
              We reserve the right to suspend or terminate your account if any information provided is
              inaccurate, false, or violates these Terms.
            </p>
          </section>

          <section>
            <h2 className={'mb-4 text-2xl font-semibold'}>4. Acceptable Use</h2>
            <p className={'mb-4 leading-relaxed text-muted-foreground'}>
              You agree to use our Service only for lawful purposes. You may not:
            </p>
            <ul className={'list-disc space-y-2 pl-6 text-muted-foreground'}>
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Post or transmit harmful, threatening, abusive, or harassing content</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Attempt to gain unauthorized access to any portion of the Service or other accounts</li>
              <li>Use the Service for commercial purposes without our express written consent</li>
              <li>Scrape, data mine, or use automated means to access the Service without permission</li>
              <li>Upload malware, viruses, or other malicious code</li>
            </ul>
          </section>

          <section>
            <h2 className={'mb-4 text-2xl font-semibold'}>5. User-Generated Content</h2>
            <p className={'mb-4 leading-relaxed text-muted-foreground'}>
              Our Service allows you to upload, post, and share content including photos, descriptions, and
              other materials related to your bobblehead collection (&quot;User Content&quot;). You retain
              ownership of your User Content, but by posting it, you grant us a non-exclusive, worldwide,
              royalty-free license to use, display, reproduce, and distribute your User Content in connection
              with the Service.
            </p>
            <p className={'mb-4 leading-relaxed text-muted-foreground'}>You represent and warrant that:</p>
            <ul className={'list-disc space-y-2 pl-6 text-muted-foreground'}>
              <li>You own or have the necessary rights to your User Content</li>
              <li>Your User Content does not infringe on any third-party rights</li>
              <li>Your User Content complies with these Terms and all applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className={'mb-4 text-2xl font-semibold'}>6. Intellectual Property</h2>
            <p className={'leading-relaxed text-muted-foreground'}>
              The Service and its original content (excluding User Content), features, and functionality are
              owned by Head Shakers and are protected by international copyright, trademark, patent, trade
              secret, and other intellectual property laws. Our trademarks and trade dress may not be used
              without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className={'mb-4 text-2xl font-semibold'}>7. Privacy</h2>
            <p className={'leading-relaxed text-muted-foreground'}>
              Your use of our Service is also governed by our Privacy Policy. Please review our Privacy Policy
              to understand how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className={'mb-4 text-2xl font-semibold'}>8. Disclaimers</h2>
            <p className={'mb-4 leading-relaxed text-muted-foreground'}>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
              KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className={'leading-relaxed text-muted-foreground'}>
              We do not warrant that the Service will be uninterrupted, secure, or error-free, that defects
              will be corrected, or that the Service or servers are free of viruses or other harmful
              components.
            </p>
          </section>

          <section>
            <h2 className={'mb-4 text-2xl font-semibold'}>9. Limitation of Liability</h2>
            <p className={'leading-relaxed text-muted-foreground'}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, HEAD SHAKERS AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND
              AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
              DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR
              IN CONNECTION WITH YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className={'mb-4 text-2xl font-semibold'}>10. Termination</h2>
            <p className={'leading-relaxed text-muted-foreground'}>
              We may terminate or suspend your account and access to the Service immediately, without prior
              notice or liability, for any reason, including if you breach these Terms. Upon termination, your
              right to use the Service will immediately cease. All provisions of these Terms which by their
              nature should survive termination shall survive.
            </p>
          </section>

          <section>
            <h2 className={'mb-4 text-2xl font-semibold'}>11. Governing Law</h2>
            <p className={'leading-relaxed text-muted-foreground'}>
              These Terms shall be governed by and construed in accordance with the laws of the United States,
              without regard to its conflict of law provisions. Any disputes arising from these Terms or your
              use of the Service shall be resolved in the courts located within the United States.
            </p>
          </section>

          <section>
            <h2 className={'mb-4 text-2xl font-semibold'}>12. Contact Us</h2>
            <p className={'leading-relaxed text-muted-foreground'}>
              If you have any questions about these Terms, please contact us at support@headshakers.com.
            </p>
          </section>
        </div>
      </div>
    </Fragment>
  );
}
