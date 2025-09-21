'use client';

import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

export const AppHeaderColorMode = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDarkMode = () => {
    setTheme('dark');
  };

  const handleLightMode = () => {
    setTheme('light');
  };

  const handleSystemMode = () => {
    setTheme('system');
  };

  const _isDarkMode = mounted && resolvedTheme === 'dark';

  // Prevent hydration mismatch by showing skeleton until mounted
  if (!mounted) {
    return <Skeleton className={'h-9 w-9 rounded-md'} />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={'icon'} variant={'outline'}>
          <Conditional isCondition={_isDarkMode}>
            <MoonIcon aria-hidden />
          </Conditional>
          <Conditional isCondition={!_isDarkMode}>
            <SunIcon aria-hidden />
          </Conditional>
          <span className={'sr-only'}>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={'end'}>
        <DropdownMenuItem onClick={handleLightMode}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={handleDarkMode}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={handleSystemMode}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
