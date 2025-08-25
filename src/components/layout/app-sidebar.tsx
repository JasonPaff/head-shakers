import { Command } from 'lucide-react';

import { AppNavMain } from '@/components/layout/app-nav-main';
import { Sidebar } from '@/components/ui/sidebar/sidebar';
import { SidebarMenu } from '@/components/ui/sidebar/sidebar-menu/sidebar-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar/sidebar-menu/sidebar-menu-button';
import { SidebarMenuItem } from '@/components/ui/sidebar/sidebar-menu/sidebar-menu-item';

import { SidebarContent } from '../ui/sidebar/sidebar-content';
import { SidebarFooter } from '../ui/sidebar/sidebar-footer';
import { SidebarHeader } from '../ui/sidebar/sidebar-header';

export const AppSidebar = () => {
  return (
    <Sidebar className={'top-(--header-height) h-[calc(100svh-var(--header-height))]!'}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size={'lg'}>
              <div
                className={
                  'flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'
                }
              >
                <Command className={'size-4'} />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AppNavMain />
      </SidebarContent>
      <SidebarFooter>footer</SidebarFooter>
    </Sidebar>
  );
};
