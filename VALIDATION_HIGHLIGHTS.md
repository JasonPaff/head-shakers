# Bobblehead Navigation - Validation Highlights

## Best Practices Found in Implementation

### 1. Keyboard Navigation Best Practice

**Location**: `bobblehead-navigation.tsx` lines 81-112

**What Makes This Excellent**:
- Smart input detection prevents keyboard navigation conflicts
- Proper event prevention avoids browser defaults
- Clear dependency array management
- Cleanup function to prevent memory leaks

```tsx
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Smart input detection - doesn't interfere with user typing
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        if (navigationData.previousBobblehead) {
          event.preventDefault();  // Prevents default scroll behavior
          handleNavigatePrevious();
        }
        break;
      case 'ArrowRight':
        if (navigationData.nextBobblehead) {
          event.preventDefault();
          handleNavigateNext();
        }
        break;
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);  // Cleanup!
}, [
  navigationData.previousBobblehead,
  navigationData.nextBobblehead,
  handleNavigatePrevious,
  handleNavigateNext,
]);
```

**Why This Pattern Works**:
- Prevents keyboard navigation while user is typing in forms
- Handles contentEditable elements properly
- Cleans up event listeners on component unmount
- Proper dependency array prevents infinite loops

---

### 2. Contextual ARIA Labels

**Location**: `bobblehead-navigation.tsx` lines 136-138, 152-154

**What Makes This Excellent**:
- Labels change based on navigation state (available vs. not available)
- Provides context about adjacent items in aria-label
- Clear disabled state communication

```tsx
// Previous button
<Button
  aria-label={
    _hasPrevious
      ? `Previous: ${navigationData.previousBobblehead?.name}`  // Shows item name
      : 'No previous bobblehead'  // Clear disabled message
  }
  disabled={_isPreviousDisabled}
>
  <ChevronLeftIcon aria-hidden className={'size-4'} />
  <span className={'hidden sm:inline'}>Previous</span>
</Button>

// Next button
<Button
  aria-label={
    _hasNext
      ? `Next: ${navigationData.nextBobblehead?.name}`  // Shows item name
      : 'No next bobblehead'  // Clear disabled message
  }
  disabled={_isNextDisabled}
>
  <span className={'hidden sm:inline'}>Next</span>
  <ChevronRightIcon aria-hidden className={'size-4'} />
</Button>
```

**Why This Pattern Works**:
- Screen reader users know exactly what will happen when they click
- Disabled state is communicated in aria-label, not just visually
- Users know what item they're navigating to

---

### 3. Responsive Text Labels

**Location**: `bobblehead-navigation.tsx` lines 148, 162

**What Makes This Excellent**:
- Mobile users get maximum space for touch targets
- Desktop users get context labels
- Consistent component sizing regardless of screen size

```tsx
{/* Previous Button - Icon visible on all sizes, text only on sm+ */}
<Button size={'sm'} variant={'outline'}>
  <ChevronLeftIcon aria-hidden className={'size-4'} />
  <span className={'hidden sm:inline'}>Previous</span>  {/* Hidden on mobile */}
</Button>

{/* Next Button - Reordered for LTR reading */}
<Button size={'sm'} variant={'outline'}>
  <span className={'hidden sm:inline'}>Next</span>     {/* Hidden on mobile */}
  <ChevronRightIcon aria-hidden className={'size-4'} />
</Button>
```

**Why This Pattern Works**:
- Mobile: Small touch targets with just icons
- Desktop: Full context with labels
- Skeleton placeholders match this sizing: `w-24 sm:w-28`

---

### 4. Proper Hook Organization

**Location**: `bobblehead-navigation.tsx` lines 20-112

**What Makes This Excellent**:
- Follows React hooks best practices consistently
- Clear separation of concerns
- Proper dependency management

```tsx
export const BobbleheadNavigation = ({ navigationData }: BobbleheadNavigationProps) => {
  // 1. useState hooks (none needed in this component)

  // 2. Other hooks
  const [isPending, startTransition] = useTransition();
  const [{ collectionId, subcollectionId }] = useQueryStates(...);
  const router = useRouter();

  // 3. Utility functions (before handlers that depend on them)
  const buildNavigationUrl = useCallback((bobbleheadSlug: string) => {
    // Builds URL with proper collection context
    const searchParams: Record<string, string> = {};
    if (collectionId) searchParams.collectionId = collectionId;
    if (subcollectionId) searchParams.subcollectionId = subcollectionId;
    return $path({
      route: '/bobbleheads/[bobbleheadSlug]',
      routeParams: { bobbleheadSlug },
      searchParams: Object.keys(searchParams).length > 0 ? searchParams : undefined,
    });
  }, [collectionId, subcollectionId]);

  // 4. Event handlers (depend on utility functions)
  const handleNavigatePrevious = useCallback(() => {
    if (!navigationData.previousBobblehead) return;
    startTransition(() => {
      const url = buildNavigationUrl(navigationData.previousBobblehead!.slug);
      router.push(url);
    });
  }, [navigationData.previousBobblehead, buildNavigationUrl, router]);

  // 5. useEffect hooks (depend on handlers)
  useEffect(() => {
    // ... keyboard navigation
  }, [navigationData.previousBobblehead, navigationData.nextBobblehead, handleNavigatePrevious, handleNavigateNext]);

  // 6. Derived variables
  const _hasPrevious = !!navigationData.previousBobblehead;
  const _hasNext = !!navigationData.nextBobblehead;
  const _hasNavigation = _hasPrevious || _hasNext;

  // 7. JSX
  return (...)
};
```

