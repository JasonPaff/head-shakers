'use client';

import { BookOpen, Bot, Settings2, SquareTerminal } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
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

const items = [
  {
    icon: SquareTerminal,
    isActive: true,
    items: [
      {
        title: 'History',
        url: '#',
      },
      {
        title: 'Starred',
        url: '#',
      },
      {
        title: 'Settings',
        url: '#',
      },
    ],
    title: 'Playground',
    url: '#',
  },
  {
    icon: Bot,
    items: [
      {
        title: 'Genesis',
        url: '#',
      },
      {
        title: 'Explorer',
        url: '#',
      },
      {
        title: 'Quantum',
        url: '#',
      },
    ],
    title: 'Models',
    url: '#',
  },
  {
    icon: BookOpen,
    items: [
      {
        title: 'Introduction',
        url: '#',
      },
      {
        title: 'Get Started',
        url: '#',
      },
      {
        title: 'Tutorials',
        url: '#',
      },
      {
        title: 'Changelog',
        url: '#',
      },
    ],
    title: 'Documentation',
    url: '#',
  },
  {
    icon: Settings2,
    items: [
      {
        title: 'General',
        url: '#',
      },
      {
        title: 'Team',
        url: '#',
      },
      {
        title: 'Billing',
        url: '#',
      },
      {
        title: 'Limits',
        url: '#',
      },
    ],
    title: 'Settings',
    url: '#',
  },
];

export const AppNavMain = () => {
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
              {item.items?.length ?
                <Fragment>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className={'data-[state=open]:rotate-90'}>
                      <ChevronRight />
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
