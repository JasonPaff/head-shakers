# Step 2: File Discovery Log

## Metadata

- **Step**: 2 - AI-Powered File Discovery
- **Started**: 2026-01-13T00:01:00.000Z
- **Completed**: 2026-01-13T00:03:00.000Z
- **Status**: Success

---

## Input: Refined Feature Request

The Add/Edit Bobblehead Form is a dual-mode form component built with TanStack React Form and integrated with Next-Safe-Action server actions, located within the user dashboard collection management interface at the appropriate route under src/app/(app)/. The form supports both creation of new bobbleheads and modification of existing entries, with the edit mode pre-populating all fields from the existing record.

---

## Agent Prompt Sent

```
Discover all files relevant to implementing this feature:

**Feature Request:**
The Add/Edit Bobblehead Form is a dual-mode form component...

**Project Structure:**
- src/app/(app)/ - App routes
- src/components/ui/ - Reusable UI components
- src/components/feature/ - Feature-specific components
- src/lib/db/ - Database schema
- src/lib/actions/ - Server actions
- src/lib/queries/ - Database queries
- src/lib/facades/ - Business logic layer
- src/lib/validations/ - Zod schemas

**Instructions:**
1. Search for existing bobblehead-related files
2. Search for existing collection-related files
3. Search for existing form patterns
4. Search for photo/image upload patterns
5. Search for existing validation schemas patterns
6. Search for existing server action patterns
7. Search for existing facade patterns
```

---

## Discovered Files Summary

**Total Files Discovered**: 25+ highly relevant files
**Directories Explored**: 15+
**Files Examined**: 50+

---

## Files by Priority

### Critical Priority (Must Create/Modify)

| File Path | Action | Description |
|-----------|--------|-------------|
| `src/app/(app)/user/[username]/dashboard/collection/components/async/add-bobblehead-form-async.tsx` | MODIFY | Server component stub - needs form rendering logic |
| `src/app/(app)/user/[username]/dashboard/collection/components/async/edit-bobblehead-form-async.tsx` | MODIFY | Server component stub for edit mode |
| `src/components/feature/bobblehead/hooks/use-bobblehead-upsert-form.ts` | CREATE | Custom hook for form state management |
| `src/components/feature/bobblehead/bobblehead-upsert-form.tsx` | CREATE | Client component with dual-mode form UI |
| `src/components/feature/bobblehead/bobblehead-form-fields.tsx` | CREATE | Form fields component |

### High Priority (Patterns to Follow)

| File Path | Relevance |
|-----------|-----------|
| `src/lib/validations/bobbleheads.validation.ts` | **EXISTING** - `createBobbleheadWithPhotosSchema`, `updateBobbleheadWithPhotosSchema` already exist |
| `src/lib/actions/bobbleheads/bobbleheads.actions.ts` | **EXISTING** - Server actions already implemented with auth, rate limiting, Sentry |
| `src/lib/facades/bobbleheads/bobbleheads.facade.ts` | **EXISTING** - `createWithPhotosAsync`, `updateAsync` with transactions |
| `src/components/feature/collections/hooks/use-collection-upsert-form.ts` | Pattern for dual-mode form hook |
| `src/components/feature/collections/collection-upsert-dialog.tsx` | Pattern for form structure |
| `src/components/feature/collections/collection-form-fields.tsx` | Pattern for form field composition |
| `src/components/ui/form/index.tsx` | Form system exports (`useAppForm`, field components) |
| `src/components/ui/cloudinary-photo-upload.tsx` | Photo upload component with full Cloudinary integration |

### Medium Priority (Integration/Reference)

