'use client';

import type { ComponentPropsWithRef } from 'react';

import { cn } from '@/utils/tailwind-utils';

type SidebarGroupContentProps = ComponentPropsWithRef<'div'>;

export const SidebarGroupContent = ({ children, className, ...props }: SidebarGroupContentProps) => (
  <div
    className={cn('w-full text-sm', className)}
    data-sidebar={'group-content'}
    data-slot={'sidebar-group-content'}
    {...props}
  >
    {children}
  </div>
);
