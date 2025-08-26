'use client';

import type { ComponentPropsWithRef } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/utils/tailwind-utils';

type SidebarInputProps = ComponentPropsWithRef<typeof Input>;

export const SidebarInput = ({ className, ...props }: SidebarInputProps) => {
  return (
    <Input
      className={cn(
        'h-8 w-full bg-background shadow-none',
        // focus-visible styles
        'focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        className,
      )}
      data-sidebar={'input'}
      data-slot={'sidebar-input'}
      {...props}
    />
  );
};
