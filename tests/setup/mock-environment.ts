/**
 * Mock environment variable utilities for testing.
 * Provides helpers to set and restore environment variables during tests.
 */

interface EnvironmentVariables {
  [key: string]: string | undefined;
  NEXT_PUBLIC_APP_URL?: string;
}

/**
 * Store original environment variables for restoration.
 */
const originalEnv: EnvironmentVariables = {};

/**
 * Clear a specific environment variable.
 *
 * @param key - Environment variable key to clear
 *
 * @example
 * ```ts
 * clearEnvVariable('NEXT_PUBLIC_APP_URL');
 * ```
 */
export function clearEnvVariable(key: string): void {
  if (!originalEnv[key]) {
    originalEnv[key] = process.env[key];
  }
  delete process.env[key];
}

/**
 * Mock a specific environment variable for a test.
 * Useful for testing different configurations.
 *
 * @param key - Environment variable key
 * @param value - Environment variable value
 *
 * @example
 * ```ts
 * mockEnvVariable('NEXT_PUBLIC_APP_URL', 'https://example.com');
 * ```
 */
export function mockEnvVariable(key: string, value: string): void {
  if (!originalEnv[key]) {
    originalEnv[key] = process.env[key];
  }
  process.env[key] = value;
}

/**
 * Set up mock environment variables for tests.
 * Saves original values for later restoration.
 *
 * @param variables - Environment variables to set
 *
 * @example
 * ```ts
 * beforeEach(() => {
 *   setupMockEnvironment({
 *     NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
 *   });
 * });
 * ```
 */
export function setupMockEnvironment(variables: EnvironmentVariables = {}): void {
  // Set default test environment variables
  const defaults: EnvironmentVariables = {
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    ...variables,
  };

  // Store original values
  Object.keys(defaults).forEach((key) => {
    originalEnv[key] = process.env[key];
  });

  // Set new values
  Object.entries(defaults).forEach(([key, value]) => {
    if (value !== undefined) {
      process.env[key] = value;
    }
  });
}

/**
 * Tear down mock environment variables and restore originals.
 * Call this in afterEach to clean up environment changes.
 *
 * @example
 * ```ts
 * afterEach(() => {
 *   teardownMockEnvironment();
 * });
 * ```
 */
export function teardownMockEnvironment(): void {
  // Restore original values
  Object.entries(originalEnv).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });

  // Clear the stored originals
  Object.keys(originalEnv).forEach((key) => {
    delete originalEnv[key];
  });
}
