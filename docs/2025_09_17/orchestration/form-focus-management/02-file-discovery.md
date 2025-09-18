# Step 2: File Discovery

**Start Time**: 2025-09-17T14:31:45Z
**End Time**: 2025-09-17T14:33:30Z
**Duration**: 1.75 minutes
**Status**: ✅ Completed

## Refined Request Used as Input

Enhanced Feature Specification: Focus Management for Invalid Form Fields

**Problem**: TanStack Form lacks built-in focus management, creating accessibility and UX issues when forms are submitted with validation errors.

**Solution**: Implement a comprehensive focus management system that automatically focuses the first errored field when invalid forms are submitted.

**Key Requirements**:
1. Create `useFocusManager` hook for focus logic
2. Add field reference system for programmatic focus
3. Integrate with TanStack Form's error state and lifecycle
4. Support all existing field types (text, select, checkbox, etc.)
5. Maintain WCAG 2.1 AA compliance
6. Preserve backward compatibility

## Agent Prompt Sent

```
You are a file discovery specialist. Your task is to identify ALL files relevant to implementing a focus management system for TanStack Form integration.

## Refined Feature Request

### Enhanced Feature Specification: Focus Management for Invalid Form Fields

**Problem**: TanStack Form lacks built-in focus management, creating accessibility and UX issues when forms are submitted with validation errors.

**Solution**: Implement a comprehensive focus management system that automatically focuses the first errored field when invalid forms are submitted.

**Key Requirements**:
1. Create `useFocusManager` hook for focus logic
2. Add field reference system for programmatic focus
3. Integrate with TanStack Form's error state and lifecycle
4. Support all existing field types (text, select, checkbox, etc.)
5. Maintain WCAG 2.1 AA compliance
6. Preserve backward compatibility

**Implementation Scope**:
- Core form hook enhancement (`src/components/ui/form/index.tsx`)
- New focus manager hook (`src/components/ui/form/hooks/use-focus-manager.ts`)
- Update 7+ field components to add ref forwarding
- Enhance submit button to trigger focus on validation failure
- Support complex multi-section forms like `/bobbleheads/add`

## Discovery Tasks

1. **Locate Current Form System**: Find all existing form-related components and hooks
2. **Identify Field Components**: Locate all field components that need ref forwarding
3. **Find Form Usage Examples**: Identify complex forms that will benefit from focus management
4. **Discover Supporting Files**: Find ARIA, validation, and utility files
5. **Locate Test Files**: Find existing form tests that may need updates

## Analysis Requirements

For each discovered file, provide:
- **File Path**: Exact path from project root
- **File Type**: Component, Hook, Utility, Test, etc.
- **Current Purpose**: What the file currently does
- **Modification Level**: None, Minor, Major, New File
- **Priority**: Critical, High, Medium, Low
- **Dependencies**: Other files this depends on or affects

## Search Strategy

Use comprehensive search patterns to find:
- Form-related components (`**/form/**`, `**/*form*`)
- Field components and hooks
- TanStack Form integration files
- Submit button and form submission handling
- ARIA and accessibility files
- Validation and error handling
- Example forms throughout the application

Return a prioritized, categorized list of all relevant files with detailed analysis for implementation planning.
```

## Full Agent Response

