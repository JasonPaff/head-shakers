# Data-TestId System Guide

## Overview

The Head Shakers application uses a comprehensive, type-safe data-testid system for E2E testing with Playwright. This system provides consistent, maintainable testids across all UI components, feature components, layout components, and form fields.

## Architecture

### Core Components

1. **Type System** (`src/lib/test-ids/types.ts`)
   - Defines `TestIdNamespace` for categorizing components
   - Provides `ComponentTestId` union type for type safety
   - Exports `ComponentTestIdProps` interface for component integration

2. **Generator Functions** (`src/lib/test-ids/generator.ts`)
   - `generateTestId()` - Main testid generator for components
   - `generateFormFieldTestId()` - Specialized for form fields
   - `generateTableCellTestId()` - For table cell identification

3. **Playwright Integration** (`tests/e2e/helpers/test-helpers.ts`)
   - `ComponentFinder` class for type-safe element location
   - `TestIdAssertions` for verification utilities
   - Namespace-specific helper functions

## Namespace System

The system uses four primary namespaces to organize testids:

### 1. UI Namespace (`ui`)

For reusable UI components like buttons, inputs, dialogs, cards, etc.

```typescript
// Examples
generateTestId('ui', 'button'); // → "ui-button"
generateTestId('ui', 'dialog', 'confirm'); // → "ui-dialog-confirm"
```

### 2. Layout Namespace (`layout`)

For layout and structural components like headers, sidebars, navigation.

```typescript
// Examples
generateTestId('layout', 'app-header'); // → "layout-app-header"
generateTestId('layout', 'app-sidebar'); // → "layout-app-sidebar"
```

### 3. Feature Namespace (`feature`)

For domain-specific feature components like bobblehead cards, collection dialogs.

```typescript
// Examples
generateTestId('feature', 'bobblehead-card'); // → "feature-bobblehead-card"
generateTestId('feature', 'collection-create-dialog'); // → "feature-collection-create-dialog"
```

### 4. Form Namespace (`form`)

For form-related components and field identification.

```typescript
// Examples
generateFormFieldTestId('name'); // → "form-field-name"
generateFormFieldTestId('email', 'error'); // → "form-field-email-error"
```

## Component Integration Patterns

### Basic UI Components

All UI components should extend `ComponentTestIdProps` and accept an optional `testId` prop:

```typescript
import type { ComponentTestIdProps } from '@/lib/test-ids';
import { generateTestId } from '@/lib/test-ids';

interface ButtonProps extends ComponentTestIdProps {
  variant?: 'primary' | 'secondary';
  // ... other props
}

export const Button = ({ testId, variant, ...props }: ButtonProps) => {
  const buttonTestId = testId || generateTestId('ui', 'button');

  return (
    <button data-testid={buttonTestId} {...props}>
      {children}
    </button>
  );
};
```

### Feature Components

Feature components follow the same pattern but use the 'feature' namespace:

```typescript
interface BobbleheadCardProps extends ComponentTestIdProps {
  bobblehead: Bobblehead;
  // ... other props
}

export const BobbleheadCard = ({ testId, bobblehead, ...props }: BobbleheadCardProps) => {
  // Generate testids for main component and interactive elements
  const cardTestId = testId || generateTestId('feature', 'bobblehead-card');
  const likeButtonTestId = generateTestId('feature', 'like-button', 'bobblehead');
  const shareButtonTestId = generateTestId('feature', 'share-button', 'bobblehead');

  return (
    <Card testId={cardTestId}>
      <LikeButton testId={likeButtonTestId} />
      <ShareButton testId={shareButtonTestId} />
    </Card>
  );
};
```

### Form Field Components

Form fields use specialized generators and include testids for all related elements:

