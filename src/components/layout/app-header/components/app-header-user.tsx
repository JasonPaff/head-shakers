'use client';

import { SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/nextjs';
import { ShieldIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';

import { Button } from '@/components/ui/button';
import { UserButtonSkeleton } from '@/components/ui/skeleton';
import { useAdminRole } from '@/hooks/use-admin-role';
import { generateTestId } from '@/lib/test-ids';

export const AppHeaderUser = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { isAdmin, isLoading: isAdminLoading, isModerator } = useAdminRole();

  const isShowAdminLink = !isAdminLoading && (isModerator || isAdmin);

  if (!isLoaded) {
    return <UserButtonSkeleton />;
  }

  if (isSignedIn) {
    const userMenuTestId = generateTestId('layout', 'user-avatar', 'button');

    return (
      <div data-testid={userMenuTestId}>
        <UserButton>
          {isShowAdminLink && (
            <UserButton.MenuItems>
              <UserButton.Link
                href={$path({ route: '/admin' })}
                label={'Admin Panel'}
                labelIcon={<ShieldIcon aria-hidden size={16} />}
              />
            </UserButton.MenuItems>
          )}
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
