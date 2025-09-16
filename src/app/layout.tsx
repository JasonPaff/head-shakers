import type { Metadata } from 'next';

import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/themes';
import { ThemeProvider } from 'next-themes';
import { Geist, Geist_Mono } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import '@/app/globals.css';
import { TanstackQueryProvider } from '@/components/feature/tanstack-query/tanstack-query-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  description: `A specialized platform for bobblehead collectors to showcase, track, and manage their collections. 
                The site prioritizes collection display and management over social features, with robust 
                tracking capabilities, real-time interactions, and community engagement through collection 
                showcases and commenting.`,
  title: { default: 'Dashboard', template: '%s | Head Shakers' },
};

type RootLayoutProps = RequiredChildren;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider
      appearance={{
        theme: shadcn,
      }}
    >
      <html data-scroll-behavior={'smooth'} lang={'en'} suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <TooltipProvider>
            <NuqsAdapter>
              <ThemeProvider
                attribute={'class'}
                defaultTheme={'system'}
                disableTransitionOnChange
                enableSystem
              >
                <TanstackQueryProvider>{children}</TanstackQueryProvider>
                <Toaster closeButton duration={2500} position={'top-right'} richColors />
              </ThemeProvider>
            </NuqsAdapter>
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
