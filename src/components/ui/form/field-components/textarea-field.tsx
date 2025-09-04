'use client';

import { useId } from 'react';

import { useFieldContext } from '@/components/ui/form';
import { FieldAria } from '@/components/ui/form/field-components/field-aria';
import { FieldDescription } from '@/components/ui/form/field-components/field-description';
import { FieldError } from '@/components/ui/form/field-components/field-error';
import { FieldItem } from '@/components/ui/form/field-components/field-item';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TextareaFieldProps {
  description?: string;
  isRequired?: boolean;
  label: string;
  placeholder?: string;
}

export const TextareaField = ({ description, isRequired, label, ...props }: TextareaFieldProps) => {
  const field = useFieldContext<string>();
  const id = useId();

  return (
    <FieldItem>
      <Label htmlFor={id} variant={isRequired ? 'required' : undefined}>
        {label}
      </Label>
      <FieldAria>
        <Textarea
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
