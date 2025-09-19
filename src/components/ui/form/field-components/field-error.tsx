'use client';

import type { ZodError } from 'zod';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Conditional } from '@/components/ui/conditional';
import { useFieldContext } from '@/components/ui/form';
import { useFieldAria } from '@/components/ui/form/field-components/use-field-aria';

type FieldErrorProps = ComponentTestIdProps;

export const FieldError = ({ testId }: FieldErrorProps) => {
  const { errorId } = useFieldAria();
  const field = useFieldContext();

  return (
    <Conditional isCondition={field.state.meta.isTouched}>
      {field.state.meta.errors.map(({ message }: ZodError, index) => {
        return (
          <p className={'text-sm font-medium text-destructive'} data-testid={testId} id={errorId} key={index}>
            {message}
          </p>
        );
      })}
    </Conditional>
  );
};
