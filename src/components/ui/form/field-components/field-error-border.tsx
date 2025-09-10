'use client';

import { Conditional } from '@/components/ui/conditional';
import { useFieldContext } from '@/components/ui/form';
import { cn } from '@/utils/tailwind-utils';

type FieldErrorBorderProps = ClassName<RequiredChildren>;

export const FieldErrorBorder = ({ children, className }: FieldErrorBorderProps) => {
  const field = useFieldContext();

  const _hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <Conditional fallback={children} isCondition={_hasError}>
      <div
        className={cn(
          'rounded-md border border-destructive',
          'ring-destructive/20 dark:ring-destructive/40',
          className,
        )}
      >
        {children}
      </div>
    </Conditional>
  );
};
