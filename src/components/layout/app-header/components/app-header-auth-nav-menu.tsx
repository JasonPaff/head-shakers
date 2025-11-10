'use client';

import {
  ChartSplineIcon,
  LayoutDashboardIcon,
  PackageIcon,
  PackagePlusIcon,
  ShieldHalfIcon,
  SparklesIcon,
  TriangleAlertIcon,
  UsersIcon,
} from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { NavigationLink } from '@/components/layout/app-header/components/app-header-nav-menu';

import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminRole } from '@/hooks/use-admin-role';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

const navigationLinks: Array<NavigationLink> = [
  {
    icon: ShieldHalfIcon,
    isAdminRequired: true,
    items: [
      {
        description: 'Manage featured content',
        href: $path({ route: '/admin/featured-content' }),
        icon: SparklesIcon,
        title: 'Featured Content',
      },
      {
        description: 'View site analytics and reports',
        href: $path({ route: '/admin/analytics' }),
        icon: ChartSplineIcon,
        title: 'Analytics',
      },
      {
        description: 'Reports of inappropriate content or behavior',
        href: $path({ route: '/admin/reports' }),
        icon: TriangleAlertIcon,
        title: 'Reports',
      },
      {
        description: 'Manage users and their roles',
        href: $path({ route: '/admin/users' }),
        icon: UsersIcon,
        title: 'Users',
      },
    ],
    label: 'Admin',
  },
  {
    icon: PackageIcon,
    isAuthRequired: true,
    items: [
      {
        description: 'Overview of your collection and recent activity',
        href: $path({ route: '/dashboard/collection' }),
        icon: LayoutDashboardIcon,
        title: 'Dashboard',
      },
      {
        description: 'Add a new bobblehead to your collection',
        href: $path({ route: '/bobbleheads/add' }),
        icon: PackagePlusIcon,
        title: 'Add Bobblehead',
      },
    ],
    label: 'My Collection',
  },
];

export const AppHeaderAuthNavMenu = () => {
  const { isAdmin, isLoading, isModerator } = useAdminRole();

  // filter navigation links based on user role
  const filteredNavigationLinks = navigationLinks.filter((link) => {
    // if admin required, check if user has moderator or admin role
    if (link.isAdminRequired) {
      return !isLoading && (isModerator || isAdmin);
    }
    // show non-admin links to all authenticated users
    return true;
  });

  return (
    <div
      className={'flex items-center gap-2 max-md:hidden'}
      data-testid={generateTestId('layout', 'app-header', 'auth-section')}
    >
      {filteredNavigationLinks.map((link, index) => {
        return (
          <AuthContent key={index}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size={'sm'} variant={'ghost'}>
                  <link.icon aria-hidden className={'mr-2 size-4'} />
                  {link.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={'end'}
                className={'w-[400px] p-4 md:w-[500px] lg:w-[600px]'}
                collisionPadding={8}
              >
                <div className={'grid gap-3 md:grid-cols-2'}>
                  {link.items.map((item, itemIndex) => (
                    <DropdownMenuItem asChild key={itemIndex}>
                      <Link
                        className={cn(
                          'flex cursor-pointer flex-col items-start gap-1 rounded-md p-3',
                          'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                        )}
                        href={item.href}
                      >
                        <div className={'flex items-center gap-2 text-sm leading-none font-medium'}>
                          <item.icon aria-hidden className={'size-4'} />
                          {item.title}
                        </div>
                        <p className={'text-sm leading-snug text-muted-foreground'}>{item.description}</p>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </AuthContent>
        );
      })}
    </div>
  );
};
