'use client';

import { PackageIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import { generateTestId } from '@/lib/test-ids';

interface AppHeaderAuthNavMenuProps {
  username: string;
}

export const AppHeaderAuthNavMenu = ({ username }: AppHeaderAuthNavMenuProps) => {
  if (!username) return null;

  return (
    <div
      className={'flex items-center gap-2 max-md:hidden'}
      data-testid={generateTestId('layout', 'app-header', 'auth-section')}
    >
      <AuthContent>
        <Link
          href={$path({
            route: '/user/[username]/dashboard/collection',
            routeParams: { username },
          })}
        >
          <Button className={'gap-2'} variant={'ghost'}>
            <PackageIcon aria-hidden className={'size-4'} />
            My Collection
          </Button>
        </Link>
      </AuthContent>
    </div>
  );
};
