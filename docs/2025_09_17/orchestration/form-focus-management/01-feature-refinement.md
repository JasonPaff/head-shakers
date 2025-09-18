# Step 1: Feature Request Refinement

**Start Time**: 2025-09-17T14:30:15Z
**End Time**: 2025-09-17T14:31:45Z
**Duration**: 1.5 minutes
**Status**: ✅ Completed

## Original Request

"The app uses tanstack-form with zod for forms. Tanstack-Form is headless and does not come with any built in focus management. The form components/integration in the app needs to be updated to focus the first errored field when invalid forms are submitted"

## Project Context Provided

### Tech Stack
- Next.js 15.5.3 with App Router
- React 19.1.0 with TypeScript
- TanStack React Form v1.19.2 for form handling
- Zod v4.0.0 for schema validation
- Radix UI component library
- Tailwind CSS 4 for styling

### Form Dependencies
- @tanstack/react-form: ^1.19.2
- zod: ^4.0.0
- drizzle-zod: ^0.8.3
- next-safe-action: ^8.0.10

### Project Structure
- src/components/ui/ - Reusable UI components (forms, dialogs, icons)
- src/components/feature/ - Feature-specific components
- src/lib/validations/ - Zod schemas for validation
- src/lib/actions/ - Server actions for mutations

## Agent Prompt Sent

```
You are a feature refinement specialist. Your task is to enhance the user's feature request with detailed project context to make it more actionable and comprehensive.

## Original User Request
"The app uses tanstack-form with zod for forms. Tanstack-Form is headless and does not come with any built in focus management. The form components/integration in the app needs to be updated to focus the first errored field when invalid forms are submitted"

## Project Context

### Tech Stack (from CLAUDE.md)
- Next.js 15.5.3 with App Router
- React 19.1.0 with TypeScript
- TanStack React Form for form handling
- Zod for schema validation and type safety
- Radix UI component library
- Tailwind CSS 4 for styling

### Form-Related Dependencies (from package.json)
- @tanstack/react-form: ^1.19.2
- zod: ^4.0.0
- drizzle-zod: ^0.8.3
- next-safe-action: ^8.0.10

### Project Structure (from CLAUDE.md)
- src/components/ui/ - Reusable UI components (forms, dialogs, icons)
- src/components/feature/ - Feature-specific components
- src/lib/validations/ - Zod schemas for validation
- src/lib/actions/ - Server actions for mutations

## Task
Refine the original request into a comprehensive feature specification that includes:

1. **Enhanced Problem Statement**: Expand on the accessibility and UX issues
2. **Technical Requirements**: Specific implementation needs for TanStack Form
3. **Integration Points**: How this fits with existing form components
4. **Accessibility Considerations**: WCAG compliance and keyboard navigation
5. **User Experience Goals**: What should happen from a user perspective
6. **Implementation Scope**: What components/files will be affected

Return a detailed, enhanced feature request that provides clear direction for implementation while considering the project's tech stack and architecture.
```

## Full Agent Response

```markdown
# Enhanced Feature Specification: Focus Management for Invalid Form Fields

## 1. Enhanced Problem Statement

### Current State
The Head Shakers application uses TanStack Form v1.19.2 as a headless form library with Zod validation. While the current implementation provides robust validation and error display, it lacks proper focus management when forms are submitted with validation errors. This creates several issues:

**Accessibility Issues:**
- Users with screen readers or keyboard navigation lose context when validation fails
- No programmatic focus management violates WCAG 2.1 AA guidelines (SC 3.2.2 - On Input)
- Error discovery requires manual scanning, particularly problematic for long forms

**User Experience Issues:**
- Users must manually locate validation errors, especially in complex multi-section forms (like the bobblehead creation form with 8+ sections)
- No visual indication of where attention is needed after form submission
- Increased cognitive load and potential form abandonment

**Current Form Architecture:**
- Forms use `withForm` HOC and `useAppForm` hook from TanStack Form
- Field components include: TextField, TextareaField, SelectField, ComboboxField, CheckboxField, SwitchField, TagField
- Error display handled by `FieldError` component with proper ARIA attributes
- Forms already have field-level validation with `onBlur` and `onChange` modes

## 2. Technical Requirements

### Core Focus Management System
1. **Focus Manager Hook**: Create `useFocusManager` hook to handle focus logic
2. **Error Detection**: Integrate with TanStack Form's error state to identify first errored field
3. **Field Registration**: Implement field reference system for programmatic focus
4. **Form Integration**: Extend existing form components without breaking changes

### TanStack Form Integration Points
- Hook into `handleSubmit` lifecycle to detect validation failures
- Utilize form's `state.errors` and `state.fieldMeta` for error detection
- Leverage existing field context system for ref management
- Maintain compatibility with current validation flow (`onBlur`, `onChange`, `onSubmit`)

### Focus Target Priority
1. **First Invalid Field**: Focus first field in DOM order with validation error
2. **Field Types**: Handle different input types (text, select, checkbox, textarea, etc.)
3. **Section-Based Forms**: Consider form sections and cards for complex forms
4. **Custom Components**: Support composite fields like TagField and ComboboxField

## 3. Integration Points

### Existing Components to Enhance
- **Form Components** (`src/components/ui/form/`):
  - `index.tsx` - Add focus management to form hook
  - `form-components/submit-button.tsx` - Trigger focus on validation failure
  - All field components in `field-components/` - Add ref forwarding

- **Field Components** to Update:
  - `text-field.tsx`, `textarea-field.tsx`, `select-field.tsx`
  - `combobox-field.tsx`, `checkbox-field.tsx`, `switch-field.tsx`, `tag-field.tsx`
  - `field-item.tsx` - Container for ref management

### Form Usage Examples to Test
- **Complex Multi-Section Form**: `/bobbleheads/add` (8 sections, 20+ fields)
- **Dialog Forms**: Collection/Subcollection create/edit dialogs
- **Admin Forms**: Featured content form
- **Simple Forms**: Various single-section forms throughout app

## 4. Accessibility Considerations

### WCAG 2.1 AA Compliance
- **SC 3.2.2 (On Input)**: Ensure focus changes are predictable and announced
- **SC 2.4.3 (Focus Order)**: Maintain logical focus order
- **SC 4.1.3 (Status Messages)**: Ensure error state changes are announced

### Screen Reader Support
- Use `aria-invalid` attributes on errored fields
- Ensure error messages are associated with fields via `aria-describedby`
- Announce focus changes with appropriate ARIA live regions
- Maintain existing error announcement system

### Keyboard Navigation
- Preserve natural tab order after focus management
- Support for all interactive field types
- Handle composite components (combobox, tag input) appropriately

## 5. User Experience Goals

### Primary Goals
1. **Immediate Error Discovery**: Users should instantly know where validation failed
2. **Reduced Cognitive Load**: Eliminate need to scan for errors manually
3. **Faster Error Resolution**: Direct users to specific fields needing attention
4. **Seamless Integration**: No disruption to existing form behavior

### User Flow Enhancement
```
1. User fills form and clicks submit
2. If validation errors exist:
   a. Form submission is prevented (existing behavior)
   b. First errored field receives focus automatically (NEW)
   c. Error messages display as normal (existing behavior)
   d. Screen readers announce the focused field and its error (NEW)
