'use client';

import type { ComponentProps } from 'react';

import { useId } from 'react';

import type { FocusRef } from '@/components/ui/form/types';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Checkbox } from '@/components/ui/checkbox';
import { useFieldContext } from '@/components/ui/form';
import { FieldAria } from '@/components/ui/form/field-components/field-aria';
import { FieldDescription } from '@/components/ui/form/field-components/field-description';
import { FieldError } from '@/components/ui/form/field-components/field-error';
import { FieldItem } from '@/components/ui/form/field-components/field-item';
import { Label } from '@/components/ui/label';
import { generateFormFieldTestId } from '@/lib/test-ids';

type CheckboxFieldProps = ComponentProps<typeof Checkbox> & ComponentTestIdProps & {
  description?: string;
  focusRef?: FocusRef;
  isRequired?: boolean;
  label: string;
};

export const CheckboxField = ({ description, focusRef, isRequired, label, testId, ...props }: CheckboxFieldProps) => {
  const field = useFieldContext<boolean>();
  const id = useId();

  // generate testIds based on field name or provided testId
  const fieldName = field.name || 'checkbox-field';
  const checkboxTestId = testId || generateFormFieldTestId(fieldName);
  const labelTestId = testId ? `${testId}-label` : generateFormFieldTestId(fieldName, 'label');
  const errorTestId = testId ? `${testId}-error` : generateFormFieldTestId(fieldName, 'error');
  const descriptionTestId = testId ? `${testId}-description` : generateFormFieldTestId(fieldName, 'description');

  return (
    <FieldItem>
      <div className={'flex items-center gap-x-3'}>
        <FieldAria focusRef={focusRef}>
          <Checkbox
            checked={field.state.value}
            id={id}
            onBlur={field.handleBlur}
            onCheckedChange={(checked) => {
              field.handleChange(checked === true);
            }}
            testId={checkboxTestId}
            {...props}
          />
        </FieldAria>
        <Label htmlFor={id} testId={labelTestId} variant={isRequired ? 'required' : undefined}>
          {label}
        </Label>
      </div>
      <FieldError testId={errorTestId} />
      <FieldDescription testId={descriptionTestId}>{description}</FieldDescription>
    </FieldItem>
  );
};
