import type { Metadata } from 'next';

import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';

import '../globals.css';
import { Button } from '@/components/ui/button';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  description: 'Bobble Head Collectors',
  title: 'Head Shakers',
};

type RootLayoutProps = Children;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider>
      <html lang={'en'}>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <header>
            <SignedOut>
              <SignInButton mode={'redirect'} />
              <SignUpButton mode={'redirect'}>
                <Button>Sign Up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
