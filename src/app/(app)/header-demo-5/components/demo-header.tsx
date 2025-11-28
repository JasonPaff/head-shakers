'use client';

import { useState } from 'react';
import Link from 'next/link';
import { $path } from 'next-typesafe-url';
import { UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import {
  SearchIcon,
  BellIcon,
  MenuIcon,
  XIcon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  SettingsIcon,
  UploadIcon,
  SparklesIcon,
  BarChart3Icon,
  BellRingIcon,
  FileTextIcon,
  UsersIcon,
  GridIcon,
  StarIcon,
  TagIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { AuthContent } from '@/components/ui/auth';
import { useAdminRole } from '@/hooks/use-admin-role';
import { useToggle } from '@/hooks/use-toggle';

export function DemoHeader() {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [mobileMenuOpen, toggleMobileMenu] = useToggle(false);
  const { isAdmin, isLoading: adminLoading } = useAdminRole();

  return (
    <header className='sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40'>
      {/* Wave decoration - top */}
      <div className='absolute inset-x-0 -top-1 h-2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-b-full blur-sm' />

      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-20 gap-4'>
          {/* Logo - Organic blob shape */}
          <Link
            href={$path({ route: '/' })}
            className='flex items-center gap-3 group relative'
            aria-label='Head Shakers Home'
          >
            <div className='relative'>
              <div className='absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300' />
              <div className='relative w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300'>
                <span className='text-2xl font-bold text-primary-foreground'>H</span>
              </div>
            </div>
            <span className='hidden sm:block text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
              Head Shakers
            </span>
          </Link>

          {/* Desktop Navigation - Flowing pills */}
          <nav className='hidden lg:flex items-center gap-2'>
            {/* Browse Menu - Organic dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='ghost'
                  className='rounded-full px-6 hover:bg-accent/50 transition-all duration-300 hover:shadow-md'
                >
                  <GridIcon className='w-4 h-4 mr-2' />
                  Browse
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='w-64 rounded-3xl shadow-xl border-border/50 bg-card/95 backdrop-blur-sm'
                align='start'
              >
                <div className='space-y-1 p-2'>
                  <NavLink href={$path({ route: '/browse' })} icon={GridIcon}>
                    All Collections
                  </NavLink>
                  <NavLink href={$path({ route: '/browse/featured' })} icon={StarIcon}>
                    Featured
                  </NavLink>
                  <NavLink href={$path({ route: '/browse/search' })} icon={SearchIcon}>
                    Search
                  </NavLink>
                  <NavLink href={$path({ route: '/browse/categories' })} icon={TagIcon}>
                    Categories
                  </NavLink>
                </div>
              </PopoverContent>
            </Popover>

            {/* Collection Menu - Auth only */}
            <AuthContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='ghost'
                    className='rounded-full px-6 hover:bg-accent/50 transition-all duration-300 hover:shadow-md'
                  >
                    <LayoutDashboardIcon className='w-4 h-4 mr-2' />
                    My Collection
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className='w-64 rounded-3xl shadow-xl border-border/50 bg-card/95 backdrop-blur-sm'
                  align='start'
                >
                  <div className='space-y-1 p-2'>
                    <NavLink href={$path({ route: '/dashboard/collection' })} icon={LayoutDashboardIcon}>
                      Dashboard
                    </NavLink>
                    <NavLink href={$path({ route: '/bobbleheads/add' })} icon={PlusCircleIcon}>
                      Add Bobblehead
                    </NavLink>
                    <Separator className='my-2' />
                    <NavLink href={$path({ route: '/settings/data/import' })} icon={UploadIcon}>
                      Import Data
                    </NavLink>
                    <NavLink href={$path({ route: '/settings' })} icon={SettingsIcon}>
                      Settings
                    </NavLink>
                  </div>
                </PopoverContent>
              </Popover>
            </AuthContent>

            {/* Admin Menu - Admin only */}
            {!adminLoading && isAdmin && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='ghost'
                    className='rounded-full px-6 hover:bg-primary/10 text-primary transition-all duration-300 hover:shadow-md'
                  >
                    <SparklesIcon className='w-4 h-4 mr-2' />
                    Admin
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className='w-64 rounded-3xl shadow-xl border-primary/20 bg-card/95 backdrop-blur-sm'
                  align='start'
                >
                  <div className='space-y-1 p-2'>
                    <NavLink href={$path({ route: '/admin/featured-content' })} icon={SparklesIcon}>
                      Featured Content
                    </NavLink>
                    <NavLink href={$path({ route: '/admin/analytics' })} icon={BarChart3Icon}>
                      Analytics
                    </NavLink>
                    <NavLink href={$path({ route: '/admin/launch-notifications' })} icon={BellRingIcon}>
                      Launch Notifications
                    </NavLink>
                    <NavLink href={$path({ route: '/admin/reports' })} icon={FileTextIcon}>
                      Reports
                    </NavLink>
                    <NavLink href={$path({ route: '/admin/users' })} icon={UsersIcon}>
                      Users
                    </NavLink>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </nav>

          {/* Search - Expandable organic pill */}
          <div className='hidden md:flex flex-1 max-w-md items-center justify-end'>
            <div
              className={`
                flex items-center gap-2 rounded-full bg-muted/50 border border-border/50
                transition-all duration-500 ease-in-out shadow-sm hover:shadow-md
                ${searchExpanded ? 'w-full px-4 py-2' : 'w-12 h-12 justify-center cursor-pointer'}
              `}
              onClick={() => !searchExpanded && setSearchExpanded(true)}
            >
              <SearchIcon className='w-5 h-5 text-muted-foreground flex-shrink-0' />
              {searchExpanded && (
                <Input
                  type='search'
                  placeholder='Search collections...'
                  className='border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0'
                  autoFocus
                  onBlur={() => setSearchExpanded(false)}
                  aria-label='Search collections'
                />
              )}
            </div>
          </div>

          {/* Right Actions - Organic flow */}
          <div className='flex items-center gap-2'>
            {/* Notifications - Auth only */}
            <AuthContent>
              <Button
                variant='ghost'
                size='icon'
                className='rounded-full hover:bg-accent/50 transition-all duration-300 hover:shadow-md relative'
                aria-label='Notifications'
              >
                <BellIcon className='w-5 h-5' />
                <span className='absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse' />
              </Button>
            </AuthContent>

            {/* User Menu */}
            <div className='hidden md:block'>
              <AuthContent
                signedOut={
                  <div className='flex items-center gap-2'>
                    <SignInButton mode='modal'>
                      <Button variant='ghost' className='rounded-full px-6 hover:bg-accent/50'>
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode='modal'>
                      <Button className='rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300'>
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </div>
                }
              >
                <div className='rounded-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300'>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'w-10 h-10',
                      },
                    }}
                  />
                </div>
              </AuthContent>
            </div>

            {/* Mobile Menu Toggle */}
            <Sheet open={mobileMenuOpen} onOpenChange={toggleMobileMenu}>
              <SheetTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='lg:hidden rounded-full hover:bg-accent/50'
                  aria-label='Open menu'
                >
                  <MenuIcon className='w-6 h-6' />
                </Button>
              </SheetTrigger>
              <SheetContent
                side='right'
                className='w-80 rounded-l-3xl border-l border-border/50 bg-card/95 backdrop-blur-sm'
              >
                <MobileMenu isAdmin={isAdmin} onClose={() => toggleMobileMenu(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Wave decoration - bottom */}
      <div className='absolute inset-x-0 -bottom-1 h-2 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-t-full blur-sm' />
    </header>
  );
}

function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className='flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-accent/50 transition-all duration-300 group'
    >
      <Icon className='w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300' />
      <span className='text-sm font-medium'>{children}</span>
    </Link>
  );
}

