'use client';

import type { LucideIcon } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';

import Link from 'next/link';

import { SidebarGroup } from '@/components/ui/sidebar/sidebar-group/sidebar-group';
import { SidebarGroupContent } from '@/components/ui/sidebar/sidebar-group/sidebar-group-content';
import { SidebarMenu } from '@/components/ui/sidebar/sidebar-menu/sidebar-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar/sidebar-menu/sidebar-menu-button';
import { SidebarMenuItem } from '@/components/ui/sidebar/sidebar-menu/sidebar-menu-item';

type AppSidebarNavSecondaryProps = ComponentPropsWithoutRef<typeof SidebarGroup> & {
  items: Array<{
    icon: LucideIcon;
    title: string;
    url: string;
  }>;
};

export const AppSidebarNavSecondary = ({ items, ...props }: AppSidebarNavSecondaryProps) => {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size={'sm'}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
