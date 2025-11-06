# Step 2: File Discovery

## Metadata

- **Step**: 2 of 3
- **Status**: ✅ Completed
- **Started**: 2025-10-25T00:01:30Z
- **Completed**: 2025-10-25T00:03:45Z
- **Duration**: 135 seconds
- **Subagent**: file-discovery-agent
- **Discovery Method**: AI-Powered Comprehensive Analysis

## Input Context

**Refined Feature Request** (from Step 1):
Implement a bobblehead details editing feature that enables authenticated users to modify the information of their existing bobbleheads through a dedicated edit form accessible from the bobblehead detail page or user's collection management interface, leveraging the existing Next.js 15.5.3 App Router architecture with React 19.1.0 and integrating seamlessly with the current Clerk authentication system to ensure users can only edit bobbleheads they own. The implementation should utilize TanStack React Form for form state management and user interactions, with comprehensive Zod validation schemas defined in the lib/validations directory to ensure data integrity for all editable fields including bobblehead name, description, manufacturer, year of production, condition, acquisition date, acquisition price, estimated value, category, subcategory, rarity, and any custom fields, while maintaining type safety through the existing Drizzle ORM schema definitions.

## Agent Prompt

```
Analyze the Head Shakers codebase to identify ALL files relevant to implementing this feature:

**Refined Feature Request**: [449-word refined request]

**Required Analysis**:
1. Find ALL existing bobblehead-related files (schemas, actions, queries, validations, components, pages)
2. Identify similar edit functionality in the codebase for reference
3. Locate form components and validation patterns to follow
4. Find authentication/authorization utilities
5. Discover cache invalidation and data fetching patterns

**Deliverable**: Comprehensive list of files categorized by:
- CRITICAL: Must modify for core functionality
- HIGH: Likely need modification or heavy reference
- MEDIUM: May need modification or serve as patterns
- LOW: Useful context but minimal changes

IMPORTANT: Discover minimum 5 relevant files. Use glob patterns, grep searches, and file reading to find all relevant files.
```

## Discovery Statistics

- **Total Files Discovered**: 45 files
- **Directories Explored**: 15+
- **Candidate Files Examined**: 50+
- **Minimum Requirement**: 5 files ✅
- **Discovery Coverage**: Comprehensive (all architectural layers)

## Discovered Files by Priority

### CRITICAL Priority (12 files)

Files that **MUST** be modified for core functionality:

1. **`src/lib/db/schema/bobbleheads.schema.ts`**
   - Database schema definition
   - All bobblehead fields and validation constraints
   - Photo table relationships

2. **`src/lib/db/schema/index.ts`**
   - Schema exports

3. **`src/lib/validations/bobbleheads.validation.ts`**
   - **MISSING**: `updateBobbleheadSchema` and `updateBobbleheadWithPhotosSchema`
   - Has insert schemas as patterns

4. **`src/lib/queries/bobbleheads/bobbleheads-query.ts`**
   - **MISSING**: `updateAsync` method
   - Has create, delete, findById methods

5. **`src/lib/facades/bobbleheads/bobbleheads.facade.ts`**
   - **MISSING**: `updateAsync` business logic
   - Coordinates photos, tags, cache

6. **`src/lib/actions/bobbleheads/bobbleheads.actions.ts`**
   - **MISSING**: `updateBobbleheadWithPhotosAction`
   - Has create and delete actions as patterns

7. **`src/app/(app)/bobbleheads/[bobbleheadId]/edit/page.tsx`**
   - Currently placeholder
   - Edit page route exists but needs implementation

8. **`src/app/(app)/bobbleheads/[bobbleheadId]/edit/loading.tsx`**
   - Loading state for edit page

9. **`src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-header.tsx`**
   - Lines 76-79: Placeholder edit button
   - Needs wiring to edit functionality

10. **`src/components/feature/bobblehead/bobblehead-edit-dialog.tsx`**
    - **NEW FILE NEEDED**: Edit dialog component
    - Alternative to full page approach

