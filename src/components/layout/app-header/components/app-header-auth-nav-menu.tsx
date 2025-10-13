'use client';

import {
  ActivityIcon,
  BrainCircuitIcon,
  ChartSplineIcon,
  HeartIcon,
  LayoutDashboardIcon,
  PackagePlusIcon,
  ShieldHalfIcon,
  SparklesIcon,
  TriangleAlertIcon,
  UserIcon,
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
      {
        description: 'AI-powered feature planning and implementation workflow',
        href: $path({ route: '/feature-planner' }),
        icon: BrainCircuitIcon,
        title: 'Feature Planner',
      },
    ],
    label: 'Admin',
  },
  {
    icon: UserIcon,
    isAuthRequired: true,
    items: [
      {
        description: 'Activity updates from collectors you follow',
        href: $path({ route: '/dashboard/feed' }),
        icon: ActivityIcon,
        title: 'My Feed',
      },
      {
        description: 'Manage your following and followers',
        href: $path({ route: '/dashboard/feed' }),
        icon: UsersIcon,
        title: 'Following',
      },
      {
        description: 'Likes, comments, and social notifications',
        href: $path({ route: '/dashboard/notifications' }),
        icon: HeartIcon,
        title: 'Notifications',
      },
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
        description: 'Your public collector profile and social presence',
        href: $path({ route: '/settings/profile' }),
        icon: UserIcon,
        title: 'Profile',
      },
    ],
    label: 'My Hub',
  },
];

export const AppHeaderAuthNavMenu = () => {
  return (
    <NavigationMenu
      className={'max-md:hidden'}
      data-testid={generateTestId('layout', 'app-header', 'auth-section')}
    >
      <NavigationMenuList className={'gap-2'}>
        {navigationLinks.map((link, index) => {
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
