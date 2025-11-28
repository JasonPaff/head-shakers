'use client';

import { $path } from 'next-typesafe-url';
import {
  SearchIcon,
  BellIcon,
  LayoutDashboardIcon,
  PlusIcon,
  FolderIcon,
  UploadIcon,
  SettingsIcon,
  ShieldIcon,
  LayoutGridIcon,
  BarChartIcon,
  BellRingIcon,
  FileTextIcon,
  UsersIcon,
  CompassIcon,
  StarIcon,
  GridIcon,
} from 'lucide-react';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { AuthContent } from '@/components/ui/auth';

interface MobileNavProps {
  isAdmin: boolean;
  onClose: () => void;
}

export function MobileNav({ isAdmin, onClose }: MobileNavProps) {
  return (
    <div className='flex h-full flex-col'>
      {/* Header */}
      <div className='mb-6'>
        <h2 className='text-2xl font-black uppercase tracking-tight'>Head Shakers</h2>
        <p className='text-xs uppercase tracking-widest text-muted-foreground'>Menu</p>
      </div>

      {/* Search */}
      <div className='mb-6'>
        <div className='relative'>
          <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input type='search' placeholder='Search collections...' className='pl-10' />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className='flex-1 space-y-6 overflow-y-auto'>
        {/* Browse Section */}
        <div>
          <h3 className='mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground'>Browse</h3>
          <div className='space-y-2'>
            <a
              href={$path({ route: '/browse' })}
              onClick={onClose}
              className='flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'
            >
              <CompassIcon className='h-5 w-5' />
              <span>All Collections</span>
            </a>
            <a
              href={$path({ route: '/browse/featured' })}
              onClick={onClose}
              className='flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'
            >
              <StarIcon className='h-5 w-5' />
              <span>Featured</span>
            </a>
            <a
              href={$path({ route: '/browse/search' })}
              onClick={onClose}
              className='flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'
            >
              <SearchIcon className='h-5 w-5' />
              <span>Search</span>
            </a>
            <a
              href={$path({ route: '/browse/categories' })}
              onClick={onClose}
              className='flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'
            >
              <GridIcon className='h-5 w-5' />
              <span>Categories</span>
            </a>
          </div>
        </div>

        <Separator />

        {/* Collection Section - Auth Only */}
        <AuthContent>
          <div>
            <h3 className='mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
              Collection
            </h3>
            <div className='space-y-2'>
              <a
                href={$path({ route: '/dashboard/collection' })}
                onClick={onClose}
                className='flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'
              >
                <LayoutDashboardIcon className='h-5 w-5' />
                <span>Dashboard</span>
              </a>
              <a
                href={$path({ route: '/bobbleheads/add' })}
                onClick={onClose}
                className='flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'
              >
                <PlusIcon className='h-5 w-5' />
                <span>Add Bobblehead</span>
              </a>
              <a
                href={$path({ route: '/dashboard/collection' })}
                onClick={onClose}
                className='flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'
              >
                <FolderIcon className='h-5 w-5' />
                <span>My Collections</span>
              </a>
              <a
                href={$path({ route: '/settings/data/import' })}
                onClick={onClose}
                className='flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'
              >
                <UploadIcon className='h-5 w-5' />
                <span>Import Data</span>
              </a>
              <a
                href={$path({ route: '/settings' })}
                onClick={onClose}
                className='flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'
              >
                <SettingsIcon className='h-5 w-5' />
                <span>Settings</span>
              </a>
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div>
            <Button variant='ghost' className='w-full justify-start space-x-3' onClick={onClose}>
              <BellIcon className='h-5 w-5' />
              <span className='text-sm font-medium'>Notifications</span>
            </Button>
          </div>
        </AuthContent>

        {/* Admin Section - Admin Only */}
        {isAdmin && (
          <>
            <Separator />
            <div>
              <h3 className='mb-3 flex items-center text-xs font-bold uppercase tracking-widest text-primary'>
                <ShieldIcon className='mr-2 h-4 w-4' />
                Admin
              </h3>
              <div className='space-y-2'>
                <a
                  href={$path({ route: '/admin/featured-content' })}
                  onClick={onClose}
                  className='flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'
                >
                  <LayoutGridIcon className='h-5 w-5' />
                  <span>Featured Content</span>
                </a>
                <a
                  href={$path({ route: '/admin/analytics' })}
                  onClick={onClose}
                  className='flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'
                >
                  <BarChartIcon className='h-5 w-5' />
                  <span>Analytics</span>
                </a>
                <a
                  href={$path({ route: '/admin/launch-notifications' })}
                  onClick={onClose}
                  className='flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'
                >
                  <BellRingIcon className='h-5 w-5' />
                  <span>Launch Notifications</span>
                </a>
                <a
                  href={$path({ route: '/admin/reports' })}
                  onClick={onClose}
                  className='flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'
                >
                  <FileTextIcon className='h-5 w-5' />
                  <span>Reports</span>
                </a>
                <a
                  href={$path({ route: '/admin/users' })}
                  onClick={onClose}
                  className='flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'
                >
                  <UsersIcon className='h-5 w-5' />
                  <span>Users</span>
                </a>
              </div>
            </div>
          </>
        )}
      </nav>

      <Separator className='my-4' />

      {/* User Section */}
      <div className='mt-auto'>
        <AuthContent
          fallback={
            <div className='space-y-2'>
              <SignInButton mode='modal'>
                <Button variant='outline' className='w-full'>
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode='modal'>
                <Button className='w-full'>Sign Up</Button>
              </SignUpButton>
            </div>
          }
        >
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Account</span>
            <UserButton />
          </div>
        </AuthContent>
      </div>
    </div>
  );
}
