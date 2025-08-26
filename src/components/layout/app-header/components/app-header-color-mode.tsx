'use client';

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

export const AppHeaderColorMode = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const handleDarkMode = () => {
    setTheme('dark');
  };

  const handleLightMode = () => {
    setTheme('light');
  };

  const handleSystemMode = () => {
    setTheme('system');
  };

  const _isDarkMode = resolvedTheme === 'dark';

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
