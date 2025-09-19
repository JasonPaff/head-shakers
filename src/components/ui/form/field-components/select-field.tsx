'use client';

import { useId } from 'react';

import type { FocusRef } from '@/components/ui/form/types';
import type { SelectOptionType } from '@/components/ui/select';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { useFieldContext } from '@/components/ui/form';
import { FieldAria } from '@/components/ui/form/field-components/field-aria';
import { FieldDescription } from '@/components/ui/form/field-components/field-description';
import { FieldError } from '@/components/ui/form/field-components/field-error';
import { FieldItem } from '@/components/ui/form/field-components/field-item';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateFormFieldTestId } from '@/lib/test-ids';

interface SelectFieldProps extends ComponentTestIdProps {
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
  testId,
}: SelectFieldProps) => {
  const field = useFieldContext<string>();
  const id = useId();

  const fieldName = field.name || 'select-field';
  const selectTestId = testId || generateFormFieldTestId(fieldName);
  const labelTestId = testId ? `${testId}-label` : generateFormFieldTestId(fieldName, 'label');
  const errorTestId = testId ? `${testId}-error` : generateFormFieldTestId(fieldName, 'error');
  const descriptionTestId =
    testId ? `${testId}-description` : generateFormFieldTestId(fieldName, 'description');

  return (
    <FieldItem>
      <Label htmlFor={id} testId={labelTestId} variant={isRequired ? 'required' : undefined}>
        {label}
      </Label>
      <Select onValueChange={field.handleChange} testId={selectTestId} value={field.state.value}>
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
      <FieldError testId={errorTestId} />
      <FieldDescription testId={descriptionTestId}>{description}</FieldDescription>
    </FieldItem>
  );
};