| File Path | Relevance |
|-----------|-----------|
| `src/lib/db/schema/bobbleheads.schema.ts` | Database schema with field definitions |
| `src/lib/queries/bobbleheads/bobbleheads.query.ts` | Query layer methods |
| `src/lib/queries/collections/collections-dashboard.query.ts` | `getSelectorsByUserIdAsync` for collection dropdown |
| `src/lib/facades/bobbleheads/bobbleheads-dashboard.facade.ts` | `getUserCollectionSelectorsAsync`, `getBobbleheadForEditAsync` |
| `src/hooks/use-server-action.ts` | Server action execution hook |
| `src/lib/utils/next-safe-action.ts` | Action client configuration |
| `src/lib/validations/collections.validation.ts` | Validation schema patterns |
| `src/lib/validations/photo-upload.validation.ts` | Photo validation schemas |
| `src/app/(app)/user/[username]/dashboard/collection/route-type.ts` | Route definition with `add`/`edit` params |
| `src/app/(app)/user/[username]/dashboard/collection/page.tsx` | Page rendering form components |

### Low Priority (Context/Constants)

| File Path | Relevance |
|-----------|-----------|
| `src/lib/constants/schema-limits.ts` | Field length limits |
| `src/lib/constants/defaults.ts` | Default values |
| `src/lib/constants/enums.ts` | Enum values for dropdowns |
| `src/lib/utils/zod.utils.ts` | Custom Zod utilities |
| `src/components/ui/form/field-components/select-field.tsx` | Select field component |
| `src/components/ui/form/field-components/combobox-field.tsx` | Combobox for collection selector |
| `src/lib/constants/cloudinary-paths.ts` | Cloudinary path builder |
| `tests/fixtures/bobblehead.factory.ts` | Test factory |
| `tests/mocks/data/bobbleheads.mock.ts` | Mock data |

---

## Key Architecture Insights

### Existing Infrastructure (No Changes Needed)

1. **Validation Schemas**: `createBobbleheadWithPhotosSchema` and `updateBobbleheadWithPhotosSchema` are complete
2. **Server Actions**: Both actions fully implemented with auth, rate limiting, transactions, Sentry
3. **Facade Layer**: `BobbleheadsFacade` methods complete with cache invalidation
4. **Dashboard Facade**: Provides `getUserCollectionSelectorsAsync` and `getBobbleheadForEditAsync`

### Form System Patterns

- `useAppForm` hook for form creation
- Field components: `TextField`, `TextareaField`, `SelectField`, `SwitchField`, `ComboboxField`, `TagField`
- `SubmitButton` component
- `withFocusManagement` HOC for accessibility
- `revalidateLogic` for validation timing

### Collection Selector Integration

Use `ComboboxField` with data from `BobbleheadsDashboardFacade.getUserCollectionSelectorsAsync()`

### Photo Upload Integration

`CloudinaryPhotoUpload` component already integrated with drag-drop, progress, reordering, metadata editing

---

## Field Definitions (From Schema)

**Required**:
- `name` (string, 1-50 chars)
- `collectionId` (UUID)

**Optional - Basic Info**:
- `description` (max 500), `characterName` (max 100), `category` (max 50)
- `series` (max 100), `manufacturer` (max 100), `year` (1800 to current+5)

**Optional - Acquisition**:
- `acquisitionDate`, `acquisitionMethod` (max 50), `purchaseLocation` (max 100)
- `purchasePrice` (decimal 10:2)

**Optional - Physical**:
- `height` (decimal 5:2), `weight` (decimal 6:2), `material` (max 100)
- `currentCondition` (enum, default: excellent)

**Optional - Settings**:
- `status` (enum, default: owned), `isPublic` (default: true), `isFeatured` (default: false)

**Optional - Custom**:
- `customFields` (array of key-value), `tags` (string array)

**Photos**:
- `photos` (array of CloudinaryPhoto, max 8)

---

## Validation Results

- **Minimum Files Check**: PASS - 25+ files discovered (requirement: 3+)
- **AI Analysis Quality**: PASS - Detailed reasoning provided
- **File Validation**: PASS - All file paths validated
- **Coverage Check**: PASS - All architectural layers covered
- **Pattern Recognition**: PASS - Existing infrastructure identified

---

## Discovery Statistics

- **Files to Create**: 3
- **Files to Modify**: 2
- **Pattern Reference Files**: 8
- **Integration Files**: 10
- **Context Files**: 9
