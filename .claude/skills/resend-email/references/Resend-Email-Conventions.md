# Resend Email Conventions

## Overview

The project uses Resend for all email operations including transactional emails, batch sending, and newsletter broadcasts. The ResendService provides a resilient abstraction with circuit breaker protection, retry logic, and comprehensive Sentry monitoring.

## Required Imports

### Service File Imports

```typescript
import * as Sentry from '@sentry/nextjs';
import { Resend } from 'resend';

import { CONFIG } from '@/lib/constants';
import { circuitBreakers } from '@/lib/utils/circuit-breaker-registry';
import { withDatabaseRetry } from '@/lib/utils/retry';
```

### React Email Imports (for complex templates)

```typescript
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
```

### Sentry Constants

```typescript
import { SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS, SENTRY_OPERATIONS } from '@/lib/constants';
```

## Service Architecture

### Resend Client Initialization

```typescript
const resend = new Resend(process.env.RESEND_API_KEY || '');
```

### Service Class Pattern

```typescript
/**
 * ResendService
 * handles all email sending operations via Resend
 * includes retry logic, circuit breaker protection, and comprehensive error tracking
 */
export class ResendService {
  // Public async methods for operations
  static async sendEmailAsync(...): Promise<boolean> { }
  static async sendBatchAsync(...): Promise<{ failedEmails: Array<string>; sentCount: number }> { }

  // Private methods for templates
  private static getEmailHtml(): string { }
  private static getTemplateHtml(data: TemplateData): string { }

  // Private method for resilient sending
  private static async sendEmailWithRetry(...): Promise<boolean> { }
}
```

### Method Naming Conventions

| Pattern                | Example                         | Use Case                      |
| ---------------------- | ------------------------------- | ----------------------------- |
| `send{Type}Async`      | `sendWaitlistConfirmationAsync` | Single email operations       |
| `send{Type}BatchAsync` | `sendLaunchNotificationsAsync`  | Batch email operations        |
| `get{Type}EmailHtml`   | `getConfirmationEmailHtml`      | Private HTML template methods |

## Email Sending Patterns

### Single Email

```typescript
static async sendWaitlistConfirmationAsync(email: string): Promise<boolean> {
  return this.sendEmailWithRetry(
    async () => {
      return resend.emails.send({
        from: 'The project <noreply@send.example.com>',
        html: this.getConfirmationEmailHtml(),
        subject: "You're on the The project launch list!",
        to: email,
      });
    },
    'sendWaitlistConfirmation',
    { email },
  );
}
```

### Batch Emails with Rate Limiting

```typescript
static async sendLaunchNotificationsAsync(
  emails: Array<string>,
): Promise<{ failedEmails: Array<string>; sentCount: number }> {
  const failedEmails: Array<string> = [];
  let sentCount = 0;

  // Conservative batch size (Resend allows 100, we use 10)
  const batchSize = 10;
  const batches = [];

  for (let i = 0; i < emails.length; i += batchSize) {
    batches.push(emails.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const results = await Promise.allSettled(
      batch.map((email) =>
        this.sendEmailWithRetry(
          async () => {
            return resend.emails.send({
              from: 'The project <noreply@send.example.com>',
              html: this.getLaunchEmailHtml(),
              subject: 'The project is now live!',
              to: email,
            });
          },
          'sendLaunchNotification',
          { email },
        ),
      ),
    );

    // Track results
    results.forEach((result, index) => {
      const email = batch[index];
      if (!email) return;

      if (result.status === 'fulfilled' && result.value) {
        sentCount++;
      } else {
        failedEmails.push(email);
        if (result.status === 'rejected') {
          Sentry.captureException(result.reason, {
            extra: { email },
            tags: { component: 'ResendService', operation: 'sendLaunchNotifications' },
          });
        }
      }
    });

    // Delay between batches to avoid rate limiting
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return { failedEmails, sentCount };
}
```

### Using Resend Batch API

