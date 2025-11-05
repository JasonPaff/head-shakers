'use client';

import type { LucideIcon } from 'lucide-react';

import { EarthIcon, GridIcon, StarIcon, TrendingUpIcon, TrophyIcon } from 'lucide-react';
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
    icon: GridIcon,
    items: [
      {
        description: 'Browse all public collections in the community',
        href: $path({ route: '/browse' }),
        icon: EarthIcon,
        title: 'All Collections',
      },
      {
        description: 'Curated collections and collector spotlights',
        href: $path({ route: '/browse/featured' }),
        icon: StarIcon,
        title: 'Featured',
      },
      {
        description: 'Most popular bobbleheads and collections right now',
        href: $path({ route: '/browse/trending' }),
        icon: TrendingUpIcon,
        title: 'Trending',
      },
      {
        description: 'Browse by category - sports, entertainment, vintage and more',
        href: $path({ route: '/browse/categories' }),
        icon: TrophyIcon,
        title: 'Categories',
      },
    ],
    label: 'Browse',
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
