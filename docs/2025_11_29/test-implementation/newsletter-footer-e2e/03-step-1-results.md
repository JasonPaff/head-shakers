# Step 1: Extend HomePage Page Object

**Timestamp**: 2025-11-29
**Step**: 1/6 - Extend HomePage Page Object with newsletter locators
**Test Type**: infrastructure
**Specialist**: test-infrastructure-specialist
**Status**: SUCCESS

## Subagent Input

- Extend HomePage with newsletter locators
- Add helper methods for scrollToFooter and subscribeToNewsletter
- Match test IDs from source component analysis

## Files Modified

- `tests/e2e/pages/home.page.ts` - Extended with newsletter locators and helper methods

## Locators Added

| Locator                         | Type         | Target                           |
| ------------------------------- | ------------ | -------------------------------- |
| `newsletterEmailInput`          | test ID      | `footer-newsletter-email`        |
| `newsletterSection`             | test ID (or) | subscribe OR unsubscribe section |
| `newsletterStayUpdatedText`     | text         | "Stay Updated" text              |
| `newsletterSubmitButton`        | test ID      | `footer-newsletter-submit`       |
| `newsletterSubscribeSection`    | test ID      | subscribe section                |
| `newsletterSubscribingButton`   | role         | "Subscribing..." button          |
| `newsletterSuccessHeading`      | role         | "Newsletter Subscriber" heading  |
| `newsletterUnsubscribeButton`   | test ID      | unsubscribe button               |
| `newsletterUnsubscribeSection`  | test ID      | unsubscribe section              |
| `newsletterUnsubscribingButton` | role         | "Unsubscribing..." button        |

## Helper Methods Added

| Method                         | Description                                        |
| ------------------------------ | -------------------------------------------------- |
| `scrollToFooter()`             | Scrolls to footer and waits for newsletter section |
| `subscribeToNewsletter(email)` | Fills email and clicks subscribe                   |

## Orchestrator Verification

- **Command**: `npm run typecheck`
- **Result**: PASS
- **Output**: TypeScript compilation completed with no errors

## Success Criteria

- [✓] TypeScript compiles without errors
- [✓] Locators match actual component test IDs
- [✓] All getters properly typed as Locator
- [✓] Helper methods follow async/Promise<void> pattern

## Fix Attempts

- 0 fix attempts required

## Duration

~30 seconds
