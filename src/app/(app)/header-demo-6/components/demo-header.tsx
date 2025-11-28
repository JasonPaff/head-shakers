'use client';

import { useState } from 'react';
import { $path } from 'next-typesafe-url';
import { BellIcon, MenuIcon, SearchIcon, XIcon, HomeIcon } from 'lucide-react';
import { UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AuthContent } from '@/components/ui/auth';
import { useAdminRole } from '@/hooks/use-admin-role';
import { useToggle } from '@/hooks/use-toggle';
import { BrowseMenu } from './browse-menu';
import { AdminMenu } from './admin-menu';
import { CollectionMenu } from './collection-menu';

export function DemoHeader() {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [mobileOpen, toggleMobile] = useToggle(false);
  const { isAdmin } = useAdminRole();

  return (
    <header className='sticky top-0 z-50 border-b-4 border-primary bg-gradient-to-r from-primary to-amber-500 shadow-[0_4px_0_0_theme(colors.slate.900)]'>
      {/* Retro pattern overlay */}
      <div
        className='pointer-events-none absolute inset-0 opacity-10'
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          )`,
        }}
      />

      <div className='container relative mx-auto'>
        <div className='flex h-16 items-center justify-between gap-4 px-4 lg:h-20'>
          {/* Logo */}
          <a
            href={$path({ route: '/' })}
            className='group flex items-center gap-2 transition-transform hover:scale-105'
          >
            <div className='flex h-10 w-10 items-center justify-center rounded-lg border-4 border-slate-900 bg-amber-400 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all group-hover:shadow-[6px_6px_0_0_theme(colors.slate.900)] lg:h-12 lg:w-12'>
              <HomeIcon className='h-6 w-6 text-slate-900 lg:h-7 lg:w-7' />
            </div>
            <span className='hidden font-black uppercase tracking-tight text-slate-900 sm:block sm:text-xl lg:text-2xl'>
              Head Shakers
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className='hidden items-center gap-2 lg:flex xl:gap-3'>
            <BrowseMenu />
            <AuthContent>
              <CollectionMenu />
            </AuthContent>
            {isAdmin && <AdminMenu />}
          </nav>

          {/* Search Bar (Desktop) */}
          <div className='hidden flex-1 max-w-md lg:block xl:max-w-lg'>
            <div className='relative'>
              <Input
                type='search'
                placeholder='Search collections...'
                className='h-12 border-4 border-slate-900 bg-amber-100 pl-12 pr-4 font-bold placeholder:text-slate-500 focus-visible:ring-4 focus-visible:ring-amber-400'
              />
              <SearchIcon className='absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-700' />
            </div>
          </div>

          {/* Search Icon (Tablet) */}
          <button
            onClick={() => setSearchExpanded(!searchExpanded)}
            className='flex h-12 w-12 items-center justify-center rounded-lg border-4 border-slate-900 bg-amber-400 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)] lg:hidden'
            aria-label='Toggle search'
          >
            <SearchIcon className='h-6 w-6 text-slate-900' />
          </button>

          {/* Right Actions */}
          <div className='flex items-center gap-2'>
            {/* Notifications */}
            <AuthContent>
              <button
                className='hidden h-12 w-12 items-center justify-center rounded-lg border-4 border-slate-900 bg-amber-400 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)] sm:flex'
                aria-label='Notifications'
              >
                <BellIcon className='h-6 w-6 text-slate-900' />
              </button>
            </AuthContent>

            {/* User Menu */}
            <div className='hidden sm:block'>
              <AuthContent
                signedInContent={
                  <div className='rounded-lg border-4 border-slate-900 bg-amber-100 p-1 shadow-[4px_4px_0_0_theme(colors.slate.900)]'>
                    <UserButton />
                  </div>
                }
                signedOutContent={
                  <div className='flex gap-2'>
                    <SignInButton mode='modal'>
                      <Button
                        variant='outline'
                        className='h-12 border-4 border-slate-900 bg-amber-100 font-black uppercase text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:bg-amber-200 hover:shadow-[6px_6px_0_0_theme(colors.slate.900)]'
                      >
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode='modal'>
                      <Button className='h-12 border-4 border-slate-900 bg-gradient-to-br from-pink-500 to-purple-600 font-black uppercase text-white shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)] hover:brightness-110'>
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </div>
                }
              />
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={toggleMobile}>
              <SheetTrigger asChild>
                <button
                  className='flex h-12 w-12 items-center justify-center rounded-lg border-4 border-slate-900 bg-pink-500 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)] lg:hidden'
                  aria-label='Open menu'
                >
                  <MenuIcon className='h-6 w-6 text-white' />
                </button>
              </SheetTrigger>
              <SheetContent
                side='right'
                className='w-full border-l-4 border-slate-900 bg-gradient-to-b from-primary to-amber-500 p-0 sm:max-w-md'
              >
                <div className='flex h-full flex-col'>
                  {/* Mobile Header */}
                  <div className='flex items-center justify-between border-b-4 border-slate-900 bg-amber-400 p-4'>
                    <span className='font-black uppercase text-slate-900'>Menu</span>
                    <button
                      onClick={toggleMobile}
                      className='flex h-10 w-10 items-center justify-center rounded-lg border-4 border-slate-900 bg-pink-500 shadow-[4px_4px_0_0_theme(colors.slate.900)]'
                      aria-label='Close menu'
                    >
                      <XIcon className='h-5 w-5 text-white' />
                    </button>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className='flex-1 overflow-y-auto p-4'>
                    <div className='space-y-3'>
                      {/* Browse Section */}
                      <div className='space-y-2'>
                        <h3 className='font-black uppercase text-slate-900'>Browse</h3>
                        <a
                          href={$path({ route: '/browse' })}
                          className='block rounded-lg border-4 border-slate-900 bg-amber-100 p-3 font-bold text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)]'
                        >
                          Collections
                        </a>
                        <a
                          href={$path({ route: '/browse/featured' })}
                          className='block rounded-lg border-4 border-slate-900 bg-amber-100 p-3 font-bold text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)]'
                        >
                          Featured
                        </a>
                        <a
                          href={$path({ route: '/browse/search' })}
                          className='block rounded-lg border-4 border-slate-900 bg-amber-100 p-3 font-bold text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)]'
                        >
                          Search
                        </a>
                        <a
                          href={$path({ route: '/browse/categories' })}
                          className='block rounded-lg border-4 border-slate-900 bg-amber-100 p-3 font-bold text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)]'
                        >
                          Categories
                        </a>
                      </div>

                      {/* Collection Section (Auth) */}
                      <AuthContent>
                        <div className='space-y-2'>
                          <h3 className='font-black uppercase text-slate-900'>My Collection</h3>
                          <a
                            href={$path({ route: '/dashboard/collection' })}
                            className='block rounded-lg border-4 border-slate-900 bg-amber-100 p-3 font-bold text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)]'
                          >
                            Dashboard
                          </a>
                          <a
                            href={$path({ route: '/bobbleheads/add' })}
                            className='block rounded-lg border-4 border-slate-900 bg-amber-100 p-3 font-bold text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)]'
                          >
                            Add Bobblehead
                          </a>
                          <a
                            href={$path({ route: '/settings/data/import' })}
                            className='block rounded-lg border-4 border-slate-900 bg-amber-100 p-3 font-bold text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)]'
                          >
                            Import Data
                          </a>
                          <a
                            href={$path({ route: '/settings' })}
                            className='block rounded-lg border-4 border-slate-900 bg-amber-100 p-3 font-bold text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)]'
                          >
                            Settings
                          </a>
                        </div>
                      </AuthContent>

                      {/* Admin Section */}
                      {isAdmin && (
                        <div className='space-y-2'>
                          <h3 className='font-black uppercase text-slate-900'>Admin</h3>
                          <a
                            href={$path({ route: '/admin/featured-content' })}
                            className='block rounded-lg border-4 border-slate-900 bg-pink-400 p-3 font-bold text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)]'
                          >
                            Featured Content
                          </a>
                          <a
                            href={$path({ route: '/admin/analytics' })}
                            className='block rounded-lg border-4 border-slate-900 bg-pink-400 p-3 font-bold text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)]'
                          >
                            Analytics
                          </a>
                          <a
                            href={$path({ route: '/admin/launch-notifications' })}
                            className='block rounded-lg border-4 border-slate-900 bg-pink-400 p-3 font-bold text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)]'
                          >
                            Launch Notifications
                          </a>
                          <a
                            href={$path({ route: '/admin/reports' })}
                            className='block rounded-lg border-4 border-slate-900 bg-pink-400 p-3 font-bold text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)]'
                          >
                            Reports
                          </a>
                          <a
                            href={$path({ route: '/admin/users' })}
                            className='block rounded-lg border-4 border-slate-900 bg-pink-400 p-3 font-bold text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)]'
                          >
                            Users
                          </a>
                        </div>
                      )}

                      {/* Notifications (Mobile) */}
                      <AuthContent>
                        <button className='w-full rounded-lg border-4 border-slate-900 bg-amber-100 p-3 text-left font-bold text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)]'>
                          <div className='flex items-center gap-2'>
                            <BellIcon className='h-5 w-5' />
                            Notifications
                          </div>
                        </button>
                      </AuthContent>
                    </div>
                  </nav>

                  {/* Mobile Footer */}
                  <div className='border-t-4 border-slate-900 bg-amber-400 p-4'>
                    <AuthContent
                      signedInContent={
                        <div className='flex items-center justify-between'>
                          <span className='font-bold text-slate-900'>Account</span>
                          <div className='rounded-lg border-4 border-slate-900 bg-amber-100 p-1'>
                            <UserButton />
                          </div>
                        </div>
                      }
                      signedOutContent={
                        <div className='flex gap-2'>
                          <SignInButton mode='modal'>
                            <Button className='flex-1 border-4 border-slate-900 bg-amber-100 font-black uppercase text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)]'>
                              Sign In
                            </Button>
                          </SignInButton>
                          <SignUpButton mode='modal'>
                            <Button className='flex-1 border-4 border-slate-900 bg-gradient-to-br from-pink-500 to-purple-600 font-black uppercase text-white shadow-[4px_4px_0_0_theme(colors.slate.900)]'>
                              Sign Up
                            </Button>
                          </SignUpButton>
                        </div>
                      }
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Expanded Search (Tablet) */}
        {searchExpanded && (
          <div className='border-t-4 border-slate-900 bg-amber-400 p-4 lg:hidden'>
            <div className='relative'>
              <Input
                type='search'
                placeholder='Search collections...'
                className='h-12 border-4 border-slate-900 bg-amber-100 pl-12 pr-4 font-bold placeholder:text-slate-500'
                autoFocus
              />
              <SearchIcon className='absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-700' />
            </div>
          </div>
        )}
      </div>

      {/* Bottom neon glow effect */}
      <div className='h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 opacity-50' />
    </header>
  );
}