**Why This Pattern Works**:
- Easy to understand code flow
- No dependency array issues
- Clear data flow from top to bottom
- Follows React team recommendations

---

### 5. Proper Conditional Rendering

**Location**: `bobblehead-navigation.tsx` lines 127

**What Makes This Excellent**:
- Uses project's Conditional component
- Clean and readable
- No JSX in return when component shouldn't render

```tsx
// Using project's Conditional component
<Conditional isCondition={_hasNavigation}>
  <nav aria-label={'Bobblehead navigation'}>
    {/* Navigation content only renders if _hasNavigation is true */}
  </nav>
</Conditional>

// Alternative (not used here, but shown for comparison):
// if (!_hasNavigation) return null;  // Would work but Conditional is cleaner
```

**Why This Pattern Works**:
- Component doesn't render in DOM at all when condition is false
- Cleaner than ternary operators for component-level logic
- Consistent with project patterns

---

### 6. Test ID Implementation

**Location**: `bobblehead-navigation.tsx` lines 121-124 and throughout

**What Makes This Excellent**:
- Generates test IDs once, reuses throughout
- Uses project's generateTestId utility
- Proper namespace and component naming
- IDs match feature structure

```tsx
// Generate test IDs once
const navTestId = generateTestId('feature', 'bobblehead-nav');
const prevButtonTestId = generateTestId('feature', 'bobblehead-nav', 'previous');
const nextButtonTestId = generateTestId('feature', 'bobblehead-nav', 'next');

// Use consistently
<nav data-testid={navTestId}>
  <Button data-testid={prevButtonTestId} />
  <Button data-testid={nextButtonTestId} />
</nav>

// Results in:
// - feature-bobblehead-nav
// - feature-bobblehead-nav-previous
// - feature-bobblehead-nav-next
```

**Why This Pattern Works**:
- Single source of truth for test IDs
- Consistent naming prevents typos
- Easy to find elements in tests
- Follows project test ID conventions

---

### 7. Loading State Management

**Location**: `bobblehead-navigation.tsx` lines 24, 65-78, 118-119, 139, 154

**What Makes This Excellent**:
- Uses React's useTransition for pending state
- Updates UI during navigation
- Disables buttons during transition
- Visual feedback with opacity change

```tsx
// 1. Get pending state from useTransition
const [isPending, startTransition] = useTransition();

// 2. Use in event handlers
const handleNavigatePrevious = useCallback(() => {
  if (!navigationData.previousBobblehead) return;
  startTransition(() => {  // Wraps navigation in transition
    const url = buildNavigationUrl(navigationData.previousBobblehead!.slug);
    router.push(url);
  });
}, [navigationData.previousBobblehead, buildNavigationUrl, router]);

// 3. Update disabled state based on pending
const _isPreviousDisabled = !_hasPrevious || isPending;
const _isNextDisabled = !_hasNext || isPending;

// 4. Visual feedback
<Button
  disabled={_isPreviousDisabled}
  className={cn('gap-2', isPending && 'opacity-70')}  // Visual feedback
>
```

**Why This Pattern Works**:
- Users see that navigation is happening
- Prevents double-clicks during transition
- Modern React pattern (useTransition)
- Both visual and interactive feedback

---

### 8. Skeleton Component with Proper Accessibility

**Location**: `bobblehead-navigation-skeleton.tsx` lines 11-18

**What Makes This Excellent**:
- Proper ARIA attributes for loading state
- Semantic role for navigation context
- Matches actual component structure

```tsx
<div
  aria-busy={'true'}               // Clear loading indicator
  aria-label={'Loading navigation'}  // Describes what's loading
  role={'navigation'}               // Semantic context
  className={'flex items-center justify-between gap-4'}
  data-slot={'bobblehead-navigation-skeleton'}
  data-testid={navSkeletonTestId}
>
  {/* Skeleton placeholders match button sizing */}
  <Skeleton className={'h-8 w-24 sm:w-28'} testId={prevButtonSkeletonTestId} />
  <Skeleton className={'h-8 w-24 sm:w-28'} testId={nextButtonSkeletonTestId} />
</div>
```

**Why This Pattern Works**:
- Screen readers announce "busy" state
- Proper landmark for navigation
- Responsive sizing matches real component
- Accessible loading experience

---

### 9. Type-Safe URL Generation

**Location**: `bobblehead-navigation.tsx` lines 41-59

**What Makes This Excellent**:
- Uses project's $path for type-safe routing
- Preserves collection context through URL params
- Handles optional subcollection ID
- Clean separation of concerns

