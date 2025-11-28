# Client Components Conventions

## Overview

Client components in Head Shakers handle interactivity, state management, event handling, and server action consumption. This document covers patterns UNIQUE to client components. For shared React conventions, see React-Coding-Conventions.md.

## Prerequisites

Before using this document, ensure you have loaded:

1. react-coding-conventions - Base React patterns
2. ui-components - UI component patterns

---

## 'use client' Directive

### When to Add 'use client'

The directive **must be the first line** of the file. Add it when the component uses:

```tsx
'use client';

// Required for:
// - useState, useEffect, useCallback, useMemo, useRef, useTransition
// - Event handlers (onClick, onChange, onSubmit, etc.)
// - Browser APIs (window, document, localStorage)
// - Third-party client libraries (Radix UI, TanStack Form, etc.)
```

### When NOT to Add

- Server components fetching data
- Layout components without interactivity
- Page components without hooks
- Skeleton components (loading states)

---

## Component Structure

### Complete Client Component Template

```tsx
'use client';

import type { ChangeEvent, ComponentProps, KeyboardEvent } from 'react';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Conditional } from '@/components/ui/conditional';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { myAction } from '@/lib/actions/my-domain/my.actions';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type MyComponentProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    isDisabled?: boolean;
    onSubmit?: (data: FormData) => void;
  };

export const MyComponent = ({
  className,
  isDisabled = false,
  onSubmit,
  testId,
  ...props
}: MyComponentProps) => {
  // 1. useState hooks
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useToggle();
  const [query, setQuery] = useState('');

  // 2. Other hooks (useContext, useQuery, etc.)
  const inputRef = useRef<HTMLInputElement>(null);
  const { execute, executeAsync, isExecuting, result } = useServerAction(myAction, {
    toastMessages: {
      error: 'Action failed',
      loading: 'Processing...',
      success: 'Action completed!',
    },
  });

  // 3. useMemo hooks
  const processedData = useMemo(() => {
    return expensiveCalculation(query);
  }, [query]);

  // 4. useEffect hooks
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [dependency]);

  // 5. Utility functions
  const formatValue = (value: string): string => {
    return value.trim().toLowerCase();
  };

  // 6. Event handlers (prefixed with 'handle')
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isDisabled) return;
    setIsLoading(true);
    try {
      await executeAsync({ query });
      onSubmit?.({ query } as unknown as FormData);
    } finally {
      setIsLoading(false);
    }
  }, [executeAsync, isDisabled, onSubmit, query]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        void handleSubmit();
      }
      if (e.key === 'Escape') {
        setIsOpen.off();
      }
    },
    [handleSubmit, setIsOpen],
  );

  // 7. Derived variables for conditional rendering (prefixed with '_')
  const _isDataReady = !isLoading && processedData.length > 0;
  const _hasNoResults = !isLoading && processedData.length === 0;
  const _isSubmitDisabled = isDisabled || isLoading || isExecuting;

  const componentTestId = testId || generateTestId('feature', 'my-component');

  return (
    <div
      className={cn('relative', className)}
      data-slot={'my-component'}
      data-testid={componentTestId}
      {...props}
    >
      {/* Input Section */}
      <input
        data-slot={'my-component-input'}
        data-testid={`${componentTestId}-input`}
        disabled={_isSubmitDisabled}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        value={query}
      />

      {/* Results Section */}
      <Conditional isCondition={_isDataReady}>
        <ResultsList data={processedData} />
      </Conditional>

      {/* Empty State */}
      <Conditional isCondition={_hasNoResults}>
        <EmptyState />
      </Conditional>
    </div>
  );
};
```

---

## Hook Patterns

### useState with Boolean Naming

```tsx
// All boolean state must use 'is' prefix
const [isLoading, setIsLoading] = useState(false);
const [isOpen, setIsOpen] = useState(false);
const [isEditing, setIsEditing] = useState(false);
const [isVisible, setIsVisible] = useState(true);
```

### useToggle Custom Hook (Preferred for Booleans)

