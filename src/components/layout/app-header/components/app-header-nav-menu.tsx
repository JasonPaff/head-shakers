'use client';

import type { LucideIcon } from 'lucide-react';

import {
  ClockIcon,
  CompassIcon,
  FilmIcon,
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

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
        description: 'Explore the most popular bobblehead collections right now',
        href: $path({ route: '/browse/search' }),
        icon: TrendingUpIcon,
        title: 'Trending Collections',
      },
      {
        description: 'See the latest bobbleheads added to the community',
        href: $path({ route: '/browse/trending' }),
        icon: StarIcon,
        title: 'Recent Additions',
      },
      {
        description: 'Curated collections and collector spotlights',
        href: $path({ route: '/browse/featured' }),
        icon: TrophyIcon,
        title: 'Featured Collections',
      },
    ],
    label: 'Discover',
  },
  {
    icon: GridIcon,
    items: [
      {
        description: 'Baseball, football, basketball and more sports bobbleheads',
        href: $path({ route: '/browse/categories/[category]', routeParams: { category: 'sports' } }),
        icon: TrophyIcon,
        title: 'Sports',
      },
      {
        description: 'Movies, TV shows, cartoons and pop culture figures',
        href: $path({ route: '/browse/categories/[category]', routeParams: { category: 'entertainment' } }),
        icon: FilmIcon,
        title: 'Entertainment',
      },
      {
        description: 'Classic and hard-to-find bobblehead collectibles',
        href: $path({ route: '/browse/categories/[category]', routeParams: { category: 'vintage' } }),
        icon: ClockIcon,
        title: 'Vintage & Rare',
      },
    ],
    label: 'Browse',
  },
  {
    icon: UsersIcon,
    items: [
      {
        description: 'Discover the most active collectors in the community',
        href: $path({ route: '/browse' }),
        icon: UsersIcon,
        title: 'Top Collectors',
      },
      {
        description: 'Find specific bobbleheads with detailed filters',
        href: $path({ route: '/browse/search' }),
        icon: SearchIcon,
        title: 'Advanced Search',
      },
      {
        description: "See what's trending in the bobblehead world",
        href: $path({ route: '/browse/trending' }),
        icon: TrendingUpIcon,
        title: "What's Hot",
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
        description: 'View and manage your complete collection',
        href: $path({ route: '/dashboard/collection' }),
        icon: HeartIcon,
        title: 'My Bobbleheads',
      },
      {
        description: 'Add a new bobblehead to your collection',
        href: $path({ route: '/bobbleheads/add' }),
        icon: PackagePlusIcon,
        title: 'Add New Bobblehead',
      },
    ],
    label: 'My Collection',
  },
];

export const AppHeaderNavMenu = () => {
  return (
    <NavigationMenu className={'max-md:hidden'}>
      <NavigationMenuList className={'gap-2'}>
        {navigationLinks.map((link, index) => {
          const content = (
            <NavigationMenuItem key={index}>
              <NavigationMenuTrigger>
                <link.icon aria-hidden className={'mr-2 h-4 w-4'} />
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
                          <item.icon aria-hidden className={'h-4 w-4'} />
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

          return link.isAuthRequired ? <AuthContent key={index}>{content}</AuthContent> : content;
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
