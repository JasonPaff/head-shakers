'use client';

import type { ComponentProps } from 'react';

import { Command as CommandPrimitive } from 'cmdk';
import { SearchIcon } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/utils/tailwind-utils';

type CommandEmptyProps = ComponentProps<typeof CommandPrimitive.Empty>;
type CommandGroupProps = ComponentProps<typeof CommandPrimitive.Group>;
type CommandInputProps = ComponentProps<typeof CommandPrimitive.Input>;
type CommandItemProps = ComponentProps<typeof CommandPrimitive.Item>;
type CommandListProps = ComponentProps<typeof CommandPrimitive.List>;
type CommandProps = ComponentProps<typeof CommandPrimitive>;
type CommandSeparatorProps = ComponentProps<typeof CommandPrimitive.Separator>;
type CommandShortcutProps = ComponentProps<'span'>;

export const Command = ({ className, ...props }: CommandProps) => {
  return (
    <CommandPrimitive
      className={cn(
        'flex h-full w-full flex-col overflow-hidden',
        'rounded-md bg-popover text-popover-foreground',
        className,
      )}
      data-slot={'command'}
      {...props}
    />
  );
};

type CommandDialogProps = ComponentProps<typeof Dialog> & {
  className?: string;
  description?: string;
  isShowCloseButton?: boolean;
  title?: string;
};

export const CommandDialog = ({
  children,
  className,
  description = 'Search for a command to run...',
  isShowCloseButton = true,
  title = 'Command Palette',
  ...props
}: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogHeader className={'sr-only'}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className={cn('overflow-hidden p-0', className)} isShowCloseButton={isShowCloseButton}>
        <Command
          className={cn(
            '**:data-[slot=command-input-wrapper]:h-12',
            '[&_[cmdk-group-heading]]:px-2',
            '[&_[cmdk-group-heading]]:font-medium',
            '[&_[cmdk-group-heading]]:text-muted-foreground',
            '[&_[cmdk-group]]:px-2',
            '[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0',
            '[&_[cmdk-input-wrapper]_svg]:h-5',
            '[&_[cmdk-input-wrapper]_svg]:w-5',
            '[&_[cmdk-input]]:h-12',
            '[&_[cmdk-item]]:px-2',
            '[&_[cmdk-item]]:py-3',
            '[&_[cmdk-item]_svg]:h-5',
            '[&_[cmdk-item]_svg]:w-5',
          )}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export const CommandEmpty = ({ children, ...props }: CommandEmptyProps) => {
  return (
    <CommandPrimitive.Empty className={'py-6 text-center text-sm'} data-slot={'command-empty'} {...props}>
      {children}
    </CommandPrimitive.Empty>
  );
};

export const CommandGroup = ({ children, className, ...props }: CommandGroupProps) => {
  return (
    <CommandPrimitive.Group
      className={cn(
        'overflow-hidden p-1 text-foreground',
        '[&_[cmdk-group-heading]]:px-2',
        '[&_[cmdk-group-heading]]:py-1.5',
        '[&_[cmdk-group-heading]]:text-xs',
        '[&_[cmdk-group-heading]]:font-medium',
        '[&_[cmdk-group-heading]]:text-muted-foreground',
        className,
      )}
      data-slot={'command-group'}
      {...props}
    >
      {children}
    </CommandPrimitive.Group>
  );
};

export const CommandInput = ({ children, className, ...props }: CommandInputProps) => {
  return (
    <div className={'flex h-9 items-center gap-2 border-b px-3'} data-slot={'command-input-wrapper'}>
      <SearchIcon className={'size-4 shrink-0 opacity-50'} />
      <CommandPrimitive.Input
        className={cn(
          'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden',
          'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        data-slot={'command-input'}
        {...props}
      >
        {children}
      </CommandPrimitive.Input>
    </div>
  );
};

export const CommandItem = ({ children, className, ...props }: CommandItemProps) => {
  return (
    <CommandPrimitive.Item
      className={cn(
        'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5',
        'text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none',
        'data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent',
        'data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none',
        "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "[&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      data-slot={'command-item'}
      {...props}
    >
      {children}
    </CommandPrimitive.Item>
  );
};

export const CommandList = ({ children, className, ...props }: CommandListProps) => {
  return (
    <CommandPrimitive.List
      className={cn('max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto', className)}
      data-slot={'command-list'}
      {...props}
    >
      {children}
    </CommandPrimitive.List>
  );
};

export const CommandSeparator = ({ children, className, ...props }: CommandSeparatorProps) => {
  return (
    <CommandPrimitive.Separator
      className={cn('-mx-1 h-px bg-border', className)}
      data-slot={'command-separator'}
      {...props}
    >
      {children}
    </CommandPrimitive.Separator>
  );
};

export const CommandShortcut = ({ children, className, ...props }: CommandShortcutProps) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      data-slot={'command-shortcut'}
      {...props}
    >
      {children}
    </span>
  );
};
