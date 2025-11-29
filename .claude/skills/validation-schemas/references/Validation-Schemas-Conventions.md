# Validation Schemas Conventions

## Overview

Head Shakers uses Zod with drizzle-zod for type-safe validation that stays in sync with the database schema. Validation schemas serve as the single source of truth for input validation, type generation, and API contracts.

**Key Integration Points:**

- **Database**: Schemas generated from Drizzle tables via `drizzle-zod`
- **Forms**: TanStack Form uses schemas via `validators: { onSubmit: schema }`
- **Actions**: Server actions validate with `schema.parse(ctx.sanitizedInput)`
- **Types**: Export both input types (for forms) and output types (after transforms)

## File Structure

```
src/lib/validations/
├── {domain}.validation.ts     # Domain-specific schemas
src/lib/utils/
├── zod.utils.ts               # Reusable zod utility functions
```

## File Naming

- **Files**: `{domain}.validation.ts` (e.g., `bobbleheads.validation.ts`, `collections.validation.ts`)
- **Schema naming**: `{operation}{Entity}Schema` (e.g., `selectBobbleheadSchema`, `insertBobbleheadSchema`)
- **Type naming**: `{Operation}{Entity}` for output, `{Operation}{Entity}Input` for input

## Required Imports

```typescript
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { DEFAULTS, ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { {table} } from '@/lib/db/schema';
import {
  zodDateString,
  zodDecimal,
  zodMaxString,
  zodMinMaxString,
  zodNullableUUID,
  zodYear,
} from '@/lib/utils/zod.utils';
```

---

## Custom Zod Utilities

**Always prefer zod utilities over raw zod chains.** These utilities provide consistent error messages and handle edge cases.

### zodMinMaxString

Required string with min and max length. Automatically trims.

```typescript
// Definition
export const zodMinMaxString = ({ fieldName, maxLength, minLength }: zodMinMaxStringOptions) => {
  const baseSchema = z.string().trim();
  const requiredMessage = `${fieldName} is required`;
  const maxLengthMessage = `${fieldName} must be ${maxLength} characters or less`;
  const minLengthMessage = `${fieldName} must be at least ${minLength} characters`;

  return baseSchema
    .min(minLength, minLength === 1 ? requiredMessage : minLengthMessage)
    .max(maxLength, maxLengthMessage);
};

// Usage
name: zodMinMaxString({
  fieldName: 'Name',
  maxLength: SCHEMA_LIMITS.BOBBLEHEAD.NAME.MAX,
  minLength: SCHEMA_LIMITS.BOBBLEHEAD.NAME.MIN,
}),
```

### zodMaxString

Optional or required string with max length. Returns null for empty strings.

```typescript
// Optional (default)
description: zodMaxString({
  fieldName: 'Description',
  maxLength: SCHEMA_LIMITS.BOBBLEHEAD.DESCRIPTION.MAX,
}),

// Required
description: zodMaxString({
  fieldName: 'Description',
  isRequired: true,
  maxLength: SCHEMA_LIMITS.BOBBLEHEAD.DESCRIPTION.MAX,
}),
```

### zodDateString

Parses date strings to Date objects. Supports nullable dates.

```typescript
// Optional nullable date
acquisitionDate: zodDateString({
  fieldName: 'Acquisition Date',
  isNullable: true,
}).optional(),

// Required date
startDate: zodDateString({
  fieldName: 'Start Date',
}),
```

### zodDecimal

Parses decimal number strings. Returns null for empty optional values.

```typescript
// Optional decimal
purchasePrice: zodDecimal({ fieldName: 'Purchase Price' }).optional(),

// Required decimal
amount: zodDecimal({ fieldName: 'Amount', isRequired: true }),
```

### zodYear

Validates 4-digit year within range (1900 to current year + 1).

```typescript
// Optional year
year: zodYear({ fieldName: 'Year' }).optional(),

// Required year
manufacturingYear: zodYear({ fieldName: 'Manufacturing Year', isRequired: true }),
```

### zodNullableUUID

Optional UUID that defaults to null. Useful for foreign key references.

```typescript
subcollectionId: zodNullableUUID('Subcollection ID'),
```

### zodInteger

