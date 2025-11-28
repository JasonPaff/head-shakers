'use client';

import { useState } from 'react';
import Link from 'next/link';
import { $path } from 'next-typesafe-url';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import {
  MenuIcon,
  XIcon,
  HomeIcon,
  SearchIcon,
  BellIcon,
  LayoutGridIcon,
  StarIcon,
  FolderIcon,
  ShieldIcon,
  SettingsIcon,
  PlusCircleIcon,
  UploadIcon,
  LayoutDashboardIcon,
  BarChartIcon,
  FileTextIcon,
  UsersIcon,
  MoonIcon,
  SunIcon,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { AuthContent } from '@/components/ui/auth';

interface MobileMenuIslandProps {
  isAdmin: boolean;
  adminLoading: boolean;
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

export function MobileMenuIsland({ isAdmin, adminLoading, theme, setTheme }: MobileMenuIslandProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className='fixed bottom-6 left-1/2 z-50 -translate-x-1/2 lg:hidden'>
      <div className='flex items-center gap-3 rounded-full bg-card px-6 py-3.5 shadow-2xl ring-1 ring-border/50'>
        {/* Logo/Home */}
        <Link
          href={$path({ route: '/' })}
          className='flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110'
          aria-label='Home'
        >
          <HomeIcon className='h-5 w-5' />
        </Link>

        <Separator orientation='vertical' className='h-8' />

        {/* Search */}
        <Button
          variant='ghost'
          size='sm'
          className='h-10 w-10 rounded-full p-0 hover:bg-accent'
          aria-label='Search'
        >
          <SearchIcon className='h-5 w-5' />
        </Button>

        {/* Notifications - Auth Only */}
        <AuthContent>
          <Button
            variant='ghost'
            size='sm'
            className='relative h-10 w-10 rounded-full p-0 hover:bg-accent'
            aria-label='Notifications'
          >
            <BellIcon className='h-5 w-5' />
            <span className='absolute right-1.5 top-1.5 flex h-2 w-2'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75' />
              <span className='relative inline-flex h-2 w-2 rounded-full bg-primary' />
            </span>
          </Button>
        </AuthContent>

        <Separator orientation='vertical' className='h-8' />

        {/* Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='h-10 w-10 rounded-full p-0 hover:bg-accent'
              aria-label='Menu'
            >
              <MenuIcon className='h-5 w-5' />
            </Button>
          </SheetTrigger>
          <SheetContent side='bottom' className='h-[85vh] rounded-t-3xl border-t'>
            <SheetHeader className='mb-6'>
              <SheetTitle className='flex items-center justify-between'>
                <span className='text-2xl font-bold'>
                  Head <span className='text-primary'>Shakers</span>
                </span>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className='h-9 w-9 p-0'
                    aria-label='Toggle theme'
                  >
                    {theme === 'dark' ?
                      <SunIcon className='h-5 w-5' />
                    : <MoonIcon className='h-5 w-5' />}
                  </Button>
                  <AuthContent
                    fallback={
                      <div className='flex items-center gap-2'>
                        <SignInButton mode='modal'>
                          <Button variant='outline' size='sm'>
                            Sign In
                          </Button>
                        </SignInButton>
                      </div>
                    }
                  >
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: 'h-9 w-9',
                        },
                      }}
                    />
                  </AuthContent>
                </div>
              </SheetTitle>
            </SheetHeader>

            <div className='space-y-6 overflow-y-auto pb-6'>
              {/* Search */}
              <div className='relative'>
                <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  type='search'
                  placeholder='Search collections, bobbleheads...'
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className='pl-10'
                />
              </div>

              {/* Browse Menu */}
              <div>
                <h3 className='mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
                  Browse
                </h3>
                <div className='space-y-1'>
                  <Link
                    href={$path({ route: '/browse' })}
                    onClick={() => setOpen(false)}
                    className='flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent'
                  >
                    <LayoutGridIcon className='h-5 w-5' />
                    Collections
                  </Link>
                  <Link
                    href={$path({ route: '/browse/featured' })}
                    onClick={() => setOpen(false)}
                    className='flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent'
                  >
                    <StarIcon className='h-5 w-5' />
                    Featured
                  </Link>
                  <Link
                    href={$path({ route: '/browse/search' })}
                    onClick={() => setOpen(false)}
                    className='flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent'
                  >
                    <SearchIcon className='h-5 w-5' />
                    Search
                  </Link>
                  <Link
                    href={$path({ route: '/browse/categories' })}
                    onClick={() => setOpen(false)}
                    className='flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent'
                  >
                    <FolderIcon className='h-5 w-5' />
                    Categories
                  </Link>
                </div>
              </div>

              {/* Collection Menu - Auth Only */}
              <AuthContent>
                <div>
                  <h3 className='mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
                    My Collection
                  </h3>
                  <div className='space-y-1'>
                    <Link
                      href={$path({ route: '/dashboard/collection' })}
                      onClick={() => setOpen(false)}
                      className='flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent'
                    >
                      <LayoutDashboardIcon className='h-5 w-5' />
                      Dashboard
                    </Link>
                    <Link
                      href={$path({ route: '/bobbleheads/add' })}
                      onClick={() => setOpen(false)}
                      className='flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent'
                    >
                      <PlusCircleIcon className='h-5 w-5' />
                      Add Bobblehead
                    </Link>
                    <Link
                      href={$path({ route: '/settings/data/import' })}
                      onClick={() => setOpen(false)}
                      className='flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent'
                    >
                      <UploadIcon className='h-5 w-5' />
                      Import Data
                    </Link>
                    <Link
                      href={$path({ route: '/settings' })}
                      onClick={() => setOpen(false)}
                      className='flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent'
                    >
                      <SettingsIcon className='h-5 w-5' />
                      Settings
                    </Link>
                  </div>
                </div>
              </AuthContent>

              {/* Admin Menu - Auth + Admin Only */}
              {!adminLoading && isAdmin && (
                <div>
                  <h3 className='mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
                    Admin
                  </h3>
                  <div className='space-y-1'>
                    <Link
                      href={$path({ route: '/admin/featured-content' })}
                      onClick={() => setOpen(false)}
                      className='flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent'
                    >
                      <StarIcon className='h-5 w-5' />
                      Featured Content
                    </Link>
                    <Link
                      href={$path({ route: '/admin/analytics' })}
                      onClick={() => setOpen(false)}
                      className='flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent'
                    >
                      <BarChartIcon className='h-5 w-5' />
                      Analytics
                    </Link>
                    <Link
                      href={$path({ route: '/admin/launch-notifications' })}
                      onClick={() => setOpen(false)}
                      className='flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent'
                    >
                      <BellIcon className='h-5 w-5' />
                      Launch Notifications
                    </Link>
                    <Link
                      href={$path({ route: '/admin/reports' })}
                      onClick={() => setOpen(false)}
                      className='flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent'
                    >
                      <FileTextIcon className='h-5 w-5' />
                      Reports
                    </Link>
                    <Link
                      href={$path({ route: '/admin/users' })}
                      onClick={() => setOpen(false)}
                      className='flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent'
                    >
                      <UsersIcon className='h-5 w-5' />
                      Users
                    </Link>
                  </div>
                </div>
              )}

              {/* Sign Up CTA for non-authenticated users */}
              <AuthContent
                fallback={
                  <div className='rounded-xl bg-primary/10 p-4'>
                    <h4 className='mb-2 font-semibold'>Join Head Shakers</h4>
                    <p className='mb-4 text-sm text-muted-foreground'>
                      Start cataloging your bobblehead collection today
                    </p>
                    <SignUpButton mode='modal'>
                      <Button className='w-full'>Sign Up</Button>
                    </SignUpButton>
                  </div>
                }
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
