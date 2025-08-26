'use client';

import { 
  SearchIcon, 
  TrendingUpIcon, 
  UsersIcon, 
  CompassIcon, 
  GridIcon, 
  StarIcon,
  TrophyIcon,
  FilmIcon,
  ClockIcon
} from 'lucide-react';
import { $path } from 'next-typesafe-url';

import { AppHeaderMyCollection } from '@/components/layout/app-header/components/app-header-my-collection';
import { CollectionListItem } from '@/components/layout/app-header/components/app-header-link-item';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { cn } from '@/utils/tailwind-utils';

const navigationLinks = [
  {
    icon: CompassIcon,
    label: 'Discover',
    items: [
      {
        href: $path({ route: '/browse/search' }),
        title: 'Trending Collections',
        description: 'Explore the most popular bobblehead collections right now',
        icon: TrendingUpIcon,
      },
      {
        href: $path({ route: '/browse/trending' }),
        title: 'Recent Additions',
        description: 'See the latest bobbleheads added to the community',
        icon: StarIcon,
      },
      {
        href: $path({ route: '/browse/featured' }),
        title: 'Featured Collections',
        description: 'Curated collections and collector spotlights',
        icon: TrophyIcon,
      },
    ],
  },
  {
    icon: GridIcon,
    label: 'Browse',
    items: [
      {
        href: $path({ route: '/browse/categories/[category]', routeParams: { category: 'sports' } }),
        title: 'Sports',
        description: 'Baseball, football, basketball and more sports bobbleheads',
        icon: TrophyIcon,
      },
      {
        href: $path({ route: '/browse/categories/[category]', routeParams: { category: 'entertainment' } }),
        title: 'Entertainment',
        description: 'Movies, TV shows, cartoons and pop culture figures',
        icon: FilmIcon,
      },
      {
        href: $path({ route: '/browse/categories/[category]', routeParams: { category: 'vintage' } }),
        title: 'Vintage & Rare',
        description: 'Classic and hard-to-find bobblehead collectibles',
        icon: ClockIcon,
      },
    ],
  },
  {
    icon: UsersIcon,
    label: 'Community',
    items: [
      {
        href: $path({ route: '/browse' }),
        title: 'Top Collectors',
        description: 'Discover the most active collectors in the community',
        icon: UsersIcon,
      },
      {
        href: $path({ route: '/browse/search' }),
        title: 'Advanced Search',
        description: 'Find specific bobbleheads with detailed filters',
        icon: SearchIcon,
      },
      {
        href: $path({ route: '/browse/trending' }),
        title: "What's Hot",
        description: 'See what\'s trending in the bobblehead world',
        icon: TrendingUpIcon,
      },
    ],
  },
];

export const AppHeaderDiscovery = () => {
  const { isTablet } = useBreakpoint();

  return (
    <NavigationMenu className={'max-md:hidden'} isViewport={!isTablet}>
      <NavigationMenuList className={'gap-2'}>
        {navigationLinks.map((link, index) => (
          <NavigationMenuItem key={index}>
            <NavigationMenuTrigger
              className={cn(
                'bg-transparent px-2 py-1.5 font-medium text-muted-foreground',
                'hover:text-primary *:[svg]:-me-0.5 *:[svg]:size-3.5',
              )}
            >
              <link.icon className={'mr-2 h-4 w-4'} />
              {link.label}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className={'grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]'}>
                {link.items.map((item, itemIndex) => (
                  <CollectionListItem
                    key={itemIndex}
                    href={item.href}
                    title={
                      <div className={'flex items-center gap-2'}>
                        <item.icon className={'h-4 w-4'} />
                        {item.title}
                      </div>
                    }
                  >
                    {item.description}
                  </CollectionListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}

        {/* My Collection */}
        <AppHeaderMyCollection />
      </NavigationMenuList>
    </NavigationMenu>
  );
};
