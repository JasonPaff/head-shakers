'use client';

import { SignInButton, SignUpButton, useAuth, UserButton, useUser } from '@clerk/nextjs';
import { User } from 'lucide-react';
import { $path } from 'next-typesafe-url';

import { Button } from '@/components/ui/button';
import { UserButtonSkeleton } from '@/components/ui/skeleton';
import { generateTestId } from '@/lib/test-ids';

export const AppHeaderUser = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return <UserButtonSkeleton />;
  }

  if (isSignedIn) {
    const userMenuTestId = generateTestId('layout', 'user-avatar', 'button');
    if (!user) return null;

    return (
      <div data-testid={userMenuTestId}>
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link
              href={$path({ route: '/users/[userId]', routeParams: { userId: user.id } })}
              label={'View Profile'}
              labelIcon={<User aria-hidden size={16} />}
            />
          </UserButton.MenuItems>
        </UserButton>
      </div>
    );
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
