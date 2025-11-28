'use client';

import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { BellIcon, MoonIcon, SunIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthContent } from '@/components/ui/auth';
import { Separator } from '@/components/ui/separator';

interface UserControlsIslandProps {
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

export function UserControlsIsland({ theme, setTheme }: UserControlsIslandProps) {
  return (
    <div className='pointer-events-auto absolute right-0 top-0'>
      <div className='flex items-center gap-3 rounded-2xl bg-card px-4 py-2.5 shadow-xl ring-1 ring-border/50'>
        {/* Theme Toggle */}
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className='h-8 w-8 p-0 hover:bg-accent'
          aria-label='Toggle theme'
        >
          {theme === 'dark' ?
            <SunIcon className='h-4 w-4' />
          : <MoonIcon className='h-4 w-4' />}
        </Button>

        {/* Notifications - Auth Only */}
        <AuthContent>
          <Button
            variant='ghost'
            size='sm'
            className='relative h-8 w-8 p-0 hover:bg-accent'
            aria-label='Notifications'
          >
            <BellIcon className='h-4 w-4' />
            {/* Notification badge */}
            <span className='absolute right-1 top-1 flex h-2 w-2'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75' />
              <span className='relative inline-flex h-2 w-2 rounded-full bg-primary' />
            </span>
          </Button>

          <Separator orientation='vertical' className='h-6' />
        </AuthContent>

        {/* User Menu */}
        <AuthContent
          fallback={
            <div className='flex items-center gap-2'>
              <SignInButton mode='modal'>
                <Button variant='ghost' size='sm' className='h-8'>
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode='modal'>
                <Button size='sm' className='h-8'>
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          }
        >
          <div className='flex items-center'>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8',
                },
              }}
            />
          </div>
        </AuthContent>
      </div>
    </div>
  );
}