```tsx
import { useToggle } from '@/hooks/use-toggle';

// Returns [state, { on, off, toggle }]
const [isOpen, setIsOpen] = useToggle(false);

// Usage
setIsOpen.on(); // Open
setIsOpen.off(); // Close
setIsOpen.toggle(); // Toggle
```

### useCallback for Event Handlers

```tsx
// Always use useCallback for handlers passed to children or in dependency arrays
const handleSubmit = useCallback(
  (data: FormData) => {
    onSubmit?.(data);
  },
  [onSubmit],
);

const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
}, []);
```

### useMemo for Expensive Calculations

```tsx
const processedData = useMemo(() => {
  return expensiveCalculation(rawData);
}, [rawData]);

const filteredItems = useMemo(() => {
  return items.filter((item) => item.name.includes(query));
}, [items, query]);
```

### useRef for DOM References

```tsx
const inputRef = useRef<HTMLInputElement>(null);
const containerRef = useRef<HTMLDivElement>(null);

// Usage
inputRef.current?.focus();
```

---

## Event Handler Patterns

### Mouse Events

```tsx
const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  e.stopPropagation();
  // Action logic
};
```

### Form Submission

```tsx
const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  e.stopPropagation();
  void form.handleSubmit();
};
```

### Keyboard Accessibility

```tsx
const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    e.stopPropagation();
    handleClick();
  }
  if (e.key === 'Escape') {
    setIsOpen.off();
  }
};
```

### Touch Events (Mobile Support)

```tsx
const touchStartXRef = useRef<number>(0);

const handleTouchStart = useCallback((e: TouchEvent<HTMLElement>) => {
  const touch = e.touches[0];
  if (touch) {
    touchStartXRef.current = touch.clientX;
  }
}, []);

const handleTouchEnd = useCallback(
  (e: TouchEvent<HTMLElement>) => {
    const touch = e.changedTouches[0];
    if (!touch) return;

    const diff = touchStartXRef.current - touch.clientX;
    if (Math.abs(diff) > 50) {
      // Swipe detected
      diff > 0 ? handleNext() : handlePrev();
    }
  },
  [handleNext, handlePrev],
);
```

---

## Server Action Consumption

### useServerAction Hook

Always use the project's `useServerAction` hook, **never `useAction` directly**:

```tsx
import { useServerAction } from '@/hooks/use-server-action';

const {
  execute, // For silent operations
  executeAsync, // For awaited operations with toast
  isExecuting, // Loading state
  result, // Action result
} = useServerAction(myServerAction, {
  toastMessages: {
    error: 'Action failed',
    loading: 'Processing...',
    success: 'Action completed!',
  },
  onSuccess: (data) => {
    // Access result via data.data (due to wrapper)
    console.log(data.data);
    onClose?.();
  },
  onError: (error) => {
    console.error(error);
  },
});
```

### Mutation Patterns

```tsx
// User-initiated mutations - use executeAsync with toast
const handleSave = async () => {
  await executeAsync(formData);
};

// Silent background operations - use execute
useEffect(() => {
  execute({ query: searchQuery });
}, [searchQuery, execute]);
```

### Accessing Results

```tsx
// Result shape is wrapped, access via data.data
const actualData = result?.data?.data;
const message = result?.data?.message;
const isSuccess = result?.data?.success;
```

---

## Form Integration

### With useAppForm

```tsx
import { useAppForm } from '@/components/ui/form';
import { useServerAction } from '@/hooks/use-server-action';
import { withFocusManagement, useFocusContext } from '@/lib/utils/focus-management';

type CreateFormProps = {
  onClose: () => void;
  onSuccess?: (data: Entity) => void;
};

export const CreateForm = withFocusManagement(({ onClose, onSuccess }: CreateFormProps) => {
  const { focusFirstError } = useFocusContext();

  // 1. Server action setup
  const { executeAsync, isExecuting } = useServerAction(createAction, {
    onSuccess: ({ data }) => {
      onSuccess?.(data.data);
      onClose();
    },
    toastMessages: {
      error: 'Failed to create',
      loading: 'Creating...',
      success: 'Created successfully!',
    },
  });

  // 2. Form setup
  const form = useAppForm({
    canSubmitWhenInvalid: true,
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      await executeAsync(value);
    },
    onSubmitInvalid: ({ formApi }) => {
      focusFirstError(formApi);
    },
    validators: {
      onSubmit: myValidationSchema,
    },
  });

  // 3. Event handler
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <form.AppField name={'name'}>{(field) => <field.TextField isRequired label={'Name'} />}</form.AppField>

      <form.AppField name={'description'}>
        {(field) => <field.TextareaField label={'Description'} />}
      </form.AppField>

      <form.AppForm>
        {(formApi) => <formApi.SubmitButton isDisabled={isExecuting}>Create</formApi.SubmitButton>}
      </form.AppForm>
    </form>
  );
});
```

