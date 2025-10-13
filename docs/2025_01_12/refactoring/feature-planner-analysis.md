# Feature Planner Components - React Conventions Analysis

**Date**: 2025-01-12
**Scope**: All components in `/feature-planner` route

## Executive Summary

The feature-planner components have several violations of the React Coding Conventions and contain very large components that should be refactored into smaller, more maintainable pieces. The main issues are:

1. **Large components** with excessive JSX that should be broken down
2. **Duplicated JSX blocks** that should be extracted into reusable components
3. **Inconsistent component organization** (not following 7-step pattern)
4. **Missing UI block comments** for better code readability
5. **Convention mismatch** between documentation and implementation

---

## Critical Issues

### 1. Convention Documentation vs Implementation Mismatch

**File**: `.claude/conventions/React-Coding-Conventions.md` vs `src/components/ui/conditional.tsx`

**Issue**: The conventions document shows using `condition` prop:

```tsx
<Conditional condition={_isDataReady}>
  <ComplexDashboard />
</Conditional>
```

But the actual `Conditional` component uses `isCondition`:

```tsx
interface ConditionalRenderProps {
  isCondition: (() => boolean | null | undefined) | boolean | null | undefined;
}
```

**Impact**: Confusion for developers following conventions

**Recommendation**: Update conventions document to use `isCondition` OR update the component to use `condition` (prefer updating docs since code is already using `isCondition` throughout)

---

## Component-Specific Issues

### page.tsx (Main Feature Planner Page)

**File**: `src/app/(app)/feature-planner/page.tsx`
**Lines**: 668
**Severity**: HIGH

#### Issues:

1. **Component Too Large** (668 lines)
   - Should be under 300 lines
   - Too many responsibilities

2. **State Management Pattern** (Lines 50-69)

   ```tsx
   const [state, setState] = useState<FeaturePlannerState>({
     allRefinements: null,
     discoverySession: null,
     isDiscoveringFiles: false,
     // ... 15+ properties
   });
   ```

   **Violation**: Conventions recommend multiple `useState` calls for separate concerns

   **Should be**:

   ```tsx
   const [isDiscoveringFiles, setIsDiscoveringFiles] = useState(false);
   const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
   const [isRefining, setIsRefining] = useState(false);
   // etc.
   ```

3. **Handler Functions Not Properly Organized**
   - Many large handlers (50-100+ lines each)
   - Should be extracted into custom hooks or separate functions
   - Examples:
     - `handleRefineRequest` (lines 75-189) - 115 lines
     - `handleParallelRefineRequest` (lines 191-266) - 76 lines
     - `handleFileDiscovery` (lines 387-450) - 64 lines
     - `handleImplementationPlanning` (lines 488-591) - 104 lines

4. **Missing Component Organization**
   - Doesn't clearly follow 7-step pattern:
     1. useState hooks ✓ (but should be split)
     2. Other hooks ❌ (missing section)
     3. useMemo hooks ❌ (none used)
     4. useEffect hooks ❌ (none used)
     5. Utility functions ❌ (inline logic instead)
     6. Event handlers ✓ (but too large)
     7. Derived variables ✓ (lines 593-597)

5. **Missing UI Block Comments**
   - Return JSX (lines 609-667) has minimal comments
   - Only 4 comments for a 60-line JSX block

#### Recommendations:

- **Extract custom hooks**:
  - `useRefinementFlow()` - handle refinement logic
  - `useFileDiscovery()` - handle file discovery
  - `useImplementationPlan()` - handle plan generation

- **Split state** into individual `useState` calls

- **Add comprehensive UI block comments**

- **Consider splitting** into smaller components if still too large after refactoring

---

### refinement-results.tsx

**File**: `src/app/(app)/feature-planner/components/refinement-results.tsx`
**Lines**: 413
**Severity**: HIGH

#### Issues:

1. **Component Way Too Large** (413 lines)
   - Second-largest component after main page

2. **Massive Code Duplication** (Lines 100-224 vs 226-386)
   - Single refinement view and multiple refinements view have ~90% identical JSX
   - **186 lines of duplicated code**

   **Duplicated blocks**:
   - Metadata badges section (lines 113-137 vs 251-275)
   - Refined request display/editing (lines 140-182 vs 278-320)
   - Validation errors (lines 184-194 vs 322-332)
   - Action buttons (lines 196-221 vs 334-382)

3. **Inline Utility Functions**
   - No clear utility functions section
   - Logic embedded in JSX

4. **Missing UI Block Comments**
   - Large JSX blocks without comments
   - Hard to identify sections

#### Recommendations:

**Extract the following components:**

