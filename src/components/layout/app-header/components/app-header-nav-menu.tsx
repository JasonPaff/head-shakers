'use client';

import type { LucideIcon } from 'lucide-react';

import {
  CompassIcon,
  EarthIcon,
  GridIcon,
  SearchIcon,
  StarIcon,
  TrendingUpIcon,
  TrophyIcon,
  UsersIcon,
} from 'lucide-react';
import { $path } from 'next-typesafe-url';

import { AppHeaderNavMenuLink } from '@/components/layout/app-header/components/app-header-nav-menu-link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

export interface NavigationLink {
  icon: LucideIcon;
  isAdminRequired?: boolean;
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
    icon: GridIcon,
    items: [
      {
        description: 'Coming soon - additional features and tools',
        href: $path({ route: '/browse' }),
        icon: CompassIcon,
        title: 'Feature One',
      },
      {
        description: 'Coming soon - more collector utilities',
        href: $path({ route: '/browse' }),
        icon: StarIcon,
        title: 'Feature Two',
      },
      {
        description: 'Coming soon - enhanced platform tools',
        href: $path({ route: '/browse' }),
        icon: TrendingUpIcon,
        title: 'Feature Three',
      },
    ],
    label: 'More',
  },
];

export const AppHeaderNavMenu = () => {
  return (
    <NavigationMenu className={'max-md:hidden'}>
      <NavigationMenuList className={'gap-2'}>
        {navigationLinks.map((link, index) => {
          return (
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
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
