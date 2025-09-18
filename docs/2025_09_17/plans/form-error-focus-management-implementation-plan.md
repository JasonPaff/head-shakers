# Form Error Focus Management Implementation Plan

**Generated**: 2025-09-17T16:17:30Z
**Original Request**: The app uses tanstack-form with zod for forms. Tanstack-Form is headless and does not come with any built in focus management. The form components/integration in the app needs to be updated to focus the first errored field when invalid forms are submitted
**Refined Request**: Implement Focus Management for TanStack Form Error Handling

## Analysis Summary
- Feature request refined with Head Shakers platform context
- Discovered 25 files across form infrastructure, components, and implementations
- Generated 6-step implementation plan with type-safe architecture integration

## File Discovery Results

### Critical Priority (Core Form Infrastructure)
- `src/components/ui/form/index.tsx` - Main TanStack Form integration with `useAppForm` hook
- `src/components/ui/form/field-components/field-aria.tsx` - Current accessibility wrapper
- `src/components/ui/form/use-field-aria.ts` - Aria context management for field accessibility

### High Priority (Field Components Requiring Focus Support)
- `src/components/ui/form/field-components/text-field.tsx` - Text input field component
- `src/components/ui/form/field-components/textarea-field.tsx` - Textarea field component
- `src/components/ui/form/field-components/select-field.tsx` - Select dropdown field component
- `src/components/ui/form/field-components/combobox-field.tsx` - Combobox field component
- `src/components/ui/form/field-components/checkbox-field.tsx` - Checkbox field component
- `src/components/ui/form/field-components/switch-field.tsx` - Switch/toggle field component
- `src/components/ui/form/field-components/tag-field.tsx` - Tag input field component

### High Priority (Form Example Implementations)
- `src/components/feature/collections/collection-create-dialog.tsx` - Dialog-based form
- `src/app/(app)/bobbleheads/add/components/add-item-form-client.tsx` - Complex multi-step form
- `src/app/(app)/bobbleheads/add/components/basic-information.tsx` - Form section with `withForm` wrapper

### Supporting Files (15 additional files)
- Form infrastructure, base UI components, validation schemas, and utilities

## Implementation Plan

### Architecture Strategy
**Integration Approach**: Seamless integration with existing `useAppForm` hook and `FieldAria` accessibility wrapper, ensuring no breaking changes to current form implementations.

**Component Enhancement**: All field components will be enhanced to support focus management while maintaining their current APIs and functionality.

**Type Safety**: Comprehensive TypeScript definitions maintaining strict type safety throughout the focus management system.

**Accessibility Compliance**: Focus management respects existing accessibility attributes and follows accessibility guidelines.

**React 19 Compatibility**: Uses direct ref passing patterns consistent with React 19, avoiding deprecated `forwardRef` usage.

### Implementation Steps

#### Step 1: Establish Type-Safe Foundation
**Objective**: Create focus management types and interfaces
**Files Modified**: `src/components/ui/form/types.ts` (new file)
**Duration**: 30 minutes

- Define `FocusableElement` interface for field ref types
- Create `FocusRegistration` type for field focus tracking
- Establish `FocusManagementOptions` configuration interface
- Add `FieldFocusProps` for component prop typing

**Validation**: `npm run typecheck` must pass

#### Step 2: Enhance FieldAria Component
**Objective**: Add focus management capabilities to the accessibility wrapper
**Files Modified**: `src/components/ui/form/field-components/field-aria.tsx`
**Duration**: 45 minutes

- Add optional `focusRef` prop to `FieldAria` interface
- Implement focus registration logic within `FieldAria`
- Maintain existing accessibility attribute handling
- Ensure backward compatibility with existing field components

**Validation**: `npm run lint:fix && npm run typecheck` must pass

#### Step 3: Update All Field Components
**Objective**: Add focus support to all 7 field components
**Files Modified**: All field components in `src/components/ui/form/field-components/`
**Duration**: 90 minutes

- Add `focusRef` prop to each field component interface
- Pass `focusRef` through to `FieldAria` wrapper
- Handle special cases for ComboboxField (manual validation styling)
- Maintain existing component APIs and functionality

**Validation**: `npm run lint:fix && npm run typecheck` must pass for each component

#### Step 4: Integrate Focus Management into useAppForm
**Objective**: Enhance the core form hook with focus management
**Files Modified**: `src/components/ui/form/index.tsx`
**Duration**: 60 minutes

- Create `useFocusManagement` hook for field registration and focus logic
- Integrate focus management into `useAppForm` hook
- Provide focus registration callbacks to field components
- Ensure seamless integration with existing TanStack Form patterns

**Validation**: `npm run lint:fix && npm run typecheck` must pass

#### Step 5: Implement Error Detection and Focus Triggering
**Objective**: Add logic to detect errors and focus first errored field
**Files Modified**: `src/components/ui/form/index.tsx`
**Duration**: 75 minutes

- Implement error detection using TanStack Form's field meta state
- Create DOM traversal logic to find first errored field in document order
- Add debouncing to prevent excessive focus changes
- Handle edge cases for hidden fields and disabled components

**Validation**: `npm run lint:fix && npm run typecheck` must pass

#### Step 6: Comprehensive Testing and Validation
**Objective**: Test focus management across all existing forms
**Files Tested**: All form implementations discovered in file analysis
**Duration**: 120 minutes

- Test dialog-based forms (collection creation)
- Test complex multi-step forms (bobblehead creation)
- Test form sections with `withForm` wrapper
- Validate accessibility compliance and keyboard navigation
- Verify no regressions in existing form functionality

**Validation**: `npm run test && npm run lint:fix && npm run typecheck` must pass

### Expected Behavior
When a form submission triggers validation errors, the focus will automatically move to the first field in DOM order that contains an error, improving accessibility and user experience across all forms in the Head Shakers platform.

### Quality Assurance
- **Type Safety**: All implementations include comprehensive TypeScript types
- **Backward Compatibility**: No breaking changes to existing form APIs
- **Accessibility**: Enhanced accessibility with proper focus management
- **Performance**: No negative performance impact
- **Maintainability**: Clear separation of concerns and extensible design

### Success Criteria
- ✅ Focus automatically moves to first errored field on form submission
- ✅ All existing forms continue to function without modification
- ✅ TypeScript compilation passes without errors
- ✅ ESLint passes without violations
- ✅ Accessibility guidelines maintained and enhanced
- ✅ Performance metrics remain unchanged

## Implementation Readiness
**READY FOR IMPLEMENTATION** - The plan provides clear step-by-step execution with specific file modifications, type-safe implementation approach, and comprehensive testing strategy.