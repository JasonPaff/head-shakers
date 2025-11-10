/**
 * Reserved usernames that cannot be used by regular users
 * Includes system routes, admin pages, and protected terms
 */
export const RESERVED_USERNAMES = [
  // System and admin routes
  'admin',
  'administrator',
  'moderator',
  'mod',
  'support',
  'help',
  'system',
  'root',
  'api',
  'auth',

  // App routes
  'dashboard',
  'bobbleheads',
  'collections',
  'profile',
  'settings',
  'notifications',
  'messages',
  'search',
  'explore',
  'trending',
  'featured',
  'discover',

  // Public routes
  'about',
  'terms',
  'privacy',
  'contact',
  'faq',
  'help',
  'blog',
  'news',
  'legal',
  'careers',
  'jobs',

  // Authentication routes
  'login',
  'logout',
  'signup',
  'signin',
  'signout',
  'register',
  'verify',
  'reset',
  'password',
  'forgot',

  // API and special routes
  'api',
  'oauth',
  'callback',
  'webhook',
  'webhooks',
  'health',
  'status',
  'metrics',

  // Protected terms
  'headshakers',
  'head-shakers',
  'official',
  'verified',
  'team',
  'staff',
  'employee',

  // Common system terms
  'www',
  'mail',
  'email',
  'smtp',
  'ftp',
  'ssh',
  'cdn',
  'static',
  'assets',
  'images',
  'uploads',
  'files',
  'public',
  'private',

  // Reserved for future use
  'shop',
  'store',
  'marketplace',
  'premium',
  'pro',
  'enterprise',
  'business',

  // Prevent impersonation
  'null',
  'undefined',
  'admin',
  'administrator',
  'owner',
  'founder',
  'ceo',
  'cto',
] as const;

/**
 * Check if a username is reserved (case-insensitive)
 */
export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.includes(username.toLowerCase() as (typeof RESERVED_USERNAMES)[number]);
}
