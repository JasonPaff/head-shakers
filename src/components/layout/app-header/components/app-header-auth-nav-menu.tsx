'use client';

import type { LucideIcon } from 'lucide-react';

import {
  BarChartIcon,
  BellRingIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  PackageIcon,
  PackagePlusIcon,
  SettingsIcon,
  StarIcon,
  UsersIcon,
} from 'lucide-react';
import Link from 'next/link';
import { $path } from 'next-typesafe-url';

import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminRole } from '@/hooks/use-admin-role';
import { generateTestId } from '@/lib/test-ids';

interface NavItem {
  href: string;
  icon: LucideIcon;
  title: string;
}

interface NavMenu {
  icon: LucideIcon;
  isAdminRequired?: boolean;
  items: Array<NavItem>;
  label: string;
  menuLabel: string;
}

const navigationLinks: Array<NavMenu> = [
  {
    icon: SettingsIcon,
    isAdminRequired: true,
    items: [
      {
        href: $path({ route: '/admin/featured-content' }),
        icon: StarIcon,
        title: 'Featured Content',
      },
      {
        href: $path({ route: '/admin/analytics' }),
        icon: BarChartIcon,
        title: 'Analytics',
      },
      {
        href: $path({ route: '/admin/launch-notifications' }),
        icon: BellRingIcon,
        title: 'Notifications',
      },
      {
        href: $path({ route: '/admin/reports' }),
        icon: FileTextIcon,
        title: 'Reports',
      },
      {
        href: $path({ route: '/admin/users' }),
        icon: UsersIcon,
        title: 'Users',
      },
    ],
    label: 'Admin',
    menuLabel: 'Administration',
  },
  {
    icon: PackageIcon,
    items: [
      {
        href: $path({ route: '/dashboard/collection' }),
        icon: LayoutDashboardIcon,
        title: 'Dashboard',
      },
      {
        href: $path({ route: '/bobbleheads/add' }),
        icon: PackagePlusIcon,
        title: 'Add Bobblehead',
      },
    ],
    label: 'My Collection',
    menuLabel: 'My Collection',
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
      {filteredNavigationLinks.map((link, index) => (
        <AuthContent key={index}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className={'gap-2'} variant={'ghost'}>
                <link.icon className={'h-4 w-4'} />
                {link.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={'start'} className={'w-48'}>
              <DropdownMenuLabel>{link.menuLabel}</DropdownMenuLabel>
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
        </AuthContent>
      ))}
    </div>
  );
};
