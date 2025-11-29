# E2E Test User Flow Diagrams

## Flow 1: Anonymous User Subscription (Gap 1)
**Priority**: CRITICAL | **Tests**: 3

### Scenario 1.1: Valid Email Submission
```
┌─────────────────────────────────────────────────────────────┐
│ Home Page (Unauthenticated)                                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Footer Newsletter Component                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                           │ │
│ │ [Stay Updated]                                           │ │
│ │ Get the latest bobblehead news.                         │ │
│ │                                                           │ │
│ │ [Enter your email ____________] [Subscribe]             │ │
│ │                                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ User enters: test@example.com
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Footer Newsletter Component (Optimistic State)              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✓ Newsletter Subscriber                                │ │
│ │                                                           │ │
│ │ You're receiving bobblehead news and updates at        │ │
│ │ test@example.com                                        │ │
│ │                                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Server processes subscription
                         │ onAfterSuccess() → form.reset()
                         │ router.refresh()
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Home Page (After Page Refresh)                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Footer Newsletter Component                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                           │ │
│ │ ✓ Newsletter Subscriber                                │ │
│ │                                                           │ │
│ │ You're receiving bobblehead news and updates at        │ │
│ │ test@example.com                                        │ │
│ │                                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘

TEST ASSERTIONS:
✓ Step 1: Newsletter form renders with "Stay Updated" title
✓ Step 2: User types email and sees optimistic success state immediately
✓ Step 3: Page refresh maintains "Newsletter Subscriber" state
```

---

## Flow 2: Authenticated User Subscription (Gap 2)
**Priority**: CRITICAL | **Tests**: 3

### Scenario 2.1: Non-Subscriber Becomes Subscriber
```
┌─────────────────────────────────────────────────────────────┐
│ Home Page (Authenticated, Not Subscribed)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Footer Newsletter Component                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ (FooterNewsletterSubscribe renders because user is not  │ │
│ │  in newsletter_signups table)                           │ │
│ │                                                           │ │
│ │ [Stay Updated]                                           │ │
│ │ Get the latest bobblehead news.                         │ │
│ │                                                           │ │
│ │ [Enter your email ____________] [Subscribe]             │ │
│ │                                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ User clicks Subscribe
                         │ Server: FooterNewsletter checks
                         │ isActiveSubscriber() → false
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Footer Newsletter Component (Transition)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✓ Newsletter Subscriber                                │ │
│ │                                                           │ │
│ │ You're receiving bobblehead news and updates at        │ │
│ │ user@example.com                                        │ │
│ │                                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│ (Optimistic state from subscription action)                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ onAfterSuccess() → router.refresh()
                         │ Server: FooterNewsletter checks
                         │ isActiveSubscriber() → true
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Home Page (After Refresh)                                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Footer Newsletter Component                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ (FooterNewsletterUnsubscribe now renders)              │ │
│ │                                                           │ │
│ │ ✓ Newsletter Subscriber                                │ │
│ │                                                           │ │
│ │ You're receiving bobblehead news and updates at        │ │
│ │ user@example.com                                        │ │
│ │                                                           │ │
│ │ [Unsubscribe] ← link to unsubscribe action            │ │
│ │                                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘

TEST ASSERTIONS:
✓ Step 1: Authenticated user sees subscribe form (not subscribed yet)
✓ Step 2: After click → transitions to unsubscribe interface
✓ Step 3: Page refresh maintains unsubscribe interface
```

---

## Flow 3: Authenticated Subscriber Unsubscribe (Gap 3)
**Priority**: CRITICAL | **Tests**: 2