Parses integer strings. Returns null for empty optional values.

```typescript
quantity: zodInteger({ fieldName: 'Quantity', isRequired: true }),
position: zodInteger({ fieldName: 'Position' }).optional(),
```

---

## Schema Generation Pattern

### Complete Entity Schema Set

```typescript
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { DEFAULTS, ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { bobbleheads } from '@/lib/db/schema';
import { zodMaxString, zodMinMaxString, zodDecimal, zodYear } from '@/lib/utils/zod.utils';

// 1. Type exports first (for better IDE support)
export type DeleteBobblehead = z.infer<typeof deleteBobbleheadSchema>;
export type InsertBobblehead = z.infer<typeof insertBobbleheadSchema>;
export type InsertBobbleheadInput = z.input<typeof insertBobbleheadSchema>;
export type SelectBobblehead = z.infer<typeof selectBobbleheadSchema>;
export type UpdateBobblehead = z.infer<typeof updateBobbleheadSchema>;
export type UpdateBobbleheadInput = z.input<typeof updateBobbleheadSchema>;

// 2. Select schema (from database)
export const selectBobbleheadSchema = createSelectSchema(bobbleheads);

// 3. Insert schema (for creating new records)
export const insertBobbleheadSchema = createInsertSchema(bobbleheads, {
  // Use zod utilities for field validation
  name: zodMinMaxString({
    fieldName: 'Name',
    maxLength: SCHEMA_LIMITS.BOBBLEHEAD.NAME.MAX,
    minLength: SCHEMA_LIMITS.BOBBLEHEAD.NAME.MIN,
  }),
  description: zodMaxString({
    fieldName: 'Description',
    maxLength: SCHEMA_LIMITS.BOBBLEHEAD.DESCRIPTION.MAX,
  }).optional(),
  category: zodMaxString({
    fieldName: 'Category',
    maxLength: SCHEMA_LIMITS.BOBBLEHEAD.CATEGORY.MAX,
  }).optional(),

  // Required UUID reference
  collectionId: z.uuid('Collection is required'),

  // Optional UUID reference
  subcollectionId: zodNullableUUID('Subcollection ID'),

  // Enum with default
  status: z.enum(ENUMS.BOBBLEHEAD.STATUS).default(DEFAULTS.BOBBLEHEAD.STATUS),
  currentCondition: z.enum(ENUMS.BOBBLEHEAD.CONDITION).default(DEFAULTS.BOBBLEHEAD.CONDITION),

  // Boolean with default
  isPublic: z.boolean().default(DEFAULTS.BOBBLEHEAD.IS_PUBLIC),

  // Decimal fields
  purchasePrice: zodDecimal({ fieldName: 'Purchase Price' }).optional(),
  height: zodDecimal({ fieldName: 'Height' }).optional(),

  // Year field
  year: zodYear({ fieldName: 'Year' }).optional(),
}).omit({
  // Always omit auto-generated fields
  commentCount: true,
  createdAt: true,
  deletedAt: true,
  id: true,
  isDeleted: true,
  likeCount: true,
  slug: true,
  updatedAt: true,
  userId: true,
  viewCount: true,
});

// 4. Update schema (extends insert with ID)
export const updateBobbleheadSchema = insertBobbleheadSchema.extend({
  id: z.uuid({ error: 'Bobblehead ID is required' }),
});

// 5. Delete schema (simple ID-only schema)
export const deleteBobbleheadSchema = z.object({
  bobbleheadId: z.uuid(),
});

// 6. Public schema (for API responses)
export const publicBobbleheadSchema = selectBobbleheadSchema;
```

---

## Type Export Patterns

### Why Both Input and Output Types?

Zod transforms can change types during validation. Forms need the **input type** (before transforms), while server code needs the **output type** (after transforms).

```typescript
// Example: zodDecimal transforms string -> number | null
purchasePrice: zodDecimal({ fieldName: 'Purchase Price' }).optional();
// Input type: string | undefined
// Output type: number | null | undefined

// Form field uses input type (user types a string)
const form = useAppForm<InsertBobbleheadInput>({
  defaultValues: { purchasePrice: '' }, // string!
});

// Server action uses output type (receives number after validation)
const data = insertBobbleheadSchema.parse(ctx.sanitizedInput);
// data.purchasePrice is number | null | undefined
```

