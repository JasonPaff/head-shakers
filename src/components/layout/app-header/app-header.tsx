import 'server-only';
import Link from 'next/link';

import { AppHeaderColorMode } from '@/components/layout/app-header/components/app-header-color-mode';
import { AppHeaderContainer } from '@/components/layout/app-header/components/app-header-container';
import { AppHeaderNavMenu } from '@/components/layout/app-header/components/app-header-nav-menu';
import { AppHeaderNotifications } from '@/components/layout/app-header/components/app-header-notifications';
import { AppHeaderSearch } from '@/components/layout/app-header/components/app-header-search';
import { AppHeaderUser } from '@/components/layout/app-header/components/app-header-user';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

export const AppHeader = () => {
  return (
    <header
      className={'sticky top-0 z-50 flex w-full items-center border-b bg-background'}
      data-testid={generateTestId('layout', 'app-header')}
    >
      <AppHeaderContainer data-testid={generateTestId('layout', 'app-header', 'container')}>
        {/* Left Section - Logo */}
        <div
          className={'flex items-center gap-4'}
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

        {/* Center Section - Search & Navigation */}
        <div
          className={'flex flex-1 items-center justify-center gap-4'}
          data-testid={generateTestId('layout', 'app-header', 'center-section')}
        >
          <div className={'max-w-md flex-1'}>
            <AppHeaderSearch />
          </div>
          <AppHeaderNavMenu />
        </div>

        {/* Right Section - User Actions */}
        <div
          className={'flex items-center space-x-4'}
          data-testid={generateTestId('layout', 'app-header', 'actions-section')}
        >
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
