# Newsletter Welcome Email Implementation Plan

**Generated**: 2025-01-24
**Original Request**: When signing up for the newsletter the person should, if a new sign-up, receive a welcome email that includes a nice friendly welcome message and a brief overview of what the newsletter is about and how often it will be sent out.

**Refined Request**: When a new user signs up for the newsletter through the footer newsletter form (via the subscribeToNewsletterAction server action), they should automatically receive a welcome email sent through Resend that includes a friendly welcome message, a brief explanation of what the newsletter covers (updates about bobblehead trends, collector features, and platform news), and clear information about sending frequency (e.g., approximately once per week). The welcome email should be triggered only for new signups (when isAlreadySubscribed is false in the NewsletterSubscriptionResult) to avoid sending duplicate emails to returning subscribers or users who are resubscribing after unsubscribing, and should follow the existing email template patterns used in ResendService for consistency with the launch notification and waitlist confirmation emails. The implementation should integrate with the Resend service using the established retry and circuit breaker patterns, include proper Sentry monitoring and error tracking, and maintain the current privacy considerations of the newsletter system (masking emails in logs and Sentry contexts).

---

## Overview

**Estimated Duration**: 2-3 hours
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

Add automated welcome email functionality for new newsletter subscribers that integrates with the existing Resend service, following established patterns for email delivery, error handling, and monitoring. The email will only be sent to genuinely new subscribers (not re-subscribers) and will include a friendly introduction to the newsletter content and frequency.

## Prerequisites

- [ ] Verify Resend API credentials are configured in environment variables
- [ ] Confirm ResendService circuit breaker and retry mechanisms are functioning
- [ ] Review existing newsletter subscription flow in `subscribeToNewsletterAction`
- [ ] Understand current email template patterns in ResendService

## Implementation Steps

### Step 1: Add Newsletter Welcome Email Template Method to ResendService

**What**: Create a private method that generates the HTML template for the newsletter welcome email
**Why**: Follows the established pattern of separating template generation from sending logic, making templates reusable and testable
**Confidence**: High

**Files to Modify:**

- `src/lib/services/resend.service.ts` - Add `getNewsletterWelcomeEmailHtml()` private method

**Changes:**

- Add private `getNewsletterWelcomeEmailHtml()` method that returns HTML string
- Follow the template structure used in `getLaunchNotificationEmailHtml()` and `getWaitlistConfirmationEmailHtml()`
- Include welcome message, newsletter description (bobblehead trends, collector features, platform news), and frequency information (approximately once per week)
- Use consistent styling and branding with existing email templates
- Add appropriate heading structure and responsive design elements
- Include unsubscribe information/link placeholder consistent with newsletter requirements

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Method returns properly formatted HTML string
- [ ] Template follows existing email template patterns
- [ ] All validation commands pass
- [ ] No TypeScript errors in ResendService

---

### Step 2: Add Newsletter Welcome Email Sending Method to ResendService

**What**: Create a public async method that sends the newsletter welcome email using the Resend API
**Why**: Encapsulates email sending logic with proper retry, circuit breaker, and error handling patterns established in the service
**Confidence**: High

**Files to Modify:**

- `src/lib/services/resend.service.ts` - Add `sendNewsletterWelcomeAsync()` public method

**Changes:**

- Add public `sendNewsletterWelcomeAsync(email: string)` method with email parameter
- Use `sendEmailWithRetry()` wrapper with MAX_RETRIES (3) and TIMEOUT (10000ms)
- Wrap send logic in `circuitBreakers.externalService()` for resilience
- Add Sentry breadcrumb before sending with category from `SENTRY_CATEGORIES.EMAIL`
- Call `getNewsletterWelcomeEmailHtml()` to get email body
- Configure email with appropriate subject line (e.g., "Welcome to Head Shakers Newsletter")
- Use FROM_EMAIL constant for sender address
- Mask email address in Sentry contexts following privacy patterns
- Add error handling with Sentry.captureException on failures
- Return boolean indicating success/failure
- Follow exact pattern from `sendLaunchNotificationEmailAsync()` and `sendWaitlistConfirmationEmailAsync()`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Method signature matches established patterns
- [ ] Circuit breaker protection is applied
- [ ] Retry logic is implemented correctly
- [ ] Sentry monitoring and breadcrumbs are added
- [ ] Email masking follows privacy requirements
- [ ] All validation commands pass
- [ ] No TypeScript errors

---

### Step 3: Add Newsletter Operation Constants

