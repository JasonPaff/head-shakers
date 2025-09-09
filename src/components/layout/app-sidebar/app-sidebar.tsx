'use client';

import type { ComponentProps } from 'react';

import {
  ActivityIcon,
  CopyleftIcon,
  LayoutDashboardIcon,
  PlusIcon,
  SettingsIcon,
  ShieldIcon,
  UploadIcon,
} from 'lucide-react';
import { $path } from 'next-typesafe-url';

import { AppSidebarNavMain } from '@/components/layout/app-sidebar/components/app-sidebar-nav-main';
import { AppSidebarNavSecondary } from '@/components/layout/app-sidebar/components/app-sidebar-nav-secondary';
import { Sidebar } from '@/components/ui/sidebar/sidebar';
import { SidebarContent } from '@/components/ui/sidebar/sidebar-content';
import { SidebarRail } from '@/components/ui/sidebar/sidebar-rail';
import { useAdminRole } from '@/hooks/use-admin-role';

const useNavigationData = () => {
  const { isAdmin, isLoading, isModerator } = useAdminRole();

  const baseNavMain = [
    {
      icon: LayoutDashboardIcon,
      isActive: true,
      title: 'Dashboard',
      url: $path({ route: '/dashboard' }),
    },
    {
      icon: CopyleftIcon,
      items: [
        {
          title: 'Analyze',
          url: $path({ route: '/dashboard/collection/analytics' }),
        },
        {
          title: 'Organize',
          url: $path({ route: '/dashboard/collection/organize' }),
        },
      ],
      title: 'My Collection',
      url: $path({ route: '/dashboard/collection' }),
    },
    {
      icon: PlusIcon,
      title: 'Add Bobblehead',
      url: $path({ route: '/bobbleheads/add' }),
    },
    {
      icon: UploadIcon,
      items: [
        {
          title: 'Import',
          url: $path({ route: '/settings/data/import' }),
        },
        {
          title: 'Export',
          url: $path({ route: '/settings/data/export' }),
        },
      ],
      title: 'Import Tools',
      url: $path({ route: '/settings/data/import' }),
    },
  ];

  // Add admin navigation if user has moderator or admin privileges
  const adminNavItem = {
    icon: ShieldIcon,
    items: [
      {
        title: 'Featured Content',
        url: $path({ route: '/admin/featured-content' }),
      },
      {
        title: 'Content Reports',
        url: $path({ route: '/admin/reports' }),
      },
      {
        title: 'User Management',
        url: $path({ route: '/admin/users' }),
      },
      {
        title: 'Analytics',
        url: $path({ route: '/admin/analytics' }),
      },
    ],
    title: 'Administration',
    url: $path({ route: '/admin' }),
  };

  const navMain = !isLoading && (isModerator || isAdmin) ? [...baseNavMain, adminNavItem] : baseNavMain;

  const navSecondary = [
    {
      icon: ActivityIcon,
      title: 'Following Feed',
      url: $path({ route: '/dashboard/feed' }),
    },
    {
      icon: SettingsIcon,
      title: 'Account Settings',
      url: $path({ route: '/settings' }),
    },
  ];

  return { navMain, navSecondary };
};

type AppSidebarProps = ComponentProps<typeof Sidebar>;

export const AppSidebar = ({ ...props }: AppSidebarProps) => {
  const { navMain, navSecondary } = useNavigationData();

  return (
    <Sidebar className={'top-(--header-height) h-[calc(100svh-var(--header-height))]!'} {...props}>
      <SidebarContent>
        <AppSidebarNavMain items={navMain} />
        <AppSidebarNavSecondary className={'mt-auto'} items={navSecondary} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};
