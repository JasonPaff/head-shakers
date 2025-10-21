# React Coding Conventions

A comprehensive guide for consistent, maintainable React development patterns and best practices.

---

## Code Style & Formatting

### Quote Usage

```tsx
// ✅ Correct
import { Component } from 'react';
const message = 'Hello world';
<Button className={'btn-primary'} />;

// ❌ Incorrect
import { Component } from 'react';
const message = 'Hello world';
<Button className='btn-primary' />;
```

**Rule**: Single quotes for strings and imports. JSX attributes must use curly braces with single quotes.

---

## File Organization

### File Naming

- Use **kebab-case** for all files: `user-profile.tsx`

### Folder Structure

```
  user-profile/
    user-profile.tsx
    user-profile.stories.tsx
    user-profile.spec.tsx
    user-profile.styles.ts
```

### Exports

```tsx
// ✅ Preferred - Named exports
export const UserProfile = ({ userId }: UserProfileProps) => {
  // component logic
};

// ❌ Avoid default exports
export default UserProfile;
```

---

## Component Architecture

### Component Definition

Always use arrow function components with proper typing:

```tsx
interface ComponentProps {
  title: string;
  isDisabled?: boolean;
  onSubmit?: (data: FormData) => void;
}

export const ComponentName = ({ title, isDisabled = false, onSubmit, ...props }: ComponentProps) => {
  // component logic
};
```

### Internal Organization

Organize component internals in this exact order:

```tsx
export const ExampleComponent = ({ onSubmit, isDisabled = false }: ExampleProps) => {
  // 1. useState hooks
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<FormData | null>(null);

  // 2. Other hooks (useContext, useQuery, etc.)
  const { user } = useCurrentUser();
  const query = useGetData();

  // 3. useMemo hooks
  const expensiveValue = useMemo(() => {
    return heavyCalculation(data);
  }, [data]);

  // 4. useEffect hooks
  useEffect(() => {
    // effect logic
  }, [dependency]);

  // 5. Utility functions
  const processData = (rawData: unknown): ProcessedData => {
    return transformData(rawData);
  };

  // 6. Event handlers (prefixed with 'handle')
  const handleSubmit = useCallback(() => {
    if (data) onSubmit?.(data);
  }, [data, onSubmit]);

  // 7. Derived values for conditional rendering (prefixed with '_')
  const _isDataReady = user && data && !isLoading;
  const _hasErrors = !isLoading && query.error;

  return (
    <div>
      {/* Submit Section */}
      <Conditional isCondition={_isDataReady}>
        <Button onClick={handleSubmit} isDisabled={isDisabled}>
          Submit
        </Button>
      </Conditional>

      {/* Error Display */}
      <Conditional isCondition={_hasErrors}>
        <ErrorMessage error={query.error} />
      </Conditional>
    </div>
  );
};
```

---

## Naming Conventions

### Boolean Variables

**All boolean values must start with `is`:**

```tsx
// ✅ Correct
const [isLoading, setIsLoading] = useState(false);
const [isVisible, setIsVisible] = useState(true);

interface Props {
  isDisabled?: boolean;
  isRequired?: boolean;
  isExpanded?: boolean;
}

// ❌ Incorrect
const [loading, setLoading] = useState(false);
interface Props {
  disabled?: boolean;
  required?: boolean;
}
```

### Derived Variables

**Prefix with underscore (`_`) :**

```tsx
// ✅ Correct
const _isSubmitReady = currentStep >= steps.length && !isLoading;
const _hasNoResults = table.getRowModel().rows?.length === 0;

// ❌ Incorrect
const isSubmitReady = currentStep >= steps.length && !isLoading;
const hasNoResults = table.getRowModel().rows?.length === 0;
```

### Function Naming

- **Event handlers**: `handle` prefix for internal functions
- **Props**: `on` prefix for callback props

```tsx
interface ComponentProps {
  onSubmit: (data: FormData) => void;
  onInputChange: (value: string) => void;
}

export const Component = ({ onSubmit, onInputChange }: ComponentProps) => {
  const handleFormSubmit = (data: FormData) => onSubmit(data);
  const handleInputValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    onInputChange(e.target.value);
  };

  // ...
};
```

---

## TypeScript Integration

### Type Imports

```tsx
import type { ComponentPropsWithRef, ChangeEvent } from 'react';
```

### Props Interfaces

```tsx
interface ComponentNameProps extends ComponentPropsWithRef<'div'> {
  variant?: 'primary' | 'secondary' | 'destructive';
  isDisabled?: boolean;
  onAction?: (id: string) => void;
}
```

### Interface Naming

Use `ComponentNameProps` pattern for consistency.

---

## State Management

### State Organization

```tsx
// ✅ Multiple useState calls for related but separate concerns
const [isLoading, setIsLoading] = useState(false);
const [data, setData] = useState<FormData | null>(null);
const [error, setError] = useState<string | null>(null);

// ❌ Avoid complex single state objects unless truly necessary
const [state, setState] = useState({ isLoading: false, data: null, error: null });
```

### Custom Hooks

Extract logic into custom hooks when:

- Logic is shared across multiple components
- Component logic becomes too complex
- State management patterns are reusable

