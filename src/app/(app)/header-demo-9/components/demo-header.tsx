'use client';

import { useState } from 'react';
import Link from 'next/link';
import { $path } from 'next-typesafe-url';
import {
  BellIcon,
  MenuIcon,
  SearchIcon,
  XIcon,
  LayoutGridIcon,
  StarIcon,
  CompassIcon,
  TagIcon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  FolderIcon,
  UploadIcon,
  SettingsIcon,
  BarChartIcon,
  UsersIcon,
  FlagIcon,
  FileTextIcon,
  BellRingIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
} from 'lucide-react';
import { UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { AuthContent } from '@/components/ui/auth';
import { useAdminRole } from '@/hooks/use-admin-role';
import { useToggle } from '@/hooks/use-toggle';

interface MegaMenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  href: string;
  badge?: string;
}

interface MegaMenuSection {
  title: string;
  items: MegaMenuItem[];
}

const browseMegaMenu: MegaMenuSection[] = [
  {
    title: 'Explore',
    items: [
      {
        icon: LayoutGridIcon,
        label: 'Collections',
        description: 'Browse all bobblehead collections',
        href: $path({ route: '/browse' }),
      },
      {
        icon: StarIcon,
        label: 'Featured',
        description: 'Curated highlights from our community',
        href: $path({ route: '/browse/featured' }),
        badge: 'Popular',
      },
    ],
  },
  {
    title: 'Discover',
    items: [
      {
        icon: CompassIcon,
        label: 'Search',
        description: 'Find specific bobbleheads and collectors',
        href: $path({ route: '/browse/search' }),
      },
      {
        icon: TagIcon,
        label: 'Categories',
        description: 'Browse by sport, team, or theme',
        href: $path({ route: '/browse/categories' }),
      },
    ],
  },
];

const collectionMegaMenu: MegaMenuSection[] = [
  {
    title: 'My Collection',
    items: [
      {
        icon: LayoutDashboardIcon,
        label: 'Dashboard',
        description: 'View and manage your collection',
        href: $path({ route: '/dashboard/collection' }),
      },
      {
        icon: PlusCircleIcon,
        label: 'Add Bobblehead',
        description: 'Add a new item to your collection',
        href: $path({ route: '/bobbleheads/add' }),
      },
      {
        icon: FolderIcon,
        label: 'My Collections',
        description: 'Organize into subcollections',
        href: $path({ route: '/dashboard/collection' }),
      },
    ],
  },
  {
    title: 'Tools',
    items: [
      {
        icon: UploadIcon,
        label: 'Import Data',
        description: 'Bulk import your collection data',
        href: $path({ route: '/settings/data/import' }),
      },
      {
        icon: SettingsIcon,
        label: 'Settings',
        description: 'Manage your account preferences',
        href: $path({ route: '/settings' }),
      },
    ],
  },
];

const adminMegaMenu: MegaMenuSection[] = [
  {
    title: 'Content Management',
    items: [
      {
        icon: SparklesIcon,
        label: 'Featured Content',
        description: 'Manage featured collections and items',
        href: $path({ route: '/admin/featured-content' }),
      },
      {
        icon: BellRingIcon,
        label: 'Launch Notifications',
        description: 'Send announcements to users',
        href: $path({ route: '/admin/launch-notifications' }),
      },
    ],
  },
  {
    title: 'Analytics & Users',
    items: [
      {
        icon: BarChartIcon,
        label: 'Analytics',
        description: 'Platform metrics and insights',
        href: $path({ route: '/admin/analytics' }),
      },
      {
        icon: FlagIcon,
        label: 'Reports',
        description: 'Review flagged content and reports',
        href: $path({ route: '/admin/reports' }),
      },
      {
        icon: UsersIcon,
        label: 'Users',
        description: 'User management and moderation',
        href: $path({ route: '/admin/users' }),
      },
    ],
  },
];

