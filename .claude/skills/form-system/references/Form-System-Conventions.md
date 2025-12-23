# Form System Conventions

## Overview

The project uses a custom form system built on TanStack Form with integrated field components, focus management, and accessibility features. Forms integrate with server actions via the `useServerAction` hook.

## Architecture

```
src/components/ui/form/
├── index.tsx                           # useAppForm hook, contexts, and exports
├── types.ts                            # Shared types (FocusRef)
├── field-components/
│   ├── checkbox-field.tsx
│   ├── combobox-field.tsx
│   ├── select-field.tsx
│   ├── switch-field.tsx
│   ├── tag-field.tsx
│   ├── text-field.tsx
│   ├── textarea-field.tsx
│   ├── field-error.tsx
│   ├── field-description.tsx
│   ├── field-item.tsx
│   ├── field-aria.tsx
│   ├── field-aria-provider.tsx
│   ├── field-error-border.tsx
│   └── use-field-aria.ts
├── form-components/
│   └── submit-button.tsx
└── focus-management/
    ├── focus-context.tsx
    ├── with-focus-management.tsx
    └── use-focus-management.ts
```

## Core Imports

```typescript
import { formOptions, revalidateLogic } from '@tanstack/form-core';
import { useStore } from '@tanstack/react-form';

import { useAppForm, useFieldContext, useFormContext } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { useServerAction } from '@/hooks/use-server-action';
```

## Complete Form Pattern

```typescript
'use client';

import { revalidateLogic } from '@tanstack/form-core';

import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { Button } from '@/components/ui/button';
import { useServerAction } from '@/hooks/use-server-action';
import { createEntityAction } from '@/lib/actions/entity/entity.actions';
import { insertEntitySchema } from '@/lib/validations/entity.validation';

interface CreateFormProps {
  onClose: () => void;
  onSuccess?: (data: EntityData) => void;
}

export const CreateForm = withFocusManagement(({ onClose, onSuccess }: CreateFormProps) => {
  const { focusFirstError } = useFocusContext();

  // 1. Setup server action with toast messages
  const { executeAsync, isExecuting } = useServerAction(createEntityAction, {
    onSuccess: ({ data }) => {
      onSuccess?.(data.data);
      onClose();
    },
    toastMessages: {
      error: 'Failed to create. Please try again.',
      loading: 'Creating...',
      success: 'Created successfully!',
    },
  });

  // 2. Setup form with useAppForm
  const form = useAppForm({
    canSubmitWhenInvalid: true,
    defaultValues: {
      description: '',
      isPublic: true,
      name: '',
    },
    onSubmit: async ({ value }) => {
      await executeAsync(value);
    },
    onSubmitInvalid: ({ formApi }) => {
      focusFirstError(formApi);
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    validators: {
      onSubmit: zodSchema,
    },
  });

  // 3. Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Text Field */}
      <form.AppField name={'name'}>
        {(field) => (
          <field.TextField
            isRequired
            label={'Name'}
            placeholder={'Enter name'}
          />
        )}
      </form.AppField>

      {/* Textarea Field */}
      <form.AppField name={'description'}>
        {(field) => (
          <field.TextareaField
            description={'Optional description'}
            label={'Description'}
            placeholder={'Enter description'}
          />
        )}
      </form.AppField>

      {/* Switch Field */}
      <form.AppField name={'isPublic'}>
        {(field) => (
          <field.SwitchField
            description={'Make this visible to everyone'}
            label={'Public'}
          />
        )}
      </form.AppField>

      {/* Submit Button with SubmitButton component */}
      <form.AppForm>
        <form.SubmitButton isDisabled={isExecuting}>
          {isExecuting ? 'Creating...' : 'Create'}
        </form.SubmitButton>
      </form.AppForm>
    </form>
  );
});
```

## useAppForm Configuration

### Required Options

```typescript
const form = useAppForm({
  // Allow form submission even with errors (for proper error display)
  canSubmitWhenInvalid: true,

  // Initial form values
  defaultValues: {
    fieldName: 'default value',
  },

  // Async submission handler
  onSubmit: async ({ value }) => {
    await executeAsync(value);
  },

  // Handle invalid submission (focus first error)
  onSubmitInvalid: ({ formApi }) => {
    focusFirstError(formApi);
  },

  // Validation timing configuration
  validationLogic: revalidateLogic({
    mode: 'submit', // Validate on submit
    modeAfterSubmission: 'change', // Re-validate on change after first submit
  }),

  // Zod schema for validation
  validators: {
    onSubmit: zodSchema,
  },
});
```

