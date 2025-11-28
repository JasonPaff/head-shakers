# Component Testing Conventions

## Overview

Component tests validate React components using Testing Library. They verify rendering, user interactions, and accessibility.

**File Pattern**: `tests/components/**/*.test.tsx`

**Key Characteristics**:

- Use custom render with providers
- Test user behavior, not implementation
- Accessibility-first query selection
- Mock server actions and external services

## Component Test Pattern

Use the custom render from `tests/setup/test-utils.tsx` which includes all providers and pre-configured userEvent.

```typescript
// tests/components/feature/social/comment-form.test.tsx
import { waitFor } from '@testing-library/react';

import { CommentForm } from '@/components/feature/social/comment-form';

import { customRender, screen } from '@/tests/setup/test-utils';

// Mock server action
vi.mock('@/lib/actions/social/social.actions', () => ({
  createCommentAction: vi.fn(),
}));

describe('CommentForm', () => {
  const defaultProps = {
    targetId: 'target-123',
    targetType: 'bobblehead' as const,
    onSuccess: vi.fn(),
  };

  it('should render the form', () => {
    customRender(<CommentForm {...defaultProps} />);

    expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should submit form with valid input', async () => {
    const { createCommentAction } = await import('@/lib/actions/social/social.actions');
    vi.mocked(createCommentAction).mockResolvedValueOnce({
      data: { success: true, data: { id: 'comment-1' }, message: 'Created' },
    });

    // customRender returns { user, ...renderResult }
    const { user } = customRender(<CommentForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/comment/i), 'Test comment');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(createCommentAction).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'Test comment' }),
      );
    });
  });

  it('should show validation error for empty input', async () => {
    const { user } = customRender(<CommentForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });
});
```

**Note**: No need to import `describe`, `it`, `expect`, `vi` - globals are enabled in Vitest config.

## Custom Render Usage

```typescript
import { customRender, screen } from '@/tests/setup/test-utils';

// Basic render
customRender(<MyComponent />);

// With user interactions
const { user } = customRender(<MyComponent />);
await user.click(screen.getByRole('button'));

// With custom wrapper or context
customRender(<MyComponent />, {
  wrapper: CustomWrapper,
});
```

## Testing Library Queries

### Query Priority (Accessibility-First)

1. **getByRole** - Most preferred, tests accessibility
2. **getByLabelText** - Form inputs
3. **getByPlaceholderText** - Input placeholders
4. **getByText** - Non-interactive text content
5. **getByTestId** - Last resort with namespace

```typescript
// Preferred: Role-based queries
screen.getByRole('button', { name: /submit/i });
screen.getByRole('heading', { level: 1 });
screen.getByRole('textbox', { name: /email/i });

// Form inputs
screen.getByLabelText(/email address/i);

// Text content
screen.getByText(/welcome to head shakers/i);

// Test IDs (with namespace)
screen.getByTestId('ui-button-primary');
screen.getByTestId('feature-bobblehead-card');
screen.getByTestId('form-comment-input');
```

### Query Types

```typescript
// getBy* - Throws if not found (use for assertions)
const button = screen.getByRole('button');

// queryBy* - Returns null if not found (use for negative assertions)
expect(screen.queryByText('Error')).not.toBeInTheDocument();

// findBy* - Async, waits for element
const dialog = await screen.findByRole('dialog');
```

## User Event Testing

```typescript
const { user } = customRender(<MyComponent />);

// Click
await user.click(screen.getByRole('button'));

// Type
await user.type(screen.getByLabelText(/name/i), 'John Doe');

// Clear and type
await user.clear(screen.getByLabelText(/email/i));
await user.type(screen.getByLabelText(/email/i), 'new@example.com');

// Select
await user.selectOptions(screen.getByRole('combobox'), 'option-value');

// Keyboard
await user.keyboard('{Enter}');
await user.keyboard('{Escape}');

// Hover
await user.hover(screen.getByRole('button'));
await user.unhover(screen.getByRole('button'));
```

## Mocking Server Actions

```typescript
// Mock at the top of the file
vi.mock('@/lib/actions/bobbleheads/bobblehead.actions', () => ({
  createBobbleheadAction: vi.fn(),
  updateBobbleheadAction: vi.fn(),
  deleteBobbleheadAction: vi.fn(),
}));

// In tests
import { createBobbleheadAction } from '@/lib/actions/bobbleheads/bobblehead.actions';

it('should handle successful submission', async () => {
  vi.mocked(createBobbleheadAction).mockResolvedValueOnce({
    data: { success: true, data: { id: 'new-id' }, message: 'Created' },
  });

  const { user } = customRender(<CreateForm />);
  // ... test interaction
});

it('should handle error response', async () => {
  vi.mocked(createBobbleheadAction).mockResolvedValueOnce({
    data: { success: false, message: 'Validation failed' },
  });

  const { user } = customRender(<CreateForm />);
  // ... test error display
});
```

## Pre-Mocked Dependencies

These are automatically mocked in `tests/setup/vitest.setup.ts`:

```typescript
// Clerk authentication
'@clerk/nextjs' - ClerkProvider, useAuth, useUser, UserButton, SignedIn, SignedOut, etc.
'@clerk/nextjs/server' - auth(), clerkClient(), currentUser()

// Next.js
'next/navigation' - useRouter, useParams, usePathname, redirect, notFound
'next/headers' - cookies(), headers()

// Third-party
'sonner' - Toast notifications
'next-themes' - Theme provider
```

Default test user in mocks:

- `userId: 'test-user-id'`
- `email: 'test@example.com'`

## data-testid Namespace Patterns

When role-based queries aren't practical, use namespaced test IDs:

```typescript
// UI components: ui-{component}-{variant}
data-testid="ui-button-primary"
data-testid="ui-dialog-header"
data-testid="ui-input-error"

// Feature components: feature-{domain}-{element}
data-testid="feature-bobblehead-card"
data-testid="feature-collection-header"
data-testid="feature-comment-list"

// Form elements: form-{name}-{type}
data-testid="form-comment-input"
data-testid="form-submit-button"
data-testid="form-field-email"
```

## Async Testing with waitFor

```typescript
import { waitFor } from '@testing-library/react';

// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});

// Wait for element to disappear
await waitFor(() => {
  expect(screen.queryByText('Loading')).not.toBeInTheDocument();
});

// Wait with timeout
await waitFor(
  () => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  },
  { timeout: 3000 },
);
```

## Testing Component Variants

```typescript
describe('Button', () => {
  it.each([
    ['primary', 'bg-primary'],
    ['secondary', 'bg-secondary'],
    ['destructive', 'bg-destructive'],
  ])('should render %s variant with correct class', (variant, expectedClass) => {
    customRender(<Button variant={variant}>Click me</Button>);

    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  });
});
```

## Checklist

- [ ] Use custom render from `tests/setup/test-utils.tsx`
- [ ] Use `user` from customRender for interactions
- [ ] Prefer role-based queries (`getByRole`, `getByLabelText`)
- [ ] Use `data-testid` with namespace pattern when needed
- [ ] Mock server actions with `vi.mock()`
- [ ] Use `waitFor` for async assertions
- [ ] Test user behavior, not implementation details
- [ ] Test both success and error states
- [ ] No imports for `describe`/`it`/`expect`/`vi` (globals enabled)
