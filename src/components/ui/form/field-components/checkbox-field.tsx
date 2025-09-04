'use client';

import type { ComponentProps } from 'react';

import { useId } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { useFieldContext } from '@/components/ui/form';
import { FieldAria } from '@/components/ui/form/field-components/field-aria';
import { FieldDescription } from '@/components/ui/form/field-components/field-description';
import { FieldError } from '@/components/ui/form/field-components/field-error';
import { FieldItem } from '@/components/ui/form/field-components/field-item';
import { Label } from '@/components/ui/label';

type CheckboxFieldProps = ComponentProps<typeof Checkbox> & {
  description?: string;
  isRequired?: boolean;
  label: string;
};

export const CheckboxField = ({ description, isRequired, label, ...props }: CheckboxFieldProps) => {
  const field = useFieldContext<boolean>();
  const id = useId();

  return (
    <FieldItem>
      <div className={'flex items-center gap-x-3'}>
        <FieldAria>
          <Checkbox
            checked={field.state.value}
            id={id}
            onBlur={field.handleBlur}
            onCheckedChange={(checked) => {
              field.handleChange(checked === true);
            }}
            {...props}
          />
        </FieldAria>
        <Label htmlFor={id} variant={isRequired ? 'required' : undefined}>
          {label}
        </Label>
      </div>
      <FieldError />
      <FieldDescription>{description}</FieldDescription>
    </FieldItem>
  );
};
