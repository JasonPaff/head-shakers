import type { ComponentProps } from 'react';

import { cn } from '@/utils/tailwind-utils';

type CardActionProps = ComponentProps<'div'>;
type CardContentProps = ComponentProps<'div'>;
type CardDescriptionProps = ComponentProps<'div'>;
type CardFooterProps = ComponentProps<'div'>;
type CardHeaderProps = ComponentProps<'div'>;
type CardProps = ComponentProps<'div'>;
type CardTitleProps = ComponentProps<'div'>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        `
          flex flex-col gap-6 rounded-xl border bg-card py-6
          text-card-foreground shadow-sm
        `,
        className,
      )}
      data-slot={'card'}
      {...props}
    />
  );
}

export function CardAction({ className, ...props }: CardActionProps) {
  return (
    <div
      className={cn(`col-start-2 row-span-2 row-start-1 self-start justify-self-end`, className)}
      data-slot={'card-action'}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn('px-6', className)} data-slot={'card-content'} {...props} />;
}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <div className={cn('text-sm text-muted-foreground', className)} data-slot={'card-description'} {...props} />
  );
}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        `
          flex items-center px-6
          [.border-t]:pt-6
        `,
        className,
      )}
      data-slot={'card-footer'}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        `
          @container/card-header grid auto-rows-min grid-rows-[auto_auto]
          items-start gap-1.5 px-6
          has-data-[slot=card-action]:grid-cols-[1fr_auto]
          [.border-b]:pb-6
        `,
        className,
      )}
      data-slot={'card-header'}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <div className={cn('leading-none font-semibold', className)} data-slot={'card-title'} {...props} />;
}
