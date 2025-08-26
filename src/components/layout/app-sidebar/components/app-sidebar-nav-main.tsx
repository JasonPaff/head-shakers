'use client';

import type { LucideIcon } from 'lucide-react';

import { ChevronRightIcon } from 'lucide-react';
import { Fragment } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup } from '@/components/ui/sidebar/sidebar-group/sidebar-group';
import { SidebarGroupLabel } from '@/components/ui/sidebar/sidebar-group/sidebar-group-label';
import { SidebarMenu } from '@/components/ui/sidebar/sidebar-menu/sidebar-menu';
import { SidebarMenuAction } from '@/components/ui/sidebar/sidebar-menu/sidebar-menu-action';
import { SidebarMenuButton } from '@/components/ui/sidebar/sidebar-menu/sidebar-menu-button';
import { SidebarMenuItem } from '@/components/ui/sidebar/sidebar-menu/sidebar-menu-item';
import { SidebarMenuSub } from '@/components/ui/sidebar/sidebar-menu/sidebar-menu-sub';
import { SidebarMenuSubButton } from '@/components/ui/sidebar/sidebar-menu/sidebar-menu-sub-button';
import { SidebarMenuSubItem } from '@/components/ui/sidebar/sidebar-menu/sidebar-menu-sub-item';

interface AppSidebarNavMainProps {
  items: Array<MenuItem>;
}

interface MenuItem {
  icon: LucideIcon;
  isActive?: boolean;
  items?: Array<SubMenuItem>;
  title: string;
  url: string;
}

interface SubMenuItem {
  title: string;
  url: string;
}

export const AppSidebarNavMain = ({ items }: AppSidebarNavMainProps) => {
  const getHasSubMenuItems = (items?: Array<SubMenuItem>) => {
    return items && items.length > 0;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible asChild defaultOpen={item.isActive} key={item.title}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
              {getHasSubMenuItems(item.items) ?
                <Fragment>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className={'data-[state=open]:rotate-90'}>
                      <ChevronRightIcon />
                      <span className={'sr-only'}>Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Fragment>
              : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};