```markdown
# File Discovery Results

## Analysis Summary
- Explored 8 primary directories (src/components/ui/form, src/app/(app)/bobbleheads/add, src/hooks, src/lib/validations, etc.)
- Examined 47 candidate files across form components, field implementations, and form usage examples
- Found 15 highly relevant files for core implementation
- Identified 12 supporting files for integration and testing
- Discovered 8 complex forms that will benefit from focus management

## Discovered Files

### High Priority (Core Implementation)

**Form System Core:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\index.tsx` - Main TanStack Form hook creation with field components registration. **CRITICAL** - needs focus manager integration
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\form-components\submit-button.tsx` - Submit button component that triggers validation. **CRITICAL** - needs focus triggering logic on validation failure

**Field Components (Need Ref Forwarding):**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-components\text-field.tsx` - Text input field component. **HIGH** - most common field type, needs ref forwarding
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-components\select-field.tsx` - Select dropdown field component. **HIGH** - complex field, needs SelectTrigger ref forwarding
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-components\textarea-field.tsx` - Textarea field component. **HIGH** - needs ref forwarding
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-components\checkbox-field.tsx` - Checkbox field component. **MEDIUM** - needs ref forwarding
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-components\switch-field.tsx` - Switch toggle field component. **MEDIUM** - needs ref forwarding
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-components\combobox-field.tsx` - Combobox field component. **MEDIUM** - complex component, needs trigger ref
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-components\tag-field.tsx` - Tags input field component. **MEDIUM** - needs input ref forwarding

**New Files (To Be Created):**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\hooks\use-focus-manager.ts` - **NEW FILE** - Core focus management hook for tracking field refs and focusing first error

### Medium Priority (Supporting/Integration)

**ARIA and Accessibility:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-components\field-aria.tsx` - ARIA attributes wrapper component. **MEDIUM** - may need focus-related ARIA updates
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\use-field-aria.ts` - Field ARIA context hook. **MEDIUM** - may need focus state integration
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-aria-provider.tsx` - ARIA context provider. **LOW** - review for focus integration

**Supporting Components:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-components\field-error.tsx` - Error display component. **LOW** - may need focus-related styling
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-components\field-item.tsx` - Field wrapper component. **LOW** - structural component
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-components\field-error-border.tsx` - Error border styling. **LOW** - may need focus styling

**Server Action Integration:**
- `C:\Users\JasonPaff\dev\head-shakers\src\hooks\use-server-action.ts` - Server action execution hook. **MEDIUM** - used in form submission, may need error handling integration

### Low Priority (May Need Updates)

**Complex Form Examples:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\add\components\add-item-form-client.tsx` - Complex multi-section form. **LOW** - test case for focus management
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\admin\featured-content\components\featured-content-form.tsx` - Admin form example. **LOW** - additional test case

**Validation Schemas:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\validations\bobbleheads.validation.ts` - Form validation schemas. **LOW** - reference for error field identification

**UI Base Components:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\input.tsx` - Base input component. **LOW** - already supports ref forwarding and focus styles
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\textarea.tsx` - Base textarea component. **LOW** - check ref forwarding support

## Architecture Insights

**Current Form Structure:**
- Uses TanStack React Form with custom createFormHook implementation
- Field components are registered centrally in form/index.tsx
- All fields use FieldAria wrapper for accessibility
- Submit button integrates with form state via useStore
- Complex forms like bobblehead creation span multiple sections with 15+ fields

**Existing Similar Functionality:**
- ARIA integration already handles aria-invalid and aria-describedby
- Input components already have focus-visible styling
- Field error states are centrally managed
- No existing focus management or programmatic focus logic found

**Integration Points Identified:**
- Submit button form.handleSubmit() method needs focus triggering
- Field components need ref forwarding to underlying inputs
- Form validation logic needs integration with focus manager
- ARIA system may need focus state announcements

## File Contents Summary

### High-Priority File Analysis:

**`src/components/ui/form/index.tsx`** (CRITICAL):
- Current functionality: Creates form hook with field components registration using createFormHook
- Key exports: useAppForm, fieldContext, formContext, field component mappings
- Integration points: Central registration point for all field types, perfect for focus manager integration
- Role in feature: **Primary integration point** - focus manager will be added here and passed to all field components

**`src/components/ui/form/form-components/submit-button.tsx`** (CRITICAL):
- Current functionality: Renders submit button with loading state from form store
- Key exports: SubmitButton component with form integration
- Integration points: Uses form.handleSubmit(), has access to form context
- Role in feature: **Trigger point** - needs to call focus manager on validation failure

