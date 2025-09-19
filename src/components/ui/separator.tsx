'use client';

import type { ComponentProps } from 'react';

import { Root } from '@radix-ui/react-separator';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type SeparatorProps = ComponentTestIdProps & Omit<ComponentProps<typeof Root>, 'decorative'> & {
  isDecorative?: boolean;
};

export const Separator = ({
  children,
  className,
  isDecorative = true,
  orientation = 'horizontal',
  testId,
  ...props
}: SeparatorProps) => {
  const separatorTestId = testId || generateTestId('ui', 'separator');

  return (
    <Root
      className={cn(
        'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full',
        'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className,
      )}
      data-slot={'separator'}
      data-testid={separatorTestId}
      decorative={isDecorative}
      orientation={orientation}
      {...props}
    >
      {children}
    </Root>
  );
};
