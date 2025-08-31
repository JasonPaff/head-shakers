'use client';

import { Combobox } from '@/components/ui/combo-box';
import { useFieldContext } from '@/components/ui/form';
import { FieldDescription } from '@/components/ui/form/field-components/field-description';
import { FieldError } from '@/components/ui/form/field-components/field-error';
import { FieldItem } from '@/components/ui/form/field-components/field-item';
import { cn } from '@/utils/tailwind-utils';

export interface ComboboxItem {
  id: string;
  name: string;
}

interface ComboboxFieldProps {
  createNewLabel?: string;
  description?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  items: Array<ComboboxItem>;
  label: string;
  onCreateNew?: (name: string) => void;
  onCreateNewSelect?: (name: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}

export const ComboboxField = ({ description, ...props }: ComboboxFieldProps) => {
  const field = useFieldContext<string>();

  const _isValid = field.state.meta.isValid;

  return (
    <FieldItem>
      <Combobox
        onValueChange={field.handleChange}
        triggerClassName={cn(
          !_isValid && 'border-destructive ring-destructive/20 aria-invalid:ring-destructive/40',
        )}
        value={field.state.value}
        {...props}
      />
      <FieldError />
      <FieldDescription>{description}</FieldDescription>
    </FieldItem>
  );
};
