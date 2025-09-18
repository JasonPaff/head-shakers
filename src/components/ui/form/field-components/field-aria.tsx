'use client';

import type { ComponentProps } from 'react';

import { Slot } from '@radix-ui/react-slot';
import { useEffect, useRef } from 'react';

import type { FocusRef } from '@/components/ui/form/types';

import { useFieldContext } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-context';
import { useFieldAria } from '@/components/ui/form/use-field-aria';

type FieldAriaProps = ComponentProps<typeof Slot> & {
  focusRef?: FocusRef;
};

export const FieldAria = ({ children, focusRef, ...props }: FieldAriaProps) => {
  const { descriptionId, errorId } = useFieldAria();
  const field = useFieldContext();
  const focusContext = useFocusContext();

  const internalRef = useRef<HTMLElement | null>(null);
  const effectiveRef = focusRef || internalRef;

  useEffect(() => {
    if (!focusContext || !effectiveRef || !field.name) {
      return;
    }

    focusContext.registerField(field.name, effectiveRef);

    return () => {
      focusContext.unregisterField(field.name);
    };
  }, [focusContext, effectiveRef, field.name]);

  return (
    <Slot
      aria-describedby={descriptionId}
      aria-errormessage={errorId}
      aria-invalid={!field.state.meta.isValid}
      ref={effectiveRef}
      {...props}
    >
      {children}
    </Slot>
  );
};
