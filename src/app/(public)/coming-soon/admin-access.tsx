'use client';

import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs';
import { LogOutIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';

export const AdminAccess = () => {
  const { isSignedIn } = useUser();

  return (
    <Conditional
      fallback={
        <SignInButton mode={'modal'}>
          <Button size={'sm'} variant={'ghost'}>
            Admin Access
          </Button>
        </SignInButton>
      }
      isCondition={isSignedIn}
    >
      <div className={'flex w-full items-center justify-center gap-x-2'}>
        <SignOutButton>
          <Button size={'sm'} variant={'outline'}>
            <LogOutIcon aria-hidden className={'mr-2 size-4'} />
            Sign Out
          </Button>
        </SignOutButton>
        <Button asChild size={'sm'} variant={'outline'}>
          <Link href={$path({ route: '/' })}>Home Page</Link>
        </Button>
      </div>
    </Conditional>
  );
};