**What**: Add operation constant for newsletter welcome email sending to support consistent monitoring and logging
**Why**: Maintains consistency with existing operation tracking patterns used throughout the application for Sentry and logging
**Confidence**: High

**Files to Modify:**

- `src/lib/constants/operations.ts` - Add newsletter welcome email operation constant

**Changes:**

- Add `SEND_NEWSLETTER_WELCOME_EMAIL` constant to the NEWSLETTER operations group (if it exists) or create the group if needed
- Follow naming convention of existing operation constants (e.g., `OPERATIONS.NEWSLETTER.SEND_WELCOME_EMAIL`)
- Ensure the constant is properly exported and typed
- Use descriptive string value that clearly identifies the operation

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Constant is added to appropriate operations group
- [ ] Naming follows existing conventions
- [ ] Constant is properly typed and exported
- [ ] All validation commands pass

---

### Step 4: Integrate Welcome Email Sending into Newsletter Facade

**What**: Add email sending logic to the newsletter subscription facade that triggers only for new subscribers
**Why**: Ensures welcome emails are sent at the appropriate point in the subscription flow with proper error handling that doesn't break the subscription process
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/newsletter/newsletter.facade.ts` - Add email sending in `subscribeAsync()` method

**Changes:**

- Import `resendService` from ResendService
- After successful database insert in `subscribeAsync()`, check if `result.isAlreadySubscribed === false`
- If true (new subscriber), call `resendService.sendNewsletterWelcomeAsync(email)` asynchronously
- Wrap email sending in try-catch to ensure email failures don't fail the subscription
- Add Sentry breadcrumb before email attempt using operation constant from Step 3
- Log email sending errors with Sentry.captureException but continue execution
- Add masked email to Sentry context for debugging (follow privacy patterns)
- Follow the pattern used in `launch-notification.facade.ts` for similar email sending logic
- Ensure the subscription still returns success even if email fails (graceful degradation)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Email is only sent when `isAlreadySubscribed === false`
- [ ] Email failures are logged but don't affect subscription success
- [ ] Sentry monitoring is properly configured
- [ ] Email addresses are masked in logs and Sentry contexts
- [ ] All validation commands pass
- [ ] No TypeScript errors in facade

---

### Step 5: Update ResendService Export and Type Definitions

**What**: Ensure the new newsletter welcome email method is properly exported and typed in ResendService
**Why**: Makes the method accessible to the facade layer and maintains type safety across the application
**Confidence**: High

**Files to Modify:**

- `src/lib/services/resend.service.ts` - Verify exports and type definitions

**Changes:**

- Ensure `sendNewsletterWelcomeAsync()` is included in the ResendService class export
- Verify return type is explicitly defined as `Promise<boolean>`
- Confirm parameter type for email is `string`
- Check that the method is accessible through the singleton instance
- Ensure no breaking changes to existing ResendService interface

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Method is properly exported from ResendService
- [ ] Type definitions are explicit and correct
- [ ] No breaking changes to existing service interface
- [ ] All validation commands pass
- [ ] TypeScript can resolve method from facade imports

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Manual verification: Test newsletter signup triggers welcome email for new subscribers
- [ ] Manual verification: Re-subscribing does not trigger welcome email
- [ ] Manual verification: Email template renders correctly in email client
- [ ] Manual verification: Email failures are logged in Sentry but don't break subscription
- [ ] Manual verification: Email addresses are masked in Sentry contexts
- [ ] Manual verification: Circuit breaker activates on repeated Resend failures

## Notes

**Important Considerations:**

- **Privacy First**: Email addresses must be masked in all Sentry contexts and logs following the existing privacy patterns in ResendService
- **Graceful Degradation**: Email sending failures should NEVER cause subscription failures - users should be subscribed successfully even if the welcome email fails
- **Idempotency**: The `isAlreadySubscribed` check ensures welcome emails are only sent once per unique subscription
- **Testing Strategy**: Consider testing with a real email address in development to verify template rendering and delivery
- **Monitoring**: Watch Sentry for email delivery failures after deployment to ensure Resend integration is working correctly

**Assumptions:**

- Resend API credentials are already configured and working (verified by existing email sending functionality)
- The `NewsletterSubscriptionResult` type correctly indicates `isAlreadySubscribed` status
- Current email templates provide adequate reference for styling and structure
- Unsubscribe functionality is handled separately and doesn't need modification

**Risk Mitigation:**

- Circuit breaker prevents cascading failures if Resend goes down
- Retry logic (3 attempts) handles transient network issues
- Comprehensive Sentry monitoring enables quick detection of issues
- Email template follows proven patterns reducing chance of rendering problems
