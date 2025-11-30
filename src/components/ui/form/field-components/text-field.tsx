'use client';

import type { ComponentProps } from 'react';

import { useRef } from 'react';
import { useId } from 'react';

import type { InputProps } from '@/components/ui/input';

import { useFieldContext } from '@/components/ui/form';
import { FieldAria } from '@/components/ui/form/field-components/field-aria';
import { FieldDescription } from '@/components/ui/form/field-components/field-description';
import { FieldError } from '@/components/ui/form/field-components/field-error';
import { FieldItem } from '@/components/ui/form/field-components/field-item';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateFormFieldTestId } from '@/lib/test-ids';

type TextFieldProps = InputProps & {
  description?: string;
  fieldErrorProps?: ComponentProps<typeof FieldError>;
  isRequired?: boolean;
  label: string;
  labelClassName?: string;
};

export const TextField = ({
  description,
  fieldErrorProps,
  isRequired,
  label,
  labelClassName,
  testId,
  ...props
}: TextFieldProps) => {
  const field = useFieldContext<string>();
  const id = useId();

  const focusRef = useRef<HTMLInputElement>(null);

  const fieldName = field.name || 'text-field';
  const inputTestId = testId || generateFormFieldTestId(fieldName);
  const labelTestId = testId ? `${testId}-label` : generateFormFieldTestId(fieldName, 'label');
  const errorTestId = testId ? `${testId}-error` : generateFormFieldTestId(fieldName, 'error');
  const descriptionTestId =
    testId ? `${testId}-description` : generateFormFieldTestId(fieldName, 'description');

  return (
    <FieldItem>
      <Label
        className={labelClassName}
        htmlFor={id}
        testId={labelTestId}
        variant={isRequired ? 'required' : undefined}
      >
        {label}
      </Label>
      <FieldAria focusRef={focusRef}>
        <Input
          id={id}
          onBlur={field.handleBlur}
          onChange={(e) => {
            field.handleChange(e.target.value);
          }}
          testId={inputTestId}
          value={field.state.value}
          {...props}
        />
      </FieldAria>
      <FieldError testId={errorTestId} {...fieldErrorProps} />
      <FieldDescription testId={descriptionTestId}>{description}</FieldDescription>
    </FieldItem>
  );
};
