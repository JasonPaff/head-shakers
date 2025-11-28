'use client';

import { useState } from 'react';
import { $path } from 'next-typesafe-url';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import {
  BellIcon,
  MenuIcon,
  SearchIcon,
  XIcon,
  HomeIcon,
  LayoutGridIcon,
  StarIcon,
  FolderIcon,
  ShieldIcon,
  SettingsIcon,
  PlusCircleIcon,
  UploadIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { AuthContent } from '@/components/ui/auth';
import { useAdminRole } from '@/hooks/use-admin-role';
import { useToggle } from '@/hooks/use-toggle';

import { LogoIsland } from './logo-island';
import { NavigationIsland } from './navigation-island';
import { SearchIsland } from './search-island';
import { UserControlsIsland } from './user-controls-island';
import { MobileMenuIsland } from './mobile-menu-island';

export function DemoHeader() {
  const { isAdmin, isLoading: adminLoading } = useAdminRole();
  const { theme, setTheme } = useTheme();
  const [searchExpanded, toggleSearchExpanded] = useToggle(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Floating Islands - Hidden on mobile */}
      <div className='fixed left-0 right-0 top-0 z-50 hidden lg:block'>
        <div className='pointer-events-none relative mx-auto max-w-[1600px] px-6 pt-6'>
          {/* Logo Island - Top Left */}
          <LogoIsland />

          {/* Navigation Island - Top Center */}
          <NavigationIsland isAdmin={isAdmin} adminLoading={adminLoading} />

          {/* Search Island - Expandable from top center-right */}
          <SearchIsland expanded={searchExpanded} onToggle={toggleSearchExpanded} />

          {/* User Controls Island - Top Right */}
          <UserControlsIsland theme={theme} setTheme={setTheme} />
        </div>
      </div>

      {/* Mobile/Tablet Floating Control Bar */}
      <MobileMenuIsland isAdmin={isAdmin} adminLoading={adminLoading} theme={theme} setTheme={setTheme} />
    </>
  );
}
