import * as Sentry from '@sentry/nextjs';
import Ably from 'ably';

import type { NewsletterSignupNotificationPayload } from '@/lib/constants/ably-channels';

import { ABLY_CHANNELS, ABLY_MESSAGE_TYPES } from '@/lib/constants/ably-channels';
import { CONFIG } from '@/lib/constants/config';
import { OPERATIONS } from '@/lib/constants/operations';
import { SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS } from '@/lib/constants/sentry';
import { circuitBreakers } from '@/lib/utils/circuit-breaker-registry';
import { withDatabaseRetry } from '@/lib/utils/retry';

/**
 * Server-side Ably REST client singleton
 * Uses REST API for serverless-friendly stateless communication
 */
const getAblyClient = (): Ably.Rest => {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    throw new Error('ABLY_API_KEY environment variable is not set');
  }
  return new Ably.Rest({ key: apiKey });
};

/**
 * AblyService
 * Handles all server-side Ably REST API operations
 * Includes retry logic, circuit breaker protection, and comprehensive error tracking
 *
 * Uses REST API (not Realtime) to avoid persistent connections in serverless environment
 */
export class AblyService {
  /**
   * Publish a notification to admins about a new newsletter signup
   * Uses fire-and-forget pattern - failures are logged but don't throw
   *
   * @param payload - Newsletter signup notification data (email should be pre-masked)
   * @returns boolean indicating if publish succeeded
   */
  static async publishNewsletterSignupNotificationAsync(
    payload: NewsletterSignupNotificationPayload,
  ): Promise<boolean> {
    const operationName = OPERATIONS.NEWSLETTER.NOTIFY_ADMIN_SIGNUP;

    try {
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.EXTERNAL_SERVICE,
        data: {
          channel: ABLY_CHANNELS.ADMIN_NEWSLETTER_SIGNUPS,
          messageType: ABLY_MESSAGE_TYPES.NEW_SIGNUP,
          signupId: payload.signupId,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Publishing newsletter signup notification to Ably',
      });

      const circuitBreaker = circuitBreakers.externalService(operationName);

      const result = await circuitBreaker.execute(async () => {
        const retryResult = await withDatabaseRetry(
          async () => {
            const client = getAblyClient();
            const channel = client.channels.get(ABLY_CHANNELS.ADMIN_NEWSLETTER_SIGNUPS);

            await channel.publish(ABLY_MESSAGE_TYPES.NEW_SIGNUP, payload);

            return { success: true };
          },
          {
            maxAttempts: CONFIG.EXTERNAL_SERVICES.ABLY.MAX_RETRIES,
            operationName,
          },
        );

        return retryResult.result;
      });

      if (result.result.success) {
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.EXTERNAL_SERVICE,
          data: {
            channel: ABLY_CHANNELS.ADMIN_NEWSLETTER_SIGNUPS,
            signupId: payload.signupId,
          },
          level: SENTRY_LEVELS.INFO,
          message: 'Newsletter signup notification published successfully',
        });

        return true;
      }

      return false;
    } catch (error) {
      // Fire-and-forget: Log error but don't throw
      Sentry.captureException(error, {
        extra: {
          channel: ABLY_CHANNELS.ADMIN_NEWSLETTER_SIGNUPS,
          email: payload.email, // Already masked by caller
          operationName,
          signupId: payload.signupId,
        },
        tags: {
          component: 'AblyService',
          operation: operationName,
        },
      });

      return false;
    }
  }
}
