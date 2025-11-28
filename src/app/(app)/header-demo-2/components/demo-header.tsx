'use client';

import { $path } from 'next-typesafe-url';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import {
  BellIcon,
  MenuIcon,
  SearchIcon,
  XIcon,
  SparklesIcon,
  HomeIcon,
  LayoutGridIcon,
  StarIcon,
  FolderIcon,
  PlusCircleIcon,
  SettingsIcon,
  UploadIcon,
  BarChartIcon,
  UsersIcon,
  FileTextIcon,
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, mobileMenuControls] = useToggle(false);
  const [isSearchExpanded, searchControls] = useToggle(false);
  const { isAdmin, isModerator } = useAdminRole();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdminUser = isAdmin || isModerator;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ?
          'bg-background/95 backdrop-blur-xl shadow-lg shadow-primary/5'
        : 'bg-background/80 backdrop-blur-md'
      }`}
    >
      <div className='container mx-auto'>
        <div className='flex h-16 items-center justify-between gap-4 px-4'>
          {/* Logo */}
          <Link
            href={$path({ route: '/' })}
            className='group flex items-center gap-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 px-4 py-2 transition-all hover:from-primary/30 hover:to-primary/10 hover:shadow-lg hover:shadow-primary/20'
          >
            <SparklesIcon className='h-5 w-5 text-primary transition-transform group-hover:rotate-12' />
            <span className='hidden font-bold text-foreground sm:inline-block'>Head Shakers</span>
            <span className='font-bold text-foreground sm:hidden'>HS</span>
          </Link>

          {/* Desktop Navigation - Browse Menu */}
          <nav className='hidden items-center gap-1 lg:flex'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='rounded-full bg-card/50 backdrop-blur-sm hover:bg-accent/80 hover:shadow-md'
                >
                  <LayoutGridIcon className='mr-2 h-4 w-4' />
                  Browse
                  <ChevronDownIcon className='ml-1 h-3 w-3 opacity-50' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='start'
                className='w-48 rounded-2xl border border-border/50 bg-popover/95 backdrop-blur-xl'
              >
                <DropdownMenuItem asChild>
                  <Link href={$path({ route: '/browse' })} className='cursor-pointer rounded-lg'>
                    <FolderIcon className='mr-2 h-4 w-4' />
                    Collections
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={$path({ route: '/browse/featured' })} className='cursor-pointer rounded-lg'>
                    <StarIcon className='mr-2 h-4 w-4' />
                    Featured
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={$path({ route: '/browse/search' })} className='cursor-pointer rounded-lg'>
                    <SearchIcon className='mr-2 h-4 w-4' />
                    Search
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={$path({ route: '/browse/categories' })} className='cursor-pointer rounded-lg'>
                    <LayoutGridIcon className='mr-2 h-4 w-4' />
                    Categories
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Collection Menu - Auth Only */}
            <AuthContent>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='rounded-full bg-card/50 backdrop-blur-sm hover:bg-accent/80 hover:shadow-md'
                  >
                    <FolderIcon className='mr-2 h-4 w-4' />
                    Collection
                    <ChevronDownIcon className='ml-1 h-3 w-3 opacity-50' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='start'
                  className='w-48 rounded-2xl border border-border/50 bg-popover/95 backdrop-blur-xl'
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href={$path({ route: '/dashboard/collection' })}
                      className='cursor-pointer rounded-lg'
                    >
                      <HomeIcon className='mr-2 h-4 w-4' />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={$path({ route: '/bobbleheads/add' })} className='cursor-pointer rounded-lg'>
                      <PlusCircleIcon className='mr-2 h-4 w-4' />
                      Add Bobblehead
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href={$path({ route: '/settings/data/import' })}
                      className='cursor-pointer rounded-lg'
                    >
                      <UploadIcon className='mr-2 h-4 w-4' />
                      Import Data
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={$path({ route: '/settings' })} className='cursor-pointer rounded-lg'>
                      <SettingsIcon className='mr-2 h-4 w-4' />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </AuthContent>

            {/* Admin Menu - Auth + Admin Only */}
            {isAdminUser && (
              <AuthContent>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      className='rounded-full bg-primary/10 backdrop-blur-sm hover:bg-primary/20 hover:shadow-md hover:shadow-primary/20'
                    >
                      <StarIcon className='mr-2 h-4 w-4 text-primary' />
                      Admin
                      <ChevronDownIcon className='ml-1 h-3 w-3 opacity-50' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align='start'
                    className='w-56 rounded-2xl border border-border/50 bg-popover/95 backdrop-blur-xl'
                  >
                    <DropdownMenuItem asChild>
                      <Link
                        href={$path({ route: '/admin/featured-content' })}
                        className='cursor-pointer rounded-lg'
                      >
                        <StarIcon className='mr-2 h-4 w-4' />
                        Featured Content
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={$path({ route: '/admin/analytics' })} className='cursor-pointer rounded-lg'>
                        <BarChartIcon className='mr-2 h-4 w-4' />
                        Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={$path({ route: '/admin/launch-notifications' })}
                        className='cursor-pointer rounded-lg'
                      >
                        <BellIcon className='mr-2 h-4 w-4' />
                        Launch Notifications
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={$path({ route: '/admin/reports' })} className='cursor-pointer rounded-lg'>
                        <FileTextIcon className='mr-2 h-4 w-4' />
                        Reports
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={$path({ route: '/admin/users' })} className='cursor-pointer rounded-lg'>
                        <UsersIcon className='mr-2 h-4 w-4' />
                        Users
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </AuthContent>
            )}
          </nav>

          {/* Search Bar - Desktop */}
          <div className='hidden flex-1 items-center justify-center md:flex md:max-w-md lg:max-w-lg'>
            <div className='group relative w-full'>
              <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary' />
              <Input
                type='search'
                placeholder='Search collections...'
                className='w-full rounded-full border-border/50 bg-card/50 pl-10 pr-4 backdrop-blur-sm transition-all focus:bg-card/80 focus:shadow-lg focus:shadow-primary/10'
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className='flex items-center gap-2'>
            {/* Search Button - Mobile/Tablet */}
            <Button
              variant='ghost'
              size='icon'
              onClick={searchControls.toggle}
              className='rounded-full bg-card/50 backdrop-blur-sm hover:bg-accent/80 hover:shadow-md md:hidden'
              aria-label='Toggle search'
            >
              {isSearchExpanded ?
                <XIcon className='h-5 w-5' />
              : <SearchIcon className='h-5 w-5' />}
            </Button>

            {/* Notifications - Auth Only */}
            <AuthContent>
              <Button
                variant='ghost'
                size='icon'
                className='hidden rounded-full bg-card/50 backdrop-blur-sm hover:bg-accent/80 hover:shadow-md sm:inline-flex'
                aria-label='Notifications'
              >
                <BellIcon className='h-5 w-5' />
              </Button>
            </AuthContent>

            {/* Theme Toggle */}
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className='hidden rounded-full bg-card/50 backdrop-blur-sm hover:bg-accent/80 hover:shadow-md lg:inline-flex'
              aria-label='Toggle theme'
            >
              {theme === 'dark' ?
                <SunIcon className='h-5 w-5' />
              : <MoonIcon className='h-5 w-5' />}
            </Button>

            {/* User Menu */}
            <div className='rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-1'>
              <AuthContent
                fallback={
                  <div className='flex items-center gap-2'>
                    <SignInButton mode='modal'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='hidden rounded-full hover:bg-accent/80 sm:inline-flex'
                      >
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode='modal'>
                      <Button
                        size='sm'
                        className='rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90'
                      >
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </div>
                }
              >
                <UserButton />
              </AuthContent>
            </div>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={mobileMenuControls.update}>
              <SheetTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='rounded-full bg-card/50 backdrop-blur-sm hover:bg-accent/80 hover:shadow-md lg:hidden'
                  aria-label='Toggle menu'
                >
                  <MenuIcon className='h-5 w-5' />
                </Button>
              </SheetTrigger>
              <SheetContent
                side='right'
                className='w-80 border-l border-border/50 bg-background/95 backdrop-blur-xl'
              >
                <nav className='mt-8 flex flex-col gap-4'>
                  {/* Browse Section */}
                  <div className='space-y-2'>
                    <h3 className='px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      Browse
                    </h3>
                    <Link
                      href={$path({ route: '/browse' })}
                      className='flex items-center gap-3 rounded-xl bg-card/50 px-3 py-2.5 text-sm transition-colors hover:bg-accent/80'
                      onClick={mobileMenuControls.off}
                    >
                      <FolderIcon className='h-4 w-4' />
                      Collections
                    </Link>
                    <Link
                      href={$path({ route: '/browse/featured' })}
                      className='flex items-center gap-3 rounded-xl bg-card/50 px-3 py-2.5 text-sm transition-colors hover:bg-accent/80'
                      onClick={mobileMenuControls.off}
                    >
                      <StarIcon className='h-4 w-4' />
                      Featured
                    </Link>
                    <Link
                      href={$path({ route: '/browse/search' })}
                      className='flex items-center gap-3 rounded-xl bg-card/50 px-3 py-2.5 text-sm transition-colors hover:bg-accent/80'
                      onClick={mobileMenuControls.off}
                    >
                      <SearchIcon className='h-4 w-4' />
                      Search
                    </Link>
                    <Link
                      href={$path({ route: '/browse/categories' })}
                      className='flex items-center gap-3 rounded-xl bg-card/50 px-3 py-2.5 text-sm transition-colors hover:bg-accent/80'
                      onClick={mobileMenuControls.off}
                    >
                      <LayoutGridIcon className='h-4 w-4' />
                      Categories
                    </Link>
                  </div>

                  {/* Collection Section - Auth Only */}
                  <AuthContent>
                    <Separator className='bg-border/50' />
                    <div className='space-y-2'>
                      <h3 className='px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                        My Collection
                      </h3>
                      <Link
                        href={$path({ route: '/dashboard/collection' })}
                        className='flex items-center gap-3 rounded-xl bg-card/50 px-3 py-2.5 text-sm transition-colors hover:bg-accent/80'
                        onClick={mobileMenuControls.off}
                      >
                        <HomeIcon className='h-4 w-4' />
                        Dashboard
                      </Link>
                      <Link
                        href={$path({ route: '/bobbleheads/add' })}
                        className='flex items-center gap-3 rounded-xl bg-card/50 px-3 py-2.5 text-sm transition-colors hover:bg-accent/80'
                        onClick={mobileMenuControls.off}
                      >
                        <PlusCircleIcon className='h-4 w-4' />
                        Add Bobblehead
                      </Link>
                      <Link
                        href={$path({ route: '/settings/data/import' })}
                        className='flex items-center gap-3 rounded-xl bg-card/50 px-3 py-2.5 text-sm transition-colors hover:bg-accent/80'
                        onClick={mobileMenuControls.off}
                      >
                        <UploadIcon className='h-4 w-4' />
                        Import Data
                      </Link>
                      <Link
                        href={$path({ route: '/settings' })}
                        className='flex items-center gap-3 rounded-xl bg-card/50 px-3 py-2.5 text-sm transition-colors hover:bg-accent/80'
                        onClick={mobileMenuControls.off}
                      >
                        <SettingsIcon className='h-4 w-4' />
                        Settings
                      </Link>
                    </div>
                  </AuthContent>

                  {/* Admin Section - Auth + Admin Only */}
                  {isAdminUser && (
                    <AuthContent>
                      <Separator className='bg-border/50' />
                      <div className='space-y-2'>
                        <h3 className='px-3 text-xs font-semibold uppercase tracking-wider text-primary'>
                          Admin
                        </h3>
                        <Link
                          href={$path({ route: '/admin/featured-content' })}
                          className='flex items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-sm transition-colors hover:bg-primary/20'
                          onClick={mobileMenuControls.off}
                        >
                          <StarIcon className='h-4 w-4' />
                          Featured Content
                        </Link>
                        <Link
                          href={$path({ route: '/admin/analytics' })}
                          className='flex items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-sm transition-colors hover:bg-primary/20'
                          onClick={mobileMenuControls.off}
                        >
                          <BarChartIcon className='h-4 w-4' />
                          Analytics
                        </Link>
                        <Link
                          href={$path({ route: '/admin/launch-notifications' })}
                          className='flex items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-sm transition-colors hover:bg-primary/20'
                          onClick={mobileMenuControls.off}
                        >
                          <BellIcon className='h-4 w-4' />
                          Launch Notifications
                        </Link>
                        <Link
                          href={$path({ route: '/admin/reports' })}
                          className='flex items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-sm transition-colors hover:bg-primary/20'
                          onClick={mobileMenuControls.off}
                        >
                          <FileTextIcon className='h-4 w-4' />
                          Reports
                        </Link>
                        <Link
                          href={$path({ route: '/admin/users' })}
                          className='flex items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-sm transition-colors hover:bg-primary/20'
                          onClick={mobileMenuControls.off}
                        >
                          <UsersIcon className='h-4 w-4' />
                          Users
                        </Link>
                      </div>
                    </AuthContent>
                  )}

                  {/* Notifications - Mobile */}
                  <AuthContent>
                    <Separator className='bg-border/50' />
                    <Link
                      href='#'
                      className='flex items-center gap-3 rounded-xl bg-card/50 px-3 py-2.5 text-sm transition-colors hover:bg-accent/80'
                      onClick={mobileMenuControls.off}
                    >
                      <BellIcon className='h-4 w-4' />
                      Notifications
                    </Link>
                  </AuthContent>

                  {/* Theme Toggle - Mobile */}
                  <Separator className='bg-border/50' />
                  <button
                    onClick={() => {
                      setTheme(theme === 'dark' ? 'light' : 'dark');
                    }}
                    className='flex items-center gap-3 rounded-xl bg-card/50 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent/80'
                  >
                    {theme === 'dark' ?
                      <>
                        <SunIcon className='h-4 w-4' />
                        Light Mode
                      </>
                    : <>
                        <MoonIcon className='h-4 w-4' />
                        Dark Mode
                      </>
                    }
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Expandable Search - Mobile/Tablet */}
        {isSearchExpanded && (
          <div className='border-t border-border/50 bg-background/90 p-4 backdrop-blur-md md:hidden'>
            <div className='relative'>
              <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Search collections...'
                autoFocus
                className='w-full rounded-full border-border/50 bg-card/50 pl-10 pr-4 backdrop-blur-sm'
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
