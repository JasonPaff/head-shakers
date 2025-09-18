# Form Error Focus Management Implementation Plan
Generated: 2025-09-17T09:05:45.000Z
Original Request: The app uses tanstack-form with zod for forms. Tanstack-Form is headless and does not come with any built in focus management. The form components/integration in the app needs to be updated to focus the first errored field when invalid forms are submitted
Refined Request: TanStack Form Error Focus Management Enhancement for Head Shakers Platform

## Analysis Summary
- Feature request refined with Head Shakers project context
- Discovered 20 files across 4 categories (9 high priority, 9 medium priority, 2 low priority)
- Generated 8-step implementation plan with 22-hour estimated timeline

## File Discovery Results

### HIGH PRIORITY - Core Form System Files (9 files)
- `src/components/ui/form/index.tsx` - Central hub for all form-related exports, contains `useAppForm` hook
- `src/components/ui/form/form-components/submit-button.tsx` - Form submission component, integration point for error focus logic
- `src/components/ui/form/field-components/text-field.tsx` - Most commonly used field, needs ref forwarding
- `src/components/ui/form/field-components/field-error.tsx` - Error display component
- `src/components/ui/form/field-components/field-item.tsx` - Base wrapper for all field components
- `src/app/(app)/bobbleheads/add/components/add-item-form-client.tsx` - Primary test case for implementation
- `src/components/feature/collections/dialogs/create-collection-dialog.tsx` - Modal form requiring focus management
- `src/components/feature/collections/dialogs/edit-collection-dialog.tsx` - Collection editing dialog
- `src/components/feature/bobbleheads/dialogs/edit-bobblehead-dialog.tsx` - Bobblehead editing form

### MEDIUM PRIORITY - Additional Field Components (7 files)
- `src/components/ui/form/field-components/textarea-field.tsx`
- `src/components/ui/form/field-components/checkbox-field.tsx`
- `src/components/ui/form/field-components/select-field.tsx`
- `src/components/ui/form/field-components/combobox-field.tsx`
- `src/components/ui/form/field-components/switch-field.tsx`
- `src/components/ui/form/field-components/tag-field.tsx`
- Plus additional form implementations across the app

## Implementation Plan

