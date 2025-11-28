'use client';

import Link from 'next/link';
import { $path } from 'next-typesafe-url';
import {
  LayoutGridIcon,
  StarIcon,
  SearchIcon,
  FolderIcon,
  ShieldIcon,
  BarChartIcon,
  BellIcon as BellIconOutline,
  FileTextIcon,
  UsersIcon,
  PlusCircleIcon,
  SettingsIcon,
  UploadIcon,
  LayoutDashboardIcon,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { AuthContent } from '@/components/ui/auth';
import { Separator } from '@/components/ui/separator';

interface NavigationIslandProps {
  isAdmin: boolean;
  adminLoading: boolean;
}

export function NavigationIsland({ isAdmin, adminLoading }: NavigationIslandProps) {
  return (
    <div className='pointer-events-auto absolute left-1/2 top-0 -translate-x-1/2'>
      <nav
        className='flex items-center gap-2 rounded-2xl bg-card px-4 py-2.5 shadow-xl ring-1 ring-border/50'
        aria-label='Main navigation'
      >
        {/* Browse Menu */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='ghost' size='sm' className='gap-2 hover:bg-accent hover:text-accent-foreground'>
              <LayoutGridIcon className='h-4 w-4' />
              <span className='hidden xl:inline'>Browse</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-56 rounded-xl p-2 shadow-2xl' align='start'>
            <div className='space-y-1'>
              <Link
                href={$path({ route: '/browse' })}
                className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'
              >
                <LayoutGridIcon className='h-4 w-4' />
                Collections
              </Link>
              <Link
                href={$path({ route: '/browse/featured' })}
                className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'
              >
                <StarIcon className='h-4 w-4' />
                Featured
              </Link>
              <Link
                href={$path({ route: '/browse/search' })}
                className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'
              >
                <SearchIcon className='h-4 w-4' />
                Search
              </Link>
              <Link
                href={$path({ route: '/browse/categories' })}
                className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'
              >
                <FolderIcon className='h-4 w-4' />
                Categories
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation='vertical' className='h-6' />

        {/* Collection Menu - Auth Only */}
        <AuthContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='gap-2 hover:bg-accent hover:text-accent-foreground'
              >
                <FolderIcon className='h-4 w-4' />
                <span className='hidden xl:inline'>Collection</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-56 rounded-xl p-2 shadow-2xl' align='start'>
              <div className='space-y-1'>
                <Link
                  href={$path({ route: '/dashboard/collection' })}
                  className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'
                >
                  <LayoutDashboardIcon className='h-4 w-4' />
                  Dashboard
                </Link>
                <Link
                  href={$path({ route: '/bobbleheads/add' })}
                  className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'
                >
                  <PlusCircleIcon className='h-4 w-4' />
                  Add Bobblehead
                </Link>
                <Link
                  href={$path({ route: '/settings/data/import' })}
                  className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'
                >
                  <UploadIcon className='h-4 w-4' />
                  Import Data
                </Link>
                <Link
                  href={$path({ route: '/settings' })}
                  className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'
                >
                  <SettingsIcon className='h-4 w-4' />
                  Settings
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </AuthContent>

        {/* Admin Menu - Auth + Admin Only */}
        {!adminLoading && isAdmin && (
          <>
            <Separator orientation='vertical' className='h-6' />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='gap-2 hover:bg-accent hover:text-accent-foreground'
                >
                  <ShieldIcon className='h-4 w-4' />
                  <span className='hidden xl:inline'>Admin</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-56 rounded-xl p-2 shadow-2xl' align='start'>
                <div className='space-y-1'>
                  <Link
                    href={$path({ route: '/admin/featured-content' })}
                    className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'
                  >
                    <StarIcon className='h-4 w-4' />
                    Featured Content
                  </Link>
                  <Link
                    href={$path({ route: '/admin/analytics' })}
                    className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'
                  >
                    <BarChartIcon className='h-4 w-4' />
                    Analytics
                  </Link>
                  <Link
                    href={$path({ route: '/admin/launch-notifications' })}
                    className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'
                  >
                    <BellIconOutline className='h-4 w-4' />
                    Launch Notifications
                  </Link>
                  <Link
                    href={$path({ route: '/admin/reports' })}
                    className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'
                  >
                    <FileTextIcon className='h-4 w-4' />
                    Reports
                  </Link>
                  <Link
                    href={$path({ route: '/admin/users' })}
                    className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'
                  >
                    <UsersIcon className='h-4 w-4' />
                    Users
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}
      </nav>
    </div>
  );
}
