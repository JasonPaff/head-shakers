'use client';

import {
  ActivityIcon,
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

import type { NavigationLink } from '@/components/layout/app-header/components/app-header-nav-menu';

import { AppHeaderNavMenuLink } from '@/components/layout/app-header/components/app-header-nav-menu-link';
import { AuthContent } from '@/components/ui/auth';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useAdminRole } from '@/hooks/use-admin-role';
import { generateTestId } from '@/lib/test-ids';

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
      {
        description: 'Activity updates from collectors you follow',
        href: $path({ route: '/dashboard/feed' }),
        icon: ActivityIcon,
        title: 'My Feed',
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
    <NavigationMenu
      className={'max-md:hidden'}
      data-testid={generateTestId('layout', 'app-header', 'auth-section')}
    >
      <NavigationMenuList className={'gap-2'}>
        {filteredNavigationLinks.map((link, index) => {
          return (
            <AuthContent key={index}>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <link.icon aria-hidden className={'mr-2 size-4'} />
                  {link.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className={'grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]'}>
                    {link.items.map((item, itemIndex) => (
                      <AppHeaderNavMenuLink
                        href={item.href}
                        key={itemIndex}
                        title={
                          <div className={'flex items-center gap-2'}>
                            <item.icon aria-hidden className={'size-4'} />
                            {item.title}
                          </div>
                        }
                      >
                        {item.description}
                      </AppHeaderNavMenuLink>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </AuthContent>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
