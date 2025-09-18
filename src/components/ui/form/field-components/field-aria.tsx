'use client';

import type { ComponentProps, RefObject } from 'react';

import { Slot } from '@radix-ui/react-slot';

import type { FocusableElement } from '@/components/ui/form/types';

import { useFieldContext } from '@/components/ui/form';
import { useFieldAria } from '@/components/ui/form/use-field-aria';

type FieldAriaProps = ComponentProps<typeof Slot> & {
  /**
   * Optional ref to the focusable element for focus management
   */
  focusRef?: RefObject<FocusableElement>;
};

export const FieldAria = ({ children, focusRef, ...props }: FieldAriaProps) => {
  const { descriptionId, errorId } = useFieldAria();
  const field = useFieldContext();

  return (
    <Slot
      aria-describedby={descriptionId}
      aria-errormessage={errorId}
      aria-invalid={!field.state.meta.isValid}
      ref={focusRef}
      {...props}
    >
      {children}
    </Slot>
  );
};