```tsx
export const useToggle = (initialState = false, onChange?: (state: boolean) => void) => {
  const [state, setState] = useState(initialState);

  const toggle = useCallback(() => {
    setState((prev) => {
      const next = !prev;
      onChange?.(next);
      return next;
    });
  }, [onChange]);

  const actions = useMemo(
    () => ({
      toggle,
      on: () => {
        setState(true);
        onChange?.(true);
      },
      off: () => {
        setState(false);
        onChange?.(false);
      },
    }),
    [toggle, onChange],
  );

  return [state, actions] as const;
};
```

---

## Event Handling

### Handler Implementation

```tsx
export const Form = ({ onSubmit }: FormProps) => {
  const [formData, setFormData] = useState<FormData>({});

  const handleFormSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    },
    [formData, onSubmit],
  );

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  return <form onSubmit={handleFormSubmit}>{/* form fields */}</form>;
};
```

---

## Conditional Rendering

### Rules for Conditional vs Ternary

**Use `<Conditional>` component for:**

- Complex boolean conditions
- Multiple conditions combined with logical operators
- Rendering complex components or multiple elements

**Use ternary operators for:**

- Simple string values
- Single component swaps
- Simple boolean checks

```tsx
// ✅ Use Conditional component
const _isDataReady = user && data && !isLoading && !error;

<Conditional isCondition={_isDataReady}>
  <ComplexDashboard />
</Conditional>;

// ✅ Use ternary for simple cases
{
  isLoading ? 'Loading...' : 'Ready';
}
{
  isLoading ? <LoadingSpinner /> : <Content />;
}
```

### Complex Conditions

Extract complex logic to meaningful variable names:

```tsx
// ✅ Correct
const _isDataReady = user && data && !isLoading && !error;
const _shouldShowEmptyState = !isLoading && !error && data?.length === 0;

return (
  <div>
    <Conditional isCondition={_isDataReady}>
      <DataDisplay data={data} />
    </Conditional>

    <Conditional isCondition={_shouldShowEmptyState}>
      <EmptyState />
    </Conditional>
  </div>
);

// ❌ Incorrect
return (
  <div>
    <Conditional isCondition={user && data && !isLoading && !error}>
      <DataDisplay data={data} />
    </Conditional>

    <Conditional isCondition={!isLoading && !error && data?.length === 0}>
      <EmptyState />
    </Conditional>
  </div>
);
```

---

## Custom Hooks

### Return Patterns

Use array returns with `as const` for tuple typing:

```tsx
export const useToggle = (initialState = false) => {
  const [state, setState] = useState(initialState);

  const toggle = useCallback(() => setState((prev) => !prev), []);
  const setTrue = useCallback(() => setState(true), []);
  const setFalse = useCallback(() => setState(false), []);

  return [state, { toggle, setTrue, setFalse }] as const;
};
```

### Context Hook Error Handling

Standardize error messages for context validation:

```tsx
export const useFormField = () => {
  const context = use(formFieldContext);
  if (!context) {
    throw new Error('useFormField can only be called from within a <FormField>');
  }
  return context;
};
```

---

## Performance Optimization

### Memoization Guidelines

```tsx
// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return expensiveDataTransformation(rawData);
}, [rawData]);

// Use useCallback for event handlers passed to dependency arrays
const handleItemClick = useCallback(
  (id: string) => {
    onItemSelect(id);
  },
  [onItemSelect],
);
```

---

## Accessibility

### Required Practices

- Use semantic HTML elements
- Include proper ARIA attributes
- Provide screen reader support

```tsx
<button
  onClick={handleClick}
  aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}
  aria-expanded={isExpanded}
>
  {isExpanded ? 'Close' : 'Menu'}
</button>
```

---

## Code Quality Rules

### UI Block Comments

```tsx
return (
  <div>
    {/* User Information Section */}
    <section className={'user-info'}>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </section>

    {/* Action Controls */}
    <div className={'actions'}>
      <Button onClick={handleEdit}>Edit</Button>
      <Button onClick={handleDelete} variant={'destructive'}>
        Delete
      </Button>
    </div>

    {/* Data Display */}
    <Conditional isCondition={_hasData}>
      <DataTable data={processedData} />
    </Conditional>
  </div>
);
```

### CSS Class Composition

Use `cn()` utility for conditional classes:

```tsx
// ✅ Correct patterns
className={cn(baseStyles, className)}
className={cn('rounded-md', _hasNoResults && 'min-h-80 border-none')}
className={cn('text-center', { 'text-left': _isAligned })}
className={cn(
  'absolute right-6 top-5 rounded-sm opacity-70',
  'transition-opacity hover:opacity-100',
  'focus:outline-none focus:ring-2',
  className
)}
```

### Essential Rules Summary

1. **Boolean Naming**: All boolean props, state, and values must start with `is`
2. **Derived Variables**: Prefix conditional rendering variables with `_`
3. **No Complex JSX Conditions**: Extract to meaningful variable names
4. **UI Block Comments**: Label individual UI sections for clarity
5. **Consistent Handler Naming**: `handle` for internal, `on` for props
6. **Proper TypeScript**: Use strict typing throughout
7. **Component Organization**: Follow the 7-step internal structure
8. **Accessibility First**: Include proper ARIA and semantic markup
9. **Performance Considerations**: Use memoization appropriately
10. **Error Handling**: Provide descriptive error messages

---