```typescript
// For sending different emails to different recipients
const { data, error } = await resend.batch.send([
  {
    from: 'The project <noreply@send.example.com>',
    to: ['user1@example.com'],
    subject: 'Personalized Subject 1',
    html: '<h1>Content for user 1</h1>',
  },
  {
    from: 'The project <noreply@send.example.com>',
    to: ['user2@example.com'],
    subject: 'Personalized Subject 2',
    html: '<h1>Content for user 2</h1>',
  },
]);
```

### Idempotency Keys

```typescript
// Prevent duplicate sends with idempotency keys
const { data, error } = await resend.emails.send(
  {
    from: 'The project <noreply@send.example.com>',
    to: email,
    subject: 'Order Confirmation',
    html: this.getOrderConfirmationHtml(orderId),
  },
  {
    headers: {
      'Idempotency-Key': `order-confirmation-${orderId}`,
    },
  },
);
```

## Resilience Patterns

### Circuit Breaker with Retry

```typescript
private static async sendEmailWithRetry(
  operation: () => Promise<{ error: unknown; id?: string }>,
  operationName: string,
  metadata?: Record<string, unknown>,
): Promise<boolean> {
  try {
    const circuitBreaker = circuitBreakers.externalService(operationName);

    const result = await circuitBreaker.execute(async () => {
      const retryResult = await withDatabaseRetry(operation, {
        maxAttempts: CONFIG.EXTERNAL_SERVICES.RESEND.MAX_RETRIES,
        operationName,
      });

      return retryResult.result;
    });

    const { error, id } = result.result as { error: unknown; id?: string };

    if (error) {
      Sentry.captureException(new Error(`Resend error: ${JSON.stringify(error)}`), {
        extra: { ...(metadata || {}), operationName },
        tags: { component: 'ResendService', operation: operationName },
      });
      return false;
    }

    Sentry.addBreadcrumb({
      category: 'email',
      data: { ...(metadata || {}), emailId: id, operationName },
      level: 'info',
      message: `Email sent successfully: ${operationName}`,
    });

    return true;
  } catch (error) {
    Sentry.captureException(error, {
      extra: { ...metadata, operationName },
      tags: { component: 'ResendService', operation: operationName },
    });
    return false;
  }
}
```

### Configuration Constants

```typescript
// In src/lib/constants/config.ts
export const CONFIG = {
  EXTERNAL_SERVICES: {
    RESEND: {
      MAX_RETRIES: 3,
      BATCH_SIZE: 10,
      BATCH_DELAY_MS: 100,
    },
  },
};
```

## Template Patterns

### Inline HTML Templates (Simple Emails)

Use for confirmations, simple notifications, and transactional emails.

```typescript
private static getConfirmationEmailHtml(): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #000; font-size: 24px; margin: 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .footer { text-align: center; font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You're on the list!</h1>
          </div>
          <div class="content">
            <p>Thanks for your interest in The project!</p>
            <p>We've added your email to our launch notification list.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 The project. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
```

### Template Structure Guidelines

| Section       | Required | Purpose                    |
| ------------- | -------- | -------------------------- |
| DOCTYPE       | Yes      | HTML5 document type        |
| meta charset  | Yes      | UTF-8 encoding             |
| meta viewport | Yes      | Mobile responsiveness      |
| Inline CSS    | Yes      | Email client compatibility |
| .container    | Yes      | Max-width 600px centering  |
| .header       | Yes      | Logo/title area            |
| .content      | Yes      | Main message body          |
| .footer       | Yes      | Copyright, unsubscribe     |

### React Email Templates (Complex Emails)

Use for newsletters, rich content, and reusable templates.

**File Location**: `src/lib/email-templates/`

```typescript
// src/lib/email-templates/newsletter-template.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface NewsletterTemplateProps {
  firstName: string;
  previewText: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  unsubscribeUrl: string;
}

export function NewsletterTemplate({
  firstName,
  previewText,
  content,
  ctaText,
  ctaUrl,
  unsubscribeUrl,
}: NewsletterTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://example.com/logo.png"
            width="150"
            height="50"
            alt="The project"
          />
          <Heading style={heading}>
            Hey {firstName}!
          </Heading>
          <Text style={paragraph}>
            {content}
          </Text>
          {ctaText && ctaUrl && (
            <Button style={button} href={ctaUrl}>
              {ctaText}
            </Button>
          )}
          <Hr style={hr} />
          <Text style={footer}>
            The project - The Bobblehead Collector Community
          </Text>
          <Link href={unsubscribeUrl} style={unsubscribeLink}>
            Unsubscribe
          </Link>
        </Container>
      </Body>
    </Html>
  );
}

// Styles (must be inline for email compatibility)
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333',
};

const button = {
  backgroundColor: '#667eea',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#ddd',
  margin: '20px 0',
};

const footer = {
  color: '#999',
  fontSize: '12px',
};

const unsubscribeLink = {
  color: '#999',
  fontSize: '12px',
  textDecoration: 'underline',
};
```