### Type Export Convention

```typescript
// Output types (after transforms) - for server code
export type InsertBobblehead = z.infer<typeof insertBobbleheadSchema>;
export type UpdateBobblehead = z.infer<typeof updateBobbleheadSchema>;
export type SelectBobblehead = z.infer<typeof selectBobbleheadSchema>;

// Input types (before transforms) - for forms
export type InsertBobbleheadInput = z.input<typeof insertBobbleheadSchema>;
export type UpdateBobbleheadInput = z.input<typeof updateBobbleheadSchema>;
```

---

## Schema Composition Patterns

### Extending Base Schemas

Use `.extend()` to add fields for specific use cases:

```typescript
// Base insert schema
export const insertBobbleheadSchema = createInsertSchema(bobbleheads, {...}).omit({...});

// Extended schema for create action with photos
export const createBobbleheadWithPhotosSchema = insertBobbleheadSchema.extend({
  photos: cloudinaryPhotosValidationSchema.default([]),
  tags: z.array(z.string()).default([]).optional(),
});

// Extended schema for update action
export const updateBobbleheadWithPhotosSchema = updateBobbleheadSchema.extend({
  photos: cloudinaryPhotosValidationSchema.default([]),
  tags: z.array(z.string()).default([]).optional(),
});
```

### Reusing Schemas Across Domains

```typescript
// In comment.validation.ts
import { insertCommentSchema } from '@/lib/validations/social.validation';

export const createCommentSchema = insertCommentSchema.extend({
  parentCommentId: z.string().uuid('Invalid parent comment ID').optional(),
});
```

---

## Action-Specific Schemas

For server actions, create focused schemas with only required fields:

```typescript
// Simple ID-based action schemas
export const deleteBobbleheadSchema = z.object({
  bobbleheadId: z.uuid(),
});

export const getBobbleheadByIdSchema = z.object({
  id: z.uuid(),
});

// Slug-based lookup schema
export const getBobbleheadBySlugSchema = z.object({
  slug: z
    .string()
    .min(SLUG_MIN_LENGTH, { message: `Slug must be at least ${SLUG_MIN_LENGTH} character long` })
    .max(SLUG_MAX_LENGTH, { message: `Slug cannot exceed ${SLUG_MAX_LENGTH} characters` })
    .regex(SLUG_PATTERN, {
      message: 'Slug must contain only lowercase letters, numbers, and hyphens',
    }),
});

// Multi-field action schema
export const reorderPhotosSchema = z.object({
  bobbleheadId: z.uuid({ message: 'Bobblehead ID is required' }),
  photoOrder: z
    .array(
      z.object({
        id: z.uuid({ message: 'Photo ID is required' }),
        isPrimary: z.boolean().optional(),
        sortOrder: z.number().min(0, { message: 'Sort order must be non-negative' }),
      }),
    )
    .min(1, { message: 'At least one photo is required for reordering' }),
});
```

---

## Pagination Schema Pattern

Use `z.coerce` for URL query parameters that come as strings:

```typescript
export const paginationSchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(DEFAULTS.PAGINATION.MAX_LIMIT, `Maximum limit is ${DEFAULTS.PAGINATION.MAX_LIMIT}`)
    .default(DEFAULTS.PAGINATION.LIMIT),
  offset: z.coerce.number().int().min(0).default(DEFAULTS.PAGINATION.OFFSET),
});

// Usage in a query schema
export const getCommentsSchema = z.object({
  pagination: paginationSchema.optional().default({
    limit: DEFAULTS.PAGINATION.LIMIT,
    offset: DEFAULTS.PAGINATION.OFFSET,
  }),
  targetId: z.string().uuid('Invalid target ID'),
  targetType: z.enum(ENUMS.COMMENT.TARGET_TYPE),
});
```

---

## Form Integration

### TanStack Form Setup

