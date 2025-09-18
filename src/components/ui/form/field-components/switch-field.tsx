'use client';

import type { ComponentProps, RefObject } from 'react';

import { useId } from 'react';

import type { FocusableElement } from '@/components/ui/form/types';

import { useFieldContext } from '@/components/ui/form';
import { FieldAria } from '@/components/ui/form/field-components/field-aria';
import { FieldDescription } from '@/components/ui/form/field-components/field-description';
import { FieldError } from '@/components/ui/form/field-components/field-error';
import { FieldItem } from '@/components/ui/form/field-components/field-item';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type SwitchFieldProps = ComponentProps<typeof Switch> & {
  description?: string;
  focusRef?: RefObject<FocusableElement>;
  isRequired?: boolean;
  label: string;
};

export const SwitchField = ({ description, focusRef, isRequired, label, ...props }: SwitchFieldProps) => {
  const field = useFieldContext<boolean>();
  const id = useId();

  return (
    <FieldItem>
      <div className={'flex items-center gap-x-3'}>
        <FieldAria focusRef={focusRef}>
          <Switch
            checked={field.state.value}
            id={id}
            onBlur={field.handleBlur}
            onCheckedChange={field.handleChange}
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
