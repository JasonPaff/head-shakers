'use client';

import { useState } from 'react';
import Link from 'next/link';
import { $path } from 'next-typesafe-url';
import { UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import {
  SearchIcon,
  BellIcon,
  MenuIcon,
  PlusIcon,
  LayoutDashboardIcon,
  LayoutGridIcon,
  StarIcon,
  FilterIcon,
  SettingsIcon,
  BarChartIcon,
  UsersIcon,
  FileTextIcon,
  BellRingIcon,
  UploadIcon,
  HomeIcon,
  UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { AuthContent } from '@/components/ui/auth';
import { useAdminRole } from '@/hooks/use-admin-role';
import { useToggle } from '@/hooks/use-toggle';

export function DemoHeader() {
  const { isAdmin, isModerator } = useAdminRole();
  const [mobileSearchOpen, setMobileSearchOpen] = useToggle(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      {/* Desktop/Tablet Top Header */}
      <header className='sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto flex h-16 items-center justify-between px-4'>
          {/* Logo */}
          <Link
            href={$path({ route: '/' })}
            className='flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity'
          >
            <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center'>
              <span className='text-primary-foreground text-sm font-extrabold'>HS</span>
            </div>
            <span className='hidden sm:inline'>Head Shakers</span>
          </Link>

          {/* Desktop Navigation (lg+) */}
          <nav className='hidden lg:flex items-center gap-6'>
            {/* Browse Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='gap-2'>
                  <LayoutGridIcon className='w-4 h-4' />
                  Browse
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-48'>
                <DropdownMenuLabel>Explore Collections</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={$path({ route: '/browse' })} className='cursor-pointer'>
                    <LayoutGridIcon className='w-4 h-4 mr-2' />
                    All Collections
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={$path({ route: '/browse/featured' })} className='cursor-pointer'>
                    <StarIcon className='w-4 h-4 mr-2' />
                    Featured
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={$path({ route: '/browse/search' })} className='cursor-pointer'>
                    <SearchIcon className='w-4 h-4 mr-2' />
                    Search
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={$path({ route: '/browse/categories' })} className='cursor-pointer'>
                    <FilterIcon className='w-4 h-4 mr-2' />
                    Categories
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Bar */}
            <div className='relative w-64'>
              <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Search collections...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>

            {/* Collection Menu (Auth) */}
            <AuthContent>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' className='gap-2'>
                    <LayoutDashboardIcon className='w-4 h-4' />
                    Collection
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start' className='w-48'>
                  <DropdownMenuLabel>My Collection</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={$path({ route: '/dashboard/collection' })} className='cursor-pointer'>
                      <LayoutDashboardIcon className='w-4 h-4 mr-2' />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={$path({ route: '/bobbleheads/add' })} className='cursor-pointer'>
                      <PlusIcon className='w-4 h-4 mr-2' />
                      Add Bobblehead
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={$path({ route: '/settings/data/import' })} className='cursor-pointer'>
                      <UploadIcon className='w-4 h-4 mr-2' />
                      Import Data
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={$path({ route: '/settings' })} className='cursor-pointer'>
                      <SettingsIcon className='w-4 h-4 mr-2' />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </AuthContent>

            {/* Admin Menu (Auth + Admin) */}
            <AuthContent>
              {(isAdmin || isModerator) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='gap-2'>
                      <SettingsIcon className='w-4 h-4' />
                      Admin
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-48'>
                    <DropdownMenuLabel>Administration</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={$path({ route: '/admin/featured-content' })} className='cursor-pointer'>
                        <StarIcon className='w-4 h-4 mr-2' />
                        Featured Content
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={$path({ route: '/admin/analytics' })} className='cursor-pointer'>
                        <BarChartIcon className='w-4 h-4 mr-2' />
                        Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={$path({ route: '/admin/launch-notifications' })} className='cursor-pointer'>
                        <BellRingIcon className='w-4 h-4 mr-2' />
                        Notifications
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={$path({ route: '/admin/reports' })} className='cursor-pointer'>
                        <FileTextIcon className='w-4 h-4 mr-2' />
                        Reports
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={$path({ route: '/admin/users' })} className='cursor-pointer'>
                        <UsersIcon className='w-4 h-4 mr-2' />
                        Users
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </AuthContent>
          </nav>

          {/* Tablet Navigation (md-lg) */}
          <nav className='hidden md:flex lg:hidden items-center gap-2'>
            {/* Browse */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' className='gap-1'>
                  <LayoutGridIcon className='w-4 h-4' />
                  Browse
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-48'>
                <DropdownMenuItem asChild>
                  <Link href={$path({ route: '/browse' })}>All Collections</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={$path({ route: '/browse/featured' })}>Featured</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={$path({ route: '/browse/search' })}>Search</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={$path({ route: '/browse/categories' })}>Categories</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* More Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm'>
                  <MenuIcon className='w-4 h-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <AuthContent>
                  <DropdownMenuLabel>My Collection</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={$path({ route: '/dashboard/collection' })}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={$path({ route: '/bobbleheads/add' })}>Add Bobblehead</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={$path({ route: '/settings' })}>Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </AuthContent>
                <AuthContent>
                  {(isAdmin || isModerator) && (
                    <>
                      <DropdownMenuLabel>Admin</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={$path({ route: '/admin/featured-content' })}>Featured Content</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={$path({ route: '/admin/analytics' })}>Analytics</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={$path({ route: '/admin/users' })}>Users</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </AuthContent>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right Side Icons (Desktop/Tablet) */}
          <div className='hidden md:flex items-center gap-3'>
            <AuthContent>
              <Button variant='ghost' size='icon' asChild>
                <Link href={$path({ route: '/notifications' })} aria-label='Notifications'>
                  <BellIcon className='w-5 h-5' />
                </Link>
              </Button>
            </AuthContent>

            <AuthContent
              signedOut={
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

          {/* Mobile: Just User Avatar */}
          <div className='flex md:hidden'>
            <AuthContent
              signedOut={
                <SignInButton mode='modal'>
                  <Button variant='ghost' size='sm'>
                    Sign In
                  </Button>
                </SignInButton>
              }
            >
              <UserButton />
            </AuthContent>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe'>
        <nav className='flex items-center justify-around h-16 px-2'>
          {/* Browse */}
          <Link
            href={$path({ route: '/browse' })}
            className='flex flex-col items-center justify-center gap-1 min-w-0 flex-1 text-muted-foreground hover:text-foreground transition-colors'
          >
            <LayoutGridIcon className='w-5 h-5' />
            <span className='text-xs font-medium'>Browse</span>
          </Link>

          {/* Search */}
          <button
            onClick={setMobileSearchOpen}
            className='flex flex-col items-center justify-center gap-1 min-w-0 flex-1 text-muted-foreground hover:text-foreground transition-colors'
            aria-label='Search'
          >
            <SearchIcon className='w-5 h-5' />
            <span className='text-xs font-medium'>Search</span>
          </button>

          {/* Add (Auth) - Floating Action Button Style */}
          <AuthContent>
            <Link
              href={$path({ route: '/bobbleheads/add' })}
              className='flex flex-col items-center justify-center -mt-8'
            >
              <div className='w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow'>
                <PlusIcon className='w-6 h-6 text-primary-foreground' />
              </div>
              <span className='text-xs font-medium text-primary mt-1'>Add</span>
            </Link>
          </AuthContent>

          {/* Notifications (Auth) */}
          <AuthContent>
            <Link
              href={$path({ route: '/notifications' })}
              className='flex flex-col items-center justify-center gap-1 min-w-0 flex-1 text-muted-foreground hover:text-foreground transition-colors'
            >
              <BellIcon className='w-5 h-5' />
              <span className='text-xs font-medium'>Alerts</span>
            </Link>
          </AuthContent>

          {/* Profile/More */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className='flex flex-col items-center justify-center gap-1 min-w-0 flex-1 text-muted-foreground hover:text-foreground transition-colors'
                aria-label='Menu'
              >
                <UserIcon className='w-5 h-5' />
                <span className='text-xs font-medium'>More</span>
              </button>
            </SheetTrigger>
            <SheetContent side='bottom' className='h-[80vh]'>
              <div className='py-6 space-y-6'>
                <div>
                  <h2 className='text-lg font-semibold mb-4'>Browse</h2>
                  <div className='space-y-2'>
                    <Link
                      href={$path({ route: '/browse' })}
                      className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors'
                    >
                      <LayoutGridIcon className='w-5 h-5' />
                      <span>All Collections</span>
                    </Link>
                    <Link
                      href={$path({ route: '/browse/featured' })}
                      className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors'
                    >
                      <StarIcon className='w-5 h-5' />
                      <span>Featured</span>
                    </Link>
                    <Link
                      href={$path({ route: '/browse/categories' })}
                      className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors'
                    >
                      <FilterIcon className='w-5 h-5' />
                      <span>Categories</span>
                    </Link>
                  </div>
                </div>

                <AuthContent>
                  <Separator />
                  <div>
                    <h2 className='text-lg font-semibold mb-4'>My Collection</h2>
                    <div className='space-y-2'>
                      <Link
                        href={$path({ route: '/dashboard/collection' })}
                        className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors'
                      >
                        <LayoutDashboardIcon className='w-5 h-5' />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href={$path({ route: '/settings/data/import' })}
                        className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors'
                      >
                        <UploadIcon className='w-5 h-5' />
                        <span>Import Data</span>
                      </Link>
                      <Link
                        href={$path({ route: '/settings' })}
                        className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors'
                      >
                        <SettingsIcon className='w-5 h-5' />
                        <span>Settings</span>
                      </Link>
                    </div>
                  </div>
                </AuthContent>

                <AuthContent>
                  {(isAdmin || isModerator) && (
                    <>
                      <Separator />
                      <div>
                        <h2 className='text-lg font-semibold mb-4'>Admin</h2>
                        <div className='space-y-2'>
                          <Link
                            href={$path({ route: '/admin/featured-content' })}
                            className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors'
                          >
                            <StarIcon className='w-5 h-5' />
                            <span>Featured Content</span>
                          </Link>
                          <Link
                            href={$path({ route: '/admin/analytics' })}
                            className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors'
                          >
                            <BarChartIcon className='w-5 h-5' />
                            <span>Analytics</span>
                          </Link>
                          <Link
                            href={$path({ route: '/admin/launch-notifications' })}
                            className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors'
                          >
                            <BellRingIcon className='w-5 h-5' />
                            <span>Launch Notifications</span>
                          </Link>
                          <Link
                            href={$path({ route: '/admin/reports' })}
                            className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors'
                          >
                            <FileTextIcon className='w-5 h-5' />
                            <span>Reports</span>
                          </Link>
                          <Link
                            href={$path({ route: '/admin/users' })}
                            className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors'
                          >
                            <UsersIcon className='w-5 h-5' />
                            <span>Users</span>
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </AuthContent>

                <AuthContent
                  signedOut={
                    <div className='pt-4'>
                      <SignUpButton mode='modal'>
                        <Button className='w-full' size='lg'>
                          Sign Up
                        </Button>
                      </SignUpButton>
                    </div>
                  }
                />
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>

      {/* Mobile Search Modal */}
      <Popover open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
        <PopoverContent className='w-screen p-4' side='top' align='center' sideOffset={80}>
          <div className='space-y-3'>
            <h3 className='font-semibold'>Search Collections</h3>
            <div className='relative'>
              <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Search bobbleheads...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
                autoFocus
              />
            </div>
            <Button variant='outline' className='w-full' asChild>
              <Link href={$path({ route: '/browse/search' })}>Advanced Search</Link>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
