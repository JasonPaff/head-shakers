# Custom Tag Input Implementation Plan

## Overview
Replace the current @diceui/tags-input implementation with a custom, accessible tag input component that supports autocomplete for both system tags and user custom tags, allows on-the-fly tag creation, and integrates seamlessly with the existing Head Shakers codebase patterns.

## Context

### Current Implementation
- Uses @diceui/tags-input primitive component
- Current TagField component in `src/components/ui/form/field-components/tag-field.tsx`
- Basic tag creation without autocomplete or suggestions
- Integrated with TanStack Form and proper accessibility patterns
- Used in `src/app/(app)/bobbleheads/add/components/item-tags.tsx`

### Existing Infrastructure
- `TagsQuery.searchAsync()` for tag search with userId filtering
- `getTagSuggestionsAction` for server-side autocomplete
- `createTagAction` for on-the-fly tag creation
- `TagBadge` component for consistent tag display
- `FieldAria` and accessibility utilities
- Form integration with TanStack Form

## Implementation Tasks

### Task 1: Create Custom TagsInput Base Component
**Priority:** High
**File:** `src/components/ui/custom-tags-input.tsx`

Build a custom TagsInput component to replace @diceui/tags-input dependency with full control over behavior and styling.

**Technical Requirements:**
- Create compound component pattern (TagsInput, TagsInputList, TagsInputItem, TagsInputInput)
- Implement keyboard navigation (Arrow keys, Tab, Enter, Backspace)
- Support tag removal with Delete/Backspace and X button
- Proper focus management and focus trapping
- ARIA attributes for screen readers (role="listbox", aria-activedescendant)
- Keyboard accessibility (Enter/Comma to add, Escape to clear input)
- Match existing Tailwind styling patterns from current tags-input.tsx

**Dependencies:**
- Lucide React icons (XIcon)
- Existing utility functions (cn from tailwind-utils)
- React hooks (useState, useRef, useCallback, useId)

### Task 2: Implement Autocomplete Dropdown Component
**Priority:** High
**File:** `src/components/ui/tag-autocomplete.tsx`

Create an autocomplete dropdown that shows tag suggestions with proper keyboard navigation and accessibility.

**Technical Requirements:**
- Dropdown with virtualized list for performance (using @tanstack/react-virtual if needed)
- Search highlighting for matched text
- Keyboard navigation (Arrow Up/Down, Enter to select, Escape to close)
- ARIA combobox pattern with proper roles and properties
- Support for both existing tags and "Create new tag" option
- Debounced search input to prevent excessive API calls
- Loading states and empty states
- Position dropdown relative to input field

**Dependencies:**
- @tanstack/react-virtual (already in package.json)
- use-debounce (already in package.json)
- TagBadge component for suggestion display
- Existing TagRecord type from tags-query.ts

### Task 3: Create Enhanced TagField Component
**Priority:** High
**File:** `src/components/ui/form/field-components/tag-field.tsx` (replace)

Build a new TagField component that integrates the custom TagsInput with autocomplete functionality and tag creation.

**Technical Requirements:**
- Integration with useFieldContext from TanStack Form
- Autocomplete integration using getTagSuggestionsAction
- On-the-fly tag creation using createTagAction
- Proper error handling and loading states
- Maintain existing FieldAria, FieldError, FieldDescription integration
- Support for both string[] (tag names) and TagRecord[] values
- Debounced search with minimum character threshold (2 chars)
- Visual distinction between system tags and user tags
- Tag validation and duplicate prevention

**Dependencies:**
- Custom TagsInput component (task 1)
- TagAutocomplete component (task 2)
- useServerAction hook
- getTagSuggestionsAction and createTagAction
- Existing form field components (FieldAria, FieldError, etc.)

### Task 4: Add Tag Management Hooks
**Priority:** Medium
**Files:**
- `src/hooks/use-tag-suggestions.ts`
- `src/hooks/use-tag-creation.ts`

Create custom hooks to manage tag operations, caching, and state management for the enhanced tag input.

