'use client';

import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { XIcon, SearchIcon } from 'lucide-react';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { AuthContent } from '@/components/ui/auth';

interface MobileOverlayProps {
  open: boolean;
  onClose: () => void;
  isAdminUser: boolean;
}

export function MobileOverlay({ open, onClose, isAdminUser }: MobileOverlayProps) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 bg-background animate-in fade-in duration-300 lg:hidden'>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-border/50 px-4 py-6'>
        <span className='text-lg font-light tracking-wider'>MENU</span>
        <Button
          variant='ghost'
          size='icon'
          onClick={onClose}
          aria-label='Close menu'
          className='transition-transform hover:scale-105'
        >
          <XIcon className='h-5 w-5' />
        </Button>
      </div>

      {/* Content */}
      <div className='flex h-[calc(100vh-80px)] flex-col justify-between p-8'>
        <div className='space-y-8'>
          {/* Search */}
          <div className='relative'>
            <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input type='search' placeholder='Search collections...' className='pl-10' />
          </div>

          <Separator />

          {/* Browse Section */}
          <nav className='space-y-4'>
            <h2 className='text-xs font-light tracking-widest text-muted-foreground'>BROWSE</h2>
            <div className='space-y-2'>
              <Link
                href={$path({ route: '/browse' })}
                onClick={onClose}
                className='block font-light tracking-wide transition-all hover:translate-x-1 hover:text-primary'
              >
                Collections
              </Link>
              <Link
                href={$path({ route: '/browse/featured' })}
                onClick={onClose}
                className='block font-light tracking-wide transition-all hover:translate-x-1 hover:text-primary'
              >
                Featured
              </Link>
              <Link
                href={$path({ route: '/browse/search' })}
                onClick={onClose}
                className='block font-light tracking-wide transition-all hover:translate-x-1 hover:text-primary'
              >
                Search
              </Link>
              <Link
                href={$path({ route: '/browse/categories' })}
                onClick={onClose}
                className='block font-light tracking-wide transition-all hover:translate-x-1 hover:text-primary'
              >
                Categories
              </Link>
            </div>
          </nav>

          {/* Collection Section (Auth Only) */}
          <AuthContent>
            <div>
              <Separator className='mb-4' />
              <nav className='space-y-4'>
                <h2 className='text-xs font-light tracking-widest text-muted-foreground'>COLLECTION</h2>
                <div className='space-y-2'>
                  <Link
                    href={$path({ route: '/dashboard/collection' })}
                    onClick={onClose}
                    className='block font-light tracking-wide transition-all hover:translate-x-1 hover:text-primary'
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={$path({ route: '/bobbleheads/add' })}
                    onClick={onClose}
                    className='block font-light tracking-wide transition-all hover:translate-x-1 hover:text-primary'
                  >
                    Add Bobblehead
                  </Link>
                  <Link
                    href={$path({ route: '/dashboard/collection' })}
                    onClick={onClose}
                    className='block font-light tracking-wide transition-all hover:translate-x-1 hover:text-primary'
                  >
                    My Collections
                  </Link>
                  <Link
                    href={$path({ route: '/settings/data/import' })}
                    onClick={onClose}
                    className='block font-light tracking-wide transition-all hover:translate-x-1 hover:text-primary'
                  >
                    Import Data
                  </Link>
                  <Link
                    href={$path({ route: '/settings' })}
                    onClick={onClose}
                    className='block font-light tracking-wide transition-all hover:translate-x-1 hover:text-primary'
                  >
                    Settings
                  </Link>
                </div>
              </nav>
            </div>
          </AuthContent>

          {/* Admin Section (Admin Only) */}
          {isAdminUser && (
            <div>
              <Separator className='mb-4' />
              <nav className='space-y-4'>
                <h2 className='text-xs font-light tracking-widest text-muted-foreground'>ADMIN</h2>
                <div className='space-y-2'>
                  <Link
                    href={$path({ route: '/admin/featured-content' })}
                    onClick={onClose}
                    className='block font-light tracking-wide transition-all hover:translate-x-1 hover:text-primary'
                  >
                    Featured Content
                  </Link>
                  <Link
                    href={$path({ route: '/admin/analytics' })}
                    onClick={onClose}
                    className='block font-light tracking-wide transition-all hover:translate-x-1 hover:text-primary'
                  >
                    Analytics
                  </Link>
                  <Link
                    href={$path({ route: '/admin/launch-notifications' })}
                    onClick={onClose}
                    className='block font-light tracking-wide transition-all hover:translate-x-1 hover:text-primary'
                  >
                    Launch Notifications
                  </Link>
                  <Link
                    href={$path({ route: '/admin/reports' })}
                    onClick={onClose}
                    className='block font-light tracking-wide transition-all hover:translate-x-1 hover:text-primary'
                  >
                    Reports
                  </Link>
                  <Link
                    href={$path({ route: '/admin/users' })}
                    onClick={onClose}
                    className='block font-light tracking-wide transition-all hover:translate-x-1 hover:text-primary'
                  >
                    Users
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>

        {/* Footer - Auth Buttons */}
        <AuthContent
          fallback={
            <div className='space-y-3'>
              <Separator className='mb-6' />
              <SignInButton mode='modal'>
                <Button
                  variant='outline'
                  className='w-full font-light tracking-wider transition-all hover:tracking-widest'
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode='modal'>
                <Button
                  variant='default'
                  className='w-full font-light tracking-wider transition-all hover:tracking-widest'
                >
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          }
        >
          <div />
        </AuthContent>
      </div>
    </div>
  );
}
