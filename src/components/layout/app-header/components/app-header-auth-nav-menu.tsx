'use client';

import type { LucideIcon } from 'lucide-react';

import { LayoutDashboardIcon, PackageIcon, PackagePlusIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateTestId } from '@/lib/test-ids';

interface NavItem {
  href: string;
  icon: LucideIcon;
  title: string;
}

const collectionNavItems: Array<NavItem> = [
  {
    href: $path({ route: '/dashboard/collection' }),
    icon: LayoutDashboardIcon,
    title: 'Dashboard',
  },
  {
    href: $path({ route: '/dashboard/collection', searchParams: { add: true } }),
    icon: PackagePlusIcon,
    title: 'Add Bobblehead',
  },
];

export const AppHeaderAuthNavMenu = () => {
  return (
    <div
      className={'flex items-center gap-2 max-md:hidden'}
      data-testid={generateTestId('layout', 'app-header', 'auth-section')}
    >
      <AuthContent>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className={'gap-2'} variant={'ghost'}>
              <PackageIcon aria-hidden className={'size-4'} />
              My Collection
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={'start'} className={'w-48'}>
            <DropdownMenuLabel>My Collection</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {collectionNavItems.map((item) => (
              <DropdownMenuItem asChild key={item.href}>
                <Link className={'cursor-pointer'} href={item.href}>
                  <item.icon aria-hidden className={'mr-2 size-4'} />
                  {item.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </AuthContent>
    </div>
  );
};
