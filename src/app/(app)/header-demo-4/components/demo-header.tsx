'use client';

import './cyber-styles.css';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import {
  BarChartIcon,
  BellIcon,
  BellRingIcon,
  ChevronDownIcon,
  FileTextIcon,
  FolderIcon,
  HomeIcon,
  LayoutGridIcon,
  MenuIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  StarIcon,
  SunIcon,
  UploadIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment, useState } from 'react';

import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAdminRole } from '@/hooks/use-admin-role';
import { useToggle } from '@/hooks/use-toggle';

export function DemoHeader() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [mobileMenuOpen, mobileMenuActions] = useToggle(false);
  const { isAdmin, isLoading: isAdminLoading } = useAdminRole();
  const { setTheme, theme } = useTheme();

  return (
    <header className={'relative border-b-2 border-primary/20 bg-background'}>
      {/* Scan line effect */}
      <div className={'pointer-events-none absolute inset-0 overflow-hidden'}>
        <div
          className={
            'absolute inset-0 animate-pulse bg-gradient-to-b from-primary/5 via-transparent to-transparent'
          }
        />
      </div>

      {/* Main header container */}
      <div className={'relative container mx-auto px-4'}>
        <div className={'flex h-16 items-center justify-between lg:h-20'}>
          {/* Left section: Logo + Desktop Nav */}
          <div className={'flex items-center gap-6'}>
            {/* Logo with angular bracket design */}
            <Link
              aria-label={'Head Shakers Home'}
              className={'group relative flex items-center gap-2'}
              href={$path({ route: '/' })}
            >
              <div
                className={
                  'absolute inset-0 -skew-x-12 bg-primary/10 transition-colors group-hover:bg-primary/20'
                }
              />
              <div className={'relative flex items-center gap-2 px-3 py-2'}>
                <span className={'font-mono text-lg font-bold tracking-wider text-primary'}>[</span>
                <span
                  className={
                    'bg-gradient-to-r from-primary to-orange-300 bg-clip-text text-lg font-bold text-transparent transition-shadow group-hover:shadow-[0_0_10px_theme(colors.primary)] lg:text-xl'
                  }
                >
                  HEAD SHAKERS
                </span>
                <span className={'font-mono text-lg font-bold tracking-wider text-primary'}>]</span>
              </div>
            </Link>

            {/* Desktop Browse Menu */}
            <nav className={'hidden items-center gap-1 lg:flex'}>
              <BrowseMenu />
            </nav>
          </div>

          {/* Center section: Search (Desktop) */}
          <div className={'mx-6 hidden max-w-md flex-1 md:flex'}>
            <SearchBar isExpanded={isSearchExpanded} onExpandChange={setIsSearchExpanded} />
          </div>

          {/* Right section: Actions */}
          <div className={'flex items-center gap-2 lg:gap-3'}>
            {/* Desktop Collection Menu */}
            <AuthContent>
              <div className={'hidden lg:block'}>
                <CollectionMenu />
              </div>
            </AuthContent>

            {/* Desktop Admin Menu */}
            {!isAdminLoading && isAdmin && (
              <div className={'hidden lg:block'}>
                <AdminMenu />
              </div>
            )}

            {/* Notifications */}
            <AuthContent>
              <NotificationButton />
            </AuthContent>

            {/* Theme Toggle */}
            <ThemeToggle setTheme={setTheme} theme={theme} />

            {/* User Menu */}
            <div className={'hidden sm:block'}>
              <AuthContent
                signedIn={<UserButton />}
                signedOut={
                  <div className={'flex items-center gap-2'}>
                    <SignInButton mode={'modal'}>
                      <Button className={'cyber-button'} size={'sm'} variant={'ghost'}>
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode={'modal'}>
                      <Button className={'cyber-button-primary'} size={'sm'}>
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </div>
                }
              />
            </div>

            {/* Mobile Menu Trigger */}
            <div className={'lg:hidden'}>
              <Sheet onOpenChange={(open) => mobileMenuActions.update(open)} open={mobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button aria-label={'Open menu'} className={'cyber-button'} size={'icon'} variant={'ghost'}>
                    <MenuIcon className={'h-5 w-5'} />
                  </Button>
                </SheetTrigger>
                <SheetContent className={'w-80 border-l-2 border-primary/20'} side={'right'}>
                  <MobileMenu
                    isAdmin={isAdmin}
                    isAdminLoading={isAdminLoading}
                    onClose={() => mobileMenuActions.off()}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className={'pb-3 md:hidden'}>
          <SearchBar isExpanded={true} onExpandChange={() => {}} />
        </div>
      </div>

      {/* Bottom accent line with glow */}
      <div
        className={
          'absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_10px_theme(colors.primary)]'
        }
      />
    </header>
  );
}

function AdminMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={'cyber-button gap-1'} size={'sm'} variant={'ghost'}>
          <ShieldIcon className={'h-4 w-4'} />
          <span className={'font-mono text-xs tracking-wider'}>ADMIN</span>
          <ChevronDownIcon className={'ml-1 h-3 w-3'} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={'end'} className={'cyber-dropdown w-56'}>
        <DropdownMenuItem asChild>
          <Link className={'cyber-menu-item'} href={$path({ route: '/admin/featured-content' })}>
            <StarIcon className={'mr-2 h-4 w-4'} />
            <span>Featured Content</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className={'cyber-menu-item'} href={$path({ route: '/admin/analytics' })}>
            <BarChartIcon className={'mr-2 h-4 w-4'} />
            <span>Analytics</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className={'cyber-menu-item'} href={$path({ route: '/admin/launch-notifications' })}>
            <BellRingIcon className={'mr-2 h-4 w-4'} />
            <span>Launch Notifications</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className={'cyber-menu-item'} href={$path({ route: '/admin/reports' })}>
            <FileTextIcon className={'mr-2 h-4 w-4'} />
            <span>Reports</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className={'cyber-menu-item'} href={$path({ route: '/admin/users' })}>
            <UsersIcon className={'mr-2 h-4 w-4'} />
            <span>Users</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BrowseMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={'cyber-button gap-1'} size={'sm'} variant={'ghost'}>
          <LayoutGridIcon className={'h-4 w-4'} />
          <span className={'font-mono text-xs tracking-wider'}>BROWSE</span>
          <ChevronDownIcon className={'ml-1 h-3 w-3'} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={'start'} className={'cyber-dropdown w-56'}>
        <DropdownMenuItem asChild>
          <Link className={'cyber-menu-item'} href={$path({ route: '/browse' })}>
            <HomeIcon className={'mr-2 h-4 w-4'} />
            <span>All Collections</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className={'cyber-menu-item'} href={$path({ route: '/browse/featured' })}>
            <StarIcon className={'mr-2 h-4 w-4'} />
            <span>Featured</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className={'cyber-menu-item'} href={$path({ route: '/browse/search' })}>
            <SearchIcon className={'mr-2 h-4 w-4'} />
            <span>Search</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className={'cyber-menu-item'} href={$path({ route: '/browse/categories' })}>
            <FolderIcon className={'mr-2 h-4 w-4'} />
            <span>Categories</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CollectionMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={'cyber-button gap-1'} size={'sm'} variant={'ghost'}>
          <FolderIcon className={'h-4 w-4'} />
          <span className={'font-mono text-xs tracking-wider'}>COLLECTION</span>
          <ChevronDownIcon className={'ml-1 h-3 w-3'} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={'end'} className={'cyber-dropdown w-56'}>
        <DropdownMenuItem asChild>
          <Link className={'cyber-menu-item'} href={$path({ route: '/dashboard/collection' })}>
            <HomeIcon className={'mr-2 h-4 w-4'} />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className={'cyber-menu-item'} href={$path({ route: '/bobbleheads/add' })}>
            <PlusIcon className={'mr-2 h-4 w-4'} />
            <span>Add Bobblehead</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className={'cyber-menu-item'} href={$path({ route: '/dashboard/collection' })}>
            <FolderIcon className={'mr-2 h-4 w-4'} />
            <span>My Collections</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className={'bg-primary/20'} />
        <DropdownMenuItem asChild>
          <Link className={'cyber-menu-item'} href={$path({ route: '/settings/data/import' })}>
            <UploadIcon className={'mr-2 h-4 w-4'} />
            <span>Import Data</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className={'cyber-menu-item'} href={$path({ route: '/settings' })}>
            <SettingsIcon className={'mr-2 h-4 w-4'} />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileMenu({
  isAdmin,
  isAdminLoading,
  onClose,
}: {
  isAdmin: boolean;
  isAdminLoading: boolean;
  onClose: () => void;
}) {
  return (
    <div className={'flex h-full flex-col py-6'}>
      {/* Header */}
      <div className={'mb-6 flex items-center justify-between'}>
        <h2 className={'font-mono text-lg font-bold tracking-wider text-primary'}>[MENU]</h2>
        <Button aria-label={'Close menu'} onClick={onClose} size={'icon'} variant={'ghost'}>
          <XIcon className={'h-5 w-5'} />
        </Button>
      </div>

      <div className={'flex-1 space-y-6 overflow-y-auto'}>
        {/* User Section */}
        <div className={'space-y-2'}>
          <h3 className={'mb-2 font-mono text-xs tracking-wider text-muted-foreground'}>{'>'} USER</h3>
          <AuthContent
            signedIn={
              <div className={'flex -skew-x-6 items-center gap-3 bg-primary/5 p-3'}>
                <div className={'skew-x-6'}>
                  <UserButton />
                </div>
              </div>
            }
            signedOut={
              <div className={'space-y-2'}>
                <SignInButton mode={'modal'}>
                  <Button className={'cyber-button w-full'} onClick={onClose} variant={'outline'}>
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode={'modal'}>
                  <Button className={'cyber-button-primary w-full'} onClick={onClose}>
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            }
          />
        </div>

        <Separator className={'bg-primary/20'} />

        {/* Browse Section */}
        <div className={'space-y-2'}>
          <h3 className={'mb-2 font-mono text-xs tracking-wider text-muted-foreground'}>{'>'} BROWSE</h3>
          <MobileNavLink href={$path({ route: '/browse' })} icon={HomeIcon} onClick={onClose}>
            All Collections
          </MobileNavLink>
          <MobileNavLink href={$path({ route: '/browse/featured' })} icon={StarIcon} onClick={onClose}>
            Featured
          </MobileNavLink>
          <MobileNavLink href={$path({ route: '/browse/search' })} icon={SearchIcon} onClick={onClose}>
            Search
          </MobileNavLink>
          <MobileNavLink href={$path({ route: '/browse/categories' })} icon={FolderIcon} onClick={onClose}>
            Categories
          </MobileNavLink>
        </div>

        {/* Collection Section */}
        <AuthContent>
          <Separator className={'bg-primary/20'} />
          <div className={'space-y-2'}>
            <h3 className={'mb-2 font-mono text-xs tracking-wider text-muted-foreground'}>
              {'>'} COLLECTION
            </h3>
            <MobileNavLink href={$path({ route: '/dashboard/collection' })} icon={HomeIcon} onClick={onClose}>
              Dashboard
            </MobileNavLink>
            <MobileNavLink href={$path({ route: '/bobbleheads/add' })} icon={PlusIcon} onClick={onClose}>
              Add Bobblehead
            </MobileNavLink>
            <MobileNavLink
              href={$path({ route: '/dashboard/collection' })}
              icon={FolderIcon}
              onClick={onClose}
            >
              My Collections
            </MobileNavLink>
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
        </AuthContent>

        {/* Admin Section */}
        {!isAdminLoading && isAdmin && (
          <Fragment>
            <Separator className={'bg-primary/20'} />
            <div className={'space-y-2'}>
              <h3 className={'mb-2 font-mono text-xs tracking-wider text-muted-foreground'}>{'>'} ADMIN</h3>
              <MobileNavLink
                href={$path({ route: '/admin/featured-content' })}
                icon={StarIcon}
                onClick={onClose}
              >
                Featured Content
              </MobileNavLink>
              <MobileNavLink
                href={$path({ route: '/admin/analytics' })}
                icon={BarChartIcon}
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
          </Fragment>
        )}
      </div>
    </div>
  );
}

