'use client';

import { PackageIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import { generateTestId } from '@/lib/test-ids';

export const AppHeaderAuthNavMenu = () => {
  return (
    <div
      className={'flex items-center gap-2 max-md:hidden'}
      data-testid={generateTestId('layout', 'app-header', 'auth-section')}
    >
      <AuthContent>
        <Link href={$path({ route: '/dashboard/collection' })}>
          <Button className={'gap-2'} variant={'ghost'}>
            <PackageIcon aria-hidden className={'size-4'} />
            My Collection
          </Button>
        </Link>
      </AuthContent>
    </div>
  );
};
