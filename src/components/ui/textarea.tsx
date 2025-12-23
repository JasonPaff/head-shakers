import type { ComponentProps } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type TextareaProps = ComponentProps<'textarea'> & ComponentTestIdProps;

export const Textarea = ({ children, className, testId, ...props }: TextareaProps) => {
  const textareaTestId = testId || generateTestId('ui', 'textarea');

  return (
    <textarea
      className={cn(
        'flex field-sizing-content min-h-16 w-full rounded-sm border border-input',
        'bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none',
        'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px]',
        'focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm',
        'dark:bg-input/30 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      data-slot={'textarea'}
      data-testid={textareaTestId}
      {...props}
    >
      {children}
    </textarea>
  );
};
