# UI Components Conventions

## Overview

Head Shakers UI components are built with Radix UI primitives, styled with Tailwind CSS, and use TanStack Form for form handling. Components follow React 19 conventions with test ID support and consistent patterns.

## Component Structure

```
src/components/
├── ui/                     # Reusable UI primitives
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   └── form/              # Form components
│       ├── index.tsx      # Form hook exports (exception to no-barrel rule)
│       ├── field-components/
│       └── form-components/
├── feature/               # Feature-specific components
│   ├── bobblehead/
│   ├── collections/
│   └── social/
└── layout/                # Layout components
    ├── header/
    └── sidebar/
```

## File Naming

- **Component files**: `kebab-case.tsx` (e.g., `user-profile.tsx`)
- **Component names**: `PascalCase` (e.g., `UserProfile`)
- **Props types**: `{ComponentName}Props` (e.g., `UserProfileProps`)

## Component Template

```tsx
import type { ComponentProps } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type CardProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    isLoading?: boolean;
    variant?: 'default' | 'outlined';
  };

export const Card = ({
  children,
  className,
  isLoading = false,
  testId,
  variant = 'default',
  ...props
}: CardProps) => {
  const cardTestId = testId || generateTestId('ui', 'card');

  return (
    <div
      className={cn(
        'rounded-lg p-4',
        variant === 'outlined' && 'border border-border',
        isLoading && 'pointer-events-none opacity-50',
        className,
      )}
      data-slot={'card'}
      data-testid={cardTestId}
      {...props}
    >
      {children}
    </div>
  );
};
```

## Type Definition Pattern

Always use `type` with `ComponentProps` and `ComponentTestIdProps`:

```tsx
import type { ComponentProps } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

// Simple props
type ButtonProps = ComponentProps<'button'> & ComponentTestIdProps;

// With additional props
type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> &
  ComponentTestIdProps & {
    isShowCloseButton?: boolean;
  };

// Props for native elements with custom additions
type InputProps = ComponentProps<'input'> &
  ComponentTestIdProps & {
    isClearable?: boolean;
    leftIcon?: ReactNode | 'search';
    onClear?: () => void;
  };
```

## Test ID Pattern

Every component must include test ID support:

```tsx
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';

// For UI components
export const Button = ({ testId, ...props }: ButtonProps) => {
  const buttonTestId = testId || generateTestId('ui', 'button');

  return <button data-testid={buttonTestId} {...props} />;
};

// For form fields
import { generateFormFieldTestId } from '@/lib/test-ids';

export const TextField = ({ testId, ...props }: TextFieldProps) => {
  const field = useFieldContext<string>();
  const fieldName = field.name || 'text-field';

  const inputTestId = testId || generateFormFieldTestId(fieldName);
  const labelTestId = testId ? `${testId}-label` : generateFormFieldTestId(fieldName, 'label');
  const errorTestId = testId ? `${testId}-error` : generateFormFieldTestId(fieldName, 'error');

  return (
    <FieldItem>
      <Label testId={labelTestId}>{label}</Label>
      <Input testId={inputTestId} {...props} />
      <FieldError testId={errorTestId} />
    </FieldItem>
  );
};
```

## Data-Slot Attribute

Every component element must include a `data-slot` attribute for styling hooks:

```tsx
<div data-slot={'card'} data-testid={cardTestId} {...props}>
  {children}
</div>

<button data-slot={'button'} data-testid={buttonTestId} {...props}>
  {children}
</button>

<DialogPrimitive.Content data-slot={'dialog-content'} data-testid={contentTestId}>
  {children}
</DialogPrimitive.Content>
```

## Boolean Props Naming

Always use `is` prefix for boolean props:

```tsx
// Correct
type DialogContentProps = {
  isShowCloseButton?: boolean;
};

type ButtonProps = {
  isDisabled?: boolean;
  isLoading?: boolean;
};

type InputProps = {
  isClearable?: boolean;
  leftIcon?: ReactNode | 'search';
};

// Incorrect - DO NOT USE
type DialogContentProps = {
  showCloseButton?: boolean; // Missing 'is' prefix
};
```

## Radix UI Integration

### Basic Radix Component

