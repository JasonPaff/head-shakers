'use client';

import type { ComponentProps } from 'react';

import { useId } from 'react';

import type { FocusRef } from '@/components/ui/form/types';

import { useFieldContext } from '@/components/ui/form';
import { FieldAria } from '@/components/ui/form/field-components/field-aria';
import { FieldDescription } from '@/components/ui/form/field-components/field-description';
import { FieldError } from '@/components/ui/form/field-components/field-error';
import { FieldItem } from '@/components/ui/form/field-components/field-item';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type TextFieldProps = ComponentProps<'input'> & {
  description?: string;
  focusRef?: FocusRef;
  isRequired?: boolean;
  label: string;
};

export const TextField = ({ description, focusRef, isRequired, label, ...props }: TextFieldProps) => {
  const field = useFieldContext<string>();
  const id = useId();

  return (
    <FieldItem>
      <Label htmlFor={id} variant={isRequired ? 'required' : undefined}>
        {label}
      </Label>
      <FieldAria focusRef={focusRef}>
        <Input
          id={id}
          onBlur={field.handleBlur}
          onChange={(e) => {
            field.handleChange(e.target.value);
          }}
          value={field.state.value}
          {...props}
        />
      </FieldAria>
      <FieldError />
      <FieldDescription>{description}</FieldDescription>
    </FieldItem>
  );
};