## Exported Hooks and Utilities

The form system exports these from `@/components/ui/form`:

```typescript
// Contexts - for building custom field components
export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

// Form hook and HOCs
export const { useAppForm, withFieldGroup, withForm } = createFormHook({
  fieldComponents: {
    /* all field components */
  },
  formComponents: { SubmitButton },
  fieldContext,
  formContext,
});
```

## SubmitButton Component

The `SubmitButton` component automatically handles loading state via form context:

```typescript
// Must be wrapped in form.AppForm to access form context
<form.AppForm>
  <form.SubmitButton isDisabled={isExecuting}>
    {isExecuting ? 'Saving...' : 'Save'}
  </form.SubmitButton>
</form.AppForm>

// Or use a regular Button if you need more control
<Button disabled={isExecuting} type={'submit'}>
  {isExecuting ? 'Saving...' : 'Save'}
</Button>
```

## Accessing Form Values with useStore

Use `useStore` from `@tanstack/react-form` to reactively access form values:

```typescript
import { useStore } from '@tanstack/react-form';

// Inside your form component:
const currentFieldValue = useStore(form.store, (state) => state.values.fieldName);
const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

// Multiple values
const [username, email] = useStore(form.store, (state) => [state.values.username, state.values.email]);
```

## Extracting Reusable Form Options

For complex forms, extract default values and options to a separate file:

```typescript
// entity-form-options.ts
import type { z } from 'zod';
import { formOptions } from '@tanstack/form-core';
import type { insertEntitySchema } from '@/lib/validations/entity.validation';
import { DEFAULTS } from '@/lib/constants';

export const entityFormOptions = formOptions({
  defaultValues: {
    name: '',
    description: '',
    priority: DEFAULTS.ENTITY.PRIORITY.toString(),
    isActive: DEFAULTS.ENTITY.IS_ACTIVE,
  } as z.input<typeof insertEntitySchema>,
});

// entity-form.tsx
import { entityFormOptions } from './entity-form-options';

const form = useAppForm({
  ...entityFormOptions,
  onSubmit: async ({ value }) => {
    /* ... */
  },
  onSubmitInvalid: ({ formApi }) => {
    /* ... */
  },
  validators: { onSubmit: insertEntitySchema },
});
```

## Field Listeners

Use `listeners` prop on `form.AppField` for field-level side effects:

```typescript
<form.AppField
  listeners={{
    onChange: ({ value }) => {
      // Reset dependent field when this field changes
      form.setFieldValue('dependentField', '');
    },
    onBlur: ({ value }) => {
      // Trigger validation or API call on blur
    },
  }}
  name={'contentType'}
>
  {(field) => (
    <field.SelectField
      label={'Content Type'}
      options={options}
    />
  )}
</form.AppField>
```

## Programmatic Field Operations

```typescript
// Set field value programmatically
form.setFieldValue('fieldName', newValue);

// Validate a specific field
await form.validateField('fieldName', 'change');

// Example: Update multiple fields after API response
const handleContentSelect = async (contentId: string, contentName: string, imageUrl?: string) => {
  form.setFieldValue('contentId', contentId);
  await form.validateField('contentId', 'change');

  if (!currentTitle) {
    form.setFieldValue('title', `Featured: ${contentName}`);
    await form.validateField('title', 'change');
  }

  form.setFieldValue('imageUrl', imageUrl || '/placeholder.jpg');
  await form.validateField('imageUrl', 'change');
};
```

## Field Components

### Common Props (all field components)

```typescript
interface CommonFieldProps {
  description?: string; // Help text below the field
  focusRef?: FocusRef; // Custom ref for focus management
  isRequired?: boolean; // Shows required indicator on label
  label: string; // Required: label text
  testId?: string; // Override auto-generated test ID
}
```

### TextField

```typescript
<form.AppField name={'fieldName'}>
  {(field) => (
    <field.TextField
      autoFocus           // Optional: focus on mount
      description={'Help text'}
      disabled={isDisabled}
      focusRef={customRef}
      isRequired
      label={'Field Label'}
      placeholder={'Placeholder'}
      type={'text'}       // 'text' | 'email' | 'password' | 'number' | etc.
    />
  )}
</form.AppField>
```

### TextareaField

