import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Geist, Geist_Mono } from 'next/font/google';

import { ClerkProvider } from '@/components/clerk/clerk-provider';
import { Header } from '@/components/layout/header';
import '@/globals.css';
import { ThemeProvider } from '@/components/next-theme/theme-provider';

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
  title: 'Head Shakers',
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider>
      <html className={'h-full'} lang={'en'} suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-full flex-col antialiased`}>
          <ThemeProvider attribute={'class'} defaultTheme={'system'} disableTransitionOnChange enableSystem>
            <Header />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
