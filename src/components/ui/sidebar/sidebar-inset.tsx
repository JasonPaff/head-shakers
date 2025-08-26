'use client';

import type { ComponentPropsWithRef } from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '@/utils/tailwind-utils';

const styles = cva([
  'relative flex w-full flex-1 flex-col bg-background',
  'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0',
  'md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm',
  'md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
]);

type SidebarInsetProps = ComponentPropsWithRef<'div'>;

export const SidebarInset = ({ children, className, ...props }: SidebarInsetProps) => {
  return (
    <div className={cn(styles(), className)} data-slot={'sidebar-inset'} {...props}>
      {children}
    </div>
  );
};
