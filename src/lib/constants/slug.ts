/**
 * Slug Constants
 * Centralized configuration for slug validation rules and constraints
 */

/**
 * Maximum length for slugs
 * Keeps URLs manageable and prevents excessively long slugs
 */
export const SLUG_MAX_LENGTH = 100;

/**
 * Minimum length for slugs
 * Ensures slugs are meaningful and not too short
 */
export const SLUG_MIN_LENGTH = 1;

/**
 * Regular expression pattern for valid slugs
 * - Must start and end with lowercase letter or number
 * - Can contain lowercase letters, numbers, and hyphens
 * - No consecutive hyphens
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Reserved slug words that cannot be used for user-generated content
 * These are protected to prevent conflicts with system routes and functionality
 */
export const SLUG_RESERVED_WORDS = [
  // Authentication & User Management
  'admin',
  'auth',
  'login',
  'logout',
  'register',
  'signup',
  'signin',
  'signout',
  'sign-in',
  'sign-out',
  'sign-up',
  'forgot-password',
  'reset-password',
  'verify',
  'verify-email',
  'onboarding',
  'profile',
  'account',
  'settings',
  'preferences',

  // API & System Routes
  'api',
  'graphql',
  'rest',
  'webhook',
  'webhooks',
  'callback',
  'oauth',

  // Next.js Protected Routes
  '_next',
  'public',
  'static',
  'favicon',
  'robots',
  'sitemap',
  'manifest',

  // CRUD Operations
  'new',
  'create',
  'edit',
  'update',
  'delete',
  'remove',

  // Application Routes
  'dashboard',
  'home',
  'search',
  'explore',
  'discover',
  'trending',
  'featured',
  'popular',
  'collections',
  'bobbleheads',
  'users',
  'feed',
  'notifications',
  'messages',
  'inbox',

  // Legal & Support
  'about',
  'terms',
  'privacy',
  'contact',
  'help',
  'support',
  'faq',
  'legal',

  // Admin & Moderation
  'moderate',
  'moderation',
  'reports',
  'analytics',
  'stats',
  'metrics',

  // Technical
  'test',
  'testing',
  'debug',
  'error',
  'errors',
  '404',
  '500',
  'healthcheck',
  'health',
  'status',
] as const;

/**
 * Type representing all reserved slug words
 */
export type ReservedSlugWord = (typeof SLUG_RESERVED_WORDS)[number];
