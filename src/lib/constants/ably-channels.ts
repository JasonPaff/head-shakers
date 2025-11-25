/**
 * Ably channel name constants
 * Uses 'admin:' prefix for privileged channels that should only be accessed by admin users
 *
 * Security model:
 * - Channel names with 'admin:' prefix indicate admin-only access
 * - Client-side components use role checking before subscribing
 * - Server-side publishing happens in trusted facade context
 * - For production: Consider implementing Ably capability tokens for true channel-level access control
 */
export const ABLY_CHANNELS = {
  /** Channel for admin notifications about new newsletter signups */
  ADMIN_NEWSLETTER_SIGNUPS: 'admin:newsletter-signups',
  /** Channel for admin notifications (bell updates) */
  ADMIN_NOTIFICATIONS: 'admin:notifications',
} as const;

/**
 * Ably message type constants
 * Used to filter messages within a channel by type
 */
export const ABLY_MESSAGE_TYPES = {
  /** Message type for new newsletter signup notifications */
  NEW_SIGNUP: 'new-signup',
  /** Message type for new notification created */
  NOTIFICATION_CREATED: 'notification-created',
} as const;

export type AblyChannel = (typeof ABLY_CHANNELS)[keyof typeof ABLY_CHANNELS];

export type AblyMessageType = (typeof ABLY_MESSAGE_TYPES)[keyof typeof ABLY_MESSAGE_TYPES];
/**
 * Payload sent to admin notifications channel when a new notification is created
 */
export interface AdminNotificationPayload {
  /** Notification ID from database */
  notificationId: string;
  /** Notification type (comment, like, follow, mention, system) */
  notificationType: string;
  /** ISO timestamp when the notification was created */
  timestamp: string;
  /** User ID of the admin who should receive this notification */
  userId: string;
}

/**
 * Payload sent to admin notification channel when a new newsletter signup occurs
 * Email is masked for privacy (first 3 characters only, e.g., "joh***")
 */
export interface NewsletterSignupNotificationPayload {
  /** Masked email address (first 3 chars + '***') for privacy */
  email: string;
  /** Newsletter signup record ID */
  signupId: string;
  /** ISO timestamp when the signup occurred */
  timestamp: string;
  /** Optional Clerk user ID if the subscriber was logged in */
  userId?: string;
}
