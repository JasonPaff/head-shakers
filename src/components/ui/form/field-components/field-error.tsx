'use client';

import type { ComponentProps } from 'react';
import type { ZodError } from 'zod';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Conditional } from '@/components/ui/conditional';
import { useFieldContext } from '@/components/ui/form';
import { useFieldAria } from '@/components/ui/form/field-components/use-field-aria';
import { cn } from '@/utils/tailwind-utils';

type FieldErrorProps = ComponentProps<'p'> & ComponentTestIdProps;

export const FieldError = ({ className, testId, ...props }: FieldErrorProps) => {
  const { errorId } = useFieldAria();
  const field = useFieldContext();

  return (
    <Conditional isCondition={field.state.meta.isTouched}>
      {field.state.meta.errors.map(({ message }: ZodError, index) => {
        return (
          <p
            className={cn('text-sm font-medium text-destructive', className)}
            {...props}
            data-testid={testId}
            id={errorId}
            key={index}
          >
            {message}
          </p>
        );
      })}
    </Conditional>
  );
};
