'use client';

import type { ZodError } from 'zod';

import { Conditional } from '@/components/ui/conditional';
import { useFieldContext } from '@/components/ui/form';
import { useFieldAria } from '@/components/ui/form/use-field-aria';

export const FieldError = () => {
  const { errorId } = useFieldAria();
  const field = useFieldContext();

  return (
    <Conditional isCondition={field.state.meta.isTouched}>
      {field.state.meta.errors.map(({ message }: ZodError, index) => {
        return (
          <p className={'text-sm font-medium text-destructive'} id={errorId} key={index}>
            {message}
          </p>
        );
      })}
    </Conditional>
  );
};