```typescript
<form.AppField name={'description'}>
  {(field) => (
    <field.TextareaField
      description={'Optional help text'}
      label={'Description'}
      placeholder={'Enter description...'}
      rows={4}
    />
  )}
</form.AppField>
```

### SelectField

```typescript
<form.AppField name={'category'}>
  {(field) => (
    <field.SelectField
      isRequired
      label={'Category'}
      options={[
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ]}
      placeholder={'Select category'}
    />
  )}
</form.AppField>
```

### CheckboxField

```typescript
<form.AppField name={'agreeToTerms'}>
  {(field) => (
    <field.CheckboxField
      description={'You must agree to continue'}
      label={'I agree to the terms and conditions'}
    />
  )}
</form.AppField>
```

### SwitchField

```typescript
<form.AppField name={'isPublic'}>
  {(field) => (
    <field.SwitchField
      description={'Make visible to all users'}
      label={'Public'}
    />
  )}
</form.AppField>
```

### ComboboxField

```typescript
<form.AppField name={'userId'}>
  {(field) => (
    <field.ComboboxField
      isRequired
      label={'User'}
      options={users.map((u) => ({ label: u.name, value: u.id }))}
      placeholder={'Search users...'}
    />
  )}
</form.AppField>
```

### TagField

```typescript
<form.AppField name={'tags'}>
  {(field) => (
    <field.TagField
      availableTags={allTags}
      label={'Tags'}
      placeholder={'Add tags...'}
    />
  )}
</form.AppField>
```

## Focus Management

### Wrapping Components

```typescript
// Always wrap form components with withFocusManagement
export const MyForm = withFocusManagement(({ onClose }: Props) => {
  const { focusFirstError } = useFocusContext();

  // ... form implementation
});

// For generic components with type parameters
export const MyForm = withFocusManagement<MyFormProps>(({ onClose, entityId }) => {
  // ... form implementation
});
```

### Focus First Error

```typescript
const form = useAppForm({
  onSubmitInvalid: ({ formApi }) => {
    // Automatically focus the first field with an error
    // Also scrolls the field into view
    focusFirstError(formApi);
  },
  // ... other options
});
```

### How Focus Management Works

1. `withFocusManagement` wraps component with `FocusProvider`
2. Each `FieldAria` component registers its field ref with the provider
3. On invalid submit, `focusFirstError` finds fields with errors sorted by DOM position
4. First errored field is focused and scrolled into view

## Form Submission Handler

Always use this pattern for form submission:

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  e.stopPropagation();
  void form.handleSubmit();
};

return (
  <form onSubmit={handleSubmit}>
    {/* fields */}
  </form>
);
```

## Validation Logic Modes

```typescript
// Validate only on submit, then on change after first submit (RECOMMENDED)
validationLogic: revalidateLogic({
  mode: 'submit',
  modeAfterSubmission: 'change',
}),

// Validate on blur - useful for real-time availability checks
validationLogic: revalidateLogic({
  mode: 'blur',
  modeAfterSubmission: 'change',
}),

// Validate on every change (can be slow for complex validations)
validationLogic: revalidateLogic({
  mode: 'change',
}),
```

## Server Action Integration

### Standard Pattern with Toast Messages

```typescript
const { executeAsync, isExecuting } = useServerAction(createEntityAction, {
  onSuccess: ({ data }) => {
    onSuccess?.(data.data);
    onClose();
  },
  toastMessages: {
    error: 'Failed to create. Please try again.',
    loading: 'Creating...',
    success: 'Created successfully!',
  },
});
```

### Disable Toast for Background Operations

```typescript
// For operations like availability checks where toasts are distracting
const { execute, isExecuting, result } = useServerAction(checkAvailabilityAction, {
  isDisableToast: true, // Don't show toast for this action
});
```

### Using Multiple Server Actions

```typescript
// For forms with create/update modes
const { executeAsync: createAsync, isExecuting: isCreating } = useServerAction(createAction, {
  toastMessages: {
    /* ... */
  },
});

const { executeAsync: updateAsync, isExecuting: isUpdating } = useServerAction(updateAction, {
  toastMessages: {
    /* ... */
  },
});

const form = useAppForm({
  // ...
  onSubmit: async ({ value }) => {
    if (entityId) await updateAsync({ ...value, id: entityId });
    else await createAsync(value);
  },
});