function MobileMenu({ isAdmin, onClose }: { isAdmin: boolean; onClose: () => void }) {
  return (
    <div className='flex flex-col h-full py-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8 px-2'>
        <h2 className='text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
          Menu
        </h2>
        <Button
          variant='ghost'
          size='icon'
          onClick={onClose}
          className='rounded-full hover:bg-accent/50'
          aria-label='Close menu'
        >
          <XIcon className='w-5 h-5' />
        </Button>
      </div>

      {/* Search - Mobile */}
      <div className='mb-6 px-2'>
        <div className='flex items-center gap-2 rounded-full bg-muted/50 border border-border/50 px-4 py-3 shadow-sm'>
          <SearchIcon className='w-5 h-5 text-muted-foreground flex-shrink-0' />
          <Input
            type='search'
            placeholder='Search collections...'
            className='border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0'
            aria-label='Search collections'
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className='flex-1 overflow-y-auto space-y-6'>
        {/* Browse Section */}
        <section className='space-y-1 px-2'>
          <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-4'>
            Browse
          </h3>
          <div className='bg-muted/30 rounded-3xl p-2 space-y-1'>
            <MobileNavLink href={$path({ route: '/browse' })} icon={GridIcon} onClick={onClose}>
              All Collections
            </MobileNavLink>
            <MobileNavLink href={$path({ route: '/browse/featured' })} icon={StarIcon} onClick={onClose}>
              Featured
            </MobileNavLink>
            <MobileNavLink href={$path({ route: '/browse/search' })} icon={SearchIcon} onClick={onClose}>
              Search
            </MobileNavLink>
            <MobileNavLink href={$path({ route: '/browse/categories' })} icon={TagIcon} onClick={onClose}>
              Categories
            </MobileNavLink>
          </div>
        </section>

        {/* Collection Section - Auth only */}
        <AuthContent>
          <section className='space-y-1 px-2'>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-4'>
              My Collection
            </h3>
            <div className='bg-muted/30 rounded-3xl p-2 space-y-1'>
              <MobileNavLink
                href={$path({ route: '/dashboard/collection' })}
                icon={LayoutDashboardIcon}
                onClick={onClose}
              >
                Dashboard
              </MobileNavLink>
              <MobileNavLink
                href={$path({ route: '/bobbleheads/add' })}
                icon={PlusCircleIcon}
                onClick={onClose}
              >
                Add Bobblehead
              </MobileNavLink>
              <Separator className='my-2' />
              <MobileNavLink
                href={$path({ route: '/settings/data/import' })}
                icon={UploadIcon}
                onClick={onClose}
              >
                Import Data
              </MobileNavLink>
              <MobileNavLink href={$path({ route: '/settings' })} icon={SettingsIcon} onClick={onClose}>
                Settings
              </MobileNavLink>
            </div>
          </section>
        </AuthContent>

        {/* Admin Section - Admin only */}
        {isAdmin && (
          <section className='space-y-1 px-2'>
            <h3 className='text-xs font-semibold text-primary uppercase tracking-wider mb-3 px-4'>Admin</h3>
            <div className='bg-primary/5 border border-primary/20 rounded-3xl p-2 space-y-1'>
              <MobileNavLink
                href={$path({ route: '/admin/featured-content' })}
                icon={SparklesIcon}
                onClick={onClose}
              >
                Featured Content
              </MobileNavLink>
              <MobileNavLink
                href={$path({ route: '/admin/analytics' })}
                icon={BarChart3Icon}
                onClick={onClose}
              >
                Analytics
              </MobileNavLink>
              <MobileNavLink
                href={$path({ route: '/admin/launch-notifications' })}
                icon={BellRingIcon}
                onClick={onClose}
              >
                Launch Notifications
              </MobileNavLink>
              <MobileNavLink href={$path({ route: '/admin/reports' })} icon={FileTextIcon} onClick={onClose}>
                Reports
              </MobileNavLink>
              <MobileNavLink href={$path({ route: '/admin/users' })} icon={UsersIcon} onClick={onClose}>
                Users
              </MobileNavLink>
            </div>
          </section>
        )}
      </nav>

      {/* Footer - User actions */}
      <div className='mt-6 px-2 space-y-3'>
        <AuthContent>
          <div className='flex items-center gap-3 bg-muted/30 rounded-full p-3'>
            <div className='flex-1'>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10',
                  },
                }}
              />
            </div>
          </div>
        </AuthContent>
        <AuthContent
          signedOut={
            <div className='space-y-2'>
              <SignInButton mode='modal'>
                <Button variant='outline' className='w-full rounded-full' size='lg'>
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode='modal'>
                <Button className='w-full rounded-full shadow-lg' size='lg'>
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          }
        />
      </div>
    </div>
  );
}

function MobileNavLink({
  href,
  icon: Icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className='flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-accent/50 transition-all duration-300 group'
    >
      <Icon className='w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300' />
      <span className='text-sm font-medium'>{children}</span>
    </Link>
  );
}
