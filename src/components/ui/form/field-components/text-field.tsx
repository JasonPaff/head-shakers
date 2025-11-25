'use client';

import type { ComponentProps, ReactNode } from 'react';

import { useId } from 'react';

import type { FocusRef } from '@/components/ui/form/types';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { useFieldContext } from '@/components/ui/form';
import { FieldAria } from '@/components/ui/form/field-components/field-aria';
import { FieldDescription } from '@/components/ui/form/field-components/field-description';
import { FieldError } from '@/components/ui/form/field-components/field-error';
import { FieldItem } from '@/components/ui/form/field-components/field-item';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateFormFieldTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type TextFieldProps = ComponentProps<'input'> &
  ComponentTestIdProps & {
    description?: string;
    focusRef?: FocusRef;
    icon?: ReactNode;
    isRequired?: boolean;
    label: string;
  };

export const TextField = ({
  description,
  focusRef,
  icon,
  isRequired,
  label,
  testId,
  ...props
}: TextFieldProps) => {
  const field = useFieldContext<string>();
  const id = useId();

  const fieldName = field.name || 'text-field';
  const inputTestId = testId || generateFormFieldTestId(fieldName);
  const labelTestId = testId ? `${testId}-label` : generateFormFieldTestId(fieldName, 'label');
  const errorTestId = testId ? `${testId}-error` : generateFormFieldTestId(fieldName, 'error');
  const descriptionTestId =
    testId ? `${testId}-description` : generateFormFieldTestId(fieldName, 'description');

  return (
    <FieldItem>
      <Label htmlFor={id} testId={labelTestId} variant={isRequired ? 'required' : undefined}>
        {label}
      </Label>
      <FieldAria focusRef={focusRef}>
        <div className={cn(!!icon && 'relative')}>
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

          {/* Icon */}
          {icon && (
            <div
              className={'pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'}
            >
              {icon}
            </div>
          )}
        </div>
      </FieldAria>
      <FieldError testId={errorTestId} />
      <FieldDescription testId={descriptionTestId}>{description}</FieldDescription>
    </FieldItem>
  );
};
