# TanStack Form Focus Management Implementation Plan

**Generated**: 2025-09-17T00:02:15.000Z
**Original Request**: The app uses tanstack-form with zod for forms. Tanstack-Form is headless and does not come with
any built in focus management.
**Refined Request**: Implement a comprehensive focus management system for TanStack Forms that provides automatic error
focus, keyboard navigation support, WCAG 2.1 AA accessibility compliance, and seamless integration with the existing
React 19/TypeScript/TanStack Form/Radix UI architecture.

## Analysis Summary

- Feature request refined with project context including React 19, TypeScript, TanStack Form 1.19.2, Radix UI
- Discovered 37 relevant files across form infrastructure, field components, and utilities

## File Discovery Results

### High Priority Files (Core Implementation) - 11 Files

**Form Infrastructure (Must Modify)**:

- `src/components/ui/form/index.tsx` - Main TanStack Form hook creation and field component exports
- `src/components/ui/form/use-field-aria.ts` - Current field ARIA context, needs focus context extension
- `src/components/ui/form/field-aria-provider.tsx` - ARIA provider component, needs focus provider integration

**Field Components (Must Modify)**:

- `src/components/ui/form/field-components/text-field.tsx` - Primary field component, needs focus ref integration
- `src/components/ui/form/field-components/textarea-field.tsx` - Textarea component, needs focus support
- `src/components/ui/form/field-components/select-field.tsx` - Select component, needs focus support
- `src/components/ui/form/field-components/combobox-field.tsx` - Combobox component, needs focus support
- `src/components/ui/form/field-components/field-error.tsx` - Error display component, needs error focus integration

**New Files to Create**:

- `src/hooks/use-form-focus-management.ts` - Core focus management hook
- `src/lib/utils/form-focus.utils.ts` - Focus utility functions
- `src/components/ui/form/focus-management-provider.tsx` - Focus context provider

### Current Architecture Insights

1. **TanStack Form Integration**: Uses `@tanstack/react-form` with custom field components and ARIA support
2. **Field Component Architecture**: All field components use `useFieldContext` and `FieldAriaProvider` for
   accessibility
3. **Validation Strategy**: Zod schemas with `revalidateLogic` for blur/change validation modes
4. **Error Handling**: Field errors displayed via `FieldError` component with ARIA linking
5. **Server Actions**: Forms integrate with `useServerAction` hook for async submissions

### Focus Management Gaps Identified

1. **No Error Focus**: No automatic focus on first invalid field after submission
2. **No Keyboard Navigation**: No Tab/Enter navigation between fields
3. **No Dynamic Field Support**: No focus management for conditional fields
4. **Limited ARIA**: Basic ARIA but no live regions for error announcements

## Implementation Plan

<implementation-plan>
<overview>
<title>TanStack Form Focus Management System Implementation</title>
<description>Implement a comprehensive focus management system for TanStack Forms that provides automatic error focus, keyboard navigation support, WCAG 2.1 AA accessibility compliance, and seamless integration with the existing React 19/TypeScript/TanStack Form/Radix UI architecture.</description>
<estimated-duration>8-12 development days</estimated-duration>
<complexity-level>High</complexity-level>
</overview>

<phases>
<phase id="1" name="Core Focus Management Infrastructure">
<description>Establish the foundational focus management system with context providers, hooks, and utility functions that integrate with the existing TanStack Form architecture.</description>
<estimated-duration>3-4 days</estimated-duration>
<tasks>

<task id="1.1" priority="high">
<title>Create Focus Management Hook and Utilities</title>
<description>Build the core focus management hook that integrates with TanStack Form lifecycle events and provides focus orchestration capabilities. This forms the foundation for all focus management features.</description>
<file-operations>
<create-file path="C:\Users\JasonPaff\dev\head-shakers\src\hooks\use-form-focus-management.ts" description="Core focus management hook with TanStack Form integration">
TypeScript hook that provides:
- Field registration system with focus priority
- Error focus navigation with automatic scrolling
- Keyboard navigation handlers (Tab, Enter, Arrow keys)
- Integration with TanStack Form validation events
- Dynamic field support for conditional forms
- ARIA live region management for announcements
</create-file>
<create-file path="C:\Users\JasonPaff\dev\head-shakers\src\lib\utils\form-focus.utils.ts" description="Focus utility functions and constants">
Utility functions for:
- Focus element identification and validation
- Smooth scrolling with offset calculations
- Keyboard event handling and key mapping
- Error element location and priority determination
- ARIA announcement formatting and timing
</create-file>
</file-operations>
<implementation-details>
<code-example language="typescript">
// Focus management hook interface
interface UseFormFocusManagementOptions {
  autoFocusFirstError?: boolean;
  enableKeyboardNavigation?: boolean;
  scrollOffset?: number;
  announceErrors?: boolean;
}

