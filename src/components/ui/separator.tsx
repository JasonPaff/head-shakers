'use client';

import type { ComponentProps } from 'react';

import { Root } from '@radix-ui/react-separator';

import { cn } from '@/utils/tailwind-utils';

type SeparatorProps = Omit<ComponentProps<typeof Root>, 'decorative'> & {
  isDecorative?: boolean;
};

export const Separator = ({
  children,
  className,
  isDecorative = true,
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
      decorative={isDecorative}
      orientation={orientation}
      {...props}
    >
      {children}
    </Root>
  );
};
