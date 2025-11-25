import 'server-only';
import Link from 'next/link';

import { AppHeaderColorMode } from '@/components/layout/app-header/components/app-header-color-mode';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

export const PublicHeader = () => {
  return (
    <header
      className={'sticky top-0 z-50 w-full border-b bg-background'}
      data-testid={generateTestId('layout', 'public-header')}
    >
      <div className={'px-2 sm:px-4 md:px-6 lg:px-10'}>
        <div className={'flex h-14 w-full items-center justify-between gap-4 sm:h-16'}>
          {/* Logo */}
          <Link
            className={'flex items-center gap-2 text-xl font-bold'}
            data-testid={generateTestId('layout', 'public-header', 'logo-link')}
            href={'/'}
          >
            <div
              className={cn(
                'flex aspect-square size-8 items-center justify-center',
                'rounded-lg bg-primary text-primary-foreground',
              )}
            >
              HS
            </div>
            <span className={'hidden sm:inline'}>Head Shakers</span>
          </Link>

          {/* Right side */}
          <div className={'flex items-center gap-2 sm:gap-4'}>
            <AppHeaderColorMode />
          </div>
        </div>
      </div>
    </header>
  );
};
