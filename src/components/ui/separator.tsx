'use client';

import type { ComponentProps } from 'react';

import { Root } from '@radix-ui/react-separator';

import { cn } from '@/utils/tailwind-utils';

type SeparatorProps = ComponentProps<typeof Root>;

export const Separator = ({
  className,
  decorative = true,
  orientation = 'horizontal',
  ...props
}: SeparatorProps) => {
  return (
    <Root
      className={cn(
        'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full',
        'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className,
      )}
      data-slot={'separator'}
      decorative={decorative}
      orientation={orientation}
      {...props}
    />
  );
};
