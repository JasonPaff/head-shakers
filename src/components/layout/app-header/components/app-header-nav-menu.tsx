'use client';

import type { LucideIcon } from 'lucide-react';

import { EarthIcon } from 'lucide-react';
import {
  ActivityIcon,
  CompassIcon,
  GridIcon,
  HeartIcon,
  LayoutDashboardIcon,
  PackagePlusIcon,
  SearchIcon,
  StarIcon,
  TrendingUpIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import { $path } from 'next-typesafe-url';

import { AppHeaderNavMenuLink } from '@/components/layout/app-header/components/app-header-nav-menu-link';
import { AuthContent } from '@/components/ui/auth';
import { Conditional } from '@/components/ui/conditional';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { NavMenuItemSkeleton } from '@/components/ui/skeleton';

interface NavigationLink {
  icon: LucideIcon;
  isAuthRequired?: boolean;
  items: Array<{
    description: string;
    href: string;
    icon: LucideIcon;
    title: string;
  }>;
  label: string;
}

const navigationLinks: Array<NavigationLink> = [
  {
    icon: CompassIcon,
    items: [
      {
        description: 'Most popular bobbleheads and collections right now',
        href: $path({ route: '/browse/trending' }),
        icon: TrendingUpIcon,
        title: 'Trending Now',
      },
      {
        description: 'Curated collections and collector spotlights',
        href: $path({ route: '/browse/featured' }),
        icon: StarIcon,
        title: 'Featured Collections',
      },
      {
        description: 'Advanced search with detailed filters and options',
        href: $path({ route: '/browse/search' }),
        icon: SearchIcon,
        title: 'Advanced Search',
      },
    ],
    label: 'Discover',
  },
  {
    icon: GridIcon,
    items: [
      {
        description: 'Browse all public collections in the community',
        href: $path({ route: '/browse' }),
        icon: EarthIcon,
        title: 'Browse All',
      },
      {
        description: 'Browse by category - sports, entertainment, vintage and more',
        href: $path({ route: '/browse/categories' }),
        icon: TrophyIcon,
        title: 'By Category',
      },
      {
        description: 'Discover the most respected collectors in the community',
        href: $path({ route: '/browse/featured' }),
        icon: UsersIcon,
        title: 'Top Collectors',
      },
    ],
    label: 'Collections',
  },
  {
    icon: UsersIcon,
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
    ],
    label: 'Community',
  },
  {
    icon: UserIcon,
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
        description: 'Your public collector profile and social presence',
        href: $path({ route: '/settings/profile' }),
        icon: UserIcon,
        title: 'Profile',
      },
    ],
    label: 'My Hub',
  },
];

export const AppHeaderNavMenu = () => {
  return (
    <NavigationMenu className={'max-md:hidden'}>
      <NavigationMenuList className={'gap-2'}>
        {navigationLinks.map((link, index) => {
          const Content = (
            <NavigationMenuItem key={index}>
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
          );

          return (
            <Conditional fallback={Content} isCondition={link.isAuthRequired} key={index}>
              <AuthContent loadingSkeleton={<NavMenuItemSkeleton />}>{Content}</AuthContent>
            </Conditional>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
