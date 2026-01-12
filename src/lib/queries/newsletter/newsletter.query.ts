import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';

import { newsletterSignups } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';
import { normalizeEmail } from '@/lib/utils/email-utils';

export type NewsletterSignupRecord = typeof newsletterSignups.$inferSelect;

/**
 * Newsletter domain query service.
 * Handles all database operations for newsletter subscriptions with consistent patterns.
 */
export class NewsletterQuery extends BaseQuery {
  /**
   * Create a new newsletter subscription with optional user linking.
   */
  static async createSignupAsync(
    email: string,
    userId: string | undefined,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const normalizedEmail = normalizeEmail(email);

    const result = await dbInstance
      .insert(newsletterSignups)
      .values({
        email: normalizedEmail,
        userId,
      })
      .onConflictDoNothing()
      .returning();

    return result[0] || null;
  }

  /**
   * Check if email exists regardless of subscription status.
   */
  static async emailExistsAsync(email: string, context: QueryContext): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

    const normalizedEmail = normalizeEmail(email);

    const result = await dbInstance
      .select({ id: newsletterSignups.id })
      .from(newsletterSignups)
      .where(eq(newsletterSignups.email, normalizedEmail))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Find a newsletter signup by email address.
   */
  static async findByEmailAsync(
    email: string,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const normalizedEmail = normalizeEmail(email);

    const result = await dbInstance
      .select()
      .from(newsletterSignups)
      .where(eq(newsletterSignups.email, normalizedEmail))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get the active subscriber by email (not unsubscribed).
   */
  static async getActiveSubscriberByEmailAsync(
    email: string,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const normalizedEmail = normalizeEmail(email);

    const result = await dbInstance
      .select()
      .from(newsletterSignups)
      .where(and(eq(newsletterSignups.email, normalizedEmail), isNull(newsletterSignups.unsubscribedAt)))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Check if an email is actively subscribed (not unsubscribed).
   */
  static async getIsActiveSubscriberByEmailAsync(email: string, context: QueryContext): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

    const normalizedEmail = normalizeEmail(email);

    const [newsletterSignup] = await dbInstance
      .select({ exists: sql<boolean>`1` })
      .from(newsletterSignups)
      .where(
        and(
          eq(newsletterSignups.email, normalizedEmail),
          isNotNull(newsletterSignups.subscribedAt),
          isNull(newsletterSignups.unsubscribedAt),
        ),
      )
      .limit(1);

    return !!newsletterSignup?.exists;
  }

  /**
   * Resubscribe an existing email by clearing unsubscribedAt and updating subscribedAt.
   */
  static async resubscribeAsync(
    email: string,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const existing = await this.findByEmailAsync(email, context);
    if (!existing) return null;

    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(newsletterSignups)
      .set({
        subscribedAt: new Date(),
        unsubscribedAt: null,
      })
      .where(eq(newsletterSignups.email, existing.email))
      .returning();

    return result[0] || null;
  }

  /**
   * Unsubscribe by setting unsubscribedAt timestamp (soft delete).
   */
  static async unsubscribeAsync(
    email: string,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const normalizedEmail = normalizeEmail(email);

    const result = await dbInstance
      .update(newsletterSignups)
      .set({
        unsubscribedAt: new Date(),
      })
      .where(eq(newsletterSignups.email, normalizedEmail))
      .returning();

    return result[0] || null;
  }

  /**
   * Link an anonymous signup to a user account.
   */
  static async updateUserIdAsync(
    email: string,
    userId: string,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const existing = await this.findByEmailAsync(email, context);
    if (!existing || existing.userId !== null) return null;

    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(newsletterSignups)
      .set({
        userId,
      })
      .where(eq(newsletterSignups.email, existing.email))
      .returning();

    return result[0] || null;
  }
}
