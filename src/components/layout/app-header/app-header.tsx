import 'server-only';
import Link from 'next/link';

import { AppHeaderAuthNavMenu } from '@/components/layout/app-header/components/app-header-auth-nav-menu';
import { AppHeaderColorMode } from '@/components/layout/app-header/components/app-header-color-mode';
import { AppHeaderContainer } from '@/components/layout/app-header/components/app-header-container';
import { AppHeaderNavMenu } from '@/components/layout/app-header/components/app-header-nav-menu';
import { AppHeaderNotifications } from '@/components/layout/app-header/components/app-header-notifications';
import { AppHeaderSearch } from '@/components/layout/app-header/components/app-header-search';
import { AppHeaderUser } from '@/components/layout/app-header/components/app-header-user';
import { AuthContent } from '@/components/ui/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

export const AppHeader = () => {
  return (
    <header
      className={'sticky top-0 z-50 flex w-full items-center border-b bg-background px-10'}
      data-testid={generateTestId('layout', 'app-header')}
    >
      <AppHeaderContainer data-testid={generateTestId('layout', 'app-header', 'container')}>
        {/* Logo */}
        <div
          className={'flex items-center'}
          data-testid={generateTestId('layout', 'app-header', 'logo-section')}
        >
          <Link
            className={'flex items-center gap-2 text-xl font-bold'}
            data-testid={generateTestId('layout', 'app-header', 'logo-link')}
            href={'/'}
          >
            <div
              className={cn(
                'flex aspect-square size-8 items-center justify-center',
                'rounded-lg bg-primary text-primary-foreground',
              )}
              data-testid={generateTestId('layout', 'app-header', 'logo-icon')}
            >
              HS
            </div>
            Head Shakers
          </Link>
        </div>

        {/* Navigation Menus */}
        <div
          className={'flex items-center'}
          data-testid={generateTestId('layout', 'app-header', 'navigation-section')}
        >
          <AppHeaderNavMenu />
        </div>

        {/* Search */}
        <div
          className={'flex flex-1 items-center px-4'}
          data-testid={generateTestId('layout', 'app-header', 'search-section')}
        >
          <div className={'mr-8 w-full max-w-md'}>
            <AppHeaderSearch />
          </div>

          {/* Auth Nav Menus */}
          <AuthContent loadingSkeleton={<Skeleton className={'h-[35px] w-7'} />}>
            <AppHeaderAuthNavMenu />
          </AuthContent>
        </div>

        {/* Notifications */}
        <div
          className={'flex items-center'}
          data-testid={generateTestId('layout', 'app-header', 'notifications-section')}
        >
          <AppHeaderNotifications />
        </div>

        {/* User Menu */}
        <div
          className={'flex items-center gap-4'}
          data-testid={generateTestId('layout', 'app-header', 'user-section')}
        >
          <div className={'mt-1.5'}>
            <AppHeaderUser />
          </div>
          <AppHeaderColorMode />
        </div>
      </AppHeaderContainer>
    </header>
  );
};