```typescript
export const TextField = ({ testId, label, ...props }: TextFieldProps) => {
  const field = useFieldContext<string>();

  // Generate testids based on field name or provided testId
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

### Dialog and Modal Components

For dialogs and modals, provide testids for the main container and key interactive elements:

```typescript
export const CreateDialog = ({ testId, ...props }: CreateDialogProps) => {
  const dialogTestId = testId || generateTestId('feature', 'create-dialog');
  const formTestId = generateTestId('feature', 'create-form');
  const submitButtonTestId = generateTestId('feature', 'create-submit');
  const cancelButtonTestId = generateTestId('feature', 'create-cancel');

  return (
    <Dialog>
      <DialogContent testId={dialogTestId}>
        <form data-testid={formTestId}>
          <Button testId={cancelButtonTestId}>Cancel</Button>
          <Button testId={submitButtonTestId}>Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

## Playwright Integration

### Using ComponentFinder

The `ComponentFinder` class provides type-safe element location:

```typescript
import { createComponentFinder } from '@/tests/e2e/helpers/test-helpers';

test('should interact with bobblehead card', async ({ page }) => {
  const finder = createComponentFinder(page);

  // Find feature components
  const bobbleheadCard = finder.feature('bobblehead-card');
  const likeButton = finder.feature('like-button', 'bobblehead');

  // Find UI components
  const submitButton = finder.ui('button', 'submit');

  // Find form fields
  const nameField = finder.formField('name');
  const emailField = finder.formField('email');

  await likeButton.click();
  await nameField.fill('Test Name');
  await submitButton.click();
});
```

### Using TestId Selectors

You can also use the testId helper functions directly:

```typescript
import { testIds } from '@/tests/e2e/helpers/test-helpers';

test('should fill form and submit', async ({ page }) => {
  // Using namespace helpers
  await page.locator(testIds.feature('collection-create-dialog')).waitFor();
  await page.locator(testIds.formField('name')).fill('My Collection');
  await page.locator(testIds.ui('button', 'submit')).click();
});
```

## Naming Conventions

### Component Names

- Use kebab-case for component names
- Be descriptive but concise
- Follow the pattern: `{domain}-{type}-{variant?}`

Examples:

- `bobblehead-card`
- `collection-create-dialog`
- `user-profile-menu`
- `photo-gallery-modal`

### Suffixes

Common suffixes for interactive elements:

- `button` - clickable buttons
- `link` - navigation links
- `input` - form inputs
- `dialog` - modal dialogs
- `menu` - dropdown menus
- `card` - content cards
- `nav` - navigation elements

### Form Field Naming

- Use field names that match your form schema
- Common suffixes: `label`, `error`, `description`, `input`
- Examples: `form-field-email`, `form-field-name-error`

## Best Practices

### 1. Consistent Application

- Every interactive element should have a testid
- Use the namespace system consistently
- Don't skip testids for "minor" elements

### 2. Avoid Hardcoded Values

```typescript
// ❌ Bad
<button data-testid="my-button">Click me</button>

// ✅ Good
const buttonTestId = testId || generateTestId('ui', 'button');
<button data-testid={buttonTestId}>Click me</button>
```

### 3. Meaningful Suffixes

Use suffixes to distinguish between multiple elements of the same type:

```typescript
const prevButtonTestId = generateTestId('feature', 'nav', 'prev');
const nextButtonTestId = generateTestId('feature', 'nav', 'next');
```

### 4. Form Field Integration

Always use the form field name for automatic testid generation:

```typescript
// In your form schema
const schema = {
  email: '',
  firstName: '',
  lastName: '',
};

// This automatically generates:
// form-field-email, form-field-first-name, form-field-last-name
```

### 5. TestId Props

- Always make testId props optional
- Provide sensible defaults using generators
- Pass testIds down to child components when needed

### 6. Playwright Test Organization

```typescript
// Group related test actions
const formActions = {
  fillName: (name: string) => finder.formField('name').fill(name),
  fillEmail: (email: string) => finder.formField('email').fill(email),
  submit: () => finder.ui('button', 'submit').click(),
};

// Use in tests
await formActions.fillName('John Doe');
await formActions.fillEmail('john@example.com');
await formActions.submit();
```

## Type Safety

The system provides compile-time validation:

```typescript
// ✅ Valid - 'button' is in ComponentTestId union
generateTestId('ui', 'button');

// ❌ TypeScript error - 'invalid' not in ComponentTestId union
generateTestId('ui', 'invalid');

// ✅ Valid namespace
finder.feature('bobblehead-card');

// ❌ TypeScript error - invalid namespace method
finder.invalid('some-component');
```

## Migration Guide

### Existing Components

1. Add `ComponentTestIdProps` to your interface
2. Import `generateTestId` or appropriate generator
3. Add testid generation logic
4. Apply testids to interactive elements

### Existing Tests

1. Replace hardcoded selectors with testId helpers
2. Use `ComponentFinder` for new tests
3. Update selectors to use namespace pattern
4. Group related actions into helper objects

## Examples

### Complete Component Example

```typescript
import type { ComponentTestIdProps } from '@/lib/test-ids';
import { generateTestId } from '@/lib/test-ids';

interface ProductCardProps extends ComponentTestIdProps {
  product: Product;
  onLike: () => void;
  onShare: () => void;
}

export const ProductCard = ({ testId, product, onLike, onShare }: ProductCardProps) => {
  const cardTestId = testId || generateTestId('feature', 'product-card');
  const likeButtonTestId = generateTestId('feature', 'like-button', 'product');
  const shareButtonTestId = generateTestId('feature', 'share-button', 'product');
  const imageTestId = generateTestId('feature', 'product-image');

  return (
    <Card testId={cardTestId}>
      <img src={product.image} data-testid={imageTestId} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div>
        <Button testId={likeButtonTestId} onClick={onLike}>
          Like
        </Button>
        <Button testId={shareButtonTestId} onClick={onShare}>
          Share
        </Button>
      </div>
    </Card>
  );
};
```

### Complete Test Example

```typescript
import { test, expect } from '@playwright/test';
import { createComponentFinder, signInWithTestUser } from '@/tests/e2e/helpers/test-helpers';

test('should interact with product card', async ({ page }) => {
  await signInWithTestUser(page);
  const finder = createComponentFinder(page);

  // Navigate to products page
  await page.goto('/products');

  // Find and interact with product card
  const productCard = finder.feature('product-card');
  const likeButton = finder.feature('like-button', 'product');
  const shareButton = finder.feature('share-button', 'product');

  // Verify card is visible
  await expect(productCard).toBeVisible();

  // Test like functionality
  await likeButton.click();
  await expect(page.locator('[data-testid="feature-like-count"]')).toContainText('1');

  // Test share functionality
  await shareButton.click();
  await expect(finder.ui('dialog', 'share')).toBeVisible();
});
```

This system provides a robust, type-safe foundation for E2E testing while maintaining consistency and reducing maintenance overhead.