```tsx
const buildNavigationUrl = useCallback(
  (bobbleheadSlug: string) => {
    // Build search params only if they exist
    const searchParams: Record<string, string> = {};
    if (collectionId) {
      searchParams.collectionId = collectionId;
    }
    if (subcollectionId) {
      searchParams.subcollectionId = subcollectionId;
    }

    // Use type-safe $path
    return $path({
      route: '/bobbleheads/[bobbleheadSlug]',
      routeParams: { bobbleheadSlug },
      searchParams: Object.keys(searchParams).length > 0 ? searchParams : undefined,
    });
  },
  [collectionId, subcollectionId],  // Proper dependencies
);
```

**Why This Pattern Works**:
- Type-safe routing prevents URL mistakes
- Collection context preserved during navigation
- Optional params handled gracefully
- Reusable utility function

---

### 10. Proper Error Boundary Integration

**Location**: `page.tsx` lines 210-221

**What Makes This Excellent**:
- Error boundary wraps component
- Suspense provides loading fallback
- Conditional rendering for collection context

```tsx
<BobbleheadErrorBoundary section={'navigation'}>
  <Suspense fallback={<BobbleheadNavigationSkeleton />}>
    <BobbleheadNavigationAsync
      bobbleheadId={bobbleheadId}
      collectionId={collectionId ?? null}
      subcollectionId={subcollectionId}
    />
  </Suspense>
</BobbleheadErrorBoundary>
```

**Why This Pattern Works**:
- Errors don't crash entire page
- Loading state handled gracefully
- Navigation only shows when relevant
- Proper error reporting to Sentry

---

## Testing Recommendations

### Unit Test Examples to Implement

```typescript
// Test keyboard navigation
it('should navigate to previous bobblehead with ArrowLeft key', () => {
  // Mock navigation data
  // Simulate ArrowLeft keydown
  // Verify router.push was called with correct URL
});

it('should not navigate if user is typing in input', () => {
  // Focus input field
  // Simulate ArrowLeft keydown
  // Verify router.push was NOT called
});

// Test disabled states
it('should disable previous button when no previous bobblehead exists', () => {
  render(<BobbleheadNavigation navigationData={{ previousBobblehead: null, nextBobblehead: {...} }} />);
  expect(screen.getByTestId('feature-bobblehead-nav-previous')).toBeDisabled();
});

// Test URL generation with collection context
it('should preserve collectionId in navigation URL', () => {
  // This would need to mock useQueryStates
  // Verify buildNavigationUrl includes collectionId in searchParams
});
```

---

## Accessibility Testing Recommendations

### Manual Testing Checklist

```
Keyboard Navigation:
- [ ] Arrow Left navigates to previous bobblehead
- [ ] Arrow Right navigates to next bobblehead
- [ ] Tab focuses both buttons in order
- [ ] Shift+Tab focuses in reverse order
- [ ] Space/Enter activates focused button

Screen Reader Testing:
- [ ] Navigation landmark is announced
- [ ] Button labels are descriptive (include bobblehead name)
- [ ] Disabled state is announced
- [ ] Loading state is announced (aria-busy)

Mobile/Touch Testing:
- [ ] Buttons are easily tappable (min 44x44 dp)
- [ ] Icons visible and clear
- [ ] No text truncation on mobile
- [ ] Responsive layout works on small screens
```

---

## Performance Considerations

### Already Optimized:
- ✅ useCallback prevents unnecessary re-renders of handlers
- ✅ useTransition prevents layout shift during navigation
- ✅ Proper memoization of computed values
- ✅ Event listener cleanup prevents memory leaks

### No Additional Optimization Needed

---

## Security Considerations

### Already Addressed:
- ✅ URL generation through $path (prevents injection)
- ✅ No eval or dynamic code execution
- ✅ Proper HTML escaping (React handles this)
- ✅ Safe optional chaining for data access

---

## Summary of Best Practices

This implementation demonstrates:

1. **Accessibility First**: ARIA labels, semantic HTML, keyboard navigation
2. **React Best Practices**: Proper hooks, state management, component patterns
3. **Type Safety**: TypeScript with no any types, type-safe routing
4. **Testing Ready**: Comprehensive test ID coverage
5. **User Experience**: Loading states, responsive design, disabled boundaries
6. **Code Quality**: Clean organization, proper naming, reusable patterns
7. **Error Handling**: Error boundaries, loading fallbacks, graceful degradation

**Recommendation**: Use this implementation as a reference for similar navigation components.

---

## Reference Files

### Main Implementation
- `/src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx`

### Skeleton Component
- `/src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-navigation-skeleton.tsx`

### Supporting Files
- `/src/components/ui/button.tsx` - Button component with variants
- `/src/components/ui/conditional.tsx` - Conditional rendering component
- `/src/components/ui/skeleton.tsx` - Skeleton loading component
- `/src/lib/test-ids/generator.ts` - Test ID generation utility
- `/src/lib/types/bobblehead-navigation.types.ts` - Type definitions

---

**Validation Date**: 2025-11-22
**Status**: ✅ Production Ready
