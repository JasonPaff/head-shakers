import * as Sentry from '@sentry/nextjs';
import { Resend } from 'resend';

import { CONFIG } from '@/lib/constants';
import { circuitBreakers } from '@/lib/utils/circuit-breaker-registry';
import { withDatabaseRetry } from '@/lib/utils/retry';

const resend = new Resend(process.env.RESEND_API_KEY || '');

/**
 * ResendService
 * handles all email sending operations via Resend
 * includes retry logic, circuit breaker protection, and comprehensive error tracking
 */
export class ResendService {
  /**
   * send launch notification emails in bulk
   * returns success count and list of failed emails
   */
  static async sendLaunchNotificationsAsync(
    emails: Array<string>,
  ): Promise<{ failedEmails: Array<string>; sentCount: number }> {
    const failedEmails: Array<string> = [];
    let sentCount = 0;

    // send in batches to respect rate limits
    const batchSize = 10; // Resend allows 100 per second, but we'll be conservative
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
                from: 'Head Shakers <noreply@head-shakers.com>',
                html: this.getLaunchEmailHtml(),
                subject: 'Head Shakers is now live! 🎉',
                to: email,
              });
            },
            'sendLaunchNotification',
            { email },
          ),
        ),
      );

      // track results
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

      // add delay between batches to avoid rate limiting
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return { failedEmails, sentCount };
  }

  /**
   * send waitlist confirmation email
   */
  static async sendWaitlistConfirmationAsync(email: string): Promise<boolean> {
    return this.sendEmailWithRetry(
      async () => {
        return resend.emails.send({
          from: 'Head Shakers <noreply@head-shakers.com>',
          html: this.getConfirmationEmailHtml(),
          subject: "You're on the Head Shakers launch list!",
          to: email,
        });
      },
      'sendWaitlistConfirmation',
      { email },
    );
  }

  /**
   * get waitlist confirmation email HTML
   */
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
              <h1>You're on the list! 🎉</h1>
            </div>
            <div class="content">
              <p>Thanks for your interest in Head Shakers!</p>
              <p>We've added your email to our launch notification list. You'll be among the first to know when we go live.</p>
              <p>In the meantime, follow us on social media or check back soon for updates!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Head Shakers. All rights reserved.</p>
              <p>You received this email because you signed up for launch notifications.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * get launch notification email HTML
   */
  private static getLaunchEmailHtml(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 40px 20px; border-radius: 8px; }
            .header h1 { font-size: 32px; margin: 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .footer { text-align: center; font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold; }
            .button:hover { background: #764ba2; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Head Shakers is Live! 🚀</h1>
            </div>
            <div class="content">
              <p>The wait is over!</p>
              <p>Head Shakers is now live and ready for you to start building your bobblehead collection.</p>
              <p>
                <a href="https://headshakers.com" class="button">Go to Head Shakers</a>
              </p>
              <p>Create your first collection, discover rare finds, and connect with other collectors today!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Head Shakers. All rights reserved.</p>
              <p>You received this email because you signed up for launch notifications.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * generic email sending with retry and circuit breaker
   */
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
}