function MegaMenuDropdown({
  title,
  sections,
  isOpen,
  onToggle,
}: {
  title: string;
  sections: MegaMenuSection[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className='relative' onMouseLeave={() => isOpen && onToggle()}>
      <button
        className='px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors'
        onMouseEnter={onToggle}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup='true'
      >
        {title}
      </button>

      {isOpen && (
        <div className='absolute left-0 top-full w-screen max-w-4xl -ml-[calc(50vw-50%)] z-50 animate-in fade-in slide-in-from-top-2 duration-200'>
          <div className='mt-2 bg-popover border border-border rounded-lg shadow-lg p-6'>
            <div className='grid grid-cols-2 gap-8'>
              {sections.map((section, idx) => (
                <div key={idx}>
                  <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4'>
                    {section.title}
                  </h3>
                  <div className='space-y-1'>
                    {section.items.map((item, itemIdx) => (
                      <Link
                        key={itemIdx}
                        href={item.href}
                        className='group flex items-start gap-3 p-3 rounded-md hover:bg-accent transition-colors'
                      >
                        <div className='mt-1'>
                          <item.icon className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm font-medium text-foreground group-hover:text-primary transition-colors'>
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground'>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className='text-xs text-muted-foreground mt-0.5'>{item.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileMenu() {
  const [isOpen, toggle] = useToggle(false);
  const { isAdmin } = useAdminRole();

  return (
    <Sheet open={isOpen} onOpenChange={toggle}>
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='lg:hidden'>
          <MenuIcon className='h-5 w-5' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='w-[85vw] sm:w-[350px] overflow-y-auto'>
        <div className='flex items-center justify-between mb-6'>
          <Link href={$path({ route: '/' })} className='text-xl font-bold text-primary' onClick={toggle}>
            Head Shakers
          </Link>
          <Button variant='ghost' size='icon' onClick={toggle}>
            <XIcon className='h-5 w-5' />
          </Button>
        </div>

        <div className='space-y-6'>
          <div>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
              Browse
            </h3>
            <div className='space-y-1'>
              {browseMegaMenu.flatMap((section) =>
                section.items.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={toggle}
                    className='flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors'
                  >
                    <item.icon className='h-5 w-5 text-muted-foreground' />
                    <div className='flex-1'>
                      <div className='text-sm font-medium'>{item.label}</div>
                      <div className='text-xs text-muted-foreground'>{item.description}</div>
                    </div>
                  </Link>
                )),
              )}
            </div>
          </div>

          <Separator />

          <AuthContent>
            <div>
              <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
                My Collection
              </h3>
              <div className='space-y-1'>
                {collectionMegaMenu.flatMap((section) =>
                  section.items.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={toggle}
                      className='flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors'
                    >
                      <item.icon className='h-5 w-5 text-muted-foreground' />
                      <div className='flex-1'>
                        <div className='text-sm font-medium'>{item.label}</div>
                        <div className='text-xs text-muted-foreground'>{item.description}</div>
                      </div>
                    </Link>
                  )),
                )}
              </div>
            </div>
          </AuthContent>

          {isAdmin && (
            <>
              <Separator />
              <div>
                <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
                  Admin
                </h3>
                <div className='space-y-1'>
                  {adminMegaMenu.flatMap((section) =>
                    section.items.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={toggle}
                        className='flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors'
                      >
                        <item.icon className='h-5 w-5 text-muted-foreground' />
                        <div className='flex-1'>
                          <div className='text-sm font-medium'>{item.label}</div>
                          <div className='text-xs text-muted-foreground'>{item.description}</div>
                        </div>
                      </Link>
                    )),
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label='Toggle theme'
    >
      <SunIcon className='h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0' />
      <MoonIcon className='absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100' />
    </Button>
  );
}

export function DemoHeader() {
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [searchExpanded, toggleSearchExpanded] = useToggle(false);
  const { isAdmin } = useAdminRole();

  const toggleMegaMenu = (menuName: string) => {
    setActiveMegaMenu((current) => (current === menuName ? null : menuName));
  };

  return (
    <header className='sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto'>
        <div className='flex h-16 items-center justify-between gap-4'>
          {/* Left Section: Mobile Menu + Logo */}
          <div className='flex items-center gap-2'>
            <MobileMenu />
            <Link
              href={$path({ route: '/' })}
              className='text-xl font-bold text-primary flex items-center gap-2'
            >
              <div className='h-8 w-8 rounded-full bg-primary flex items-center justify-center'>
                <span className='text-primary-foreground text-sm font-bold'>HS</span>
              </div>
              <span className='hidden sm:inline'>Head Shakers</span>
            </Link>
          </div>

          {/* Center Section: Desktop Navigation with Mega Menus */}
          <nav className='hidden lg:flex items-center gap-1'>
            <MegaMenuDropdown
              title='Browse'
              sections={browseMegaMenu}
              isOpen={activeMegaMenu === 'browse'}
              onToggle={() => toggleMegaMenu('browse')}
            />

            <AuthContent>
              <MegaMenuDropdown
                title='My Collection'
                sections={collectionMegaMenu}
                isOpen={activeMegaMenu === 'collection'}
                onToggle={() => toggleMegaMenu('collection')}
              />
            </AuthContent>

            {isAdmin && (
              <MegaMenuDropdown
                title='Admin'
                sections={adminMegaMenu}
                isOpen={activeMegaMenu === 'admin'}
                onToggle={() => toggleMegaMenu('admin')}
              />
            )}
          </nav>

          {/* Right Section: Search + Actions */}
          <div className='flex items-center gap-2'>
            {/* Search */}
            <div
              className={`flex items-center transition-all duration-200 ${
                searchExpanded ? 'w-48 sm:w-64' : 'w-10'
              }`}
            >
              {searchExpanded ?
                <div className='relative w-full'>
                  <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    type='search'
                    placeholder='Search collections...'
                    className='w-full pl-9 pr-3 h-10'
                    autoFocus
                    onBlur={() => toggleSearchExpanded()}
                  />
                </div>
              : <Button variant='ghost' size='icon' onClick={toggleSearchExpanded} aria-label='Search'>
                  <SearchIcon className='h-5 w-5' />
                </Button>
              }
            </div>

            {/* Notifications */}
            <AuthContent>
              <Button variant='ghost' size='icon' aria-label='Notifications'>
                <BellIcon className='h-5 w-5' />
              </Button>
            </AuthContent>

            {/* Theme Toggle */}
            <ThemeToggle />

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
              <UserButton />
            </AuthContent>
          </div>
        </div>
      </div>
    </header>
  );
}
