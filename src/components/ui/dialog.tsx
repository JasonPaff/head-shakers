'use client';

import type { ComponentProps } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type DialogCloseProps = ComponentProps<typeof DialogPrimitive.Close> & ComponentTestIdProps;
type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> &
  ComponentTestIdProps & {
    isShowCloseButton?: boolean;
  };
type DialogDescriptionProps = ComponentProps<typeof DialogPrimitive.Description> & ComponentTestIdProps;
type DialogFooterProps = ComponentProps<'div'> & ComponentTestIdProps;
type DialogHeaderProps = ComponentProps<'div'> & ComponentTestIdProps;
type DialogOverlayProps = ComponentProps<typeof DialogPrimitive.Overlay> & ComponentTestIdProps;
type DialogPortalProps = ComponentProps<typeof DialogPrimitive.Portal> & ComponentTestIdProps;
type DialogProps = ComponentProps<typeof DialogPrimitive.Root> & ComponentTestIdProps;
type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title> & ComponentTestIdProps;
type DialogTriggerProps = ComponentProps<typeof DialogPrimitive.Trigger> & ComponentTestIdProps;

export const Dialog = ({ children, testId, ...props }: DialogProps) => {
  const dialogTestId = testId || generateTestId('ui', 'dialog');

  return (
    <DialogPrimitive.Root data-slot={'dialog'} data-testid={dialogTestId} {...props}>
      {children}
    </DialogPrimitive.Root>
  );
};

export const DialogClose = ({ children, testId, ...props }: DialogCloseProps) => {
  const dialogCloseTestId = testId || generateTestId('ui', 'dialog', 'close');

  return (
    <DialogPrimitive.Close data-slot={'dialog-close'} data-testid={dialogCloseTestId} {...props}>
      {children}
    </DialogPrimitive.Close>
  );
};

export const DialogContent = ({
  children,
  className,
  isShowCloseButton = true,
  testId,
  ...props
}: DialogContentProps) => {
  const dialogContentTestId = testId || generateTestId('ui', 'dialog', 'content');
  const closeButtonTestId = testId ? `${testId}-close` : generateTestId('ui', 'dialog', 'close');

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
        data-testid={dialogContentTestId}
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
            data-testid={closeButtonTestId}
          >
            <XIcon aria-hidden className={'size-4'} />
            <span className={'sr-only'}>Close</span>
          </DialogPrimitive.Close>
        </Conditional>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
};

export const DialogDescription = ({ children, className, testId, ...props }: DialogDescriptionProps) => {
  const dialogDescriptionTestId = testId || generateTestId('ui', 'dialog', 'description');

  return (
    <DialogPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      data-slot={'dialog-description'}
      data-testid={dialogDescriptionTestId}
      {...props}
    >
      {children}
    </DialogPrimitive.Description>
  );
};

export const DialogFooter = ({ children, className, testId, ...props }: DialogFooterProps) => {
  const dialogFooterTestId = testId || generateTestId('ui', 'dialog', 'footer');

  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      data-slot={'dialog-footer'}
      data-testid={dialogFooterTestId}
      {...props}
    >
      {children}
    </div>
  );
};

export const DialogHeader = ({ children, className, testId, ...props }: DialogHeaderProps) => {
  const dialogHeaderTestId = testId || generateTestId('ui', 'dialog', 'header');

  return (
    <div
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      data-slot={'dialog-header'}
      data-testid={dialogHeaderTestId}
      {...props}
    >
      {children}
    </div>
  );
};

export const DialogOverlay = ({ children, className, testId, ...props }: DialogOverlayProps) => {
  const dialogOverlayTestId = testId || generateTestId('ui', 'dialog', 'overlay');

  return (
    <DialogPrimitive.Overlay
      className={cn(
        '!pointer-events-none fixed inset-0 z-50 bg-black/50',
        'data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0',
        'data-[state=open]:animate-in',
        'data-[state=open]:fade-in-0',
        className,
      )}
      data-slot={'dialog-overlay'}
      data-testid={dialogOverlayTestId}
      {...props}
    >
      {children}
    </DialogPrimitive.Overlay>
  );
};

export const DialogPortal = ({ children, testId, ...props }: DialogPortalProps) => {
  const dialogPortalTestId = testId || generateTestId('ui', 'dialog', 'portal');

  return (
    <DialogPrimitive.Portal data-slot={'dialog-portal'} data-testid={dialogPortalTestId} {...props}>
      {children}
    </DialogPrimitive.Portal>
  );
};

export const DialogTitle = ({ children, className, testId, ...props }: DialogTitleProps) => {
  const dialogTitleTestId = testId || generateTestId('ui', 'dialog', 'title');

  return (
    <DialogPrimitive.Title
      className={cn('text-lg leading-none font-semibold', className)}
      data-slot={'dialog-title'}
      data-testid={dialogTitleTestId}
      {...props}
    >
      {children}
    </DialogPrimitive.Title>
  );
};

export const DialogTrigger = ({ children, testId, ...props }: DialogTriggerProps) => {
  const dialogTriggerTestId = testId || generateTestId('ui', 'dialog', 'trigger');

  return (
    <DialogPrimitive.Trigger data-slot={'dialog-trigger'} data-testid={dialogTriggerTestId} {...props}>
      {children}
    </DialogPrimitive.Trigger>
  );
};