const _isSubmitting = isCreating || isUpdating;
```

## Edit Form Pattern

For edit forms, populate with existing data:

```typescript
export const EditForm = withFocusManagement(({ entity, onClose, onSuccess }: Props) => {
  const { focusFirstError } = useFocusContext();

  const { executeAsync, isExecuting } = useServerAction(updateEntityAction, {
    onSuccess: ({ data }) => {
      onSuccess?.(data.data);
      onClose();
    },
    toastMessages: {
      error: 'Failed to update.',
      loading: 'Updating...',
      success: 'Updated successfully!',
    },
  });

  const form = useAppForm({
    canSubmitWhenInvalid: true,
    defaultValues: {
      // Populate with existing entity data
      description: entity.description || '',
      id: entity.id,
      name: entity.name,
    },
    onSubmit: async ({ value }) => {
      await executeAsync(value);
    },
    onSubmitInvalid: ({ formApi }) => {
      focusFirstError(formApi);
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    validators: {
      onSubmit: updateEntitySchema,
    },
  });

  // ... render form
});
```

## Edit Form with Async Data Loading

For forms that load data asynchronously:

```typescript
export const EditForm = withFocusManagement(({ entityId, onClose }: Props) => {
  const [isLoading, setIsLoading] = useToggle(!!entityId);
  const { focusFirstError } = useFocusContext();
  const { executeAsync: getEntity } = useAction(getEntityAction);

  const form = useAppForm({
    canSubmitWhenInvalid: true,
    defaultValues: { name: '', description: '' },
    // ... other options
  });

  // Fetch and populate form on mount
  useEffect(() => {
    if (!entityId) return;
    setIsLoading.on();
    getEntity({ id: entityId })
      .then((result) => {
        if (result?.data) {
          const data = result.data.data;
          form.setFieldValue('name', data.name);
          form.setFieldValue('description', data.description || '');
        }
      })
      .catch((error) => {
        console.error('Error fetching entity:', error);
        toast.error('Failed to load data');
        onClose();
      })
      .finally(setIsLoading.off);
  }, [entityId]);

  if (isLoading) {
    return <LoadingState />;
  }

  return <form>{ /* ... */ }</form>;
});
```

## Dialog Form Pattern

For forms in dialogs:

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: EntityData) => void;
}

export const CreateDialog = ({ isOpen, onClose, onSuccess }: CreateDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Entity</DialogTitle>
        </DialogHeader>
        <CreateForm onClose={onClose} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
};

// The form component is separate and wrapped with withFocusManagement
const CreateForm = withFocusManagement(({ onClose, onSuccess }: FormProps) => {
  // ... form implementation
});
```

## Simple Form Pattern (Without useAppForm)

For simple forms without complex validation, you can use a simpler pattern:

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SimpleFormProps {
  isSubmitting?: boolean;
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
}

export const SimpleForm = ({
  isSubmitting = false,
  onSubmit,
  placeholder = 'Enter content...',
}: SimpleFormProps) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (content.trim() && !isSubmitting) {
      await onSubmit(content.trim());
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Textarea
        disabled={isSubmitting}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        value={content}
      />
      <Button disabled={!content.trim() || isSubmitting} type={'submit'}>
        Submit
      </Button>
    </form>
  );
};
```

Use this pattern when:

- Form has only 1-2 fields
- No complex validation needed
- No focus management required
- Submission state is managed externally

## Test IDs

Field components automatically generate test IDs:

```typescript
// Input: generateFormFieldTestId('name')
// Output: 'form-field-name'

// With suffix: generateFormFieldTestId('name', 'label')
// Output: 'form-field-name-label'

// Custom testId prop overrides automatic generation
<field.TextField testId={'custom-name-input'} label={'Name'} />
```

## Anti-Patterns to Avoid

1. **Never use raw TanStack Form hooks** - Always use `useAppForm`
2. **Never skip `withFocusManagement`** - Always wrap form components
3. **Never skip `onSubmitInvalid`** - Always handle invalid submissions
4. **Never use inline validation** - Use Zod schemas in `validators.onSubmit`
5. **Never call `form.handleSubmit()` directly** - Wrap in event handler
6. **Never skip `canSubmitWhenInvalid: true`** - Required for proper error display
7. **Never forget `e.preventDefault()`** - Always prevent default form submission
8. **Never access form values directly** - Use `onSubmit: ({ value })` or `useStore`
9. **Never use `form.SubmitButton` without `form.AppForm` wrapper** - Requires context
10. **Never modify form values in render** - Use `useEffect` or event handlers