11. **`src/components/feature/bobblehead/edit-item-form-options.ts`**
    - **NEW FILE NEEDED**: Form configuration
    - Similar to add-item-form-options.ts

12. **`src/lib/services/cache-revalidation.service.ts`**
    - **NEEDS**: `onUpdate` method for bobbleheads section
    - Has onCreate for pattern

### HIGH Priority (15 files)

Files likely needing modification or serving as key references:

**Form Pattern References (Add Form):**

13. **`src/app/(app)/bobbleheads/add/components/add-item-form-client.tsx`**
    - Complete TanStack Form implementation
    - 150 lines of form handling patterns

14. **`src/app/(app)/bobbleheads/add/components/add-item-form-options.ts`**
    - Form configuration and default values

15. **`src/app/(app)/bobbleheads/add/components/basic-information.tsx`**
    - Name, description, manufacturer, year fields

16. **`src/app/(app)/bobbleheads/add/components/acquisition-details.tsx`**
    - Acquisition date, method, location, price

17. **`src/app/(app)/bobbleheads/add/components/physical-attributes.tsx`**
    - Height, weight, material, condition

18. **`src/app/(app)/bobbleheads/add/components/item-photos.tsx`**
    - Photo upload and Cloudinary integration

19. **`src/app/(app)/bobbleheads/add/components/item-tags.tsx`**
    - Tag selection and management

20. **`src/app/(app)/bobbleheads/add/components/custom-fields.tsx`**
    - Custom metadata fields (JSONB)

21. **`src/app/(app)/bobbleheads/add/components/item-settings.tsx`**
    - Privacy and status settings

22. **`src/app/(app)/bobbleheads/add/components/collection-assignment.tsx`**
    - Collection/subcollection selection

**Edit Pattern Reference (Collection):**

23. **`src/components/feature/collections/collection-edit-dialog.tsx`**
    - Complete edit dialog pattern
    - Modal approach with form

24. **`src/lib/actions/collections/collections.actions.ts`**
    - `updateCollectionAction` implementation pattern

**Constants:**

25. **`src/lib/constants/action-names.ts`**
    - Has placeholder: `BOBBLEHEADS.UPDATE` (line 44)

26. **`src/lib/constants/operations.ts`**
    - Has placeholder: `BOBBLEHEADS.UPDATE` (line 36)

27. **`src/lib/constants/schema-limits.ts`**
    - Field length limits for validation

### MEDIUM Priority (10 files)

Files that may need modification or serve as patterns:

**Authentication & Authorization:**

28. **`src/lib/utils/next-safe-action.ts`**
    - `authActionClient` configuration

29. **`src/lib/queries/base/permission-filters.ts`**
    - `buildOwnershipFilter` for authorization

30. **`src/lib/queries/base/query-context.ts`**
    - Query context with user ID

31. **`src/lib/queries/base/base-query.ts`**
    - Base query class utilities

**Cloudinary & Photos:**

32. **`src/lib/services/cloudinary.service.ts`**
    - Photo deletion and batch operations

33. **`src/lib/validations/photo-upload.validation.ts`**
    - Photo validation schemas

**Query Patterns:**

34. **`src/lib/queries/collections/collections.query.ts`**
    - `updateAsync` implementation pattern

35. **`src/lib/facades/collections/collections.facade.ts`**
    - Update facade pattern

**Hooks & Utilities:**

36. **`src/hooks/use-server-action.ts`**
    - Toast notifications, loading states

37. **`src/components/ui/form/index.tsx`**
    - TanStack Form hook configuration

### LOW Priority (8 files)

Useful context but minimal changes needed:

**UI Form Components (Reusable):**

38. **`src/components/ui/form/field-components/text-field.tsx`**
39. **`src/components/ui/form/field-components/textarea-field.tsx`**
40. **`src/components/ui/form/field-components/select-field.tsx`**
41. **`src/components/ui/form/field-components/switch-field.tsx`**
42. **`src/components/ui/form/form-components/submit-button.tsx`**

**UI Components:**

43. **`src/components/ui/dialog.tsx`**
44. **`src/components/ui/button.tsx`**