3. User fixes error and continues with natural tab order
```

### Error Feedback Timing
- **Immediate**: Focus change happens immediately after submit attempt
- **Non-Intrusive**: No focus changes during typing or field navigation
- **Contextual**: Focus exactly where user needs to take action

## 6. Implementation Scope

### New Components/Hooks
```typescript
// New hook for focus management
useFocusManager(form: FormApi) => {
  focusFirstErrorField: () => void;
  registerFieldRef: (name: string, ref: RefObject) => void;
}

// Enhanced form hook with focus management
useAppForm(options & { enableFocusManagement?: boolean })
```

### Files to Modify
**Core Form System:**
- `src/components/ui/form/index.tsx` - Add focus management to form hook
- `src/components/ui/form/hooks/use-focus-manager.ts` - New focus manager hook
- `src/components/ui/form/form-components/submit-button.tsx` - Handle focus on submit

**Field Components (Add ref forwarding):**
- `src/components/ui/form/field-components/text-field.tsx`
- `src/components/ui/form/field-components/textarea-field.tsx`
- `src/components/ui/form/field-components/select-field.tsx`
- `src/components/ui/form/field-components/combobox-field.tsx`
- `src/components/ui/form/field-components/checkbox-field.tsx`
- `src/components/ui/form/field-components/switch-field.tsx`
- `src/components/ui/form/field-components/tag-field.tsx`
- `src/components/ui/form/field-components/field-item.tsx`

**Supporting Components:**
- `src/components/ui/form/field-components/field-aria.tsx` - Enhanced ARIA support
- `src/components/ui/form/field-aria-provider.tsx` - Extended context

### Backward Compatibility
- Feature enabled by default for new forms
- Existing forms continue working without changes
- Opt-out available via `enableFocusManagement: false`
- No breaking changes to existing field component APIs

### Testing Requirements
- **Unit Tests**: Focus manager hook behavior
- **Integration Tests**: Form submission with validation errors
- **E2E Tests**: Complete user flows in complex forms
- **Accessibility Tests**: Screen reader compatibility and ARIA compliance
- **Cross-Browser**: Focus behavior across modern browsers

### Performance Considerations
- Minimal overhead: Only track refs for fields with errors
- Efficient DOM queries: Use registered refs instead of selectors
- Memory management: Clean up refs when components unmount
- No impact on render performance: Focus management happens post-submit only

---

This comprehensive specification addresses the original request while providing detailed context about the existing codebase architecture, specific implementation requirements, and clear goals for enhancing the user experience and accessibility of forms throughout the Head Shakers application.
```

## Refined Feature Request Extracted

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

## Validation Results

✅ **Problem Statement**: Clear accessibility and UX issues identified
✅ **Technical Requirements**: Specific TanStack Form integration points defined
✅ **Implementation Scope**: Detailed file list and component changes specified
✅ **Backward Compatibility**: Opt-in/opt-out strategy defined
✅ **Testing Strategy**: Unit, integration, E2E, and accessibility tests outlined

## Warnings

⚠️ **Complexity**: Multi-section forms with 20+ fields may require additional testing
⚠️ **Performance**: Field ref management overhead needs monitoring
⚠️ **Browser Support**: Focus behavior testing required across browsers