### Using React Email Templates

```typescript
import { NewsletterTemplate } from '@/lib/email-templates/newsletter-template';

static async sendNewsletterAsync(
  email: string,
  firstName: string,
  content: string,
  unsubscribeUrl: string,
): Promise<boolean> {
  return this.sendEmailWithRetry(
    async () => {
      return resend.emails.send({
        from: 'The project <noreply@send.example.com>',
        react: NewsletterTemplate({
          firstName,
          previewText: 'Your weekly bobblehead news',
          content,
          unsubscribeUrl,
        }),
        subject: 'The project Weekly Newsletter',
        to: email,
      });
    },
    'sendNewsletter',
    { email: email.substring(0, 3) + '***' }, // Mask email in logs
  );
}
```

## Broadcasts & Audiences

### Creating an Audience

```typescript
const { data: audience, error } = await resend.audiences.create({
  name: 'Newsletter Subscribers',
});
```

### Adding Contacts to Audience

```typescript
const { data: contact, error } = await resend.contacts.create({
  audienceId: 'audience_id_here',
  email: 'subscriber@example.com',
  firstName: 'John',
  lastName: 'Doe',
  unsubscribed: false,
});
```

### Creating and Sending a Broadcast

```typescript
// Step 1: Create the broadcast
const { data: broadcast, error: createError } = await resend.broadcasts.create({
  audienceId: 'audience_id_here',
  from: 'The project <noreply@send.example.com>',
  subject: 'Weekly Bobblehead Roundup',
  html: `
    <h1>Hey {{{FIRST_NAME|there}}}!</h1>
    <p>Check out this week's featured bobbleheads...</p>
    <p><a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a></p>
  `,
  name: 'Weekly Newsletter - Week 42',
});

// Step 2: Send the broadcast
const { data: sent, error: sendError } = await resend.broadcasts.send(broadcast.id, {
  scheduledAt: 'in 1 hour', // Or ISO 8601: '2025-01-15T10:00:00Z'
});
```

### Template Variable Syntax

| Variable                       | Description                     | Example                   |
| ------------------------------ | ------------------------------- | ------------------------- |
| `{{{FIRST_NAME}}}`             | Contact first name              | John                      |
| `{{{LAST_NAME}}}`              | Contact last name               | Doe                       |
| `{{{EMAIL}}}`                  | Contact email                   | john@example.com          |
| `{{{VAR\|fallback}}}`          | Variable with fallback          | `{{{FIRST_NAME\|there}}}` |
| `{{{RESEND_UNSUBSCRIBE_URL}}}` | Auto-generated unsubscribe link | Required in broadcasts    |

### Scheduled Sending

```typescript
// Natural language
scheduledAt: 'in 1 min';
scheduledAt: 'in 1 hour';
scheduledAt: 'tomorrow at 9am';

// ISO 8601
scheduledAt: '2025-01-15T10:00:00Z';
scheduledAt: '2025-01-15T10:00:00.000Z';
```

## Sentry Integration

### Breadcrumb on Success

```typescript
Sentry.addBreadcrumb({
  category: SENTRY_BREADCRUMB_CATEGORIES.EXTERNAL_SERVICE,
  data: { emailId: id, operationName, recipientCount: emails.length },
  level: SENTRY_LEVELS.INFO,
  message: `Email sent successfully: ${operationName}`,
});
```

### Exception Capture on Failure

```typescript
Sentry.captureException(new Error(`Resend error: ${JSON.stringify(error)}`), {
  extra: {
    operationName,
    recipientCount: emails.length,
    // Never include actual email addresses or content
  },
  level: 'warning', // Use warning for non-critical failures
  tags: {
    component: 'ResendService',
    operation: operationName,
  },
});
```

