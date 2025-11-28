'use client';

import { BellIcon, MenuIcon, SearchIcon } from 'lucide-react';
import { UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import { $path } from 'next-typesafe-url';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AuthContent } from '@/components/ui/auth';
import { useAdminRole } from '@/hooks/use-admin-role';
import { BrowseMenu } from './browse-menu';
import { CollectionMenu } from './collection-menu';
import { AdminMenu } from './admin-menu';
import { MobileNav } from './mobile-nav';

export function DemoHeader() {
  const { isAdmin } = useAdminRole();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className='border-b-4 border-primary'>
      {/* Top Masthead Bar */}
      <div className='bg-card'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex items-center justify-between'>
            {/* Logo - Large Editorial Style */}
            <a href={$path({ route: '/' })} className='group flex items-center space-x-2'>
              <div className='flex flex-col'>
                <span className='text-4xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary md:text-5xl lg:text-6xl'>
                  HEAD SHAKERS
                </span>
                <span className='text-xs font-medium uppercase tracking-widest text-muted-foreground lg:text-sm'>
                  Bobblehead Collection Platform
                </span>
              </div>
            </a>

            {/* Right Side Actions - Desktop */}
            <div className='hidden items-center space-x-4 lg:flex'>
              {/* Search */}
              <div className={`transition-all duration-300 ${isSearchExpanded ? 'w-64' : 'w-10'}`}>
                {isSearchExpanded ?
                  <Input
                    type='search'
                    placeholder='Search collections...'
                    className='w-full'
                    onBlur={() => setIsSearchExpanded(false)}
                    autoFocus
                  />
                : <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setIsSearchExpanded(true)}
                    aria-label='Open search'
                  >
                    <SearchIcon className='h-5 w-5' />
                  </Button>
                }
              </div>

              {/* Notifications - Auth Only */}
              <AuthContent>
                <Button variant='ghost' size='icon' aria-label='Notifications'>
                  <BellIcon className='h-5 w-5' />
                </Button>
              </AuthContent>

              {/* User Menu */}
              <AuthContent
                fallback={
                  <div className='flex items-center space-x-2'>
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

            {/* Mobile Menu Toggle */}
            <div className='lg:hidden'>
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant='ghost' size='icon' aria-label='Open menu'>
                    <MenuIcon className='h-6 w-6' />
                  </Button>
                </SheetTrigger>
                <SheetContent side='right' className='w-80'>
                  <MobileNav isAdmin={isAdmin} onClose={() => setIsMobileMenuOpen(false)} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className='hidden bg-background lg:block'>
        <div className='container mx-auto px-4'>
          <nav className='flex items-center justify-between py-4'>
            {/* Left Navigation */}
            <div className='flex items-center space-x-8'>
              <BrowseMenu />

              <AuthContent>
                <CollectionMenu />
              </AuthContent>

              {isAdmin && <AdminMenu />}
            </div>

            {/* Right Side - Additional Actions */}
            <div className='flex items-center space-x-4'>
              <span className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                Latest Updates
              </span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
