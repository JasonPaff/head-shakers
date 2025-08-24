import type { Metadata } from 'next';

import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';

import '../globals.css';
import type { Children } from '@/types/component-types';

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
          <header className={'flex justify-end items-center p-4 gap-4 h-16'}>
            <SignedOut>
              <SignInButton mode={'redirect'} />
              <SignUpButton mode={'redirect'}>
                <button
                  className={
                    'bg-[#6c47ff] text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer'
                  }
                >
                  Sign Up
                </button>
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
