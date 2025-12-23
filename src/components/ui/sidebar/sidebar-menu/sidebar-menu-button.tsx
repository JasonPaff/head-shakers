'use client';

import type { VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithRef } from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { cn } from '@/utils/tailwind-utils';

import { useSidebar } from '../sidebar-provider/use-sidebar';

const styles = cva(
  [
    'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-sm p-2 text-left text-sm',
    'ring-sidebar-ring outline-hidden transition-[width,height,padding]',
    'group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8!',
    'group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    'focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none',
    'aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium',
    'data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent',
    'data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate',
    '[&>svg]:size-4 [&>svg]:shrink-0',
  ],
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-8 text-sm',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
        sm: 'h-7 text-xs',
      },
      variant: {
        default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        outline: [
          'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent',
          'hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
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
  const { state } = useSidebar();
  const { isMobile } = useBreakpoint();

  const button = (
    <Comp
      className={cn(styles({ size, variant }), className)}
      data-active={isActive}
      data-sidebar={'menu-button'}
      data-size={size}
      data-slot={'sidebar-menu-button'}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === 'string') {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        align={'center'}
        hidden={state !== 'collapsed' || isMobile}
        side={'right'}
        {...tooltip}
      />
    </Tooltip>
  );
};