### Scenario 3.1: Subscriber Unsubscribes
```
┌─────────────────────────────────────────────────────────────┐
│ Home Page (Authenticated, Subscribed)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Footer Newsletter Component                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ (FooterNewsletterUnsubscribe renders because user is in │ │
│ │  newsletter_signups with unsubscribedAt = NULL)         │ │
│ │                                                           │ │
│ │ ✓ Newsletter Subscriber                                │ │
│ │                                                           │ │
│ │ You're receiving bobblehead news and updates at        │ │
│ │ user@example.com                                        │ │
│ │                                                           │ │
│ │ [Unsubscribe]                                           │ │
│ │                                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ User clicks Unsubscribe button
                         │ Button shows "Unsubscribing..."
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Footer Newsletter Component (Optimistic Unsubscribed)      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                           │ │
│ │ [Stay Updated]                                           │ │
│ │ Get the latest bobblehead news.                         │ │
│ │                                                           │ │
│ │ (Empty form, not showing before/after email)           │ │
│ │                                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│ (Optimistic: isSubscribed = false)                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ onAfterSuccess() → router.refresh()
                         │ Server: unsubscribedAt NOW set
                         │ isActiveSubscriber() → false
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Home Page (After Refresh)                                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Footer Newsletter Component                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ (FooterNewsletterSubscribe now renders)                │ │
│ │                                                           │ │
│ │ [Stay Updated]                                           │ │
│ │ Get the latest bobblehead news.                         │ │
│ │                                                           │ │
│ │ [Enter your email ____________] [Subscribe]             │ │
│ │                                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘

TEST ASSERTIONS:
✓ Step 1: Subscriber sees unsubscribe button with email
✓ Step 2: Click unsubscribe → transitions to subscribe form
✓ Step 3: Page refresh maintains subscribe form (unsubscribed state)
```

---

## Flow 4: Email Validation Errors (Gap 4)
**Priority**: HIGH | **Tests**: 2

### Scenario 4.1: Invalid Email Format
```
┌─────────────────────────────────────────────────────────────┐
│ Footer Newsletter Component                                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ [Stay Updated]                                               │
│ Get the latest bobblehead news.                             │
│                                                               │
│ [Enter your email ____________] [Subscribe]                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
              │
              │ User types: notanemail
              │ Focus moves away from input
              │ Validation runs: onChangeInvalid
              ▼
┌─────────────────────────────────────────────────────────────┐
│ Footer Newsletter Component (with Error)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ [Stay Updated]                                               │
│ Get the latest bobblehead news.                             │
│                                                               │
│ [Enter your email notanemail     ] [Subscribe]              │
│ ✗ Please enter a valid email address                       │ ← Error shown
│                                                               │
└─────────────────────────────────────────────────────────────┘
              │
              │ User clicks Submit
              │ Form prevents submission (invalid)
              │ focusFirstError() → focus on email input
              ▼
            (Error persists, user corrects)

TEST ASSERTIONS:
✓ Empty email → validation error message shown
✓ Invalid format (notanemail) → validation error message shown
```

---

## Flow 5: Optimistic UI Loading States (Gap 5)
**Priority**: HIGH | **Tests**: 2

### Scenario 5.1: Submit Button State Transition
```
BEFORE SUBMIT:
┌──────────────────────┐
│ [Email input enabled]│
│ [Subscribe ▢]        │ ← button clickable, not disabled
└──────────────────────┘

              │ User clicks Subscribe
              ▼

DURING SUBMIT:
┌──────────────────────┐
│ [Email input]        │ ← disabled (opacity 50%)
│ [Subscribing... ✓]   │ ← button disabled, text changed
└──────────────────────┘

              │ Server responds
              ▼

AFTER SUCCESS:
┌──────────────────────┐
│ ✓ Newsletter Subscriber
│ You're receiving...   │
│ test@example.com      │
└──────────────────────┘

TEST ASSERTIONS:
✓ Before submit: button text is "Subscribe", input enabled
✓ During submit: button disabled + shows "Subscribing...", input disabled
✓ After success: form resets, shows confirmation state
```

---

## Flow 6: Privacy - Duplicate Subscription (Gap 6)
**Priority**: HIGH | **Tests**: 2

