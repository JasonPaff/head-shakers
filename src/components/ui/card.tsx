import type { ComponentProps } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { cn } from '@/utils/tailwind-utils';

type CardActionProps = ComponentProps<'div'> & ComponentTestIdProps;
type CardContentProps = ComponentProps<'div'> & ComponentTestIdProps;
type CardDescriptionProps = ComponentProps<'div'> & ComponentTestIdProps;
type CardFooterProps = ComponentProps<'div'> & ComponentTestIdProps;
type CardHeaderProps = ComponentProps<'div'> & ComponentTestIdProps;
type CardProps = ComponentProps<'div'> & ComponentTestIdProps;
type CardTitleProps = ComponentProps<'div'> & ComponentTestIdProps;

export const Card = ({ className, testId, ...props }: CardProps) => {
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
      data-testid={testId}
      {...props}
    />
  );
};

export const CardAction = ({ className, testId, ...props }: CardActionProps) => {
  return (
    <div
      className={cn(`col-start-2 row-span-2 row-start-1 self-start justify-self-end`, className)}
      data-slot={'card-action'}
      data-testid={testId}
      {...props}
    />
  );
};

export const CardContent = ({ className, testId, ...props }: CardContentProps) => {
  return <div className={cn('px-6', className)} data-slot={'card-content'} data-testid={testId} {...props} />;
};

export const CardDescription = ({ className, testId, ...props }: CardDescriptionProps) => {
  return (
    <div
      className={cn('text-sm text-muted-foreground', className)}
      data-slot={'card-description'}
      data-testid={testId}
      {...props}
    />
  );
};

export const CardFooter = ({ className, testId, ...props }: CardFooterProps) => {
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
      data-testid={testId}
      {...props}
    />
  );
};

export const CardHeader = ({ className, testId, ...props }: CardHeaderProps) => {
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
      data-testid={testId}
      {...props}
    />
  );
};

export const CardTitle = ({ className, testId, ...props }: CardTitleProps) => {
  return <div className={cn('leading-none font-semibold', className)} data-slot={'card-title'} data-testid={testId} {...props} />;
};