### Accessing Form Values

```tsx
import { useStore } from '@tanstack/react-form';

// Inside component
const currentName = useStore(form.store, (state) => state.values.name);
const isFormValid = useStore(form.store, (state) => state.isValid);
```

---

## Radix UI Integration

### Dialog Pattern

```tsx
'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import { Conditional } from '@/components/ui/conditional';

type MyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const MyDialog = ({ children, isOpen, onClose }: MyDialogProps) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <DialogPrimitive.Root onOpenChange={handleOpenChange} open={isOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={'fixed inset-0 bg-black/50'} />
        <DialogPrimitive.Content
          className={'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'}
          data-slot={'dialog-content'}
        >
          {children}
          <DialogPrimitive.Close asChild>
            <Button variant={'ghost'}>Close</Button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
```

### Popover Pattern

```tsx
'use client';

import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';

export const MyPopover = () => {
  const [isOpen, setIsOpen] = useToggle();

  return (
    <Popover onOpenChange={setIsOpen.toggle} open={isOpen}>
      <PopoverAnchor asChild>
        <Button onClick={setIsOpen.toggle}>Open</Button>
      </PopoverAnchor>
      <PopoverContent
        align={'start'}
        onOpenAutoFocus={(e) => {
          e.preventDefault(); // Prevent focus steal if needed
        }}
        sideOffset={8}
      >
        {/* Content */}
      </PopoverContent>
    </Popover>
  );
};
```

---

## URL State Management

### Using nuqs for URL State

```tsx
'use client';

import { useQueryStates } from 'nuqs';
import { parseAsString, parseAsInteger } from 'nuqs';

export const SearchComponent = () => {
  const [{ page, query, sort }, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    query: parseAsString.withDefault(''),
    sort: parseAsString.withDefault('newest'),
  });

  const handleSearch = (newQuery: string) => {
    void setParams({ page: 1, query: newQuery });
  };

  const handlePageChange = (newPage: number) => {
    void setParams({ page: newPage });
  };

  return (/* ... */);
};
```

---

## Import Order for Client Components

```tsx
// 1. 'use client' directive (MUST be first)
'use client';

// 2. Type imports
import type { ChangeEvent, ComponentProps, KeyboardEvent } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

// 3. React hooks
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 4. External libraries
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

// 5. Internal UI components
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';

// 6. Custom hooks
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';

// 7. Actions
import { myAction } from '@/lib/actions/my-domain/my.actions';

// 8. Utilities
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';
```

---

## Anti-Patterns to Avoid

1. **Never use `useAction` directly** - Use `useServerAction` hook
2. **Never skip 'use client'** - Required for hooks and events
3. **Never access window/document without guards** - Check if window exists
4. **Never forget keyboard accessibility** - Include onKeyDown handlers
5. **Never skip e.preventDefault()** - Include in form submissions
6. **Never use inline callbacks in JSX** - Extract to named handlers with useCallback
7. **Never call facades directly** - Use server actions
8. **Never use async components** - Client components are synchronous
9. **Never use notFound() or redirect()** - Those are server-only
10. **Never import 'server-only'** - That's for server components
11. **Never skip focus management in forms** - Use withFocusManagement HOC
12. **Never forget to destructure setters from useToggle** - Use setIsOpen.on/off/toggle

---

## Complete Interactive Component Example

