'use client';

import type { ComponentProps } from 'react';

import {
  ActivityIcon,
  CopyleftIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  PlusIcon,
  SettingsIcon,
  UploadIcon,
  UserIcon,
} from 'lucide-react';

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
      url: '/dashboard',
    },
    {
      icon: CopyleftIcon,
      items: [
        {
          title: 'All Items',
          url: '/collection',
        },
        {
          title: 'Categories',
          url: '/collection/categories',
        },
        {
          title: 'Wishlist',
          url: '/collection/wishlist',
        },
      ],
      title: 'My Collection',
      url: '/collection',
    },
    {
      icon: PlusIcon,
      title: 'Add Bobblehead',
      url: '/add',
    },
    {
      icon: UploadIcon,
      items: [
        {
          title: 'Bulk Upload',
          url: '/import/bulk',
        },
        {
          title: 'CSV Import',
          url: '/import/csv',
        },
        {
          title: 'Photo Import',
          url: '/import/photos',
        },
      ],
      title: 'Import Tools',
      url: '/import',
    },
  ],
  navSecondary: [
    {
      icon: ActivityIcon,
      title: 'Following Feed',
      url: '/feed',
    },
    {
      icon: UserIcon,
      title: 'My Profile',
      url: '/profile',
    },
    {
      icon: SettingsIcon,
      title: 'Account Settings',
      url: '/settings',
    },
    {
      icon: HelpCircleIcon,
      title: 'Help & Tutorials',
      url: '/help',
    },
  ],
  user: {
    avatar: '/avatars/user.jpg',
    email: 'john@example.com',
    name: 'John Collector',
  },
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