```tsx
'use client';

import type { ComponentProps } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type DialogProps = ComponentProps<typeof DialogPrimitive.Root> & ComponentTestIdProps;
type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> &
  ComponentTestIdProps & {
    isShowCloseButton?: boolean;
  };

export const Dialog = ({ children, testId, ...props }: DialogProps) => {
  const dialogTestId = testId || generateTestId('ui', 'dialog');

  return (
    <DialogPrimitive.Root data-slot={'dialog'} data-testid={dialogTestId} {...props}>
      {children}
    </DialogPrimitive.Root>
  );
};

export const DialogContent = ({
  children,
  className,
  isShowCloseButton = true,
  testId,
  ...props
}: DialogContentProps) => {
  const dialogContentTestId = testId || generateTestId('ui', 'dialog', 'content');
  const closeButtonTestId = testId ? `${testId}-close` : generateTestId('ui', 'dialog', 'close');

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-[50%] top-[50%] z-50 -translate-x-1/2 -translate-y-1/2',
          'rounded-lg border bg-background p-6 shadow-lg',
          className,
        )}
        data-slot={'dialog-content'}
        data-testid={dialogContentTestId}
        {...props}
      >
        {children}
        <Conditional isCondition={isShowCloseButton}>
          <DialogPrimitive.Close
            className={'absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100'}
            data-slot={'dialog-close'}
            data-testid={closeButtonTestId}
          >
            <XIcon aria-hidden className={'size-4'} />
            <span className={'sr-only'}>Close</span>
          </DialogPrimitive.Close>
        </Conditional>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
};
```

## TanStack Form Integration

### Form Hook Setup (src/components/ui/form/index.tsx)

```tsx
import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { CheckboxField } from '@/components/ui/form/field-components/checkbox-field';
import { TextField } from '@/components/ui/form/field-components/text-field';
import { SubmitButton } from '@/components/ui/form/form-components/submit-button';

export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

export const { useAppForm, withFieldGroup, withForm } = createFormHook({
  fieldComponents: {
    TextField,
    CheckboxField,
    // ... other field components
  },
  fieldContext,
  formComponents: { SubmitButton },
  formContext,
});
```

### Form Field Component

```tsx
'use client';

import type { ComponentProps } from 'react';

import { useId } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { useFieldContext } from '@/components/ui/form';
import { FieldAria } from '@/components/ui/form/field-components/field-aria';
import { FieldDescription } from '@/components/ui/form/field-components/field-description';
import { FieldError } from '@/components/ui/form/field-components/field-error';
import { FieldItem } from '@/components/ui/form/field-components/field-item';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateFormFieldTestId } from '@/lib/test-ids';

type TextFieldProps = ComponentProps<'input'> &
  ComponentTestIdProps & {
    description?: string;
    isRequired?: boolean;
    label: string;
  };

export const TextField = ({ description, isRequired, label, testId, ...props }: TextFieldProps) => {
  const field = useFieldContext<string>();
  const id = useId();

  const fieldName = field.name || 'text-field';
  const inputTestId = testId || generateFormFieldTestId(fieldName);
  const labelTestId = testId ? `${testId}-label` : generateFormFieldTestId(fieldName, 'label');
  const errorTestId = testId ? `${testId}-error` : generateFormFieldTestId(fieldName, 'error');

  return (
    <FieldItem>
      <Label htmlFor={id} testId={labelTestId} variant={isRequired ? 'required' : undefined}>
        {label}
      </Label>
      <FieldAria>
        <Input
          id={id}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          testId={inputTestId}
          value={field.state.value}
          {...props}
        />
      </FieldAria>
      <FieldError testId={errorTestId} />
      <FieldDescription>{description}</FieldDescription>
    </FieldItem>
  );
};
```

### Submit Button

```tsx
'use client';

import { useStore } from '@tanstack/react-form';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form';
import { generateTestId } from '@/lib/test-ids';

type SubmitButtonProps = ComponentTestIdProps & RequiredChildren<{ isDisabled?: boolean }>;

export const SubmitButton = ({ children, isDisabled, testId }: SubmitButtonProps) => {
  const form = useFormContext();
  const submitButtonTestId = testId || generateTestId('ui', 'form-submit');

  const [isSubmitting] = useStore(form.store, (state) => [state.isSubmitting]);

  return (
    <Button disabled={isSubmitting || isDisabled} testId={submitButtonTestId} type={'submit'}>
      {children}
    </Button>
  );
};
```

