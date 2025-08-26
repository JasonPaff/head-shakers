import Link from 'next/link';

import { AppHeaderColorMode } from '@/components/layout/app-header/components/app-header-color-mode';
import { AppHeaderContainer } from '@/components/layout/app-header/components/app-header-container';
import { AppHeaderDiscovery } from '@/components/layout/app-header/components/app-header-discovery';
import { AppHeaderNotifications } from '@/components/layout/app-header/components/app-header-notifications';
import { AppHeaderSearch } from '@/components/layout/app-header/components/app-header-search';
import { AppHeaderUser } from '@/components/layout/app-header/components/app-header-user';
import { AuthContent } from '@/components/ui/auth';
import { SidebarTrigger } from '@/components/ui/sidebar/sidebar-trigger';
import { cn } from '@/utils/tailwind-utils';

export const AppHeader = () => {
  return (
    <header className={'sticky top-0 z-50 flex w-full items-center border-b bg-background'}>
      <AppHeaderContainer>
        <AuthContent>
          <SidebarTrigger
            className={cn(
              '-ml-1 text-background/75 hover:bg-primary hover:text-background/50',
              'dark:text-foreground/75 hover:dark:text-foreground/50',
            )}
          />
        </AuthContent>

        {/* Logo */}
        <Link className={'flex items-center gap-2 text-xl font-bold'} href={'/'}>
          <div
            className={cn(
              'flex aspect-square size-8 items-center justify-center',
              'rounded-lg bg-primary text-primary-foreground',
            )}
          >
            HS
          </div>
          Head Shakers
        </Link>

        {/* Search */}
        <div className={'mx-4 max-w-md flex-1'}>
          <AppHeaderSearch />
        </div>

        <div className={'flex items-center justify-between space-x-4'}>
          {/* Discovery Actions */}
          <AppHeaderDiscovery />

          {/* Notifications */}
          <AppHeaderNotifications />

          {/* User Actions */}
          <AppHeaderUser />

          {/* Color Mode Toggle */}
          <AppHeaderColorMode />
        </div>
      </AppHeaderContainer>
    </header>
  );
};
