'use client';

import { useId } from 'react';

import type { FocusRef } from '@/components/ui/form/types';
import type { SelectOptionType } from '@/components/ui/select';

import { useFieldContext } from '@/components/ui/form';
import { FieldAria } from '@/components/ui/form/field-components/field-aria';
import { FieldDescription } from '@/components/ui/form/field-components/field-description';
import { FieldError } from '@/components/ui/form/field-components/field-error';
import { FieldItem } from '@/components/ui/form/field-components/field-item';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SelectFieldProps {
  description?: string;
  focusRef?: FocusRef;
  isRequired?: boolean;
  label: string;
  options: Array<SelectOptionType>;
  placeholder?: string;
}

export const SelectField = ({
  description,
  focusRef,
  isRequired,
  label,
  options,
  placeholder,
}: SelectFieldProps) => {
  const field = useFieldContext<string>();
  const id = useId();

  return (
    <FieldItem>
      <Label htmlFor={id} variant={isRequired ? 'required' : undefined}>
        {label}
      </Label>
      <Select onValueChange={field.handleChange} value={field.state.value}>
        <FieldAria focusRef={focusRef}>
          <SelectTrigger className={'w-full'} id={id} onBlur={field.handleBlur}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </FieldAria>
        <SelectContent>
          {options.map((option) => {
            return (
              <SelectItem key={option.value} value={option.value}>
                <span className={'capitalize'}>{option.label}</span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <FieldError />
      <FieldDescription>{description}</FieldDescription>
    </FieldItem>
  );
};