## CVA (Class Variance Authority)

### Button Variants

```tsx
import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

export const buttonVariants = cva(
  `
    inline-flex shrink-0 items-center justify-center gap-2 rounded-md
    text-sm font-medium whitespace-nowrap transition-all outline-none
    focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
    disabled:pointer-events-none disabled:opacity-50
  `,
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 px-4 py-2',
        icon: 'size-9',
        lg: 'h-10 rounded-md px-6',
        sm: 'h-8 gap-1.5 rounded-md px-3',
      },
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive: 'bg-destructive text-white shadow-xs hover:bg-destructive/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
      },
    },
  },
);

export type ButtonProps = ComponentProps<'button'> &
  ComponentTestIdProps &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = ({ asChild = false, className, size, testId, variant, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot : 'button';
  const buttonTestId = testId || generateTestId('ui', 'button');

  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      data-slot={'button'}
      data-testid={buttonTestId}
      type={'button'}
      {...props}
    />
  );
};
```

## Conditional Rendering

### Using the Conditional Component

```tsx
import { Conditional } from '@/components/ui/conditional';

// Basic usage
<Conditional isCondition={isLoading}>
  <LoadingSpinner />
</Conditional>

// With fallback
<Conditional isCondition={isLoading} fallback={<DataList items={items} />}>
  <LoadingSpinner />
</Conditional>

// With function condition
<Conditional isCondition={() => items.length > 0}>
  <ItemList items={items} />
</Conditional>
```

### Simple Conditions

```tsx
{
  /* Ternary for simple conditions */
}
{
  isError ? <ErrorMessage /> : <Content />;
}

{
  /* Short-circuit for optional rendering */
}
{
  showBadge && <Badge>{count}</Badge>;
}
```

## Link Navigation

Always use `$path` from next-typesafe-url:

```tsx
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

// Route without params
<Link href={$path({ route: '/dashboard' })}>Dashboard</Link>

// Route with params
<Link href={$path({ route: '/bobbleheads/[id]', routeParams: { id: bobbleheadId } })}>
  View Bobblehead
</Link>

// Route with search params
<Link
  href={$path({
    route: '/search',
    searchParams: { q: query, type: 'bobblehead' },
  })}
>
  Search Results
</Link>
```

## Accessibility Patterns

### ARIA Labels

```tsx
// Icon-only buttons - use aria-label
<button aria-label={'Close dialog'}>
  <XIcon aria-hidden />
</button>

// Loading states
<button aria-busy={isLoading} aria-disabled={isLoading}>
  Submit
</button>

// Screen reader only text
<span className={'sr-only'}>Close</span>

// Icons should be aria-hidden
<XIcon aria-hidden className={'size-4'} />
```

### Focus Management

```tsx
// Auto-focus on mount
<input autoFocus />

// Focus trap in modals (handled by Radix automatically)
<DialogPrimitive.Content>
  {/* Focus is trapped automatically */}
</DialogPrimitive.Content>
```

## Import Order

Follow this import order:

```tsx
// 1. Type imports
import type { ComponentProps } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

// 2. React/external libraries
import { useId } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

// 3. Internal components
import { Conditional } from '@/components/ui/conditional';
import { Button } from '@/components/ui/button';

// 4. Utilities and helpers
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';
```

## Anti-Patterns to Avoid

1. **Never use `export default`** - Always use named exports
2. **Never use inline styles** - Use Tailwind classes
3. **Never skip `data-slot` attribute** - Every component needs it
4. **Never skip `data-testid`** - Use `generateTestId()` for all components
5. **Never hardcode routes** - Use `$path` from next-typesafe-url
6. **Never use `forwardRef`** - Pass ref directly in React 19
7. **Never skip accessibility** - Always include ARIA labels for icon buttons
8. **Never use `any` type** - Use proper TypeScript types
9. **Never use `interface` for component props** - Use `type` with `ComponentProps`
10. **Never use `condition` prop** - Use `isCondition` for Conditional component
11. **Never import cn from wrong path** - Use `@/utils/tailwind-utils`
12. **Never use regular function declarations** - Use arrow functions for components
