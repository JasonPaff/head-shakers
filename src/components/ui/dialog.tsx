'use client';

import type { ComponentProps } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

import { Conditional } from '@/components/ui/conditional';
import { cn } from '@/utils/tailwind-utils';

type DialogCloseProps = ComponentProps<typeof DialogPrimitive.Close>;
type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  isShowCloseButton?: boolean;
};
type DialogDescriptionProps = ComponentProps<typeof DialogPrimitive.Description>;
type DialogFooterProps = ComponentProps<'div'>;
type DialogHeaderProps = ComponentProps<'div'>;
type DialogOverlayProps = ComponentProps<typeof DialogPrimitive.Overlay>;
type DialogPortalProps = ComponentProps<typeof DialogPrimitive.Portal>;
type DialogProps = ComponentProps<typeof DialogPrimitive.Root>;
type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title>;
type DialogTriggerProps = ComponentProps<typeof DialogPrimitive.Trigger>;

export const Dialog = ({ children, ...props }: DialogProps) => {
  return (
    <DialogPrimitive.Root data-slot={'dialog'} {...props}>
      {children}
    </DialogPrimitive.Root>
  );
};

export const DialogClose = ({ children, ...props }: DialogCloseProps) => {
  return (
    <DialogPrimitive.Close data-slot={'dialog-close'} {...props}>
      {children}
    </DialogPrimitive.Close>
  );
};

export const DialogContent = ({
  children,
  className,
  isShowCloseButton = true,
  ...props
}: DialogContentProps) => {
  return (
    <DialogPortal data-slot={'dialog-portal'}>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)]',
          'translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6',
          'shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0',
          'data-[state=open]:zoom-in-95 sm:max-w-lg',
          className,
        )}
        data-slot={'dialog-content'}
        {...props}
      >
        {children}
        <Conditional isCondition={isShowCloseButton}>
          <DialogPrimitive.Close
            className={cn(
              'absolute top-4 right-4 rounded-xs opacity-70',
              'ring-offset-background transition-opacity',
              'hover:opacity-100 focus:ring-2 focus:ring-ring',
              'focus:ring-offset-2 focus:outline-hidden',
              'disabled:pointer-events-none data-[state=open]:bg-accent',
              'data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none',
              "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            )}
            data-slot={'dialog-close'}
          >
            <XIcon aria-hidden className={'size-4'} />
            <span className={'sr-only'}>Close</span>
          </DialogPrimitive.Close>
        </Conditional>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
};

export const DialogDescription = ({ children, className, ...props }: DialogDescriptionProps) => {
  return (
    <DialogPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      data-slot={'dialog-description'}
      {...props}
    >
      {children}
    </DialogPrimitive.Description>
  );
};

export const DialogFooter = ({ children, className, ...props }: DialogFooterProps) => {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      data-slot={'dialog-footer'}
      {...props}
    >
      {children}
    </div>
  );
};

export const DialogHeader = ({ children, className, ...props }: DialogHeaderProps) => {
  return (
    <div
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      data-slot={'dialog-header'}
      {...props}
    >
      {children}
    </div>
  );
};

export const DialogOverlay = ({ children, className, ...props }: DialogOverlayProps) => {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/50',
        'data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0',
        'data-[state=open]:animate-in',
        'data-[state=open]:fade-in-0',
        className,
      )}
      data-slot={'dialog-overlay'}
      {...props}
    >
      {children}
    </DialogPrimitive.Overlay>
  );
};

export const DialogPortal = ({ children, ...props }: DialogPortalProps) => {
  return (
    <DialogPrimitive.Portal data-slot={'dialog-portal'} {...props}>
      {children}
    </DialogPrimitive.Portal>
  );
};

export const DialogTitle = ({ children, className, ...props }: DialogTitleProps) => {
  return (
    <DialogPrimitive.Title
      className={cn('text-lg leading-none font-semibold', className)}
      data-slot={'dialog-title'}
      {...props}
    >
      {children}
    </DialogPrimitive.Title>
  );
};

export const DialogTrigger = ({ children, ...props }: DialogTriggerProps) => {
  return (
    <DialogPrimitive.Trigger data-slot={'dialog-trigger'} {...props}>
      {children}
    </DialogPrimitive.Trigger>
  );
};
