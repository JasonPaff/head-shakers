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
import { SidebarHeader } from '@/components/ui/sidebar/sidebar-header';
import { SidebarMenu } from '@/components/ui/sidebar/sidebar-menu/sidebar-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar/sidebar-menu/sidebar-menu-button';
import { SidebarMenuItem } from '@/components/ui/sidebar/sidebar-menu/sidebar-menu-item';

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
    <Sidebar className={'top-16 h-[calc(100svh-4rem)]'} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size={'lg'}>
              <a href={'/dashboard'}>
                <div
                  className={
                    'flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'
                  }
                >
                  B
                </div>
                <div className={'grid flex-1 text-left text-sm leading-tight'}>
                  <span className={'truncate font-medium'}>BobbleHub</span>
                  <span className={'truncate text-xs'}>Collection Manager</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AppSidebarNavMain items={data.navMain} />
        <AppSidebarNavSecondary className={'mt-auto'} items={data.navSecondary} />
      </SidebarContent>
    </Sidebar>
  );
};
