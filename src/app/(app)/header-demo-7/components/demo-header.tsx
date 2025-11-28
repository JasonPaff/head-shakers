'use client';

import { useState } from 'react';
import Link from 'next/link';
import { $path } from 'next-typesafe-url';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import {
  SearchIcon,
  BellIcon,
  MenuIcon,
  XIcon,
  LayoutGridIcon,
  SparklesIcon,
  SettingsIcon,
  PlusCircleIcon,
  HomeIcon,
  ShieldIcon,
  BarChartIcon,
  UsersIcon,
  FileTextIcon,
  BellRingIcon,
  UploadIcon,
  ChevronDownIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { AuthContent } from '@/components/ui/auth';
import { useAdminRole } from '@/hooks/use-admin-role';
import { useToggle } from '@/hooks/use-toggle';

export function DemoHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useToggle(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const { isAdmin, isLoading: adminLoading } = useAdminRole();

  return (
    <header className='sticky top-0 z-50 w-full'>
      {/* Desktop: Split Asymmetric Layout */}
      <div className='hidden md:flex'>
        {/* Left Zone - 30% - Primary Background with Logo */}
        <div
          className='relative flex items-center justify-center bg-primary px-8 py-4'
          style={{
            width: '30%',
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
          }}
        >
          <Link
            href={$path({ route: '/' })}
            className='flex items-center space-x-3 text-primary-foreground transition-opacity hover:opacity-90'
            aria-label='Head Shakers Home'
          >
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20'>
              <span className='text-2xl'>🎭</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-xl font-bold leading-tight'>Head</span>
              <span className='text-xl font-bold leading-tight'>Shakers</span>
            </div>
          </Link>
        </div>

        {/* Right Zone - 70% - Navigation & Controls */}
        <div className='flex flex-1 items-center justify-between bg-card px-6 py-4 shadow-sm'>
          {/* Browse Navigation */}
          <nav className='flex items-center space-x-1'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' className='gap-1' aria-label='Browse menu'>
                  <LayoutGridIcon className='h-4 w-4' />
                  <span className='hidden lg:inline'>Browse</span>
                  <ChevronDownIcon className='h-3 w-3' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-48'>
                <DropdownMenuItem asChild>
                  <Link href={$path({ route: '/browse' })} className='flex items-center gap-2'>
                    <LayoutGridIcon className='h-4 w-4' />
                    Collections
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={$path({ route: '/browse/featured' })} className='flex items-center gap-2'>
                    <SparklesIcon className='h-4 w-4' />
                    Featured
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={$path({ route: '/browse/search' })} className='flex items-center gap-2'>
                    <SearchIcon className='h-4 w-4' />
                    Search
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={$path({ route: '/browse/categories' })} className='flex items-center gap-2'>
                    <LayoutGridIcon className='h-4 w-4' />
                    Categories
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Collection Menu - Auth Only */}
            <AuthContent>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm' className='gap-1' aria-label='My collection menu'>
                    <HomeIcon className='h-4 w-4' />
                    <span className='hidden lg:inline'>My Collection</span>
                    <ChevronDownIcon className='h-3 w-3' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start' className='w-56'>
                  <DropdownMenuItem asChild>
                    <Link
                      href={$path({ route: '/dashboard/collection' })}
                      className='flex items-center gap-2'
                    >
                      <HomeIcon className='h-4 w-4' />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={$path({ route: '/bobbleheads/add' })} className='flex items-center gap-2'>
                      <PlusCircleIcon className='h-4 w-4' />
                      Add Bobblehead
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href={$path({ route: '/settings/data/import' })}
                      className='flex items-center gap-2'
                    >
                      <UploadIcon className='h-4 w-4' />
                      Import Data
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={$path({ route: '/settings' })} className='flex items-center gap-2'>
                      <SettingsIcon className='h-4 w-4' />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </AuthContent>

            {/* Admin Menu - Admin Only */}
            <AuthContent>
              {!adminLoading && isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='sm' className='gap-1' aria-label='Admin menu'>
                      <ShieldIcon className='h-4 w-4' />
                      <span className='hidden lg:inline'>Admin</span>
                      <ChevronDownIcon className='h-3 w-3' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-56'>
                    <DropdownMenuItem asChild>
                      <Link
                        href={$path({ route: '/admin/featured-content' })}
                        className='flex items-center gap-2'
                      >
                        <SparklesIcon className='h-4 w-4' />
                        Featured Content
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={$path({ route: '/admin/analytics' })} className='flex items-center gap-2'>
                        <BarChartIcon className='h-4 w-4' />
                        Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={$path({ route: '/admin/launch-notifications' })}
                        className='flex items-center gap-2'
                      >
                        <BellRingIcon className='h-4 w-4' />
                        Launch Notifications
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={$path({ route: '/admin/reports' })} className='flex items-center gap-2'>
                        <FileTextIcon className='h-4 w-4' />
                        Reports
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={$path({ route: '/admin/users' })} className='flex items-center gap-2'>
                        <UsersIcon className='h-4 w-4' />
                        Users
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </AuthContent>
          </nav>

          {/* Right Controls */}
          <div className='flex items-center gap-2'>
            {/* Search */}
            <div
              className={`flex items-center transition-all duration-300 ${searchExpanded ? 'w-64' : 'w-10'}`}
            >
              {searchExpanded ?
                <div className='flex w-full items-center gap-2'>
                  <div className='relative flex-1'>
                    <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                    <Input
                      type='search'
                      placeholder='Search collections...'
                      className='pl-9 pr-3'
                      autoFocus
                      aria-label='Search collections'
                    />
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setSearchExpanded(false)}
                    aria-label='Close search'
                  >
                    <XIcon className='h-4 w-4' />
                  </Button>
                </div>
              : <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setSearchExpanded(true)}
                  aria-label='Open search'
                >
                  <SearchIcon className='h-4 w-4' />
                </Button>
              }
            </div>

            {/* Notifications - Auth Only */}
            <AuthContent>
              <Button variant='ghost' size='icon' className='relative' aria-label='Notifications'>
                <BellIcon className='h-4 w-4' />
                <span className='absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary' />
              </Button>
            </AuthContent>

            <Separator orientation='vertical' className='h-6' />

            {/* User Menu */}
            <AuthContent
              fallback={
                <div className='flex items-center gap-2'>
                  <SignInButton mode='modal'>
                    <Button variant='ghost' size='sm'>
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode='modal'>
                    <Button size='sm'>Sign Up</Button>
                  </SignUpButton>
                </div>
              }
            >
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'h-8 w-8',
                  },
                }}
              />
            </AuthContent>
          </div>
        </div>
      </div>

      {/* Mobile: Stacked Asymmetric Zones */}
      <div className='flex flex-col md:hidden'>
        {/* Top Zone - Primary with Logo */}
        <div className='relative bg-primary px-4 py-3'>
          <div
            className='absolute bottom-0 left-0 right-0 h-3 bg-card'
            style={{
              clipPath: 'polygon(0 50%, 100% 0, 100% 100%, 0 100%)',
            }}
          />
          <div className='relative flex items-center justify-between'>
            <Link
              href={$path({ route: '/' })}
              className='flex items-center space-x-2 text-primary-foreground'
              aria-label='Head Shakers Home'
            >
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20'>
                <span className='text-lg'>🎭</span>
              </div>
              <span className='text-lg font-bold'>Head Shakers</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-primary-foreground'
                  aria-label='Toggle menu'
                >
                  <MenuIcon className='h-5 w-5' />
                </Button>
              </SheetTrigger>
              <SheetContent side='right' className='w-80'>
                <MobileMenu isAdmin={isAdmin} onClose={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Bottom Zone - Controls */}
        <div className='flex items-center justify-between bg-card px-4 py-2 shadow-sm'>
          {/* Search */}
          <div className='flex-1'>
            <div className='relative'>
              <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Search...'
                className='h-9 pl-9 pr-3'
                aria-label='Search collections'
              />
            </div>
          </div>

          {/* Right Icons */}
          <div className='ml-2 flex items-center gap-1'>
            <AuthContent>
              <Button variant='ghost' size='icon' className='relative h-9 w-9' aria-label='Notifications'>
                <BellIcon className='h-4 w-4' />
                <span className='absolute right-1 top-1 h-2 w-2 rounded-full bg-primary' />
              </Button>
            </AuthContent>

            <AuthContent
              fallback={
                <SignInButton mode='modal'>
                  <Button variant='ghost' size='sm' className='h-9'>
                    Sign In
                  </Button>
                </SignInButton>
              }
            >
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'h-7 w-7',
                  },
                }}
              />
            </AuthContent>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ isAdmin, onClose }: { isAdmin: boolean; onClose: () => void }) {
  return (
    <div className='flex flex-col space-y-6 pt-6'>
      {/* Browse Section */}
      <div>
        <h3 className='mb-3 px-2 text-sm font-semibold text-muted-foreground'>Browse</h3>
        <nav className='space-y-1'>
          <Link
            href={$path({ route: '/browse' })}
            className='flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent'
            onClick={onClose}
          >
            <LayoutGridIcon className='h-4 w-4' />
            Collections
          </Link>
          <Link
            href={$path({ route: '/browse/featured' })}
            className='flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent'
            onClick={onClose}
          >
            <SparklesIcon className='h-4 w-4' />
            Featured
          </Link>
          <Link
            href={$path({ route: '/browse/search' })}
            className='flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent'
            onClick={onClose}
          >
            <SearchIcon className='h-4 w-4' />
            Search
          </Link>
          <Link
            href={$path({ route: '/browse/categories' })}
            className='flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent'
            onClick={onClose}
          >
            <LayoutGridIcon className='h-4 w-4' />
            Categories
          </Link>
        </nav>
      </div>

      <Separator />

      {/* My Collection Section - Auth Only */}
      <AuthContent>
        <div>
          <h3 className='mb-3 px-2 text-sm font-semibold text-muted-foreground'>My Collection</h3>
          <nav className='space-y-1'>
            <Link
              href={$path({ route: '/dashboard/collection' })}
              className='flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent'
              onClick={onClose}
            >
              <HomeIcon className='h-4 w-4' />
              Dashboard
            </Link>
            <Link
              href={$path({ route: '/bobbleheads/add' })}
              className='flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent'
              onClick={onClose}
            >
              <PlusCircleIcon className='h-4 w-4' />
              Add Bobblehead
            </Link>
            <Link
              href={$path({ route: '/settings/data/import' })}
              className='flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent'
              onClick={onClose}
            >
              <UploadIcon className='h-4 w-4' />
              Import Data
            </Link>
            <Link
              href={$path({ route: '/settings' })}
              className='flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent'
              onClick={onClose}
            >
              <SettingsIcon className='h-4 w-4' />
              Settings
            </Link>
          </nav>
        </div>
        <Separator />
      </AuthContent>

      {/* Admin Section - Admin Only */}
      {isAdmin && (
        <AuthContent>
          <div>
            <h3 className='mb-3 px-2 text-sm font-semibold text-muted-foreground'>Admin</h3>
            <nav className='space-y-1'>
              <Link
                href={$path({ route: '/admin/featured-content' })}
                className='flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent'
                onClick={onClose}
              >
                <SparklesIcon className='h-4 w-4' />
                Featured Content
              </Link>
              <Link
                href={$path({ route: '/admin/analytics' })}
                className='flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent'
                onClick={onClose}
              >
                <BarChartIcon className='h-4 w-4' />
                Analytics
              </Link>
              <Link
                href={$path({ route: '/admin/launch-notifications' })}
                className='flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent'
                onClick={onClose}
              >
                <BellRingIcon className='h-4 w-4' />
                Launch Notifications
              </Link>
              <Link
                href={$path({ route: '/admin/reports' })}
                className='flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent'
                onClick={onClose}
              >
                <FileTextIcon className='h-4 w-4' />
                Reports
              </Link>
              <Link
                href={$path({ route: '/admin/users' })}
                className='flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent'
                onClick={onClose}
              >
                <UsersIcon className='h-4 w-4' />
                Users
              </Link>
            </nav>
          </div>
        </AuthContent>
      )}
    </div>
  );
}
