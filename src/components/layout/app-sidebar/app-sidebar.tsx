'use client';

import type { ComponentProps } from 'react';

import {
  ActivityIcon,
  CopyleftIcon,
  LayoutDashboardIcon,
  PlusIcon,
  SettingsIcon,
  UploadIcon,
} from 'lucide-react';
import { $path } from 'next-typesafe-url';

import { AppSidebarNavMain } from '@/components/layout/app-sidebar/components/app-sidebar-nav-main';
import { AppSidebarNavSecondary } from '@/components/layout/app-sidebar/components/app-sidebar-nav-secondary';
import { Sidebar } from '@/components/ui/sidebar/sidebar';
import { SidebarContent } from '@/components/ui/sidebar/sidebar-content';
import { SidebarRail } from '@/components/ui/sidebar/sidebar-rail';

const data = {
  navMain: [
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
      url: $path({ route: '/items/add' }),
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
  ],
  navSecondary: [
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
  ],
};

type AppSidebarProps = ComponentProps<typeof Sidebar>;

export const AppSidebar = ({ ...props }: AppSidebarProps) => {
  return (
    <Sidebar className={'top-(--header-height) h-[calc(100svh-var(--header-height))]!'} {...props}>
      <SidebarContent>
        <AppSidebarNavMain items={data.navMain} />
        <AppSidebarNavSecondary className={'mt-auto'} items={data.navSecondary} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};