interface FocusableField {
id: string;
element: HTMLElement;
priority: number;
isError: boolean;
fieldName: string;
}

// Key utility functions
export const focusUtils = {
findFocusableElements: (container: HTMLElement) => HTMLElement[],
scrollToElement: (element: HTMLElement, offset?: number) => void,
announceToScreenReader: (message: string) => void,
getFieldPriority: (fieldName: string, errors: FieldError[]) => number
};
</code-example>
</implementation-details>
<dependencies>TanStack Form context, React refs, ARIA utilities</dependencies>
<acceptance-criteria>

- Hook integrates with TanStack Form lifecycle
- Utilities handle edge cases (hidden elements, dynamic content)
- TypeScript types are fully defined with no any types
- Functions are pure and testable
  </acceptance-criteria>
  </task>

<task id="1.2" priority="high">
<title>Create Focus Context Provider</title>
<description>Build a React context provider that manages form-wide focus state and integrates with the existing FieldAriaProvider architecture.</description>
<file-operations>
<create-file path="C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\focus-management-provider.tsx" description="Focus context provider component">
React context provider that:
- Manages registered focusable fields
- Provides focus navigation methods
- Maintains keyboard navigation state
- Integrates with ARIA live regions
- Wraps existing form components seamlessly
</create-file>
<modify-file path="C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\use-field-aria.ts" description="Extend ARIA context with focus context">
Extend UseFieldAriaContext interface to include:
- Focus registration methods
- Focus navigation callbacks
- Error announcement handlers
- Keyboard navigation state
</modify-file>
</file-operations>
<implementation-details>
<code-example language="typescript">
interface FocusManagementContext {
  registerField: (fieldId: string, element: HTMLElement, options: FieldOptions) => void;
  unregisterField: (fieldId: string) => void;
  focusFirstError: () => void;
  focusNextField: () => void;
  focusPreviousField: () => void;
  announceError: (message: string) => void;
  isKeyboardNavigationEnabled: boolean;
}

export const FocusManagementProvider = ({ children, options }) => {
// Implementation with field registry and navigation logic
};
</code-example>
</implementation-details>
<dependencies>React context, useFieldAria hook, TanStack Form</dependencies>
<acceptance-criteria>

- Provider integrates with existing FieldAriaProvider
- Context is type-safe and well-documented
- Backward compatibility maintained for existing forms
- ARIA live regions work correctly
  </acceptance-criteria>
  </task>

</tasks>
</phase>

<phase id="2" name="Field Component Integration">
<description>Integrate focus management into all existing field components while maintaining backward compatibility and adding ref forwarding support.</description>
<estimated-duration>3-4 days</estimated-duration>
<tasks>

<task id="2.1" priority="high">
<title>Enhance Base Input Components with Focus Support</title>
<description>Add ref forwarding and focus integration to base UI components (Input, Select, Textarea) to support the focus management system.</description>
<file-operations>
<modify-file path="C:\Users\JasonPaff\dev\head-shakers\src\components\ui\input.tsx" description="Add ref forwarding and focus classes">
Updates:
- Add React.forwardRef for focus ref handling
- Add focus ring styles for keyboard navigation
- Maintain existing clearable and search functionality
- Add data attributes for focus management
</modify-file>
<modify-file path="C:\Users\JasonPaff\dev\head-shakers\src\components\ui\textarea.tsx" description="Add ref forwarding support">
Updates:
- Add React.forwardRef implementation
- Focus ring styles for accessibility
- Integration with focus management system
</modify-file>
<modify-file path="C:\Users\JasonPaff\dev\head-shakers\src\components\ui\select.tsx" description="Enhance Radix Select with focus integration">
Updates:
- Add ref forwarding to SelectTrigger
- Focus handling for keyboard navigation
- ARIA enhancements for focus management
</modify-file>
</file-operations>
<implementation-details>
<code-example language="typescript">
// Enhanced Input with ref forwarding
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, isClearable, isSearch, onClear, type, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          className={cn(
            // Existing classes...
            'focus-visible:ring-2 focus-visible:ring-offset-2',
            'data-[keyboard-navigation=true]:ring-2',
            className
          )}
          data-focusable="true"
          {...props}
        />
        {/* Existing clearable/search logic */}
      </div>
    );
  }
);
</code-example>
</implementation-details>
<dependencies>React.forwardRef, existing component APIs</dependencies>
<acceptance-criteria>
- All base components support ref forwarding
- Focus styles are consistent and accessible
- Existing functionality remains unchanged
- TypeScript types are properly maintained
</acceptance-criteria>
</task>

