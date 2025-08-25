import type { Metadata } from 'next';

import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/themes';
import { ThemeProvider } from 'next-themes';
import { Geist, Geist_Mono } from 'next/font/google';

import '@/app/globals.css';
import { AppHeader } from '@/components/layout/app-header/app-header';

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

type RootLayoutProps = LayoutProps;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider
      appearance={{
        theme: shadcn,
      }}
    >
      <html className={'h-full'} lang={'en'} suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}>
          <ThemeProvider attribute={'class'} defaultTheme={'system'} disableTransitionOnChange enableSystem>
            <AppHeader />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
