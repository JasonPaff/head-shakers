import 'server-only';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { AppHeaderAuthNavMenu } from '@/components/layout/app-header/components/app-header-auth-nav-menu';
import { AppHeaderColorMode } from '@/components/layout/app-header/components/app-header-color-mode';
import { AppHeaderContainer } from '@/components/layout/app-header/components/app-header-container';
import { AppHeaderMobileMenu } from '@/components/layout/app-header/components/app-header-mobile-menu';
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
      className={'sticky top-0 z-50 w-full border-b bg-background'}
      data-testid={generateTestId('layout', 'app-header')}
    >
      {/* Main Navigation Row */}
      <div className={'px-2 sm:px-4 md:px-6 lg:px-10'}>
        <AppHeaderContainer data-testid={generateTestId('layout', 'app-header', 'container')}>
          {/* Mobile Menu Button */}
          <div className={'flex items-center md:hidden'}>
            <AppHeaderMobileMenu />
          </div>

          {/* Logo */}
          <div
            className={'flex items-center'}
            data-testid={generateTestId('layout', 'app-header', 'logo-section')}
          >
            <Link
              className={'flex items-center gap-2 text-xl font-bold'}
              data-testid={generateTestId('layout', 'app-header', 'logo-link')}
              href={$path({ route: '/' })}
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
              <span className={'hidden sm:inline'}>Head Shakers</span>
            </Link>
          </div>

          {/* Search - In navbar on mobile and desktop, hidden on tablet */}
          <div
            className={'flex flex-1 items-center gap-2 px-2 md:hidden lg:flex lg:gap-4 lg:px-4'}
            data-testid={generateTestId('layout', 'app-header', 'search-section')}
          >
            <div className={'w-full min-w-0'}>
              <AppHeaderSearch />
            </div>
          </div>

          {/* Navigation Menus - Hidden on mobile */}
          <div
            className={'hidden items-center md:flex'}
            data-testid={generateTestId('layout', 'app-header', 'navigation-section')}
          >
            <AppHeaderNavMenu />
          </div>

          {/* Auth Nav Menus (Collections) - Hidden on mobile and tablet, shown on desktop */}
          <AuthContent loadingSkeleton={<Skeleton className={'h-[35px] w-7'} />}>
            <div className={'hidden lg:block'}>
              <AppHeaderAuthNavMenu />
            </div>
          </AuthContent>

          {/* Auth Nav Menus - Show on tablet only when search is below */}
          <AuthContent loadingSkeleton={<Skeleton className={'h-[35px] w-7'} />}>
            <div className={'hidden items-center gap-2 md:flex lg:hidden'}>
              <AppHeaderAuthNavMenu />
            </div>
          </AuthContent>

          {/* Notifications - Always visible */}
          <div
            className={'flex items-center'}
            data-testid={generateTestId('layout', 'app-header', 'notifications-section')}
          >
            <AppHeaderNotifications />
          </div>

          {/* User Menu - Always visible */}
          <div
            className={'flex items-center gap-2 md:gap-4'}
            data-testid={generateTestId('layout', 'app-header', 'user-section')}
          >
            <div className={'mt-1.5'}>
              <AppHeaderUser />
            </div>
            <AppHeaderColorMode />
          </div>
        </AppHeaderContainer>
      </div>

      {/* Search Row - Only visible on tablet (md breakpoint) */}
      <div
        className={'hidden border-t bg-background px-2 sm:px-4 md:block md:px-6 lg:hidden'}
        data-testid={generateTestId('layout', 'app-header', 'search-row')}
      >
        <div className={'mx-auto max-w-2xl py-2'}>
          <AppHeaderSearch />
        </div>
      </div>
    </header>
  );
};
