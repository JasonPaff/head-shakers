'use client';

import { SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/nextjs';
import { Fragment } from 'react';

import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';

export const AppHeaderUser = () => {
  const { isSignedIn } = useAuth();

  return (
    <Fragment>
      {/* Signed In */}
      <AuthContent>
        <UserButton />
      </AuthContent>

      {/* Signed Out */}
      <Conditional isCondition={!isSignedIn}>
        <div className={'space-x-2'}>
          <Button asChild size={'sm'}>
            <SignInButton mode={'modal'}>Sign In</SignInButton>
          </Button>
          <Button asChild size={'sm'}>
            <SignUpButton mode={'modal'}>Sign Up</SignUpButton>
          </Button>
        </div>
      </Conditional>
    </Fragment>
  );
};