**Existing Pages:**

45. **`src/app/(app)/bobbleheads/add/page.tsx`**

## File Path Validation

All file paths validated for existence and accessibility:

| Status         | Count | Description                                 |
| -------------- | ----- | ------------------------------------------- |
| ✅ Exists      | 43    | Files confirmed to exist in codebase        |
| 📝 Create      | 2     | New files needed for implementation         |
| ⚠️ Placeholder | 1     | Exists but needs implementation (edit page) |

**Files Requiring Creation:**

- `src/components/feature/bobblehead/bobblehead-edit-dialog.tsx`
- `src/components/feature/bobblehead/edit-item-form-options.ts`

**Files Requiring Implementation:**

- `src/app/(app)/bobbleheads/[bobbleheadId]/edit/page.tsx` (currently placeholder)

## Architecture Analysis

### Layered Architecture Pattern Identified

```
Database Schema (Drizzle)
    ↓
Validation Layer (Zod/Drizzle-Zod)
    ↓
Query Layer (BobbleheadsQuery)
    ↓
Facade Layer (BobbleheadsFacade)
    ↓
Server Actions (Next-Safe-Action)
    ↓
UI Components (React/TanStack Form)
```

### Key Patterns Discovered

1. **Update Pattern** (from Collections):
   - Validation: Extend insert schema with ID field
   - Query: `updateAsync(data, userId)` with ownership check
   - Facade: Wrap query with error handling
   - Action: `authActionClient` with transactions

2. **Form Handling**:
   - TanStack Form with `useAppForm` hook
   - Form options configuration file
   - `withFocusManagement` HOC
   - `useServerAction` for submission

3. **Photo Management**:
   - Upload to temp folder → Move to permanent on save
   - CloudinaryService for deletions
   - Database records with URLs

4. **Authorization**:
   - `authActionClient` requires authentication
   - Ownership validation: `eq(bobbleheads.userId, userId)`
   - UI conditional rendering with `isOwner`

5. **Cache Invalidation**:
   - CacheRevalidationService pattern
   - Need `.onUpdate()` method

## Integration Points Identified

1. **Photo Management**: Upload, delete, reorder existing photos
2. **Custom Fields**: Dynamic JSONB field handling
3. **Tag Updates**: Compare and sync tag changes
4. **Collection Assignment**: May need read-only in edit
5. **Authorization**: Ownership verification
6. **Cache Invalidation**: Multiple affected views

## Implementation Approaches

### Option A: Full Page Edit

- Uses existing `/edit` route
- More space for complex form
- Implement `bobbleheads/[bobbleheadId]/edit/page.tsx`

### Option B: Modal Dialog Edit ⭐ **RECOMMENDED**

- Faster UX, no navigation
- Matches collection edit pattern
- Create `bobblehead-edit-dialog.tsx`
- Easier to implement

## Existing Implementation Plan Found

Located: `docs/2025_09_19/plans/bobblehead-edit-button-implementation-plan.md`

This plan provides additional context and can be referenced for implementation details.

## AI Analysis Metrics

- **Analysis Duration**: 135 seconds
- **File Read Operations**: 50+ files examined
- **Pattern Matching**: 5 architectural layers analyzed
- **Integration Points**: 6 identified
- **Discovery Coverage**: All major components covered

## Validation Results

| Check                 | Status  | Notes                        |
| --------------------- | ------- | ---------------------------- |
| Minimum Files (5+)    | ✅ Pass | Discovered 45 files          |
| Path Validation       | ✅ Pass | All existing files confirmed |
| Categorization        | ✅ Pass | 4 priority levels assigned   |
| Architecture Coverage | ✅ Pass | All layers represented       |
| Pattern Recognition   | ✅ Pass | Update patterns identified   |
| Integration Points    | ✅ Pass | 6 integration points found   |

## Next Steps

- Proceed to Step 3: Implementation Planning
- Use discovered files and patterns for detailed plan generation
- Reference collection edit pattern for modal approach
- Follow layered architecture for implementation sequence
