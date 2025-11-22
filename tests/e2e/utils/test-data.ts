/**
 * Test Data Utilities for E2E Testing
 *
 * Since E2E branches are created from the development branch using copy-on-write,
 * they inherit all existing data. This module provides utilities for:
 * 1. Retrieving IDs of known test entities
 * 2. Creating additional test data if needed
 * 3. Cleaning up test-specific data after tests
 */

// Test user identifiers (must match Clerk test users)
export const TEST_USERS = {
  admin: {
    clerkUsername: process.env.E2E_CLERK_ADMIN_USERNAME || 'admin@test.headshakers.com',
    role: 'admin' as const,
  },
  newUser: {
    clerkUsername: process.env.E2E_CLERK_NEW_USER_USERNAME || 'newuser@test.headshakers.com',
    role: 'user' as const,
  },
  user: {
    clerkUsername: process.env.E2E_CLERK_USER_USERNAME || 'user@test.headshakers.com',
    role: 'user' as const,
  },
} as const;

export interface TestDataIds {
  adminUserId?: string;
  collections: Array<string>;
  newUserUserId?: string;
  subCollections: Array<string>;
  userUserId?: string;
}

/**
 * Get test data IDs from environment or defaults
 * These should be set during test data setup or read from the seeded database
 */
export function getTestDataIds(): TestDataIds {
  return {
    adminUserId: process.env.E2E_ADMIN_USER_ID,
    collections: (process.env.E2E_COLLECTION_IDS || '').split(',').filter(Boolean),
    newUserUserId: process.env.E2E_NEW_USER_ID,
    subCollections: (process.env.E2E_SUBCOLLECTION_IDS || '').split(',').filter(Boolean),
    userUserId: process.env.E2E_USER_ID,
  };
}

/**
 * Test data constants for deterministic testing
 */
export const TEST_DATA = {
  bobbleheads: {
    default: {
      category: 'sports',
      manufacturer: 'Test Manufacturer',
      name: 'E2E Test Bobblehead',
    },
  },
  collections: {
    default: {
      description: 'E2E Test Collection Description',
      name: 'E2E Test Collection',
    },
    featured: {
      description: 'Featured test collection for E2E testing',
      name: 'Featured E2E Collection',
    },
  },
} as const;

/**
 * Generate unique test identifiers to avoid collisions
 */
export function generateTestId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-e2e-${timestamp}-${random}`;
}

/**
 * Log test environment status
 */
export function logTestEnvironmentStatus(): void {
  const { isValid, missingVars } = validateTestEnvironment();

  if (isValid) {
    console.log('Test environment: All required variables are set');
  } else {
    console.warn('Test environment: Missing required variables:', missingVars.join(', '));
  }
}

/**
 * Validate that required test environment variables are set
 */
export function validateTestEnvironment(): { isValid: boolean; missingVars: Array<string> } {
  const requiredVars = [
    'E2E_CLERK_ADMIN_USERNAME',
    'E2E_CLERK_ADMIN_PASSWORD',
    'E2E_CLERK_USER_USERNAME',
    'E2E_CLERK_USER_PASSWORD',
    'E2E_CLERK_NEW_USER_USERNAME',
    'E2E_CLERK_NEW_USER_PASSWORD',
    'NEON_API_KEY',
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}
