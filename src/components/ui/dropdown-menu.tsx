'use client';

import type { ComponentProps } from 'react';

import {
  CheckboxItem,
  Content,
  Group,
  Item,
  ItemIndicator,
  Label,
  Portal,
  RadioGroup,
  RadioItem,
  Root,
  Separator,
  Sub,
  SubContent,
  SubTrigger,
  Trigger,
} from '@radix-ui/react-dropdown-menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';

import { cn } from '@/utils/tailwind-utils';

type DropdownMenuCheckboxItemProps = ComponentProps<typeof CheckboxItem>;
type DropdownMenuContentProps = ComponentProps<typeof Content>;
type DropdownMenuGroupProps = ComponentProps<typeof Group>;
type DropdownMenuItemProps = ComponentProps<typeof Item> & {
  isInset?: boolean;
  variant?: 'default' | 'destructive';
};
type DropdownMenuLabelProps = ComponentProps<typeof Label> & {
  isInset?: boolean;
};
type DropdownMenuPortalProps = ComponentProps<typeof Portal>;
type DropdownMenuProps = ComponentProps<typeof Root>;
type DropdownMenuRadioGroupProps = ComponentProps<typeof RadioGroup>;
type DropdownMenuRadioItemProps = ComponentProps<typeof RadioItem>;
type DropdownMenuSeparatorProps = ComponentProps<typeof Separator>;
type DropdownMenuShortcutProps = ComponentProps<'span'>;
type DropdownMenuSubContentProps = ComponentProps<typeof SubContent>;
type DropdownMenuSubProps = ComponentProps<typeof Sub>;
type DropdownMenuSubTriggerProps = ComponentProps<typeof SubTrigger> & {
  isInset?: boolean;
};
type DropdownMenuTriggerProps = ComponentProps<typeof Trigger>;

export const DropdownMenu = ({ ...props }: DropdownMenuProps) => {
  return <Root data-slot={'dropdown-menu'} {...props} />;
};

export const DropdownMenuCheckboxItem = ({
  checked,
  children,
  className,
  ...props
}: DropdownMenuCheckboxItemProps) => {
  return (
    <CheckboxItem
      checked={checked}
      className={cn(
        'relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm',
        'outline-hidden select-none focus:bg-accent focus:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none',
        "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      data-slot={'dropdown-menu-checkbox-item'}
      {...props}
    >
      <span className={'pointer-events-none absolute left-2 flex size-3.5 items-center justify-center'}>
        <ItemIndicator>
          <CheckIcon className={'size-4'} />
        </ItemIndicator>
      </span>
      {children}
    </CheckboxItem>
  );
};

export const DropdownMenuContent = ({ className, sideOffset = 4, ...props }: DropdownMenuContentProps) => {
  return (
    <Portal>
      <Content
        className={cn(
          'z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem]',
          'origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto',
          'rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          className,
        )}
        data-slot={'dropdown-menu-content'}
        sideOffset={sideOffset}
        {...props}
      />
    </Portal>
  );
};

export const DropdownMenuGroup = ({ ...props }: DropdownMenuGroupProps) => {
  return <Group data-slot={'dropdown-menu-group'} {...props} />;
};

export const DropdownMenuItem = ({ className, isInset, variant = 'default', ...props }: DropdownMenuItemProps) => {
  return (
    <Item
      className={cn(
        'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden',
        'select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none',
        'data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive',
        'data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive',
        'dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0',
        `[&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground`,
        'data-[variant=destructive]:*:[svg]:!text-destructive',
        className,
      )}
      data-inset={isInset}
      data-slot={'dropdown-menu-item'}
      data-variant={variant}
      {...props}
    />
  );
};

export const DropdownMenuLabel = ({ className, isInset, ...props }: DropdownMenuLabelProps) => {
  return (
    <Label
      className={cn('px-2 py-1.5 text-sm font-medium data-[inset]:pl-8', className)}
      data-inset={isInset}
      data-slot={'dropdown-menu-label'}
      {...props}
    />
  );
};

export const DropdownMenuPortal = ({ ...props }: DropdownMenuPortalProps) => {
  return <Portal data-slot={'dropdown-menu-portal'} {...props} />;
};

export const DropdownMenuRadioGroup = ({ ...props }: DropdownMenuRadioGroupProps) => {
  return <RadioGroup data-slot={'dropdown-menu-radio-group'} {...props} />;
};

export const DropdownMenuRadioItem = ({ children, className, ...props }: DropdownMenuRadioItemProps) => {
  return (
    <RadioItem
      className={cn(
        'relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm',
        'outline-hidden select-none focus:bg-accent focus:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none',
        `[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
        className,
      )}
      data-slot={'dropdown-menu-radio-item'}
      {...props}
    >
      <span className={'pointer-events-none absolute left-2 flex size-3.5 items-center justify-center'}>
        <ItemIndicator>
          <CircleIcon className={'size-2 fill-current'} />
        </ItemIndicator>
      </span>
      {children}
    </RadioItem>
  );
};

export const DropdownMenuSeparator = ({ className, ...props }: DropdownMenuSeparatorProps) => {
  return (
    <Separator
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      data-slot={'dropdown-menu-separator'}
      {...props}
    />
  );
};

export const DropdownMenuShortcut = ({ className, ...props }: DropdownMenuShortcutProps) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      data-slot={'dropdown-menu-shortcut'}
      {...props}
    />
  );
};

export const DropdownMenuSub = ({ ...props }: DropdownMenuSubProps) => {
  return <Sub data-slot={'dropdown-menu-sub'} {...props} />;
};

export const DropdownMenuSubContent = ({ className, ...props }: DropdownMenuSubContentProps) => {
  return (
    <SubContent
      className={cn(
        'z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin)',
        'overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
        className,
      )}
      data-slot={'dropdown-menu-sub-content'}
      {...props}
    />
  );
};

export const DropdownMenuSubTrigger = ({
  children,
  className,
  isInset,
  ...props
}: DropdownMenuSubTriggerProps) => {
  return (
    <SubTrigger
      className={cn(
        'flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none',
        'focus:bg-accent focus:text-accent-foreground',
        'data-[inset]:pl-8',
        'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
        className,
      )}
      data-inset={isInset}
      data-slot={'dropdown-menu-sub-trigger'}
      {...props}
    >
      {children}
      <ChevronRightIcon className={'ml-auto size-4'} />
    </SubTrigger>
  );
};

export const DropdownMenuTrigger = ({ ...props }: DropdownMenuTriggerProps) => {
  return <Trigger data-slot={'dropdown-menu-trigger'} {...props} />;
};