### Context Guidelines

| Include                | Exclude              |
| ---------------------- | -------------------- |
| Operation name         | Email addresses      |
| Recipient count        | Email content        |
| Email ID (from Resend) | Personal information |
| Error codes            | Subject lines        |
| Batch index            | Template data        |

## From Address Configuration

```typescript
// Standard transactional
from: 'The project <noreply@send.example.com>';

// Newsletter/Marketing
from: 'The project Newsletter <newsletter@send.example.com>';

// Support
from: 'The project Support <support@send.example.com>';
```

## Result Patterns

### Single Email Operations

```typescript
// Return boolean for single email
async function sendEmailAsync(email: string): Promise<boolean>;
```

### Bulk Operations

```typescript
// Return detailed results for bulk operations
async function sendBatchAsync(emails: Array<string>): Promise<{
  failedEmails: Array<string>;
  sentCount: number;
}>;
```

### Broadcast Operations

```typescript
// Return broadcast ID and status
async function sendBroadcastAsync(
  audienceId: string,
  content: BroadcastContent,
): Promise<{
  broadcastId: string;
  scheduledAt?: string;
  success: boolean;
}>;
```

## File Organization

```
src/
  lib/
    services/
      resend.service.ts           # Main ResendService class
    email-templates/              # React Email templates
      components/                 # Shared email components
        email-button.tsx
        email-footer.tsx
        email-header.tsx
      newsletter-template.tsx
      welcome-template.tsx
      confirmation-template.tsx
    constants/
      config.ts                   # Resend configuration
```

## Anti-Patterns to Avoid

1. **Never include PII in Sentry context**

   ```typescript
   // BAD
   Sentry.captureException(error, {
     extra: { email: 'user@example.com', content: emailBody },
   });

   // GOOD
   Sentry.captureException(error, {
     extra: { email: email.substring(0, 3) + '***', operationName },
   });
   ```

2. **Never skip circuit breaker protection**

   ```typescript
   // BAD - Direct call without protection
   await resend.emails.send({ ... });

   // GOOD - With circuit breaker and retry
   await this.sendEmailWithRetry(async () => resend.emails.send({ ... }), 'operation');
   ```

3. **Never exceed 100 emails per batch call**

   ```typescript
   // BAD
   await resend.batch.send(allEmails); // Could be 1000+

   // GOOD
   const batchSize = 10; // Conservative
   for (const batch of chunks(emails, batchSize)) {
     await this.sendBatch(batch);
     await delay(100); // Rate limiting
   }
   ```

4. **Never hardcode email addresses**

   ```typescript
   // BAD
   to: 'admin@company.com';

   // GOOD
   to: process.env.ADMIN_EMAIL;
   ```

5. **Never send broadcasts without unsubscribe link**

   ```typescript
   // BAD
   html: '<p>Newsletter content</p>';

   // GOOD
   html: '<p>Newsletter content</p><a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a>';
   ```

6. **Never use external CSS in emails**

   ```typescript
   // BAD
   <link rel="stylesheet" href="styles.css">

   // GOOD
   <style>/* inline styles */</style>
   // Or inline style attributes
   ```

7. **Never fail entire operation for partial failures**

   ```typescript
   // BAD - Throws on first failure
   for (const email of emails) {
     await sendEmail(email); // Throws on failure
   }

   // GOOD - Track failures, continue processing
   const results = await Promise.allSettled(emails.map(sendEmail));
   const failed = results.filter((r) => r.status === 'rejected');
   ```

## Testing Patterns

### Mocking Resend

```typescript
// In tests
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null }),
    },
    batch: {
      send: vi.fn().mockResolvedValue({ data: [{ id: 'test-id-1' }, { id: 'test-id-2' }], error: null }),
    },
  })),
}));
```

### Test Email Addresses

```typescript
// Resend test addresses
to: 'delivered@resend.dev'; // Always succeeds
to: 'bounced@resend.dev'; // Always bounces
to: 'complained@resend.dev'; // Always marks as spam
```
