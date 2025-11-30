'use client';

import type { ReactNode } from 'react';

import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useToggle } from '@/hooks/use-toggle';
import { cn } from '@/utils/tailwind-utils';

import { CollectionDesktopSidebar } from './collection-desktop-sidebar';
import { CollectionMobileHeader } from './collection-mobile-header';

type CollectionLayoutProps = {
  main: ReactNode;
  sidebar: ReactNode;
};

export const CollectionLayout = ({ main, sidebar }: CollectionLayoutProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useToggle();

  return (
    <div className={cn('flex h-screen overflow-hidden bg-background')} data-slot={'collection-layout'}>
      {/* Desktop Sidebar - visible on lg+ */}
      <CollectionDesktopSidebar>{sidebar}</CollectionDesktopSidebar>

      {/* Mobile Drawer - Sheet component */}
      <Sheet onOpenChange={setIsDrawerOpen.update} open={isDrawerOpen}>
        <SheetContent className={'w-[85%] max-w-sm p-0'} side={'left'}>
          <div className={'flex h-full flex-col'} data-slot={'mobile-drawer-content'}>
            {sidebar}
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className={'flex flex-1 flex-col overflow-hidden'} data-slot={'main-content'}>
        {/* Mobile Header - visible on < lg */}
        <CollectionMobileHeader onMenuClick={setIsDrawerOpen.toggle} />

        {/* Main Content */}
        {main}
      </div>
    </div>
  );
};
