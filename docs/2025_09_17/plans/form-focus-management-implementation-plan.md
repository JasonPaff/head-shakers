# Form Focus Management Implementation Plan

**Generated**: 2025-09-17T14:35:15Z
**Original Request**: The app uses tanstack-form with zod for forms. Tanstack-Form is headless and does not come with any built in focus management. The form components/integration in the app needs to be updated to focus the first errored field when invalid forms are submitted
**Refined Request**: Enhanced Feature Specification: Focus Management for Invalid Form Fields - implement comprehensive focus management system that automatically focuses the first errored field when invalid forms are submitted.

## Analysis Summary

- **Feature request refined** with comprehensive project context and accessibility requirements
- **Discovered 20 files** across form system (2 critical, 7 high priority, 1 new file, 10 supporting)
- **Generated 7-step implementation plan** with detailed validation and testing strategy
- **Estimated Duration**: 8-12 hours
- **Complexity**: Medium
- **Risk Level**: Low

## File Discovery Results

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

## Implementation Plan

```xml
<implementation-plan>
  <metadata>
    <feature>Focus Management for TanStack Form Integration</feature>
    <complexity>Medium</complexity>
    <estimated-time>8-12 hours</estimated-time>
    <risk-level>Low</risk-level>
  </metadata>

  <prerequisites>
    <prerequisite>TanStack React Form v1.19.2 already installed and configured</prerequisite>
    <prerequisite>All field components already use FieldAria wrapper</prerequisite>
    <prerequisite>Form validation system is operational</prerequisite>
    <prerequisite>TypeScript strict mode enabled</prerequisite>
  </prerequisites>

  <implementation-steps>
    <step number="1">
      <title>Create Focus Management Hook</title>
      <description>Create a custom hook to manage focus state and provide field registration capabilities. Centralized focus management enables coordinated field focusing based on validation errors.</description>
      <files-modified>
        <file>src/components/ui/form/hooks/use-focus-manager.ts</file>
      </files-modified>
      <code-changes>
        <change file="src/components/ui/form/hooks/use-focus-manager.ts">
          <description>Create useFocusManager hook with field registration system</description>
          <code-snippet>
import { useRef, useCallback } from 'react'
import type { FormApi } from '@tanstack/react-form'

export interface FocusManager {
  registerFieldRef: (name: string, ref: HTMLElement | null) => void
  unregisterFieldRef: (name: string) => void
  focusFirstErrorField: () => void
}

export function useFocusManager(form: FormApi): FocusManager {
  const fieldRefs = useRef<Map<string, HTMLElement>>(new Map())

  const registerFieldRef = useCallback((name: string, ref: HTMLElement | null) => {
    if (ref) {
      fieldRefs.current.set(name, ref)
    } else {
      fieldRefs.current.delete(name)
    }
  }, [])

  const unregisterFieldRef = useCallback((name: string) => {
    fieldRefs.current.delete(name)
  }, [])

  const focusFirstErrorField = useCallback(() => {
    const errors = form.state.errors
    if (!errors || errors.length === 0) return

    // Find first field with error in DOM order
    const errorFieldNames = errors.map(error => error.name || '')
    const registeredFields = Array.from(fieldRefs.current.entries())

    for (const errorField of errorFieldNames) {
      const fieldEntry = registeredFields.find(([name]) => name === errorField)
      if (fieldEntry) {
        const [, element] = fieldEntry
        element.focus()
        break
      }
    }
  }, [form])

  return {
    registerFieldRef,
    unregisterFieldRef,
    focusFirstErrorField
  }
}
          </code-snippet>
        </change>
      </code-changes>
      <validation>
        <check>Hook exports proper TypeScript interfaces</check>
        <check>Field registration and unregistration functions work</check>
        <check>Focus management utilities handle all field types</check>
        <check>All validation commands pass: npm run lint:fix && npm run typecheck</check>
      </validation>
    </step>

    <step number="2">
      <title>Extend Form Context with Focus Management</title>
      <description>Integrate focus management into the existing form context and hooks. Provides focus capabilities to all form components through existing context system.</description>
      <files-modified>
        <file>src/components/ui/form/index.tsx</file>
      </files-modified>
      <code-changes>
        <change file="src/components/ui/form/index.tsx">
          <description>Add focus manager to form creation</description>
          <code-snippet>
import { useFocusManager, type FocusManager } from './hooks/use-focus-manager'

// Extend existing form hook to include focus management
export function useAppForm<T>(options: FormOptions<T> & { enableFocusManagement?: boolean }) {
  const form = createFormHook(options)
  const focusManager = options.enableFocusManagement !== false ? useFocusManager(form) : null

  return {
    ...form,
    focusManager
  }
}

// Create focus context for field components
export const FocusContext = createContext<FocusManager | null>(null)

export function useFocusContext() {
  return useContext(FocusContext)
}
          </code-snippet>
        </change>
      </code-changes>
      <validation>
        <check>Focus manager integrates with existing form creation</check>
        <check>All existing form functionality remains unchanged</check>
        <check>New focus capabilities are available through context</check>
        <check>TypeScript compilation succeeds: npm run typecheck</check>
      </validation>
    </step>

    <step number="3">
      <title>Create Focus-Aware Field Aria Component</title>
      <description>Enhance FieldAria component to register fields for focus management. Enables automatic field registration without changing individual field components.</description>
      <files-modified>
        <file>src/components/ui/form/field-components/field-aria.tsx</file>
      </files-modified>
      <code-changes>
        <change file="src/components/ui/form/field-components/field-aria.tsx">
          <description>Add focus registration to FieldAria</description>
          <code-snippet>
import { forwardRef, useEffect } from 'react'
import { useFocusContext } from '../index'

export const FieldAria = forwardRef<HTMLElement, FieldAriaProps>(
  ({ fieldName, children, ...props }, ref) => {
    const focusManager = useFocusContext()

    useEffect(() => {
      if (focusManager && ref && typeof ref === 'object' && ref.current) {
        focusManager.registerFieldRef(fieldName, ref.current)

        return () => {
          focusManager.unregisterFieldRef(fieldName)
        }
      }
    }, [focusManager, fieldName, ref])

    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    )
  }
)
          </code-snippet>
        </change>
      </code-changes>
      <validation>
        <check>FieldAria component forwards refs properly</check>
        <check>Field registration happens automatically</check>
        <check>Existing ARIA functionality remains intact</check>
        <check>Focus targeting works for all field types</check>
      </validation>
    </step>

    <step number="4">
      <title>Update Submit Button with Focus Management</title>
      <description>Enhance submit button to trigger focus management on validation errors. Provides the submission trigger point for focus management activation.</description>
      <files-modified>
        <file>src/components/ui/form/form-components/submit-button.tsx</file>
      </files-modified>
      <code-changes>
        <change file="src/components/ui/form/form-components/submit-button.tsx">
          <description>Add focus error handling to submit button</description>
          <code-snippet>
import { useFocusContext } from '../index'

export function SubmitButton({ children, ...props }: SubmitButtonProps) {
  const form = useFormContext()
  const focusManager = useFocusContext()

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()

    form.handleSubmit().then((result) => {
      // If validation failed and focus management is available
      if (!result.success && focusManager) {
        // Small delay to ensure error state is updated
        setTimeout(() => {
          focusManager.focusFirstErrorField()
        }, 0)
      }
    })
  }, [form, focusManager])

  return (
    <Button type="submit" onClick={handleSubmit} {...props}>
      {children}
    </Button>
  )
}
          </code-snippet>
        </change>
      </code-changes>
      <validation>
        <check>Submit button detects validation failures</check>
        <check>Focus management activates on form errors</check>
        <check>First errored field receives focus automatically</check>
        <check>Existing submit behavior works unchanged</check>
      </validation>
    </step>

    <step number="5">
      <title>Enhance Field Components with Focus Support</title>
      <description>Update all field components to support ref forwarding for focus management. Ensures all field types can receive programmatic focus when needed.</description>
      <files-modified>
        <file>src/components/ui/form/field-components/text-field.tsx</file>
        <file>src/components/ui/form/field-components/select-field.tsx</file>
        <file>src/components/ui/form/field-components/textarea-field.tsx</file>
        <file>src/components/ui/form/field-components/checkbox-field.tsx</file>
        <file>src/components/ui/form/field-components/switch-field.tsx</file>
        <file>src/components/ui/form/field-components/combobox-field.tsx</file>
        <file>src/components/ui/form/field-components/tag-field.tsx</file>
      </files-modified>
      <code-changes>
        <change file="src/components/ui/form/field-components/text-field.tsx">
          <description>Add forwardRef to TextField component</description>
          <code-snippet>
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ name, ...props }, ref) => {
    return (
      <FieldAria fieldName={name} ref={ref}>
        <Input ref={ref} {...props} />
      </FieldAria>
    )
  }
)
          </code-snippet>
        </change>
      </code-changes>
      <validation>
        <check>All field components forward refs correctly</check>
        <check>Focus management works with all field types</check>
        <check>No breaking changes to existing field APIs</check>
        <check>TypeScript refs are properly typed</check>
      </validation>
    </step>

    <step number="6">
      <title>Add Accessibility Enhancements</title>
      <description>Implement ARIA live regions and screen reader announcements for focus changes. Ensures focus management meets WCAG 2.1 AA accessibility requirements.</description>
      <files-modified>
        <file>src/components/ui/form/field-components/field-aria.tsx</file>
        <file>src/components/ui/form/hooks/use-focus-manager.ts</file>
      </files-modified>
      <code-changes>
        <change file="src/components/ui/form/field-components/field-aria.tsx">
          <description>Add ARIA live region for focus announcements</description>
          <code-snippet>
// Add ARIA live region for screen reader announcements
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {focusedField && `Focused on ${focusedField} field with validation error`}
</div>
          </code-snippet>
        </change>
      </code-changes>
      <validation>
        <check>ARIA live regions announce focus changes</check>
        <check>Screen readers receive proper error notifications</check>
        <check>Focus management maintains accessibility compliance</check>
        <check>Existing accessibility features work unchanged</check>
      </validation>
    </step>

    <step number="7">
      <title>Create Comprehensive Test Suite</title>
      <description>Implement unit, integration, and accessibility tests for focus management. Ensures focus management works correctly across all scenarios and maintains quality.</description>
      <files-modified>
        <file>tests/unit/components/ui/form/hooks/use-focus-manager.test.tsx</file>
        <file>tests/integration/components/ui/form/focus-management.test.tsx</file>
        <file>tests/accessibility/form-focus-management.test.tsx</file>
      </files-modified>
      <code-changes>
        <change file="tests/unit/components/ui/form/hooks/use-focus-manager.test.tsx">
          <description>Create comprehensive unit tests for focus management hook</description>
          <code-snippet>
describe('useFocusManager', () => {
  it('should register and unregister field refs', () => {
    // Test field registration functionality
  })

  it('should focus first errored field', () => {
    // Test focus management on validation errors
  })

  it('should handle multiple field types correctly', () => {
    // Test all supported field types
  })
})
          </code-snippet>
        </change>
      </code-changes>
      <validation>
        <check>All focus management functionality is tested</check>
        <check>Tests pass for all field types and scenarios</check>
        <check>Accessibility tests verify WCAG compliance</check>
        <check>Performance tests show no regressions</check>
      </validation>
    </step>
  </implementation-steps>

  <testing-strategy>
    <unit-tests>
      <test>Test useFocusManager hook field registration and unregistration</test>
      <test>Test focus management with different field types</test>
      <test>Test error field identification and focusing logic</test>
      <test>Test TypeScript type safety for all focus management operations</test>
    </unit-tests>
    <integration-tests>
      <test>Test complete form submission flow with focus management</test>
      <test>Test complex multi-section forms like bobblehead creation</test>
      <test>Test focus management with server action integration</test>
      <test>Test focus behavior with different validation scenarios</test>
    </integration-tests>
    <accessibility-tests>
      <test>Test WCAG 2.1 AA compliance with automated accessibility tools</test>
      <test>Test screen reader announcements for focus changes</test>
      <test>Test keyboard navigation and focus order</test>
      <test>Test ARIA live region functionality</test>
    </accessibility-tests>
  </testing-strategy>

  <quality-gates>
    <gate>All TypeScript files pass `npm run typecheck`</gate>
    <gate>All files pass `npm run lint:fix`</gate>
    <gate>All tests pass with `npm run test`</gate>
    <gate>Focus management works with all field types</gate>
    <gate>WCAG 2.1 AA compliance maintained</gate>
    <gate>No breaking changes to existing form API</gate>
    <gate>Performance benchmarks show no significant regression</gate>
  </quality-gates>

  <rollback-plan>
    <step>Revert all field component changes to remove ref forwarding</step>
    <step>Remove focus management hook and context additions</step>
    <step>Restore original submit button functionality</step>
    <step>Remove ARIA enhancements that depend on focus management</step>
    <step>Delete focus management test files</step>
    <step>Verify all existing functionality works as before</step>
  </rollback-plan>
</implementation-plan>
```

## Architecture Considerations

- **Seamless Integration**: Focus management integrates with existing TanStack Form patterns without disrupting current functionality
- **Backward Compatibility**: All changes are additive and maintain existing form API compatibility
- **TypeScript Safety**: Comprehensive type definitions ensure compile-time safety for all focus operations
- **Performance**: Minimal overhead with efficient field registration and ref management

## Risk Mitigation

- **Gradual Implementation**: Step-by-step approach allows testing and validation at each stage
- **Comprehensive Testing**: Unit, integration, and accessibility tests ensure reliability
- **Rollback Strategy**: Clear rollback plan available if issues arise
- **Quality Gates**: Multiple validation checkpoints prevent integration issues

## Accessibility Compliance

- **WCAG 2.1 AA**: Focus management follows accessibility guidelines for keyboard navigation
- **Screen Reader Support**: ARIA live regions provide proper announcements for focus changes
- **Error Identification**: Enhanced error discovery improves user experience for all users
- **Existing Features**: All current accessibility features are preserved and enhanced