function MobileNavLink({
  children,
  href,
  icon: Icon,
  onClick,
}: {
  children: React.ReactNode;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <Link
      className={'group relative flex items-center gap-3 p-3 transition-colors hover:bg-primary/10'}
      href={href}
      onClick={onClick}
    >
      <div
        className={
          'absolute inset-0 -skew-x-6 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100'
        }
      />
      <Icon className={'relative z-10 h-4 w-4'} />
      <span className={'relative z-10 font-mono text-sm'}>{children}</span>
    </Link>
  );
}

function NotificationButton() {
  return (
    <Button aria-label={'Notifications'} className={'cyber-button relative'} size={'icon'} variant={'ghost'}>
      <BellIcon className={'h-5 w-5'} />
      <span
        className={
          'absolute top-1 right-1 h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_6px_theme(colors.primary)]'
        }
      />
    </Button>
  );
}

function SearchBar({
  isExpanded,
  onExpandChange,
}: {
  isExpanded: boolean;
  onExpandChange: (isExpanded: boolean) => void;
}) {
  // isExpanded is used for future functionality like search suggestions
  void isExpanded;
  return (
    <div className={'group relative w-full'}>
      <div
        className={'absolute inset-0 -skew-x-6 bg-primary/5 transition-colors group-hover:bg-primary/10'}
      />
      <div className={'relative flex items-center'}>
        <SearchIcon className={'pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground'} />
        <Input
          aria-label={'Search collections'}
          className={
            'border-primary/20 bg-transparent pr-4 pl-10 font-mono text-sm transition-all focus:border-primary/40 focus:shadow-[0_0_8px_theme(colors.primary.DEFAULT/0.3)]'
          }
          onBlur={() => onExpandChange(false)}
          onFocus={() => onExpandChange(true)}
          placeholder={'Search collections...'}
          type={'search'}
        />
      </div>
    </div>
  );
}

function ThemeToggle({ setTheme, theme }: { setTheme: (theme: string) => void; theme?: string }) {
  return (
    <Button
      aria-label={'Toggle theme'}
      className={'cyber-button hidden sm:flex'}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      size={'icon'}
      variant={'ghost'}
    >
      {theme === 'dark' ?
        <SunIcon className={'h-5 w-5'} />
      : <MoonIcon className={'h-5 w-5'} />}
    </Button>
  );
}
