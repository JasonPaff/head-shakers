'use client';

import type { ComponentProps } from 'react';

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { buttonVariants } from '@/components/ui/button';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type AlertDialogActionProps = ComponentProps<typeof AlertDialogPrimitive.Action> & ComponentTestIdProps;
type AlertDialogCancelProps = ComponentProps<typeof AlertDialogPrimitive.Cancel> & ComponentTestIdProps;
type AlertDialogContentProps = ComponentProps<typeof AlertDialogPrimitive.Content> & ComponentTestIdProps;
type AlertDialogDescriptionProps = ComponentProps<typeof AlertDialogPrimitive.Description> & ComponentTestIdProps;
type AlertDialogFooterProps = ComponentProps<'div'> & ComponentTestIdProps;
type AlertDialogHeaderProps = ComponentProps<'div'> & ComponentTestIdProps;
type AlertDialogOverlayProps = ComponentProps<typeof AlertDialogPrimitive.Overlay> & ComponentTestIdProps;
type AlertDialogPortalProps = ComponentProps<typeof AlertDialogPrimitive.Portal> & ComponentTestIdProps;
type AlertDialogProps = ComponentProps<typeof AlertDialogPrimitive.Root> & ComponentTestIdProps;
type AlertDialogTitleProps = ComponentProps<typeof AlertDialogPrimitive.Title> & ComponentTestIdProps;
type AlertDialogTriggerProps = ComponentProps<typeof AlertDialogPrimitive.Trigger> & ComponentTestIdProps;

export const AlertDialog = ({ testId, ...props }: AlertDialogProps) => {
  const alertDialogTestId = testId || generateTestId('ui', 'alert-dialog');

  return <AlertDialogPrimitive.Root data-slot={'alert-dialog'} data-testid={alertDialogTestId} {...props} />;
};

export const AlertDialogAction = ({ className, testId, ...props }: AlertDialogActionProps) => {
  const alertDialogActionTestId = testId || generateTestId('ui', 'alert-dialog', 'action');

  return <AlertDialogPrimitive.Action className={cn(buttonVariants(), className)} data-testid={alertDialogActionTestId} {...props} />;
};

export const AlertDialogCancel = ({ className, testId, ...props }: AlertDialogCancelProps) => {
  const alertDialogCancelTestId = testId || generateTestId('ui', 'alert-dialog', 'cancel');

  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      data-testid={alertDialogCancelTestId}
      {...props}
    />
  );
};

export const AlertDialogContent = ({ className, testId, ...props }: AlertDialogContentProps) => {
  const alertDialogContentTestId = testId || generateTestId('ui', 'alert-dialog', 'content');

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
        data-testid={alertDialogContentTestId}
        {...props}
      />
    </AlertDialogPortal>
  );
};

export const AlertDialogDescription = ({ className, testId, ...props }: AlertDialogDescriptionProps) => {
  const alertDialogDescriptionTestId = testId;

  return (
    <AlertDialogPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      data-slot={'alert-dialog-description'}
      data-testid={alertDialogDescriptionTestId}
      {...props}
    />
  );
};

export const AlertDialogFooter = ({ className, testId, ...props }: AlertDialogFooterProps) => {
  const alertDialogFooterTestId = testId;

  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      data-slot={'alert-dialog-footer'}
      data-testid={alertDialogFooterTestId}
      {...props}
    />
  );
};

export const AlertDialogHeader = ({ className, testId, ...props }: AlertDialogHeaderProps) => {
  const alertDialogHeaderTestId = testId;

  return (
    <div
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      data-slot={'alert-dialog-header'}
      data-testid={alertDialogHeaderTestId}
      {...props}
    />
  );
};

export const AlertDialogOverlay = ({ className, testId, ...props }: AlertDialogOverlayProps) => {
  const alertDialogOverlayTestId = testId;

  return (
    <AlertDialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/30',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        className,
      )}
      data-slot={'alert-dialog-overlay'}
      data-testid={alertDialogOverlayTestId}
      {...props}
    />
  );
};

export const AlertDialogPortal = ({ testId, ...props }: AlertDialogPortalProps) => {
  const alertDialogPortalTestId = testId;

  return <AlertDialogPrimitive.Portal data-slot={'alert-dialog-portal'} data-testid={alertDialogPortalTestId} {...props} />;
};

export const AlertDialogTitle = ({ className, testId, ...props }: AlertDialogTitleProps) => {
  const alertDialogTitleTestId = testId;

  return (
    <AlertDialogPrimitive.Title
      className={cn('text-lg font-semibold', className)}
      data-slot={'alert-dialog-title'}
      data-testid={alertDialogTitleTestId}
      {...props}
    />
  );
};

export const AlertDialogTrigger = ({ testId, ...props }: AlertDialogTriggerProps) => {
  const alertDialogTriggerTestId = testId || generateTestId('ui', 'alert-dialog', 'trigger');

  return <AlertDialogPrimitive.Trigger data-slot={'alert-dialog-trigger'} data-testid={alertDialogTriggerTestId} {...props} />;
};
