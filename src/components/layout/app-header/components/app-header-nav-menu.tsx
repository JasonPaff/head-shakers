'use client';

import type { LucideIcon } from 'lucide-react';

import { FilterIcon, LayoutGridIcon, SearchIcon, StarIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface NavigationLink {
  icon: LucideIcon;
  isAdminRequired?: boolean;
  isAuthRequired?: boolean;
  items: Array<{
    href: string;
    icon: LucideIcon;
    title: string;
  }>;
  label: string;
}

const navigationLinks: Array<NavigationLink> = [
  {
    icon: LayoutGridIcon,
    items: [
      {
        href: $path({ route: '/browse' }),
        icon: LayoutGridIcon,
        title: 'All Collections',
      },
      {
        href: $path({ route: '/browse/featured' }),
        icon: StarIcon,
        title: 'Featured',
      },
      {
        href: $path({ route: '/browse/search' }),
        icon: SearchIcon,
        title: 'Search',
      },
      {
        href: $path({ route: '/browse/categories' }),
        icon: FilterIcon,
        title: 'Categories',
      },
    ],
    label: 'Browse',
  },
];

export const AppHeaderNavMenu = () => {
  return (
    <div className={'max-md:hidden'}>
      {navigationLinks.map((link, index) => (
        <DropdownMenu key={index}>
          <DropdownMenuTrigger asChild>
            <Button className={'gap-2'} variant={'ghost'}>
              <link.icon className={'h-4 w-4'} />
              {link.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={'start'} className={'w-48'}>
            <DropdownMenuLabel>Explore Collections</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {link.items.map((item, itemIndex) => (
              <DropdownMenuItem asChild key={itemIndex}>
                <Link className={'cursor-pointer'} href={item.href}>
                  <item.icon className={'mr-2 h-4 w-4'} />
                  {item.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  );
};
