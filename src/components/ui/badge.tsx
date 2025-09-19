import type { ComponentProps } from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

const badgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border',
    'px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow]',
    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
    'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
    'dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3',
  ],
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        destructive: [
          'border-transparent bg-destructive text-white focus-visible:ring-destructive/20',
          'dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90',
        ],
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
      },
    },
  },
);

type BadgeProps = ComponentProps<'span'> & ComponentTestIdProps & VariantProps<typeof badgeVariants> & { asChild?: boolean };

export const Badge = ({ asChild = false, className, testId, variant, ...props }: BadgeProps) => {
  const Comp = asChild ? Slot : 'span';
  const badgeTestId = testId || generateTestId('ui', 'badge');

  return <Comp className={cn(badgeVariants({ variant }), className)} data-slot={'badge'} data-testid={badgeTestId} {...props} />;
};