```xml
<?xml version="1.0" encoding="UTF-8"?>
<implementation-plan>
  <project>Head Shakers - TanStack Form Error Focus Management</project>
  <version>1.0</version>
  <created>2025-09-17</created>

  <overview>
    <description>
      Implement automatic focus management for TanStack Form validation errors.
      When forms are submitted with validation errors, automatically focus the first field with an error.
    </description>
    <impact>
      <area>Bobblehead creation and editing forms</area>
      <area>Collection management dialogs</area>
      <area>Admin featured content forms</area>
      <area>All other forms using the centralized form system</area>
    </impact>
  </overview>

  <technical-requirements>
    <requirement>TanStack Form v1.19.2 compatibility</requirement>
    <requirement>React 19.1.0 with TypeScript</requirement>
    <requirement>Integration with existing useAppForm hook</requirement>
    <requirement>Support for all 7 field component types</requirement>
    <requirement>Radix UI component compatibility</requirement>
    <requirement>Strict TypeScript type safety (no any types)</requirement>
  </technical-requirements>

  <implementation-steps>

    <step id="1" priority="critical" estimated-hours="4">
      <title>Create Focus Management Utility</title>
      <description>
        Create a centralized utility function to handle focus management logic
        that can be reused across all form implementations.
      </description>
      <file-changes>
        <file action="create" path="src/lib/utils/form-focus-utils.ts">
          <code-example>
import type { FieldApi } from '@tanstack/react-form'

export interface FocusableField {
  name: string
  ref: React.RefObject&lt;HTMLElement&gt; | null
  hasError: boolean
  errorIndex?: number
}

export function focusFirstErrorField(fields: FocusableField[]): boolean {
  const fieldsWithErrors = fields
    .filter(field =&gt; field.hasError && field.ref?.current)
    .sort((a, b) =&gt; (a.errorIndex || 0) - (b.errorIndex || 0))

  if (fieldsWithErrors.length &gt; 0) {
    const firstErrorField = fieldsWithErrors[0]
    firstErrorField.ref?.current?.focus()

    // Scroll into view if needed
    firstErrorField.ref?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })

    return true
  }

  return false
}

export function getFieldErrorIndex(fieldApi: FieldApi&lt;any, any, any, any&gt;): number | undefined {
  // Get the DOM element order index for consistent focus ordering
  const element = document.querySelector(`[name="${fieldApi.name}"]`)
  if (!element) return undefined

  const form = element.closest('form')
  if (!form) return undefined

  const formElements = Array.from(form.elements)
  return formElements.indexOf(element as Element)
}
          </code-example>
        </file>
      </file-changes>
      <validation>
        <check>Utility functions compile without TypeScript errors</check>
        <check>Functions handle edge cases (no errors, no refs, no DOM elements)</check>
        <check>Focus behavior works correctly in browser environment</check>
      </validation>
    </step>

    <step id="2" priority="critical" estimated-hours="6">
      <title>Enhance Core Form Hook</title>
      <description>
        Extend the useAppForm hook to support error focus management by integrating
        with TanStack Form's onSubmitInvalid callback.
      </description>
      <file-changes>
        <file action="modify" path="src/components/ui/form/index.tsx">
          <changes>
            <change>Add focus management to useAppForm hook</change>
            <change>Integrate with TanStack Form onSubmitInvalid callback</change>
            <change>Export enhanced hook with backward compatibility</change>
          </changes>
          <code-example>
import { useForm } from '@tanstack/react-form'
import { useRef, useCallback } from 'react'
import { focusFirstErrorField, type FocusableField } from '@/lib/utils/form-focus-utils'

export interface UseAppFormOptions&lt;TFormData&gt; {
  // Existing options...
  enableErrorFocus?: boolean // New optional feature flag
}

export function useAppForm&lt;TFormData&gt;(options: UseAppFormOptions&lt;TFormData&gt;) {
  const fieldRefsRef = useRef&lt;Map&lt;string, React.RefObject&lt;HTMLElement&gt;&gt;&gt;(new Map())

  const handleSubmitInvalid = useCallback(() =&gt; {
    if (options.enableErrorFocus !== false) { // Default to enabled
      const fields: FocusableField[] = []

      // Collect all field refs and their error states
      fieldRefsRef.current.forEach((ref, fieldName) =&gt; {
        const fieldApi = form.getFieldInfo(fieldName)
        const hasError = fieldApi?.errorMap && Object.keys(fieldApi.errorMap).length &gt; 0

        if (ref && hasError) {
          fields.push({
            name: fieldName,
            ref,
            hasError: true,
            errorIndex: getFieldErrorIndex(fieldApi)
          })
        }
      })

      focusFirstErrorField(fields)
    }
  }, [options.enableErrorFocus])

  const form = useForm({
    ...options,
    onSubmitInvalid: handleSubmitInvalid
  })

  const registerFieldRef = useCallback((fieldName: string, ref: React.RefObject&lt;HTMLElement&gt;) =&gt; {
    fieldRefsRef.current.set(fieldName, ref)
  }, [])

  const unregisterFieldRef = useCallback((fieldName: string) =&gt; {
    fieldRefsRef.current.delete(fieldName)
  }, [])

  return {
    ...form,
    registerFieldRef,
    unregisterFieldRef
  }
}
          </code-example>
        </file>
      </file-changes>
      <validation>
        <check>Enhanced hook maintains backward compatibility</check>
        <check>New focus management integrates properly with TanStack Form</check>
        <check>Field registration system works correctly</check>
        <check>TypeScript types are properly extended</check>
      </validation>
    </step>

    <step id="3" priority="critical" estimated-hours="8">
      <title>Update All Field Components</title>
      <description>
        Modify all 7 field components to support ref forwarding and integrate
        with the focus management system.
      </description>
      <file-changes>
        <file action="modify" path="src/components/ui/form/field-components/text-field.tsx">
          <changes>
            <change>Add React.forwardRef wrapper</change>
            <change>Integrate with form focus management</change>
            <change>Maintain existing component API</change>
          </changes>
          <code-example>
import React, { forwardRef, useEffect, useRef } from 'react'
import { useFieldContext } from '../field-context'

export interface TextFieldProps {
  // Existing props...
}

export const TextField = forwardRef&lt;HTMLInputElement, TextFieldProps&gt;(
  (props, ref) =&gt; {
    const field = useFieldContext()
    const internalRef = useRef&lt;HTMLInputElement&gt;(null)
    const fieldRef = ref || internalRef

    // Register with form focus management
    useEffect(() =&gt; {
      if (form?.registerFieldRef && fieldRef && 'current' in fieldRef) {
        form.registerFieldRef(field.name, fieldRef as React.RefObject&lt;HTMLElement&gt;)

        return () =&gt; {
          form.unregisterFieldRef?.(field.name)
        }
      }
    }, [field.name, fieldRef, form])

    return (
      &lt;Input
        ref={fieldRef}
        name={field.name}
        value={field.state.value}
        onChange={(e) =&gt; field.handleChange(e.target.value)}
        // ... other existing props
      /&gt;
    )
  }
)

TextField.displayName = 'TextField'
          </code-example>
        </file>
        <file action="modify" path="src/components/ui/form/field-components/textarea-field.tsx">
          <changes>
            <change>Apply same forwardRef pattern as TextField</change>
            <change>Integrate with focus management system</change>
          </changes>
        </file>
        <file action="modify" path="src/components/ui/form/field-components/checkbox-field.tsx">
          <changes>
            <change>Apply forwardRef pattern with checkbox-specific handling</change>
            <change>Ensure focus works correctly for checkbox inputs</change>
          </changes>
        </file>
        <file action="modify" path="src/components/ui/form/field-components/select-field.tsx">
          <changes>
            <change>Apply forwardRef pattern for Radix Select components</change>
            <change>Handle focus for compound Radix UI components</change>
          </changes>
        </file>
        <file action="modify" path="src/components/ui/form/field-components/combobox-field.tsx">
          <changes>
            <change>Apply forwardRef pattern for complex combobox component</change>
            <change>Ensure focus works with searchable input elements</change>
          </changes>
        </file>
        <file action="modify" path="src/components/ui/form/field-components/switch-field.tsx">
          <changes>
            <change>Apply forwardRef pattern for switch components</change>
            <change>Handle focus for toggle-style inputs</change>
          </changes>
        </file>
        <file action="modify" path="src/components/ui/form/field-components/tag-field.tsx">
          <changes>
            <change>Apply forwardRef pattern for tag input component</change>
            <change>Focus on primary input element within tag field</change>
          </changes>
        </file>
      </file-changes>
      <validation>
        <check>All 7 field components support ref forwarding</check>
        <check>Components integrate with focus management system</check>
        <check>Existing component APIs remain unchanged</check>
        <check>Focus behavior works correctly for each component type</check>
        <check>Radix UI component integration maintains accessibility</check>
      </validation>
    </step>

    <step id="4" priority="high" estimated-hours="3">
      <title>Update Field Context System</title>
      <description>
        Ensure the field context system provides access to the form instance
        for focus management registration.
      </description>
      <file-changes>
        <file action="modify" path="src/components/ui/form/field-context.tsx">
          <changes>
            <change>Add form instance to field context</change>
            <change>Ensure backward compatibility</change>
            <change>Update TypeScript types</change>
          </changes>
          <code-example>
import { createContext, useContext } from 'react'
import type { FieldApi } from '@tanstack/react-form'

export interface FieldContextValue {
  field: FieldApi&lt;any, any, any, any&gt;
  form?: {
    registerFieldRef?: (name: string, ref: React.RefObject&lt;HTMLElement&gt;) =&gt; void
    unregisterFieldRef?: (name: string) =&gt; void
  }
}

export const FieldContext = createContext&lt;FieldContextValue | null&gt;(null)

export function useFieldContext() {
  const context = useContext(FieldContext)
  if (!context) {
    throw new Error('useFieldContext must be used within a Field component')
  }
  return context
}
          </code-example>
        </file>
      </file-changes>
      <validation>
        <check>Field context provides form instance access</check>
        <check>Context updates maintain backward compatibility</check>
        <check>TypeScript types are correctly updated</check>
      </validation>
    </step>

    <step id="5" priority="high" estimated-hours="4">
      <title>Test with Primary Form Implementation</title>
      <description>
        Test the focus management implementation with the bobblehead creation form
        as the primary validation case.
      </description>
      <file-changes>
        <file action="modify" path="src/app/(app)/bobbleheads/add/components/add-item-form-client.tsx">
          <changes>
            <change>Enable error focus management in useAppForm call</change>
            <change>Verify integration with existing validation</change>
            <change>Test with multiple field types</change>
          </changes>
          <code-example>
export function AddItemFormClient() {
  const form = useAppForm({
    // ... existing options
    enableErrorFocus: true // Enable focus management
  })

  // ... rest of component remains unchanged
}
          </code-example>
        </file>
      </file-changes>
      <validation>
        <check>Focus management works in bobblehead creation form</check>
        <check>First error field receives focus on invalid submission</check>
        <check>Focus behavior works with form validation</check>
        <check>No regressions in existing form functionality</check>
      </validation>
    </step>

    <step id="6" priority="medium" estimated-hours="6">
      <title>Update Additional Form Implementations</title>
      <description>
        Roll out focus management to other key form implementations across the platform.
      </description>
      <file-changes>
        <file action="modify" path="src/components/feature/collections/dialogs/create-collection-dialog.tsx">
          <changes>
            <change>Enable error focus management</change>
            <change>Test in modal dialog context</change>
          </changes>
        </file>
        <file action="modify" path="src/components/feature/collections/dialogs/edit-collection-dialog.tsx">
          <changes>
            <change>Enable error focus management</change>
            <change>Ensure consistency with create dialog</change>
          </changes>
        </file>
        <file action="modify" path="src/components/feature/bobbleheads/dialogs/edit-bobblehead-dialog.tsx">
          <changes>
            <change>Enable error focus management</change>
            <change>Test with complex form in modal context</change>
          </changes>
        </file>
      </file-changes>
      <validation>
        <check>Focus management works in all modal dialog forms</check>
        <check>Focus behavior is consistent across similar forms</check>
        <check>Modal focus management doesn't interfere with dialog accessibility</check>
      </validation>
    </step>

    <step id="7" priority="low" estimated-hours="4">
      <title>Accessibility Enhancements</title>
      <description>
        Add accessibility improvements to complement the focus management system.
      </description>
      <file-changes>
        <file action="modify" path="src/components/ui/form/field-components/field-error.tsx">
          <changes>
            <change>Add aria-live regions for error announcements</change>
            <change>Improve screen reader experience with focus changes</change>
          </changes>
          <code-example>
export function FieldError({ children }: FieldErrorProps) {
  return (
    &lt;div
      className="text-sm text-destructive"
      role="alert"
      aria-live="polite"
    &gt;
      {children}
    &lt;/div&gt;
  )
}
          </code-example>
        </file>
      </file-changes>
      <validation>
        <check>Screen readers announce error focus changes</check>
        <check>ARIA attributes improve accessibility</check>
        <check>Focus management doesn't break keyboard navigation</check>
      </validation>
    </step>

    <step id="8" priority="high" estimated-hours="3">
      <title>Comprehensive Testing</title>
      <description>
        Create and execute comprehensive tests to validate the focus management implementation.
      </description>
      <file-changes>
        <file action="create" path="tests/unit/form-focus-management.test.tsx">
          <changes>
            <change>Test focus utility functions</change>
            <change>Test form hook integration</change>
            <change>Test field component ref forwarding</change>
          </changes>
        </file>
        <file action="create" path="tests/integration/form-error-focus.test.tsx">
          <changes>
            <change>Test focus behavior in real form implementations</change>
            <change>Test across different field types</change>
            <change>Test modal dialog integration</change>
          </changes>
        </file>
      </file-changes>
      <validation>
        <check>Unit tests pass for all focus management utilities</check>
        <check>Integration tests validate real-world usage</check>
        <check>Tests cover edge cases and error conditions</check>
        <check>All existing tests continue to pass</check>
      </validation>
    </step>

  </implementation-steps>

  <testing-strategy>
    <unit-tests>
      <test>Focus utility functions with various input scenarios</test>
      <test>Form hook registration and unregistration</test>
      <test>Field component ref forwarding</test>
      <test>TypeScript type safety validation</test>
    </unit-tests>

    <integration-tests>
      <test>Focus management in bobblehead creation form</test>
      <test>Focus management in collection dialog forms</test>
      <test>Focus behavior across different field types</test>
      <test>Modal dialog focus integration</test>
      <test>Multiple error field scenarios</test>
    </integration-tests>

    <manual-tests>
      <test>Keyboard navigation compatibility</test>
      <test>Screen reader accessibility</test>
      <test>Visual focus indicators</test>
      <test>Mobile device touch interaction</test>
    </manual-tests>
  </testing-strategy>

  <risk-assessment>
    <risk level="medium">
      <description>Breaking changes to existing form behavior</description>
      <mitigation>
        <action>Implement as opt-in feature with enableErrorFocus flag</action>
        <action>Maintain strict backward compatibility</action>
        <action>Comprehensive regression testing</action>
      </mitigation>
    </risk>

    <risk level="low">
      <description>Performance impact from ref management</description>
      <mitigation>
        <action>Use efficient Map-based ref storage</action>
        <action>Properly clean up refs on unmount</action>
        <action>Monitor performance in complex forms</action>
      </mitigation>
    </risk>

    <risk level="low">
      <description>Accessibility issues with programmatic focus</description>
      <mitigation>
        <action>Follow ARIA best practices</action>
        <action>Test thoroughly with screen readers</action>
        <action>Provide smooth scroll behavior</action>
      </mitigation>
    </risk>
  </risk-assessment>

  <success-criteria>
    <criterion>Users automatically receive focus on first error field when submitting invalid forms</criterion>
    <criterion>Focus management works across all 7 field component types</criterion>
    <criterion>Implementation integrates seamlessly with existing form system</criterion>
    <criterion>No breaking changes to existing form implementations</criterion>
    <criterion>TypeScript type safety is maintained throughout</criterion>
    <criterion>Accessibility standards are met or improved</criterion>
    <criterion>Performance impact is negligible</criterion>
  </success-criteria>

  <rollout-plan>
    <phase name="Core Implementation">
      <steps>1, 2, 3, 4</steps>
      <timeline>2-3 days</timeline>
      <validation>Focus management working in isolated test environment</validation>
    </phase>

    <phase name="Primary Integration">
      <steps>5</steps>
      <timeline>1 day</timeline>
      <validation>Bobblehead creation form has working focus management</validation>
    </phase>

    <phase name="Platform Rollout">
      <steps>6, 7</steps>
      <timeline>2 days</timeline>
      <validation>All major forms have focus management enabled</validation>
    </phase>

    <phase name="Testing &amp; Validation">
      <steps>8</steps>
      <timeline>1 day</timeline>
      <validation>Comprehensive test suite passes, ready for production</validation>
    </phase>
  </rollout-plan>

</implementation-plan>
```