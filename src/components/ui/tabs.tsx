'use client';

import type { ComponentProps } from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/utils/tailwind-utils';

type TabsProps = ComponentProps<typeof TabsPrimitive.Root>;

export const Tabs = ({ children, className, ...props }: TabsProps) => {
  return (
    <TabsPrimitive.Root className={cn('flex flex-col gap-2', className)} data-slot={'tabs'} {...props}>
      {children}
    </TabsPrimitive.Root>
  );
};

type TabsContentProps = ComponentProps<typeof TabsPrimitive.Content>;

export const TabsContent = ({ children, className, ...props }: TabsContentProps) => {
  return (
    <TabsPrimitive.Content
      className={cn('flex-1 outline-none', className)}
      data-slot={'tabs-content'}
      {...props}
    >
      {children}
    </TabsPrimitive.Content>
  );
};

type TabsListProps = ComponentProps<typeof TabsPrimitive.List>;

export const TabsList = ({ children, className, ...props }: TabsListProps) => {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex h-9 w-fit items-center justify-center',
        'rounded-lg bg-muted p-[3px] text-muted-foreground',
        className,
      )}
      data-slot={'tabs-list'}
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  );
};

type TabsTriggerProps = ComponentProps<typeof TabsPrimitive.Trigger>;

export const TabsTrigger = ({ children, className, ...props }: TabsTriggerProps) => {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5',
        'rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap',
        'text-foreground transition-[color,box-shadow] focus-visible:border-ring',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1',
        'focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:bg-background data-[state=active]:shadow-sm dark:text-muted-foreground',
        'dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30',
        'dark:data-[state=active]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0',
        "[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      data-slot={'tabs-trigger'}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
};
