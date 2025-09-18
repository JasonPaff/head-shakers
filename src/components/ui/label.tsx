'use client';

import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { Root as LabelRoot } from '@radix-ui/react-label';
import { cva } from 'class-variance-authority';

import { cn } from '@/utils/tailwind-utils';

const styles = cva(
  [
    'text-sm leading-none font-medium',
    'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
    'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
  ],
  {
    variants: {
      variant: { required: 'after:ml-1 after:text-destructive after:content-["*"]' },
    },
  },
);

type LabelProps = ComponentProps<typeof LabelRoot> & VariantProps<typeof styles>;

export const Label = ({ children, className, variant, ...props }: LabelProps) => {
  return (
    <LabelRoot className={cn(styles({ variant }), className)} data-slot={'label'} {...props}>
      {children}
    </LabelRoot>
  );
};
