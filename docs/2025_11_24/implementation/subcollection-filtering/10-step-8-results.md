# Step 8: Update Validation Schemas

**Step**: 8/10
**Specialist**: validation-specialist
**Status**: ✓ Success
**Duration**: ~2 minutes

## Objective

Add validation schemas for subcollection filter parameters

## Skills Loaded

- **validation-schemas**: Validation-Schemas-Conventions.md

## Changes Made

### Files Modified

**src/lib/validations/collections.validation.ts**

- Added `subcollectionFilterSchema` with two fields:
  - `subcollectionId`: Uses `zodNullableUUID` utility for optional UUID with null default
  - `view`: Enum validation for three-state filtering ('all', 'collection', 'subcollection')
- Exported `SubcollectionFilter` type using `z.infer`

### Schema Structure

```typescript
export const subcollectionFilterSchema = z.object({
  subcollectionId: zodNullableUUID,
  view: z.enum(['all', 'collection', 'subcollection'], {
    errorMap: () => ({ message: 'View must be all, collection, or subcollection' }),
  }),
});

export type SubcollectionFilter = z.infer<typeof subcollectionFilterSchema>;
```

## Conventions Applied

- ✓ Used custom zod utility (`zodNullableUUID`) instead of raw zod chains
- ✓ Exported types using `z.infer<typeof schema>` pattern
- ✓ Schema naming follows `{operation}{Entity}Schema` pattern
- ✓ Type naming follows `{Operation}{Entity}` pattern
- ✓ Type exports before schema definitions for IDE support
- ✓ z.enum with custom error message for view state
- ✓ Imported zodNullableUUID from '@/lib/utils/zod.utils'

## Validation Results

### ESLint

✓ Passed - No errors or warnings

### TypeScript

✓ Passed - No compilation errors

## Success Criteria

- [✓] Zod schema validates subcollection filter parameter correctly
- [✓] Schema handles all filter modes (all/collection/specific)
- [✓] Type exports available for use across application
- [✓] All validation commands pass

## Notes for Next Steps

**Schema Usage**:

- Server components reading URL search params
- Client components managing filter state with Nuqs
- Server actions accepting filter parameters

**Three-State Support**:

- `view: 'all'` + `subcollectionId: null` → All bobbleheads
- `view: 'collection'` + `subcollectionId: null` → Main collection only
- `view: 'subcollection'` + `subcollectionId: uuid` → Specific subcollection

**Validation Benefits**:

- Type-safe filter parameters throughout the stack
- Consistent UUID validation using project utility
- Clear error messages for invalid view states