**Technical Requirements:**
- useTagSuggestions hook with TanStack Query for caching
- useTagCreation hook for creating new tags with optimistic updates
- Proper error handling and retry logic
- Cache invalidation on successful tag creation
- Loading and error states management
- Integration with existing server actions
- Support for user-specific vs system tag filtering

**Dependencies:**
- @tanstack/react-query (already in package.json)
- getTagSuggestionsAction and createTagAction
- useServerAction hook
- Existing error handling patterns

### Task 5: Enhance Tag Validation and Creation Logic
**Priority:** Medium
**Files:**
- `src/lib/facades/tags/tags.facade.ts` (modify)
- `src/lib/validations/tags.validation.ts` (modify)

Improve tag validation and creation to support the new autocomplete functionality and prevent duplicate system tags.

**Technical Requirements:**
- Add validation for duplicate tag names (case-insensitive)
- Enhance createTag to check for existing system tags first
- Add proper sanitization for tag names (trim, lowercase comparison)
- Validation for tag name length and special characters
- Support for tag color generation/assignment for new tags
- Proper error messages for validation failures

**Dependencies:**
- Existing TagsFacade patterns
- Current validation schemas
- TagsQuery methods

### Task 6: Update ItemTags Component Integration
**Priority:** High
**File:** `src/app/(app)/bobbleheads/add/components/item-tags.tsx` (modify)

Update the ItemTags component to use the new enhanced TagField with autocomplete functionality.

**Technical Requirements:**
- Replace existing TagField usage with enhanced version
- Update field configuration to support autocomplete
- Add proper placeholder text mentioning autocomplete functionality
- Ensure form validation works with new tag input
- Maintain existing styling and layout structure
- Update description text to mention autocomplete and tag creation features

**Dependencies:**
- Enhanced TagField component (task 3)
- Existing form integration patterns
- Current ItemTags styling and structure

### Task 7: Remove Legacy Dependencies and Update Package
**Priority:** Low
**Files:**
- `package.json` (modify)
- `src/components/ui/tags-input.tsx` (remove)

Clean up the codebase by removing the @diceui/tags-input dependency and updating imports.

**Technical Requirements:**
- Remove @diceui/tags-input from package.json dependencies
- Ensure no remaining imports of the old tags-input component
- Run tests to verify no breaking changes
- Update any other components that might reference the old tags-input
- Clean up any unused types or interfaces

**Dependencies:**
- Completion of all previous tasks
- Verification that new implementation works correctly

## Accessibility Requirements
- Proper ARIA roles and properties (combobox, listbox, option)
- Keyboard navigation support (Arrow keys, Tab, Enter, Escape)
- Focus management and visual focus indicators
- Screen reader announcements for tag operations
- Proper error messaging and validation feedback
- Support for reduced motion preferences

## Testing Strategy

### Unit Tests
- TagsInput component keyboard interactions
- TagAutocomplete dropdown behavior
- TagField form integration and validation
- Tag creation and suggestion hooks

### Integration Tests
- End-to-end tag creation workflow
- Autocomplete search and selection
- Form submission with new tag field
- Accessibility compliance testing

### Manual Testing
- Screen reader compatibility
- Keyboard-only navigation
- Touch device interaction
- Visual design consistency

## Rollout Strategy

### Phase 1: Development
1. Implement core TagsInput component with basic functionality
2. Add autocomplete dropdown with tag suggestions
3. Integrate with form system and add creation capabilities
4. Test thoroughly in development environment

### Phase 2: Testing
1. Comprehensive accessibility testing
2. Performance testing with large tag lists
3. Cross-browser compatibility verification
4. User experience testing

## Key Features
- **Smart Autocomplete** - Suggests both system tags and user's custom tags as you type
- **On-the-fly Tag Creation** - Create new tags directly without leaving the form
- **Full Accessibility** - WCAG compliant with proper keyboard navigation and screen reader support
- **Visual Polish** - Matches the app's design system with enhanced UX

## Technical Approach
- **7-task implementation** broken into logical, testable phases
- **Leverages existing infrastructure** - Uses current tag queries, actions, and form patterns
- **Performance optimized** - Debounced search, virtualized dropdown, proper caching
- **Type-safe integration** - Full TypeScript support with existing validation schemas