import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { CheckboxField } from '@/components/ui/form/field-components/checkbox-field';
import { ComboboxField } from '@/components/ui/form/field-components/combobox-field';
import { SelectField } from '@/components/ui/form/field-components/select-field';
import { TextField } from '@/components/ui/form/field-components/text-field';
import { TextareaField } from '@/components/ui/form/field-components/textarea-field';
import { SubmitButton } from '@/components/ui/form/form-components/submit-button';

export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

export const { useAppForm, withFieldGroup, withForm } = createFormHook({
  fieldComponents: { CheckboxField, ComboboxField, SelectField, TextareaField, TextField },
  fieldContext,
  formComponents: { SubmitButton },
  formContext,
});
