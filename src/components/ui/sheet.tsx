'use client';

import type { ComponentProps } from 'react';

import { Close, Content, Description, Overlay, Portal, Root, Title, Trigger } from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

import { cn } from '@/utils/tailwind-utils';

type SheetCloseProps = ComponentProps<typeof Close>;
type SheetContentProps = ComponentProps<typeof Content> & {
  side?: 'bottom' | 'left' | 'right' | 'top';
};
type SheetDescriptionProps = ComponentProps<typeof Description>;
type SheetFooterProps = ComponentProps<'div'>;
type SheetHeaderProps = ComponentProps<'div'>;
type SheetOverlayProps = ComponentProps<typeof Overlay>;
type SheetPortalProps = ComponentProps<typeof Portal>;
type SheetProps = ComponentProps<typeof Root>;
type SheetTitleProps = ComponentProps<typeof Title>;
type SheetTriggerProps = ComponentProps<typeof Trigger>;

export const Sheet = ({ ...props }: SheetProps) => {
  return <Root data-slot={'sheet'} {...props} />;
};

export const SheetClose = ({ ...props }: SheetCloseProps) => {
  return <Close data-slot={'sheet-close'} {...props} />;
};

export const SheetContent = ({ children, className, side = 'right', ...props }: SheetContentProps) => {
  return (
    <SheetPortal>
      <SheetOverlay />
      <Content
        className={cn(
          'fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out',
          'data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500',
          side === 'right' &&
            'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
          side === 'left' &&
            'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
          side === 'top' &&
            'inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
          side === 'bottom' &&
            'inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          className,
        )}
        data-slot={'sheet-content'}
        {...props}
      >
        {children}
        <Close
          className={
            'absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary'
          }
        >
          <XIcon className={'size-4'} />
          <span className={'sr-only'}>Close</span>
        </Close>
      </Content>
    </SheetPortal>
  );
};

export const SheetDescription = ({ className, ...props }: SheetDescriptionProps) => {
  return (
    <Description
      className={cn('text-sm text-muted-foreground', className)}
      data-slot={'sheet-description'}
      {...props}
    />
  );
};

export const SheetFooter = ({ className, ...props }: SheetFooterProps) => {
  return (
    <div className={cn('mt-auto flex flex-col gap-2 p-4', className)} data-slot={'sheet-footer'} {...props} />
  );
};

export const SheetHeader = ({ className, ...props }: SheetHeaderProps) => {
  return <div className={cn('flex flex-col gap-1.5 p-4', className)} data-slot={'sheet-header'} {...props} />;
};

export const SheetOverlay = ({ className, ...props }: SheetOverlayProps) => {
  return (
    <Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        className,
      )}
      data-slot={'sheet-overlay'}
      {...props}
    />
  );
};

export const SheetPortal = ({ ...props }: SheetPortalProps) => {
  return <Portal data-slot={'sheet-portal'} {...props} />;
};

export const SheetTitle = ({ className, ...props }: SheetTitleProps) => {
  return <Title className={cn('font-semibold text-foreground', className)} data-slot={'sheet-title'} {...props} />;
};

export const SheetTrigger = ({ ...props }: SheetTriggerProps) => {
  return <Trigger data-slot={'sheet-trigger'} {...props} />;
};
