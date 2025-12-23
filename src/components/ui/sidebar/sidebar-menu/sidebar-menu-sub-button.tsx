'use client';

import type { VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithRef } from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/utils/tailwind-utils';

const styles = cva(
  [
    'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-sm px-2',
    'text-sidebar-foreground ring-sidebar-ring outline-none hover:bg-sidebar-accent',
    // hover styles
    'hover:text-sidebar-accent-foreground',
    // focus-visible styles
    'focus-visible:ring-2',
    // active styles
    'active:bg-sidebar-accent active:text-sidebar-accent-foreground',
    // disabled styles
    'disabled:pointer-events-none disabled:opacity-50',
    // aria styles
    'aria-disabled:pointer-events-none aria-disabled:opacity-50',
    // span styles
    '[&>span:last-child]:truncate',
    // svg styles
    '[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground',
    // data-active styles
    'data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground',
    // group styles
    'group-data-collapsible-icon:hidden',
  ],
  {
    defaultVariants: {
      size: 'md',
    },
    variants: {
      size: {
        md: 'text-sm',
        sm: 'text-xs',
      },
    },
  },
);

interface SidebarMenuSubButtonProps extends ComponentPropsWithRef<'a'>, VariantProps<typeof styles> {
  asChild?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
  tooltip?: ComponentPropsWithRef<typeof TooltipContent> | string;
}

export const SidebarMenuSubButton = ({
  asChild = false,
  className,
  isActive,
  isDisabled,
  size = 'md',
  tooltip,
  ...props
}: SidebarMenuSubButtonProps) => {
  const Comp = asChild ? Slot : 'a';

  if (!tooltip)
    return (
      <Comp
        className={cn(styles({ size }), className)}
        data-active={isActive}
        data-sidebar={'menu-sub-button'}
        data-size={size}
        {...props}
      />
    );

  if (typeof tooltip === 'string') {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild disabled={isDisabled}>
        <Comp
          className={cn(styles({ size }), className)}
          data-active={isActive}
          data-sidebar={'menu-sub-button'}
          data-size={size}
          data-slot={'sidebar-menu-sub-button'}
          {...props}
        />
      </TooltipTrigger>
      <TooltipContent align={'center'} side={'right'} {...tooltip} />
    </Tooltip>
  );
};
