'use client';

import { SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';
import { UserButtonSkeleton } from '@/components/ui/skeleton';

export const AppHeaderUser = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <UserButtonSkeleton />;
  }

  if (isSignedIn) {
    return <UserButton />;
  }

  return (
    <div className={'space-x-2'}>
      <Button asChild size={'sm'}>
        <SignInButton mode={'modal'}>Sign In</SignInButton>
      </Button>
      <Button asChild size={'sm'}>
        <SignUpButton mode={'modal'}>Sign Up</SignUpButton>
      </Button>
    </div>
  );
};
