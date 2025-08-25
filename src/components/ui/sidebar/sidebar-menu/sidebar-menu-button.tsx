'use client';

import type { VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithRef } from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/utils/tailwind-utils';

const styles = cva(
  [
    'peer/menu-button',
    'flex w-full items-center gap-2 overflow-hidden rounded-md',
    'p-2 text-left text-sm ring-sidebar-ring outline-none',
    // animation styles
    'transition-[width,height,padding]',
    // hover styles
    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    // focus-visible styles
    'focus-visible:ring-2',
    // active styles
    'active:bg-sidebar-accent active:text-sidebar-accent-foreground',
    // disabled styles
    'disabled:pointer-events-none',
    'disabled:opacity-50',
    // group styles
    'group-has-[[data-sidebar=menu-action]]/menu-item:pr-8',
    'group-data-collapsible-icon:!size-8 group-data-collapsible-icon:!p-2',
    // aria styles
    'aria-disabled:pointer-events-none aria-disabled:opacity-50',
    // data-active styles
    'data-active:bg-sidebar-accent',
    'data-active:font-medium data-active:text-sidebar-accent-foreground',
    // data-open styles
    'rdx-state-open:hover:bg-sidebar-accent rdx-state-open:hover:text-sidebar-accent-foreground',
    // svg styles
    '[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
  ],
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-8 text-sm',
        lg: 'h-12 text-sm group-data-collapsible-icon:!p-0',
        sm: 'h-7 text-xs',
      },
      variant: {
        default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        outline: [
          'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))]',
          // hover styles
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          'hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
        ],
      },
    },
  },
);

interface SidebarMenuButtonProps extends ComponentPropsWithRef<'button'>, VariantProps<typeof styles> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: ComponentPropsWithRef<typeof TooltipContent> | string;
}

export const SidebarMenuButton = ({
  asChild = false,
  className,
  isActive = false,
  size = 'default',
  tooltip,
  variant = 'default',
  ...props
}: SidebarMenuButtonProps) => {
  const Comp = asChild ? Slot : 'button';

  const button = (
    <Comp
      className={cn(styles({ size, variant }), className)}
      data-active={isActive}
      data-sidebar={'menu-button'}
      data-size={size}
      {...props}
    />
  );

  if (!tooltip) return button;

  if (typeof tooltip === 'string') {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent align={'center'} side={'right'} {...tooltip} />
    </Tooltip>
  );
};
