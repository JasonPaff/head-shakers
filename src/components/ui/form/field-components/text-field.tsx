'use client';

import type { ComponentProps } from 'react';

import { useFieldContext } from '@/components/ui/form';
import { FieldAria } from '@/components/ui/form/field-components/field-aria';
import { FieldDescription } from '@/components/ui/form/field-components/field-description';
import { FieldError } from '@/components/ui/form/field-components/field-error';
import { FieldItem } from '@/components/ui/form/field-components/field-item';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type TextFieldProps = ComponentProps<'input'> & {
  description?: string;
  isRequired?: boolean;
  label: string;
};

export const TextField = ({ description, isRequired, label, ...props }: TextFieldProps) => {
  const field = useFieldContext<string>();

  return (
    <FieldItem>
      <Label htmlFor={field.name} variant={isRequired ? 'required' : undefined}>
        {label}
      </Label>
      <FieldAria>
        <Input
          id={field.name}
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