<task id="2.2" priority="high">
<title>Update TextField Component with Focus Management</title>
<description>Enhance the TextField component to register with the focus management system and support automatic error focus and keyboard navigation.</description>
<file-operations>
<modify-file path="C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-components\text-field.tsx" description="Add focus management integration">
Updates:
- Add useRef for field element reference
- Register field with focus management context
- Add keyboard navigation handlers
- Integrate with error focus system
- Add ARIA enhancements for focus
</modify-file>
</file-operations>
<implementation-details>
<code-example language="typescript">
export const TextField = ({ description, isRequired, label, ...props }: TextFieldProps) => {
  const field = useFieldContext<string>();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { registerField, unregisterField } = useFocusManagement();

useEffect(() => {
if (inputRef.current) {
registerField(id, inputRef.current, {
priority: field.state.meta.errors.length > 0 ? 1 : 0,
fieldName: field.name,
isError: !field.state.meta.isValid
});
}
return () => unregisterField(id);
}, [field.state.meta.isValid, field.state.meta.errors]);

return (
<FieldItem>
<Label htmlFor={id} variant={isRequired ? 'required' : undefined}>
{label}
</Label>
<FieldAria>
<Input
ref={inputRef}
id={id}
onBlur={field.handleBlur}
onChange={(e) => field.handleChange(e.target.value)}
onKeyDown={handleKeyboardNavigation}
value={field.state.value}
{...props}
/>
</FieldAria>
<FieldError />
<FieldDescription>{description}</FieldDescription>
</FieldItem>
);
};
</code-example>
</implementation-details>
<dependencies>Focus management hook, Input component with ref</dependencies>
<acceptance-criteria>

- Field registers and unregisters properly
- Error focus works automatically
- Keyboard navigation functions correctly
- No regression in existing functionality
  </acceptance-criteria>
  </task>

<task id="2.3" priority="high">
<title>Update Select and Complex Field Components</title>
<description>Enhance SelectField, ComboboxField, and other complex field components with focus management support, handling the complexity of composite components.</description>
<file-operations>
<modify-file path="C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-components\select-field.tsx" description="Add focus management to SelectField">
Updates:
- Ref handling for Radix Select trigger
- Focus registration with proper element reference
- Keyboard navigation for select options
- Error focus integration
</modify-file>
<modify-file path="C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-components\combobox-field.tsx" description="Add focus management to ComboboxField">
Updates:
- Complex ref forwarding for combobox trigger
- Focus management for searchable dropdown
- Keyboard navigation within options
- ARIA enhancements for accessibility
</modify-file>
<modify-file path="C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-components\textarea-field.tsx" description="Add focus management to TextareaField">
Updates:
- Ref forwarding to textarea element
- Focus registration and management
- Keyboard navigation support
- Error focus integration
</modify-file>
</file-operations>
<dependencies>Enhanced base components, focus management context</dependencies>
<acceptance-criteria>
- All field types support focus management
- Complex components (Select, Combobox) work correctly
- Keyboard navigation is intuitive
- ARIA compliance is maintained
</acceptance-criteria>
</task>

</tasks>
</phase>

<phase id="3" name="Error Focus and Navigation System">
<description>Implement automatic error focus, enhanced error display, and comprehensive keyboard navigation throughout forms.</description>
<estimated-duration>2-3 days</estimated-duration>
<tasks>

<task id="3.1" priority="high">
<title>Enhance Error Handling and Focus System</title>
<description>Improve the FieldError component to integrate with focus management and add ARIA live regions for error announcements.</description>
<file-operations>
<modify-file path="C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-components\field-error.tsx" description="Add focus management and ARIA enhancements">
Updates:
- Add ARIA live region for error announcements
- Integration with focus management context
- Enhanced error display with focus indicators
- Automatic error announcement timing
</modify-file>
<modify-file path="C:\Users\JasonPaff\dev\head-shakers\src\hooks\use-server-action.ts" description="Add focus management on server action errors">
Updates:
- Integration with focus management system
- Automatic error focus after server action failure
- Enhanced error handling with focus navigation
- Preserve existing toast functionality
</modify-file>
</file-operations>
<dependencies>Focus management context, existing error handling</dependencies>
<acceptance-criteria>
- Errors are announced to screen readers
- Focus moves to first error after validation
- Error focus is visually indicated
- Server action errors trigger focus management
</acceptance-criteria>
</task>

