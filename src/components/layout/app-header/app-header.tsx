'use client';

import { HeaderColorMode } from '@/components/layout/app-header/components/header-color-mode';
import { HeaderDiscovery } from '@/components/layout/app-header/components/header-discovery';
import { HeaderSearch } from '@/components/layout/app-header/components/header-search';
import { HeaderUser } from '@/components/layout/app-header/components/header-user';

export const AppHeader = () => {
  return (
    <header className={'border-b shadow-sm'}>
      <div className={'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'}>
        <div className={'flex h-16 items-center justify-between'}>
          {/* Logo */}
          <div className={'flex items-center'}>
            <div className={'text-2xl font-bold'}>Head Shakers</div>
          </div>

          {/* Discovery Search */}
          <div className={'mx-8 max-w-2xl flex-1'}>
            <HeaderSearch />
          </div>

          <div className={'flex items-center space-x-4'}>
            {/* Discovery Actions */}
            <HeaderDiscovery />
            {/* User Actions */}
            <HeaderUser />
            {/* Color Mode Toggle */}
            <HeaderColorMode />
          </div>
        </div>
      </div>
    </header>
  );
};
