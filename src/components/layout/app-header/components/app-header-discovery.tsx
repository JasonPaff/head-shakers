'use client';

import { SearchIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';
import { Fragment } from 'react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { cn } from '@/utils/tailwind-utils';

interface BaseNavigationItem {
  href: string;
  label: string;
}

interface DescriptionNavigationItem extends BaseNavigationItem {
  description: string;
}

interface IconNavigationItem extends BaseNavigationItem {
  icon: IconType;
}

type IconType = 'SearchIcon' | 'TrendingUpIcon' | 'UsersIcon';

interface NavigationLink {
  href?: string;
  isSubmenu: boolean;
  items?: (DescriptionNavigationItem | IconNavigationItem)[];
  label: string;
  type?: 'description' | 'icon';
}

const navigationLinks: NavigationLink[] = [
  {
    isSubmenu: true,
    items: [
      {
        description: 'Explore the most popular bobblehead collections right now.',
        href: '#/discover/trending',
        label: 'Trending Collections',
      },
      {
        description: 'See the latest bobbleheads added to the community.',
        href: '#/discover/recent',
        label: 'Recent Additions',
      },
      {
        description: 'Curated collections and collector spotlights.',
        href: '#/discover/featured',
        label: 'Featured Collections',
      },
    ],
    label: 'Discover',
    type: 'description',
  },
  {
    isSubmenu: true,
    items: [
      {
        description: 'Baseball, football, basketball and more sports bobbleheads.',
        href: '#/browse/sports',
        label: 'Sports',
      },
      {
        description: 'Movies, TV shows, cartoons and pop culture figures.',
        href: '#/browse/entertainment',
        label: 'Entertainment',
      },
      {
        description: 'Classic and hard-to-find bobblehead collectibles.',
        href: '#/browse/vintage',
        label: 'Vintage & Rare',
      },
    ],
    label: 'Browse',
    type: 'description',
  },
  {
    isSubmenu: true,
    items: [
      { href: '#/community/collectors', icon: 'UsersIcon', label: 'Top Collectors' },
      { href: '#/community/search', icon: 'SearchIcon', label: 'Advanced Search' },
      { href: '#/community/trending', icon: 'TrendingUpIcon', label: "What's Hot" },
    ],
    label: 'Community',
    type: 'icon',
  },
];

const iconMap = {
  SearchIcon,
  TrendingUpIcon,
  UsersIcon,
};

const renderIcon = (iconName: IconType) => {
  const IconComponent = iconMap[iconName];
  return <IconComponent aria-hidden={'true'} className={'text-foreground opacity-60'} size={16} />;
};

const renderNavigationItem = (item: DescriptionNavigationItem | IconNavigationItem, type?: string) => {
  if (type === 'icon' && 'icon' in item) {
    return (
      <div className={'flex items-center gap-2'}>
        {renderIcon(item.icon)}
        <span>{item.label}</span>
      </div>
    );
  }

  if (type === 'description' && 'description' in item) {
    return (
      <div className={'space-y-1'}>
        <div className={'font-medium'}>{item.label}</div>
        <p className={'line-clamp-2 text-xs text-muted-foreground'}>{item.description}</p>
      </div>
    );
  }

  return <span>{item.label}</span>;
};

export const AppHeaderDiscovery = () => {
  const { isTablet } = useBreakpoint();

  return (
    <NavigationMenu className={'max-md:hidden'} isViewport={!isTablet}>
      <NavigationMenuList className={'gap-2'}>
        {navigationLinks.map((link, index) => (
          <NavigationMenuItem key={index}>
            {link.isSubmenu ?
              <Fragment>
                <NavigationMenuTrigger
                  className={cn(
                    'bg-transparent px-2 py-1.5 font-medium text-muted-foreground',
                    'hover:text-primary *:[svg]:-me-0.5 *:[svg]:size-3.5',
                  )}
                >
                  {link.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  className={cn(
                    'z-50 p-1 data-[motion=from-end]:slide-in-from-right-16!',
                    'data-[motion=from-start]:slide-in-from-left-16!',
                    'data-[motion=to-end]:slide-out-to-right-16!',
                    'data-[motion=to-start]:slide-out-to-left-16!',
                  )}
                >
                  <ul className={cn(link.type === 'description' ? 'min-w-64' : 'min-w-48')}>
                    {link.items?.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <NavigationMenuLink className={'py-1.5'} href={item.href}>
                          {renderNavigationItem(item, link.type)}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </Fragment>
            : <NavigationMenuLink
                className={'py-1.5 font-medium text-muted-foreground hover:text-primary'}
                href={link.href}
              >
                {link.label}
              </NavigationMenuLink>
            }
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