1. **RefinementCard** - Reusable card for displaying a single refinement

   ```tsx
   interface RefinementCardProps {
     refinement: FeatureRefinement;
     isSelected: boolean;
     isEditing: boolean;
     currentText: string;
     onEdit: () => void;
     onSelect: () => void;
     onTextChange: (text: string) => void;
   }
   ```

2. **RefinementMetadata** - Badges display

   ```tsx
   interface RefinementMetadataProps {
     wordCount: number;
     executionTimeMs: number | null;
     totalTokens: number | null;
     isSelected: boolean;
     isEdited: boolean;
   }
   ```

3. **RefinementContent** - Text display/editing

   ```tsx
   interface RefinementContentProps {
     text: string;
     isEditing: boolean;
     onChange: (text: string) => void;
     onEditToggle: () => void;
     onReset: () => void;
   }
   ```

4. **ValidationErrorsDisplay** - Validation issues
   ```tsx
   interface ValidationErrorsDisplayProps {
     errors: Array<{ message: string }>;
   }
   ```

**After extraction, component should be ~150 lines**

---

### file-discovery-results.tsx

**File**: `src/app/(app)/feature-planner/components/file-discovery-results.tsx`
**Lines**: 411
**Severity**: MEDIUM-HIGH

#### Issues:

1. **Component Too Large** (411 lines)

2. **Complex Nested JSX**
   - Deep nesting makes it hard to read
   - Lines 232-402 are a single massive map function

3. **Inline Utility Functions** (Lines 110-146)
   - Should be in dedicated utility functions section
   - Examples: `getAllFileKeys`, `getGroupFileKeys`, `handleSelectAll`, etc.

4. **Missing UI Block Comments**
   - Minimal comments for large sections

#### Recommendations:

**Extract the following components:**

1. **PriorityStatsGrid** (Lines 170-199)

   ```tsx
   interface PriorityStatsGridProps {
     criticalCount: number;
     highCount: number;
     mediumCount: number;
     lowCount: number;
     manualCounts: {
       critical: number;
       high: number;
       medium: number;
       low: number;
     };
   }
   ```

2. **FileSelectionControls** (Lines 202-220)

   ```tsx
   interface FileSelectionControlsProps {
     isAllSelected: boolean;
     selectedCount: number;
     onSelectAll: () => void;
     onDeselectAll: () => void;
   }
   ```

3. **PriorityGroup** (Lines 232-402)

   ```tsx
   interface PriorityGroupProps {
     label: string;
     variant: BadgeVariant;
     files: DiscoveredFile[];
     manualFiles: ManualFile[];
     selectedFiles: string[];
     onSelectFiles: (files: string[]) => void;
     onRemoveManualFile?: (filePath: string) => void;
   }
   ```

4. **DiscoveredFileItem**

   ```tsx
   interface DiscoveredFileItemProps {
     file: DiscoveredFile;
     isSelected: boolean;
     onToggleSelection: (checked: boolean) => void;
   }
   ```

5. **ManualFileItem**
   ```tsx
   interface ManualFileItemProps {
     file: ManualFile;
     isSelected: boolean;
     onToggleSelection: (checked: boolean) => void;
     onRemove?: () => void;
   }
   ```

**After extraction, component should be ~150 lines**

---

### plan-viewer-client.tsx

**File**: `src/components/feature/feature-planner/plan-viewer-client.tsx`
**Lines**: 354
**Severity**: MEDIUM

#### Issues:

1. **Component Size** (354 lines)
   - Better than others but still could be smaller

2. **Utility Functions Not Memoized** (Lines 89-118)

   ```tsx
   const getComplexityColor = (complexity: null | string) => {
     /* ... */
   };
   const getRiskLevelColor = (riskLevel: null | string) => {
     /* ... */
   };
   ```

   - Should use `useCallback` since they're used in render
   - Or move outside component if they don't need props/state

3. **Missing Derived Variables with `_` Prefix**
   - Lines 252-255: `hasCommands` and `hasValidationCommands` should be `_hasCommands` and `_hasValidationCommands`

4. **Missing UI Block Comments**
   - Large JSX sections without clear labels

#### Recommendations:

