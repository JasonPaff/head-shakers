'use client';

import { SignOutButton, useUser } from '@clerk/nextjs';
import { LogOutIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const AdminSignOut = () => {
  const { user } = useUser();

  return (
    <SignOutButton>
      <Button size={'sm'} variant={'outline'}>
        <LogOutIcon aria-hidden className={'mr-2 size-4'} />
        Sign Out - {user?.primaryEmailAddress?.emailAddress}
      </Button>
    </SignOutButton>
  );
};