```typescript
'use client';

import { revalidateLogic } from '@tanstack/form-core';

import { useAppForm } from '@/components/ui/form';
import { useServerAction } from '@/hooks/use-server-action';
import { createBobbleheadAction } from '@/lib/actions/bobbleheads/bobbleheads.actions';
import type { InsertBobbleheadInput } from '@/lib/validations/bobbleheads.validation';
import { insertBobbleheadSchema } from '@/lib/validations/bobbleheads.validation';

export const CreateBobbleheadForm = ({ collectionId }: { collectionId: string }) => {
  const { executeAsync, isExecuting } = useServerAction(createBobbleheadAction, {
    toastMessages: {
      error: 'Failed to create bobblehead',
      loading: 'Creating bobblehead...',
      success: 'Bobblehead created!',
    },
  });

  // Use INPUT type for form - this is the type before transforms
  const form = useAppForm<InsertBobbleheadInput>({
    defaultValues: {
      collectionId,
      description: '',
      isPublic: true,
      name: '',
      purchasePrice: '', // String! zodDecimal expects string input
      year: '',          // String! zodYear expects string input
    },
    onSubmit: async ({ value }) => {
      await executeAsync(value);
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    validators: {
      onSubmit: insertBobbleheadSchema, // Zod schema validates on submit
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(); }}>
      <form.AppField name={'name'}>
        {(field) => <field.TextField isRequired label={'Name'} />}
      </form.AppField>

      <form.AppField name={'purchasePrice'}>
        {(field) => <field.TextField label={'Purchase Price'} />}
      </form.AppField>

      <Button disabled={isExecuting} type={'submit'}>
        {isExecuting ? 'Creating...' : 'Create'}
      </Button>
    </form>
  );
};
```

---

## Server Action Validation

### Critical: Always Parse sanitizedInput

```typescript
export const createBobbleheadAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.CREATE,
    isTransactionRequired: true,
  })
  .inputSchema(createBobbleheadWithPhotosSchema)
  .action(async ({ ctx, parsedInput }) => {
    // CORRECT: Parse sanitizedInput through schema
    const data = createBobbleheadWithPhotosSchema.parse(ctx.sanitizedInput);

    // WRONG: Never use parsedInput directly
    // const data = parsedInput; // Don't do this!

    const dbInstance = ctx.db;
    // ... rest of action
  });
```

---

## Constants Integration

Always use constants from `@/lib/constants` - never hardcode values:

```typescript
// In src/lib/constants/index.ts
export const SCHEMA_LIMITS = {
  BOBBLEHEAD: {
    NAME: { MIN: 1, MAX: 100 },
    DESCRIPTION: { MAX: 2000 },
    CATEGORY: { MAX: 50 },
  },
  BOBBLEHEAD_PHOTO: {
    ALT_TEXT: { MAX: 200 },
    CAPTION: { MAX: 500 },
    URL: { MIN: 1, MAX: 2048 },
  },
};

export const DEFAULTS = {
  BOBBLEHEAD: {
    STATUS: 'active' as const,
    CONDITION: 'mint' as const,
    IS_PUBLIC: true,
    IS_FEATURED: false,
  },
  PAGINATION: {
    LIMIT: 20,
    MAX_LIMIT: 100,
    OFFSET: 0,
  },
};

export const ENUMS = {
  BOBBLEHEAD: {
    STATUS: ['active', 'retired', 'sold'] as const,
    CONDITION: ['mint', 'excellent', 'good', 'fair', 'poor'] as const,
  },
};
```

---

## Fields to Omit

### Insert Schemas - Always Omit Auto-Generated Fields

```typescript
.omit({
  commentCount: true,   // Computed field
  createdAt: true,      // Auto-generated by DB
  deletedAt: true,      // Soft-delete tracking
  id: true,             // Auto-generated by DB
  isDeleted: true,      // Soft-delete flag
  likeCount: true,      // Computed field
  slug: true,           // Auto-generated from name
  updatedAt: true,      // Auto-generated by DB
  userId: true,         // Set by server from auth context
  viewCount: true,      // Computed field
})
```

### Public Schemas - Omit Internal Fields

```typescript
export const publicBobbleheadSchema = selectBobbleheadSchema.omit({
  deletedAt: true,
  isDeleted: true,
});
```

---

## Common Field Patterns

### UUID Fields