- Move color utility functions outside component (they're pure functions)
- Add `_` prefix to derived variables
- Consider extracting:
  - **PlanMetadataCard** (Lines 174-234)
  - **PlanStepItem** (Lines 258-344)

**After extraction, component should be ~200 lines**

---

### step-two.tsx

**File**: `src/app/(app)/feature-planner/components/steps/step-two.tsx`
**Lines**: 147
**Severity**: LOW

#### Good Practices:

✅ Good use of early returns for loading states
✅ Derived variable with `_` prefix (line 117)
✅ Clean component structure

#### Minor Issues:

1. **Missing UI Block Comments** in return JSX

#### Recommendations:

- Add UI block comments to main sections
- Consider extracting loading state into separate component if reused

---

### request-input.tsx

**File**: `src/app/(app)/feature-planner/components/request-input.tsx`
**Lines**: 111
**Severity**: LOW

#### Good Practices:

✅ Derived variables with `_` prefix (lines 41-43)
✅ Clean component organization
✅ Appropriate size

#### Minor Issues:

1. **Missing UI block comments** in return JSX

#### Recommendations:

- Add UI block comments to main sections

---

## Pattern Compliance Summary

| Component                  | Size   | Duplication | Organization | Comments   | Overall                 |
| -------------------------- | ------ | ----------- | ------------ | ---------- | ----------------------- |
| page.tsx                   | ❌ 668 | ✅ None     | ❌ Poor      | ⚠️ Minimal | ❌ Needs Major Refactor |
| refinement-results.tsx     | ❌ 413 | ❌ High     | ⚠️ Fair      | ❌ None    | ❌ Needs Major Refactor |
| file-discovery-results.tsx | ❌ 411 | ✅ None     | ⚠️ Fair      | ❌ None    | ⚠️ Needs Refactor       |
| plan-viewer-client.tsx     | ⚠️ 354 | ✅ None     | ✅ Good      | ⚠️ Minimal | ⚠️ Needs Minor Refactor |
| step-two.tsx               | ✅ 147 | ✅ None     | ✅ Good      | ⚠️ Minimal | ✅ Minor Improvements   |
| request-input.tsx          | ✅ 111 | ✅ None     | ✅ Good      | ⚠️ Minimal | ✅ Minor Improvements   |
| step-orchestrator.tsx      | ✅ 110 | ✅ None     | ✅ Good      | ✅ Present | ✅ Good                 |
| step-one.tsx               | ✅ 45  | ✅ None     | ✅ Good      | ✅ Present | ✅ Good                 |
| step-three.tsx             | ✅ 124 | ✅ None     | ✅ Good      | ✅ Present | ✅ Good                 |

---

## Common Issues Across All Components

### 1. UI Block Comments

**Missing or minimal** in most components. Per conventions:

```tsx
return (
  <div>
    {/* User Information Section */}
    <section className={'user-info'}>
      <h2>{user.name}</h2>
    </section>

    {/* Action Controls */}
    <div className={'actions'}>
      <Button>Edit</Button>
    </div>
  </div>
);
```

**Current state**: Most components lack these comments entirely

### 2. Component Size Guidelines

**Convention**: Components should ideally be under 300 lines

**Current state**:

- page.tsx: 668 lines (223% over)
- refinement-results.tsx: 413 lines (138% over)
- file-discovery-results.tsx: 411 lines (137% over)
- plan-viewer-client.tsx: 354 lines (118% over)

### 3. Utility Functions Placement

**Convention**: Utility functions should be in dedicated section (step 5 of 7-step pattern)

**Current state**: Most components have utility functions inline or at wrong position

---

## Refactoring Priority

### High Priority (Complete within 1-2 days)

1. **page.tsx** - Extract custom hooks and split state
2. **refinement-results.tsx** - Extract RefinementCard and sub-components
3. **file-discovery-results.tsx** - Extract file item components

### Medium Priority (Complete within 3-4 days)

4. **plan-viewer-client.tsx** - Extract metadata and step components
5. **Add UI block comments** to all components

### Low Priority (Complete within 1 week)

6. **Update conventions documentation** - Fix `condition` vs `isCondition` mismatch
7. **Add comprehensive tests** for new extracted components

---

## Estimated Impact

**Before Refactoring:**

- Total lines: ~2,300
- Average component size: 256 lines
- Components > 300 lines: 4
- Duplicated code: ~186 lines

**After Refactoring:**

- Total lines: ~2,400 (slight increase due to component interfaces)
- Average component size: ~120 lines
- Components > 300 lines: 0
- Duplicated code: 0 lines
- New reusable components: 15+

**Benefits:**

- ✅ Better maintainability
- ✅ Easier testing
- ✅ Better code reusability
- ✅ Clearer component responsibilities
- ✅ Easier onboarding for new developers
- ✅ Follows established patterns

---

## Next Steps

1. Review and approve this analysis
2. Create task breakdown for refactoring work
3. Begin with high-priority components
4. Add comprehensive tests for extracted components
5. Update conventions documentation
6. Code review and validation