### Scenario 6.1: Resubscription Looks Identical to New
```
SCENARIO A: First-time subscriber
┌────────────────────────────────────────┐
│ User submits: new-user@example.com     │
│                                         │
│ SUCCESS MESSAGE:                        │
│ "Thanks for subscribing! You'll        │
│  receive our latest updates."          │
│                                         │
│ Database: New record created           │
│ newsletter_signups.id = <new>          │
└────────────────────────────────────────┘

SCENARIO B: Previously unsubscribed user resubscribes
┌────────────────────────────────────────┐
│ User submits: old-user@example.com     │
│ (was previously unsubscribed at 2025-11-20)
│                                         │
│ SUCCESS MESSAGE:                        │ ← SAME MESSAGE!
│ "Thanks for subscribing! You'll        │   (Privacy: doesn't reveal
│  receive our latest updates."          │    prior subscription history)
│                                         │
│ Database: unsubscribedAt = NULL        │
│ newsletter_signups.id = <unchanged>    │
└────────────────────────────────────────┘

TEST ASSERTIONS:
✓ First-time subscriber sees success message
✓ Resubscriber sees IDENTICAL success message (no enumeration leak)
✓ API response data same in both cases
```

---

## Flow 7: Unsubscribe Button Loading (Gap 7)
**Priority**: HIGH | **Tests**: 1

### Scenario 7.1: Unsubscribe Loading State
```
BEFORE UNSUBSCRIBE:
┌─────────────────────────────────────┐
│ ✓ Newsletter Subscriber              │
│ You're receiving... user@example.com │
│                                       │
│ [Unsubscribe]                        │ ← button clickable
└─────────────────────────────────────┘

              │ User clicks Unsubscribe
              ▼

DURING UNSUBSCRIBE:
┌─────────────────────────────────────┐
│ ✓ Newsletter Subscriber              │
│ You're receiving... user@example.com │
│                                       │
│ [Unsubscribing...]                   │ ← button disabled, text changed
└─────────────────────────────────────┘

              │ Server responds
              ▼

AFTER UNSUBSCRIBE:
┌─────────────────────────────────────┐
│ [Stay Updated]                        │
│ Get the latest bobblehead news.      │
│                                       │
│ [Enter your email ____________]      │
│ [Subscribe]                           │
└─────────────────────────────────────┘

TEST ASSERTIONS:
✓ During unsubscribe: button shows "Unsubscribing..." and is disabled
```

---

## Flow 8: Page Refresh State Consistency (Gap 8)
**Priority**: MEDIUM | **Tests**: 2

### Scenario 8.1: Subscription State Persists
```
┌─────────────────┐
│ Home Page       │
├─────────────────┤
│ Subscribe Form  │
│                 │
│ User subscribes │
│ Optimistic UI   │
│ shows success   │
└─────────────────┘
         │
         │ router.refresh()
         │ FooterNewsletter queries database
         │ NewsletterFacade.getIsActiveSubscriberAsync(email)
         │ → returns true (subscription found)
         ▼
┌─────────────────┐
│ Home Page       │
├─────────────────┤
│ Unsubscribe UI  │
│                 │
│ Shows subscriber│
│ state persisted │
└─────────────────┘
         │
         │ User navigates away
         │ (click link to /browse)
         ▼
┌─────────────────┐
│ Browse Page     │
├─────────────────┤
│ (footer present)│
└─────────────────┘
         │
         │ User navigates back
         │ (home button or browser back)
         ▼
┌─────────────────┐
│ Home Page       │
├─────────────────┤
│ Unsubscribe UI  │
│                 │
│ Still shows     │
│ subscriber state│
│ (persisted!)    │
└─────────────────┘

TEST ASSERTIONS:
✓ Subscribe → refresh → state persists
✓ Subscribe → navigate away → navigate back → state persists
```

---

## Flow 9: Footer Visibility (Gap 9)
**Priority**: MEDIUM | **Tests**: 1