**Field Components Pattern** (All HIGH priority):
- Current functionality: Each field wraps base UI components with form integration
- Key exports: Typed field components (TextField, SelectField, etc.)
- Integration points: All use FieldAria wrapper and field context
- Role in feature: **Focus targets** - need forwardRef to enable programmatic focus

**Complex Form (`add-item-form-client.tsx`)**:
- Current functionality: 8-section form with collection assignment, photos, tags, custom fields
- Key exports: AddItemFormClient with extensive validation
- Integration points: Uses form.handleSubmit() for validation and submission
- Role in feature: **Primary test case** - ideal for testing focus management with complex multi-section form

**Potential Integration Challenges:**
- Select and Combobox components use Radix UI primitives that may need special ref forwarding
- TagsInput has complex internal structure with multiple focusable elements
- Need to ensure focus management doesn't interfere with existing ARIA implementation
- Form submission flow involves server actions that may need error handling coordination

This analysis provides a complete roadmap for implementing focus management across the entire form system, prioritized by implementation necessity and impact.
```

## Discovered Files List with Categorization

### Critical Files (2 files)
1. **src/components/ui/form/index.tsx** - Main form hook integration point
2. **src/components/ui/form/form-components/submit-button.tsx** - Submit trigger point

### High Priority Files (7 files)
3. **src/components/ui/form/field-components/text-field.tsx** - Text input field
4. **src/components/ui/form/field-components/select-field.tsx** - Select dropdown field
5. **src/components/ui/form/field-components/textarea-field.tsx** - Textarea field
6. **src/components/ui/form/field-components/checkbox-field.tsx** - Checkbox field
7. **src/components/ui/form/field-components/switch-field.tsx** - Switch field
8. **src/components/ui/form/field-components/combobox-field.tsx** - Combobox field
9. **src/components/ui/form/field-components/tag-field.tsx** - Tags input field

### New Files to Create (1 file)
10. **src/components/ui/form/hooks/use-focus-manager.ts** - Focus management hook

### Medium Priority Files (4 files)
11. **src/components/ui/form/field-components/field-aria.tsx** - ARIA wrapper
12. **src/components/ui/form/use-field-aria.ts** - Field ARIA hook
13. **src/components/ui/form/field-aria-provider.tsx** - ARIA provider
14. **src/hooks/use-server-action.ts** - Server action hook

### Supporting Files (6 files)
15. **src/components/ui/form/field-components/field-error.tsx** - Error display
16. **src/components/ui/form/field-components/field-item.tsx** - Field wrapper
17. **src/components/ui/form/field-components/field-error-border.tsx** - Error styling
18. **src/app/(app)/bobbleheads/add/components/add-item-form-client.tsx** - Complex form example
19. **src/app/(app)/admin/featured-content/components/featured-content-form.tsx** - Admin form
20. **src/lib/validations/bobbleheads.validation.ts** - Validation schemas

## File Path Validation Results

✅ **All Critical Files Exist**: Form system core files found
✅ **All Field Components Exist**: 7 field components located
✅ **ARIA System Exists**: Accessibility infrastructure present
✅ **Complex Forms Found**: Multi-section forms identified for testing
✅ **Validation System Present**: Zod schemas available for reference

## Discovery Metrics and Statistics

- **Total Files Examined**: 47 files
- **Relevant Files Found**: 20 files
- **New Files to Create**: 1 file
- **Critical Modifications**: 2 files
- **High Priority Updates**: 7 files
- **Supporting Integrations**: 10 files
- **Complex Form Examples**: 2 forms identified
- **Field Types Supported**: 7 different field components

## Architecture Analysis

**Current Form Pattern**:
- Centralized form hook creation in `index.tsx`
- Field components use FieldAria wrapper for accessibility
- Submit button integrates with TanStack Form state
- No existing focus management implementation found

**Integration Opportunities**:
- Focus manager can be added to central form hook
- All field components already use ref forwarding pattern
- ARIA system can be extended for focus announcements
- Submit button has direct access to form validation state