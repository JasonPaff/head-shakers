'use client';

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

  return (
    <FieldItem>
      <Label htmlFor={field.name} variant={isRequired ? 'required' : undefined}>
        {label}
      </Label>
      <FieldAria>
        <Textarea
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
