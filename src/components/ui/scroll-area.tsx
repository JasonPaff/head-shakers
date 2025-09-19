'use client';

import type { ComponentProps } from 'react';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type ScrollAreaProps = ComponentProps<typeof ScrollAreaPrimitive.Root> & ComponentTestIdProps;

export const ScrollArea = ({ children, className, testId, ...props }: ScrollAreaProps) => {
  const scrollAreaTestId = testId || generateTestId('ui', 'scroll-area');

  return (
    <ScrollAreaPrimitive.Root
      className={cn('relative', className)}
      data-slot={'scroll-area'}
      data-testid={scrollAreaTestId}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className={cn(
          'size-full rounded-[inherit] transition-[color,box-shadow]',
          'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'focus-visible:outline-1',
        )}
        data-slot={'scroll-area-viewport'}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
};

type ScrollBarProps = ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> & ComponentTestIdProps;

export const ScrollBar = ({ className, orientation = 'vertical', testId, ...props }: ScrollBarProps) => {
  const scrollBarTestId = testId || generateTestId('ui', 'scroll-area', 'scrollbar');

  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      className={cn(
        'flex touch-none p-px transition-colors select-none',
        orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent',
        orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent',
        className,
      )}
      data-slot={'scroll-area-scrollbar'}
      data-testid={scrollBarTestId}
      orientation={orientation}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        className={'relative flex-1 rounded-full bg-border'}
        data-slot={'scroll-area-thumb'}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
};
