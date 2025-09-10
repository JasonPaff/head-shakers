'use client';

import type { ComponentProps } from 'react';

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/utils/tailwind-utils';

type AlertDialogActionProps = ComponentProps<typeof AlertDialogPrimitive.Action>;
type AlertDialogCancelProps = ComponentProps<typeof AlertDialogPrimitive.Cancel>;
type AlertDialogContentProps = ComponentProps<typeof AlertDialogPrimitive.Content>;
type AlertDialogDescriptionProps = ComponentProps<typeof AlertDialogPrimitive.Description>;
type AlertDialogFooterProps = ComponentProps<'div'>;
type AlertDialogHeaderProps = ComponentProps<'div'>;
type AlertDialogOverlayProps = ComponentProps<typeof AlertDialogPrimitive.Overlay>;
type AlertDialogPortalProps = ComponentProps<typeof AlertDialogPrimitive.Portal>;
type AlertDialogProps = ComponentProps<typeof AlertDialogPrimitive.Root>;
type AlertDialogTitleProps = ComponentProps<typeof AlertDialogPrimitive.Title>;
type AlertDialogTriggerProps = ComponentProps<typeof AlertDialogPrimitive.Trigger>;

export const AlertDialog = ({ ...props }: AlertDialogProps) => {
  return <AlertDialogPrimitive.Root data-slot={'alert-dialog'} {...props} />;
};

export const AlertDialogAction = ({ className, ...props }: AlertDialogActionProps) => {
  return <AlertDialogPrimitive.Action className={cn(buttonVariants(), className)} {...props} />;
};

export const AlertDialogCancel = ({ className, ...props }: AlertDialogCancelProps) => {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      {...props}
    />
  );
};

export const AlertDialogContent = ({ className, ...props }: AlertDialogContentProps) => {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        className={cn(
          'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)]',
          'translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background',
          'p-6 shadow-lg duration-200 data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0',
          'data-[state=open]:zoom-in-95 sm:max-w-lg',
          className,
        )}
        data-slot={'alert-dialog-content'}
        {...props}
      />
    </AlertDialogPortal>
  );
};

export const AlertDialogDescription = ({ className, ...props }: AlertDialogDescriptionProps) => {
  return (
    <AlertDialogPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      data-slot={'alert-dialog-description'}
      {...props}
    />
  );
};

export const AlertDialogFooter = ({ className, ...props }: AlertDialogFooterProps) => {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      data-slot={'alert-dialog-footer'}
      {...props}
    />
  );
};

export const AlertDialogHeader = ({ className, ...props }: AlertDialogHeaderProps) => {
  return (
    <div
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      data-slot={'alert-dialog-header'}
      {...props}
    />
  );
};

export const AlertDialogOverlay = ({ className, ...props }: AlertDialogOverlayProps) => {
  return (
    <AlertDialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/30',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        className,
      )}
      data-slot={'alert-dialog-overlay'}
      {...props}
    />
  );
};

export const AlertDialogPortal = ({ ...props }: AlertDialogPortalProps) => {
  return <AlertDialogPrimitive.Portal data-slot={'alert-dialog-portal'} {...props} />;
};

export const AlertDialogTitle = ({ className, ...props }: AlertDialogTitleProps) => {
  return (
    <AlertDialogPrimitive.Title
      className={cn('text-lg font-semibold', className)}
      data-slot={'alert-dialog-title'}
      {...props}
    />
  );
};

export const AlertDialogTrigger = ({ ...props }: AlertDialogTriggerProps) => {
  return <AlertDialogPrimitive.Trigger data-slot={'alert-dialog-trigger'} {...props} />;
};
