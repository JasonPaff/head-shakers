'use client';

import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import { BellIcon, SearchIcon, MenuIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthContent } from '@/components/ui/auth';
import { useAdminRole } from '@/hooks/use-admin-role';
import { BrowseMenu } from './browse-menu';
import { CollectionMenu } from './collection-menu';
import { AdminMenu } from './admin-menu';
import { MobileOverlay } from './mobile-overlay';

export function DemoHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAdmin, isModerator } = useAdminRole();
  const isAdminUser = isAdmin || isModerator;

  return (
    <>
      {/* Main Header */}
      <header className='relative border-b border-border bg-background'>
        <div className='mx-auto max-w-7xl'>
          {/* Mobile Header */}
          <div className='flex items-center justify-between px-4 py-6 lg:hidden'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setMobileMenuOpen(true)}
              aria-label='Open menu'
              className='transition-transform hover:scale-105'
            >
              <MenuIcon className='h-5 w-5' />
            </Button>

            <Link
              href={$path({ route: '/' })}
              className='text-lg font-light tracking-wider transition-opacity hover:opacity-70'
            >
              HEAD SHAKERS
            </Link>

            <div className='flex items-center gap-2'>
              <AuthContent>
                <Button
                  variant='ghost'
                  size='icon'
                  aria-label='Notifications'
                  className='transition-transform hover:scale-105'
                >
                  <BellIcon className='h-5 w-5' />
                </Button>
              </AuthContent>
              <UserButton />
            </div>
          </div>

          {/* Desktop Header - Three Row Layout */}
          <div className='hidden lg:block'>
            {/* Top Row: Logo Centered */}
            <div className='flex items-center justify-center border-b border-border/50 py-8'>
              <Link
                href={$path({ route: '/' })}
                className='group text-2xl font-light tracking-[0.3em] transition-all duration-300 hover:tracking-[0.4em]'
              >
                <span className='transition-colors group-hover:text-primary'>HEAD SHAKERS</span>
              </Link>
            </div>

            {/* Middle Row: Primary Navigation - Symmetrical */}
            <div className='flex items-center justify-between px-12 py-6'>
              {/* Left Navigation */}
              <div className='flex items-center gap-8'>
                <BrowseMenu />
                <AuthContent>
                  <CollectionMenu />
                </AuthContent>
              </div>

              {/* Center: Search */}
              <div className='relative'>
                {searchOpen ?
                  <div className='flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300'>
                    <Input
                      type='search'
                      placeholder='Search collections...'
                      className='w-80 border-border bg-background transition-all focus:w-96'
                      autoFocus
                      onBlur={(e) => {
                        if (!e.target.value) {
                          setSearchOpen(false);
                        }
                      }}
                    />
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => setSearchOpen(false)}
                      className='transition-transform hover:scale-105'
                    >
                      <XIcon className='h-4 w-4' />
                    </Button>
                  </div>
                : <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setSearchOpen(true)}
                    aria-label='Search'
                    className='transition-transform hover:scale-105 hover:text-primary'
                  >
                    <SearchIcon className='h-5 w-5' />
                  </Button>
                }
              </div>

              {/* Right Navigation */}
              <div className='flex items-center gap-6'>
                {isAdminUser && <AdminMenu />}
                <AuthContent>
                  <Button
                    variant='ghost'
                    size='icon'
                    aria-label='Notifications'
                    className='transition-transform hover:scale-105 hover:text-primary'
                  >
                    <BellIcon className='h-5 w-5' />
                  </Button>
                </AuthContent>
                <div className='transition-transform hover:scale-105'>
                  <UserButton />
                </div>
              </div>
            </div>

            {/* Bottom Row: Auth Buttons (for non-authenticated users) */}
            <AuthContent fallback={<UnauthenticatedActions />}>
              <div className='h-0' />
            </AuthContent>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      <MobileOverlay
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isAdminUser={isAdminUser}
      />
    </>
  );
}

function UnauthenticatedActions() {
  return (
    <div className='flex items-center justify-center gap-6 border-t border-border/50 py-6'>
      <SignInButton mode='modal'>
        <Button
          variant='ghost'
          className='font-light tracking-wider transition-all hover:tracking-widest hover:text-primary'
        >
          Sign In
        </Button>
      </SignInButton>
      <div className='h-4 w-px bg-border' />
      <SignUpButton mode='modal'>
        <Button variant='default' className='font-light tracking-wider transition-all hover:tracking-widest'>
          Sign Up
        </Button>
      </SignUpButton>
    </div>
  );
}
