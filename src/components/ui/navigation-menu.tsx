import type { ComponentProps } from 'react';

import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { cva } from 'class-variance-authority';
import { ChevronDownIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type NavigationMenuProps = ComponentProps<typeof NavigationMenuPrimitive.Root> &
  ComponentTestIdProps & {
    isViewport?: boolean;
  };

export const NavigationMenu = ({
  children,
  className,
  isViewport = true,
  testId,
  ...props
}: NavigationMenuProps) => {
  const navigationMenuTestId = testId || generateTestId('ui', 'navigation-menu');

  return (
    <NavigationMenuPrimitive.Root
      className={cn(
        'group/navigation-menu relative flex max-w-max flex-1 items-center justify-center',
        className,
      )}
      data-slot={'navigation-menu'}
      data-testid={navigationMenuTestId}
      data-viewport={isViewport}
      {...props}
    >
      {children}
      <Conditional isCondition={isViewport}>
        <NavigationMenuViewport />
      </Conditional>
    </NavigationMenuPrimitive.Root>
  );
};

type NavigationMenuItemProps = ComponentProps<typeof NavigationMenuPrimitive.Item> & ComponentTestIdProps;

export const NavigationMenuItem = ({ children, className, testId, ...props }: NavigationMenuItemProps) => {
  const navigationMenuItemTestId = testId || generateTestId('ui', 'navigation-menu', 'item');

  return (
    <NavigationMenuPrimitive.Item
      className={cn('relative', className)}
      data-slot={'navigation-menu-item'}
      data-testid={navigationMenuItemTestId}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Item>
  );
};

type NavigationMenuListProps = ComponentProps<typeof NavigationMenuPrimitive.List> & ComponentTestIdProps;

export const NavigationMenuList = ({ className, testId, ...props }: NavigationMenuListProps) => {
  const navigationMenuListTestId = testId || generateTestId('ui', 'navigation-menu', 'list');

  return (
    <NavigationMenuPrimitive.List
      className={cn('group flex flex-1 list-none items-center justify-center gap-1', className)}
      data-slot={'navigation-menu-list'}
      data-testid={navigationMenuListTestId}
      {...props}
    />
  );
};

type NavigationMenuContentProps = ComponentProps<typeof NavigationMenuPrimitive.Content> &
  ComponentTestIdProps;

export const NavigationMenuContent = ({
  children,
  className,
  testId,
  ...props
}: NavigationMenuContentProps) => {
  const navigationMenuContentTestId = testId || generateTestId('ui', 'navigation-menu', 'content');

  return (
    <NavigationMenuPrimitive.Content
      className={cn(
        'top-0 left-0 w-full p-2 pr-2.5 data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out md:absolute md:w-auto',
        'group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95',
        className,
      )}
      data-slot={'navigation-menu-content'}
      data-testid={navigationMenuContentTestId}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Content>
  );
};

type NavigationMenuIndicatorProps = ComponentProps<typeof NavigationMenuPrimitive.Indicator> &
  ComponentTestIdProps;

export const NavigationMenuIndicator = ({ className, testId, ...props }: NavigationMenuIndicatorProps) => {
  const navigationMenuIndicatorTestId = testId || generateTestId('ui', 'navigation-menu', 'indicator');

  return (
    <NavigationMenuPrimitive.Indicator
      className={cn(
        'top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in',
        className,
      )}
      data-slot={'navigation-menu-indicator'}
      data-testid={navigationMenuIndicatorTestId}
      {...props}
    >
      <div className={'relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md'} />
    </NavigationMenuPrimitive.Indicator>
  );
};

type NavigationMenuLinkProps = ComponentProps<typeof NavigationMenuPrimitive.Link> & ComponentTestIdProps;

export const NavigationMenuLink = ({ children, className, testId, ...props }: NavigationMenuLinkProps) => {
  const navigationMenuLinkTestId = testId || generateTestId('ui', 'navigation-menu', 'link');

  return (
    <NavigationMenuPrimitive.Link
      className={cn(
        "flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground data-[active=true]:hover:bg-accent data-[active=true]:focus:bg-accent [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      data-slot={'navigation-menu-link'}
      data-testid={navigationMenuLinkTestId}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Link>
  );
};

export const navigationMenuTriggerStyle = cva(
  'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-[color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50 data-[state=open]:text-accent-foreground data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent',
);

type NavigationMenuTriggerProps = ComponentProps<typeof NavigationMenuPrimitive.Trigger> &
  ComponentTestIdProps;

export const NavigationMenuTrigger = ({
  children,
  className,
  testId,
  ...props
}: NavigationMenuTriggerProps) => {
  const navigationMenuTriggerTestId = testId || generateTestId('ui', 'navigation-menu', 'trigger');

  return (
    <NavigationMenuPrimitive.Trigger
      className={cn(navigationMenuTriggerStyle(), 'group', className)}
      data-slot={'navigation-menu-trigger'}
      data-testid={navigationMenuTriggerTestId}
      {...props}
    >
      {children}{' '}
      <ChevronDownIcon
        aria-hidden={'true'}
        className={
          'relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180'
        }
      />
    </NavigationMenuPrimitive.Trigger>
  );
};

type NavigationMenuViewportProps = ComponentProps<typeof NavigationMenuPrimitive.Viewport> &
  ComponentTestIdProps;

// TODO: investigate origin-top-center
export const NavigationMenuViewport = ({
  children,
  className,
  testId,
  ...props
}: NavigationMenuViewportProps) => {
  const navigationMenuViewportTestId = testId || generateTestId('ui', 'navigation-menu', 'viewport');

  return (
    <div className={cn('absolute top-full left-0 isolate z-50 flex justify-center')}>
      <NavigationMenuPrimitive.Viewport
        className={cn(
          'relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]',
          className,
        )}
        data-slot={'navigation-menu-viewport'}
        data-testid={navigationMenuViewportTestId}
        {...props}
      >
        {children}
      </NavigationMenuPrimitive.Viewport>
    </div>
  );
};