```tsx
'use client';

import type { ChangeEvent, ComponentProps, KeyboardEvent } from 'react';

import { SearchIcon, XIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { searchAction } from '@/lib/actions/search/search.actions';
import { CONFIG } from '@/lib/constants';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type SearchDropdownProps = ComponentProps<'div'> & ComponentTestIdProps;

export const SearchDropdown = ({ className, testId, ...props }: SearchDropdownProps) => {
  // 1. useState hooks
  const [isOpen, setIsOpen] = useToggle();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 2. Other hooks
  const inputRef = useRef<HTMLInputElement>(null);
  const { execute, isExecuting, result } = useServerAction(searchAction);

  // 3. useMemo hooks
  const searchResults = useMemo(() => result?.data?.data, [result?.data?.data]);

  // 4. useEffect hooks
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, CONFIG.SEARCH.DEBOUNCE_MS);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length >= CONFIG.SEARCH.MIN_QUERY_LENGTH) {
      execute({ query: debouncedQuery });
      setIsOpen.on();
    } else {
      setIsOpen.off();
    }
  }, [debouncedQuery, execute, setIsOpen]);

  // 5. Utility functions
  const getViewAllUrl = (searchQuery: string): string => {
    return $path({ route: '/browse/search', searchParams: { q: searchQuery } });
  };

  // 6. Event handlers
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const handleInputClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setIsOpen.off();
  }, [setIsOpen]);

  const handleResultClick = useCallback(() => {
    setIsOpen.off();
  }, [setIsOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') setIsOpen.off();
    },
    [setIsOpen],
  );

  // 7. Derived variables
  const _isQueryValid = query.trim().length >= CONFIG.SEARCH.MIN_QUERY_LENGTH;
  const _isLoading = isExecuting;
  const _hasResults = searchResults && searchResults.length > 0;
  const _shouldShowResults = !_isLoading && _hasResults;
  const _shouldShowEmptyState = !_isLoading && _isQueryValid && !_hasResults;

  const dropdownTestId = testId || generateTestId('feature', 'search-dropdown');

  return (
    <div
      className={cn('relative w-full', className)}
      data-slot={'search-dropdown'}
      data-testid={dropdownTestId}
      {...props}
    >
      <Popover onOpenChange={(open) => !open && setIsOpen.off()} open={isOpen}>
        <PopoverAnchor asChild>
          <div className={'relative'}>
            <SearchIcon
              aria-hidden
              className={'absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'}
            />
            <Input
              aria-label={'Search'}
              className={'pl-9'}
              isClearable
              onChange={handleInputChange}
              onClear={handleInputClear}
              onKeyDown={handleKeyDown}
              placeholder={'Search...'}
              ref={inputRef}
              testId={`${dropdownTestId}-input`}
              value={query}
            />
          </div>
        </PopoverAnchor>

        <Conditional isCondition={isOpen && _isQueryValid}>
          <PopoverContent
            align={'start'}
            className={'w-96 p-2'}
            onOpenAutoFocus={(e) => e.preventDefault()}
            sideOffset={8}
            testId={`${dropdownTestId}-content`}
          >
            {/* Loading State */}
            <Conditional isCondition={_isLoading}>
              <div className={'flex flex-col gap-2'}>
                <Skeleton className={'h-16 w-full'} />
                <Skeleton className={'h-16 w-full'} />
              </div>
            </Conditional>

            {/* Results */}
            <Conditional isCondition={_shouldShowResults}>
              <div className={'flex flex-col'}>
                {searchResults?.map((item) => (
                  <Link
                    className={'rounded-md p-2 hover:bg-accent'}
                    href={item.url}
                    key={item.id}
                    onClick={handleResultClick}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  className={'mt-2 border-t pt-2 text-center text-sm text-primary'}
                  href={getViewAllUrl(query)}
                  onClick={handleResultClick}
                >
                  View All Results
                </Link>
              </div>
            </Conditional>

            {/* Empty State */}
            <Conditional isCondition={_shouldShowEmptyState}>
              <div className={'py-8 text-center text-sm text-muted-foreground'}>No results found</div>
            </Conditional>
          </PopoverContent>
        </Conditional>
      </Popover>
    </div>
  );
};
```
