# Step 1: Extend Content Report Type with Slug Information

**Timestamp**: 2025-11-24
**Specialist**: validation-specialist
**Status**: SUCCESS

## Step Details

**What**: Create a new extended type that includes slug fields needed for content linking
**Why**: The current SelectContentReport type only includes targetId, but we need slugs for type-safe routing

## Skills Loaded

- validation-schemas: `.claude/skills/validation-schemas/references/Validation-Schemas-Conventions.md`

## Files Modified

| File                                         | Changes                                                                                   |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| src/lib/validations/moderation.validation.ts | Added `selectContentReportWithSlugsSchema` and `SelectContentReportWithSlugs` type export |

## Conventions Applied

- Used `.extend()` pattern to extend base schema
- Used `z.infer<typeof schema>` for type export
- Type naming follows `Select{Entity}` convention
- Schema naming follows `select{Entity}Schema` convention
- Used `z.string().nullable()` for optional slug fields
- Used `z.boolean()` for contentExists flag

## Validation Results

| Command           | Result |
| ----------------- | ------ |
| npm run lint:fix  | PASS   |
| npm run typecheck | PASS   |

## Success Criteria

- [x] New type is exported from moderation.validation.ts
- [x] Type includes all necessary slug fields for routing
- [x] All validation commands pass

## Notes for Next Steps

- The new `SelectContentReportWithSlugs` type extends `SelectContentReport` with:
  - `targetSlug: string | null` - for bobbleheads, collections, subcollections
  - `parentCollectionSlug: string | null` - for subcollections only
  - `contentExists: boolean` - to determine if content was deleted
- This type is ready to be used in the query layer (Step 2)
