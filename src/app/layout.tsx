import type { Metadata } from 'next';

import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/themes';
import { ThemeProvider } from 'next-themes';

import '@/app/globals.css';
import { $path } from 'next-typesafe-url';
import { Geist, Geist_Mono } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { AblyProvider } from '@/components/layout/ably-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DEFAULT_SITE_METADATA, FALLBACK_METADATA } from '@/lib/seo/seo.constants';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  description: FALLBACK_METADATA.description,
  metadataBase: new URL(DEFAULT_SITE_METADATA.url),
  openGraph: {
    description: FALLBACK_METADATA.description,
    locale: DEFAULT_SITE_METADATA.locale,
    siteName: DEFAULT_SITE_METADATA.siteName,
    title: DEFAULT_SITE_METADATA.title,
    type: DEFAULT_SITE_METADATA.ogType,
    url: DEFAULT_SITE_METADATA.url,
  },
  robots: 'index, follow',
  title: { default: DEFAULT_SITE_METADATA.title, template: '%s | Head Shakers' },
  twitter: {
    card: DEFAULT_SITE_METADATA.twitterCard,
    creator: DEFAULT_SITE_METADATA.twitterHandle,
    site: DEFAULT_SITE_METADATA.twitterHandle,
  },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION && {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    }),
    ...(process.env.BING_SITE_VERIFICATION && {
      other: {
        'msvalidate.01': process.env.BING_SITE_VERIFICATION,
      },
    }),
  },
};

type RootLayoutProps = RequiredChildren;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider
      appearance={{
        theme: shadcn,
      }}
      signInUrl={$path({ route: '/' })}
      signUpUrl={$path({ route: '/' })}
    >
      <html data-scroll-behavior={'smooth'} lang={'en'} suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <AblyProvider>
            <TooltipProvider>
              <NuqsAdapter>
                <ThemeProvider
                  attribute={'class'}
                  defaultTheme={'system'}
                  disableTransitionOnChange
                  enableSystem
                >
                  {children}
                  <Toaster closeButton duration={2500} position={'top-right'} richColors />
                </ThemeProvider>
              </NuqsAdapter>
            </TooltipProvider>
          </AblyProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
