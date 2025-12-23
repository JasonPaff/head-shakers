import type { ComponentProps } from 'react';

import * as TagsInputPrimitive from '@diceui/tags-input';
import { XIcon } from 'lucide-react';

import { cn } from '@/utils/tailwind-utils';

type TagsInputProps = ComponentProps<typeof TagsInputPrimitive.Root>;

export const TagsInput = ({ children, className, ...props }: TagsInputProps) => {
  return (
    <TagsInputPrimitive.Root
      className={cn('flex w-[380px] flex-col gap-2', className)}
      data-slot={'tags-input'}
      {...props}
    >
      {children}
    </TagsInputPrimitive.Root>
  );
};

type TagsInputClearProps = ComponentProps<typeof TagsInputPrimitive.Clear>;

export const TagsInputClear = ({ children, ...props }: TagsInputClearProps) => {
  return (
    <TagsInputPrimitive.Clear data-slot={'tags-input-clear'} {...props}>
      {children}
    </TagsInputPrimitive.Clear>
  );
};

type TagsInputInputProps = ComponentProps<typeof TagsInputPrimitive.Input>;

export const TagsInputInput = ({ children, className, ...props }: TagsInputInputProps) => {
  return (
    <TagsInputPrimitive.Input
      className={cn(
        'flex-1 bg-transparent outline-hidden placeholder:text-muted-foreground',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      data-slot={'tags-input-input'}
      {...props}
    >
      {children}
    </TagsInputPrimitive.Input>
  );
};

type TagsInputItemProps = ComponentProps<typeof TagsInputPrimitive.Item>;

export const TagsInputItem = ({ children, className, ...props }: TagsInputItemProps) => {
  return (
    <TagsInputPrimitive.Item
      className={cn(
        'inline-flex max-w-[calc(100%-8px)] items-center gap-1.5 rounded border',
        'bg-transparent px-2.5 py-1 text-sm focus:outline-hidden data-editable:select-none',
        'data-editing:bg-transparent data-editing:ring-1 data-editing:ring-ring',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        '[&:not([data-editing])]:pr-1.5 [&[data-highlighted]:not([data-editing])]:bg-accent',
        '[&[data-highlighted]:not([data-editing])]:text-accent-foreground',
        className,
      )}
      data-slot={'tags-input-item'}
      {...props}
    >
      <TagsInputPrimitive.ItemText className={'truncate'}>{children}</TagsInputPrimitive.ItemText>
      <TagsInputPrimitive.ItemDelete
        className={
          'size-4 shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100'
        }
      >
        <XIcon aria-hidden className={'size-3.5'} />
      </TagsInputPrimitive.ItemDelete>
    </TagsInputPrimitive.Item>
  );
};

type TagsInputLabelProps = ComponentProps<typeof TagsInputPrimitive.Label>;

export const TagsInputLabel = ({ children, className, ...props }: TagsInputLabelProps) => {
  return (
    <TagsInputPrimitive.Label
      className={cn(
        'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      data-slot={'tags-input-label'}
      {...props}
    >
      {children}
    </TagsInputPrimitive.Label>
  );
};

type TagsInputListProps = ComponentProps<'div'>;

export const TagsInputList = ({ children, className, ...props }: TagsInputListProps) => {
  return (
    <div
      className={cn(
        'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-sm',
        'border border-input bg-background px-3 py-2 text-sm',
        'focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      data-slot={'tags-input-list'}
      {...props}
    >
      {children}
    </div>
  );
};
