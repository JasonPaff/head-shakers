'use client';

import type { ComponentPropsWithRef } from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '@/utils/tailwind-utils';

const styles = cva([
  'relative flex min-h-svh flex-1 flex-col bg-background',
  // peer data-variant styles
  'peer-data-variant-inset:min-h-[calc(100svh-theme(spacing.4))]',
  'md:peer-data-variant-inset:m-2',
  'md:peer-data-variant-inset:ml-0',
  'md:peer-data-variant-inset:rounded-xl',
  'md:peer-data-variant-inset:shadow',
  // peer data-collapsed data-variant styles
  'md:peer-data-state-collapsed:peer-data-variant-inset:ml-2',
]);

type SidebarInsetProps = ComponentPropsWithRef<'div'>;

export const SidebarInset = ({ children, className, ...props }: SidebarInsetProps) => {
  return (
    <div className={cn(styles(), className)} {...props}>
      {children}
    </div>
  );
};
