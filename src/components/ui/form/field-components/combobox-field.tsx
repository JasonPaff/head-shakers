'use client';

import { useEffect, useRef } from 'react';

import type { FocusRef } from '@/components/ui/form/types';

import { Combobox } from '@/components/ui/combo-box';
import { useFieldContext } from '@/components/ui/form';
import { FieldDescription } from '@/components/ui/form/field-components/field-description';
import { FieldError } from '@/components/ui/form/field-components/field-error';
import { FieldItem } from '@/components/ui/form/field-components/field-item';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { cn } from '@/utils/tailwind-utils';

export interface ComboboxItem {
  id: string;
  name: string;
}

interface ComboboxFieldProps {
  createNewLabel?: string;
  description?: string;
  focusRef?: FocusRef;
  isDisabled?: boolean;
  isRequired?: boolean;
  items: Array<ComboboxItem>;
  label: string;
  onCreateNew?: (name: string) => void;
  onCreateNewSelect?: (name: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}

export const ComboboxField = ({ description, focusRef, ...props }: ComboboxFieldProps) => {
  const field = useFieldContext<string>();
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

  const _isValid = field.state.meta.isValid;

  return (
    <FieldItem>
      <Combobox
        focusRef={effectiveRef}
        onValueChange={field.handleChange}
        triggerClassName={cn(!_isValid && 'border-destructive dark:border-destructive')}
        value={field.state.value}
        {...props}
      />
      <FieldError />
      <FieldDescription>{description}</FieldDescription>
    </FieldItem>
  );
};