```typescript
// Required UUID (use z.uuid directly)
collectionId: z.uuid('Collection is required'),
bobbleheadId: z.uuid({ message: 'Bobblehead ID is required' }),

// Optional UUID with null default
subcollectionId: zodNullableUUID('Subcollection ID'),

// UUID in standalone schemas
export const deleteBobbleheadSchema = z.object({
  bobbleheadId: z.uuid(),
});
```

### Enum Fields

```typescript
// Required enum with default
status: z.enum(ENUMS.BOBBLEHEAD.STATUS).default(DEFAULTS.BOBBLEHEAD.STATUS),

// Required enum without default
targetType: z.enum(ENUMS.COMMENT.TARGET_TYPE, {
  message: 'Target must be a bobblehead, collection, or subcollection',
}),
```

### Boolean Fields

```typescript
// Boolean with default
isPublic: z.boolean().default(DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
isFeatured: z.boolean().default(DEFAULTS.BOBBLEHEAD.IS_FEATURED),
isPrimary: z.boolean().default(DEFAULTS.BOBBLEHEAD_PHOTO.IS_PRIMARY).optional(),
```

### URL Fields

```typescript
// Required URL
url: z.url().min(SCHEMA_LIMITS.PHOTO.URL.MIN).max(SCHEMA_LIMITS.PHOTO.URL.MAX).trim(),

// Optional URL
coverImageUrl: z.url().optional(),
```

### Array Fields

```typescript
// Array with default
tags: z.array(z.string()).default([]).optional(),

// Array of objects
photoOrder: z.array(
  z.object({
    id: z.uuid(),
    sortOrder: z.number().min(0),
  }),
).min(1, 'At least one item required'),

// Transform empty array to null
customFields: customFieldsSchema
  .array()
  .transform((val) => {
    if (!val || val.length === 0) return null;
    return val;
  })
  .optional(),
```

---

## Anti-Patterns to Avoid

### 1. Never Use Raw Zod Chains for Common Patterns

```typescript
// ❌ Wrong
name: z.string().min(1, 'Name is required').max(100, 'Name is too long').trim(),

// ✅ Correct
name: zodMinMaxString({
  fieldName: 'Name',
  maxLength: SCHEMA_LIMITS.ENTITY.NAME.MAX,
  minLength: SCHEMA_LIMITS.ENTITY.NAME.MIN,
}),
```

### 2. Never Hardcode Limits or Defaults

```typescript
// ❌ Wrong
description: z.string().max(2000),
isPublic: z.boolean().default(true),

// ✅ Correct
description: zodMaxString({ fieldName: 'Description', maxLength: SCHEMA_LIMITS.ENTITY.DESCRIPTION.MAX }),
isPublic: z.boolean().default(DEFAULTS.ENTITY.IS_PUBLIC),
```

### 3. Never Skip Type Exports

```typescript
// ❌ Wrong - no type exports
export const insertEntitySchema = createInsertSchema(entities);

// ✅ Correct - export both input and output types
export type InsertEntity = z.infer<typeof insertEntitySchema>;
export type InsertEntityInput = z.input<typeof insertEntitySchema>;
export const insertEntitySchema = createInsertSchema(entities, {...});
```

### 4. Never Use parsedInput in Actions

```typescript
// ❌ Wrong
.action(async ({ parsedInput }) => {
  const data = parsedInput; // Type unsafe!
});

// ✅ Correct
.action(async ({ ctx }) => {
  const data = schema.parse(ctx.sanitizedInput);
});
```

### 5. Never Use `.string().uuid()` When `.uuid()` Exists

```typescript
// ❌ Wrong
id: z.string().uuid('Invalid ID'),

// ✅ Correct
id: z.uuid('Invalid ID'),
id: z.uuid({ message: 'Invalid ID' }),
```

### 6. Never Forget Form Input Types

```typescript
// ❌ Wrong - using output type for form
const form = useAppForm<InsertBobblehead>({
  // Output type!
  defaultValues: {
    purchasePrice: 0, // Wrong! Form receives string input
  },
});

// ✅ Correct - using input type for form
const form = useAppForm<InsertBobbleheadInput>({
  // Input type!
  defaultValues: {
    purchasePrice: '', // Correct! Form field value is string
  },
});
```
