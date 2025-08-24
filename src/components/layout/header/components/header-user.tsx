'use client';

import { SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/nextjs';
import { BellIcon } from 'lucide-react';
import { Fragment } from 'react';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';

export const HeaderUser = () => {
  const { isSignedIn } = useAuth();

  return (
    <Fragment>
      {/* Signed In */}
      <Conditional isCondition={isSignedIn}>
        <BellIcon aria-label={'notifications'} className={'h-5 w-5'} />
        <UserButton />
      </Conditional>

      {/* Signed Out */}
      <Conditional isCondition={!isSignedIn}>
        <div className={'space-x-2'}>
          <Button asChild size={'sm'}>
            <SignInButton mode={'redirect'}>Sign In</SignInButton>
          </Button>
          <Button asChild size={'sm'}>
            <SignUpButton mode={'redirect'}>Sign Up</SignUpButton>
          </Button>
        </div>
      </Conditional>
    </Fragment>
  );
};
