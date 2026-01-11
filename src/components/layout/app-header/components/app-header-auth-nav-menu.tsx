'use client';

import { useUser } from '@clerk/nextjs';
import { PackageIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import { generateTestId } from '@/lib/test-ids';

export const AppHeaderAuthNavMenu = () => {
  const { user } = useUser();

  return (
    <div
      className={'flex items-center gap-2 max-md:hidden'}
      data-testid={generateTestId('layout', 'app-header', 'auth-section')}
    >
      <AuthContent>
        {user?.username && (
          <Link
            href={$path({
              route: '/user/[username]/dashboard/collection',
              routeParams: { username: user.username },
            })}
          >
            <Button className={'gap-2'} variant={'ghost'}>
              <PackageIcon aria-hidden className={'size-4'} />
              My Collection
            </Button>
          </Link>
        )}
      </AuthContent>
    </div>
  );
};