### Scenario 9.1: Newsletter Available on Multiple Pages
```
┌──────────────────────────────────┐
│ Home Page                         │
├──────────────────────────────────┤
│ Hero Section                      │
│ Featured Collections              │
│ Trending                          │
├──────────────────────────────────┤
│ Footer                            │
│ ┌────────────────────────────────┐│
│ │ Newsletter Section Available   ││
│ │ [Stay Updated...]              ││
│ └────────────────────────────────┘│
└──────────────────────────────────┘
         ▼ (user navigates)
┌──────────────────────────────────┐
│ Browse Page                       │
├──────────────────────────────────┤
│ Bobblehead Cards Grid             │
├──────────────────────────────────┤
│ Footer                            │
│ ┌────────────────────────────────┐│
│ │ Newsletter Section Available   ││
│ │ [Stay Updated...]              ││
│ └────────────────────────────────┘│
└──────────────────────────────────┘
         ▼ (user navigates)
┌──────────────────────────────────┐
│ Dashboard Page (Authenticated)    │
├──────────────────────────────────┤
│ My Collection                     │
├──────────────────────────────────┤
│ Footer                            │
│ ┌────────────────────────────────┐│
│ │ Newsletter Section Available   ││
│ │ [Unsubscribe] (if subscribed)  ││
│ │ OR                             ││
│ │ [Stay Updated...] (if not)     ││
│ └────────────────────────────────┘│
└──────────────────────────────────┘

TEST ASSERTIONS:
✓ Newsletter footer renders on home page
✓ Newsletter footer renders on browse page
✓ Newsletter footer renders on dashboard page
```

---

## State Diagram: Complete Newsletter Lifecycle

```
                    ┌──────────────────┐
                    │ Not in Database  │ (anonymous or not subscribed)
                    └────────┬─────────┘
                             │
                    subscribe│
                             │
                             ▼
                    ┌──────────────────┐
                    │ Active           │
                    │ Subscriber       │ (subscribedAt: NOT NULL, unsubscribedAt: NULL)
                    └────────┬─────────┘
                             │
                   unsubscribe│
                             │
                             ▼
                    ┌──────────────────┐
                    │ Unsubscribed     │ (unsubscribedAt: NOW)
                    └────────┬─────────┘
                             │
                   resubscribe│
                             │
                             ▼
                    ┌──────────────────┐
                    │ Active           │
                    │ Subscriber       │ (unsubscribedAt: NULL)
                    └──────────────────┘

COMPONENT RENDERINGS BY STATE:

Not in Database         → FooterNewsletterSubscribe
Active Subscriber       → FooterNewsletterUnsubscribe
Unsubscribed (opt-out)  → FooterNewsletterSubscribe (can resubscribe)
Anonymous              → FooterNewsletterSubscribe
```

---

## Test Isolation Matrix

```
                    | DB Setup | Auth State | Fixture Type | Isolation
--------------------|----------|-----------|--------------|----------
Gap 1 (Anon)       | None     | Logged Out | page         | High
Gap 2 (Auth Non-Sub)| Clean    | User Auth  | userPage     | Medium
Gap 3 (Auth Sub)   | Fresh Sub| User Auth  | userPage     | Medium
Gap 4 (Validation) | None     | Logged Out | page         | High
Gap 5 (Loading)    | None     | Logged Out | page         | High
Gap 6 (Privacy)    | Various  | Both       | page/userPage| Medium
Gap 7 (Unsub Load) | Fresh Sub| User Auth  | userPage     | Medium
Gap 8 (Refresh)    | Fresh    | Both       | Both         | Medium
Gap 9 (Visibility) | None     | Both       | Both         | Low

Legend:
High Isolation   = No interdependencies, can run in any order
Medium Isolation = Requires specific database state, can run in parallel with setup
Low Isolation    = Informational, no side effects
```

---

## Quick Reference: Gap to Test Mapping

| Gap | User Type | Action | Expected Result | Test Count |
|-----|-----------|--------|-----------------|------------|
| 1 | Anonymous | Submit valid email | Optimistic success + persists | 3 |
| 2 | Auth non-sub | Submit subscription | Transitions to unsubscribe UI | 3 |
| 3 | Auth subscriber | Click unsubscribe | Transitions to subscribe UI | 2 |
| 4 | Either | Submit invalid email | Validation error shown | 2 |
| 5 | Either | During submit | Button shows loading state | 2 |
| 6 | Either | Resubscribe | Same message as new subscribe | 2 |
| 7 | Auth subscriber | Click unsubscribe | Button shows loading state | 1 |
| 8 | Either | Page refresh | State persists from database | 2 |
| 9 | Either | Multiple pages | Newsletter available everywhere | 1 |