<task id="3.2" priority="medium">
<title>Implement Comprehensive Keyboard Navigation</title>
<description>Add keyboard navigation support including Tab/Shift+Tab for field navigation, Enter for form submission, and arrow keys for complex components.</description>
<file-operations>
<modify-file path="C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\field-aria-provider.tsx" description="Add keyboard navigation wrapper">
Updates:
- Wrap children with keyboard event handlers
- Add form-level keyboard navigation logic
- Integration with focus management system
- Support for complex navigation patterns
</modify-file>
<create-file path="C:\Users\JasonPaff\dev\head-shakers\src\lib\utils\keyboard-navigation.utils.ts" description="Keyboard navigation utilities">
Utilities for:
- Key event handling and mapping
- Navigation direction determination
- Field traversal algorithms
- Complex component navigation support
</create-file>
</file-operations>
<dependencies>Focus management system, keyboard utilities</dependencies>
<acceptance-criteria>
- Tab navigation works between all fields
- Enter submits forms when appropriate
- Arrow keys work in complex components
- Navigation respects field visibility and state
</acceptance-criteria>
</task>

</tasks>
</phase>

<phase id="4" name="Integration and Testing">
<description>Integrate the focus management system with existing forms and create comprehensive tests to ensure reliability and accessibility.</description>
<estimated-duration>2-3 days</estimated-duration>
<tasks>

<task id="4.1" priority="high">
<title>Update Form Hook and Integration Points</title>
<description>Integrate the focus management system with the main form hook and update the form index exports to include new functionality.</description>
<file-operations>
<modify-file path="C:\Users\JasonPaff\dev\head-shakers\src\components\ui\form\index.tsx" description="Add focus management exports and integration">
Updates:
- Export focus management hooks and providers
- Integrate FocusManagementProvider with form creation
- Add focus management options to form configuration
- Maintain backward compatibility with existing forms
</modify-file>
<modify-file path="C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\add\components\add-item-form-client.tsx" description="Example integration with complex form">
Updates:
- Add FocusManagementProvider wrapper
- Configure focus management options
- Test integration with server actions
- Demonstrate error focus functionality
</modify-file>
</file-operations>
<dependencies>All previous components, form hook system</dependencies>
<acceptance-criteria>
- Focus management integrates seamlessly with existing forms
- Backward compatibility is maintained
- New features are opt-in and configurable
- Example integration works in complex forms
</acceptance-criteria>
</task>

<task id="4.2" priority="medium">
<title>Create Comprehensive Test Suite</title>
<description>Develop unit, integration, and accessibility tests for the focus management system to ensure reliability and compliance.</description>
<file-operations>
<create-file path="C:\Users\JasonPaff\dev\head-shakers\tests\components\ui\form\focus-management.test.tsx" description="Focus management component tests">
Test coverage for:
- Focus provider functionality
- Field registration and unregistration
- Error focus navigation
- Keyboard navigation handlers
- ARIA compliance
</create-file>
<create-file path="C:\Users\JasonPaff\dev\head-shakers\tests\hooks\use-form-focus-management.test.ts" description="Focus management hook tests">
Test coverage for:
- Hook lifecycle and cleanup
- Focus navigation algorithms
- Error handling and edge cases
- Integration with TanStack Form
</create-file>
<create-file path="C:\Users\JasonPaff\dev\head-shakers\tests\lib\utils\form-focus.utils.test.ts" description="Focus utility function tests">
Test coverage for:
- Element finding and validation
- Scroll behavior and positioning
- ARIA announcement timing
- Cross-browser compatibility
</create-file>
</file-operations>
<dependencies>Testing Library, Vitest, accessibility testing tools</dependencies>
<acceptance-criteria>
- All components have comprehensive test coverage
- Integration tests pass with real forms
- Accessibility tests validate WCAG compliance
- Performance tests ensure no regressions
</acceptance-criteria>
</task>

</tasks>
</phase>

</phases>

<testing-strategy>
<unit-tests>Test individual components and hooks in isolation with mocked dependencies</unit-tests>
<integration-tests>Test complete form workflows with focus management enabled</integration-tests>
<accessibility-tests>Validate WCAG 2.1 AA compliance using axe-core and manual testing</accessibility-tests>
<performance-tests>Ensure focus management doesn't impact form performance significantly</performance-tests>
<cross-browser-tests>Test focus behavior across major browsers and assistive technologies</cross-browser-tests>
</testing-strategy>

<deployment-considerations>
<backward-compatibility>All existing forms continue to work without modification</backward-compatibility>
<progressive-enhancement>Focus management features are opt-in and gracefully degrade</progressive-enhancement>
<bundle-size>Monitor impact on bundle size and implement code splitting if necessary</bundle-size>
<accessibility-testing>Conduct manual testing with screen readers before deployment</accessibility-testing>
</deployment-considerations>

<risk-assessment>
<high-risk>Complex component integration (Select, Combobox) may require custom focus handling</high-risk>
<medium-risk>Browser compatibility issues with focus management APIs</medium-risk>
<medium-risk>Performance impact on large forms with many fields</medium-risk>
<low-risk>TypeScript type complexity in focus management system</low-risk>
<mitigation>Comprehensive testing, gradual rollout, fallback mechanisms for unsupported browsers</mitigation>
</risk-assessment>

</implementation_plan>