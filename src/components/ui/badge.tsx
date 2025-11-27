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
        editor_pick: [
          'border-transparent bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-lg',
          '[a&]:hover:shadow-xl',
        ],
        new_badge: [
          'border-transparent bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg',
          '[a&]:hover:shadow-xl',
        ],
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        popular: [
          'border-transparent bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg',
          '[a&]:hover:shadow-xl',
        ],
        secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        trending: [
          'border-transparent bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg',
          '[a&]:hover:shadow-xl',
        ],
      },
    },
  },
);

type BadgeProps = ComponentProps<'span'> &
  ComponentTestIdProps &
  VariantProps<typeof badgeVariants> & { asChild?: boolean; icon?: React.ReactNode };

export const Badge = ({
  asChild = false,
  children,
  className,
  icon,
  testId,
  variant,
  ...props
}: BadgeProps) => {
  const Comp = asChild ? Slot : 'span';
  const badgeTestId = testId || generateTestId('ui', 'badge');

  // When asChild is true, Slot expects exactly one child element
  // Icon is not supported with asChild - the child element should contain any icons
  if (asChild) {
    return (
      <Comp
        className={cn(badgeVariants({ variant }), className)}
        data-slot={'badge'}
        data-testid={badgeTestId}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      className={cn(badgeVariants({ variant }), className)}
      data-slot={'badge'}
      data-testid={badgeTestId}
      {...props}
    >
      {icon && <span className={'size-3'}>{icon}</span>}
      {children}
    </Comp>
  );
};
