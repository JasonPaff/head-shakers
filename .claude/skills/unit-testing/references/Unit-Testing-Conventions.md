# Unit Testing Conventions

## Overview

Unit tests validate isolated pieces of code - pure functions, validation schemas, and utilities. They run without database or external service dependencies.

**File Pattern**: `tests/unit/**/*.test.ts`

**Key Characteristics**:

- Pure isolation - no database, no network
- Fast execution (no external dependencies)
- Mock all external imports
- Test behavior, not implementation

## Unit Test Pattern

```typescript
import { describe, expect, it } from 'vitest';

import { formatDate, parseDate } from '@/lib/utils/date';

describe('date utilities', () => {
  describe('formatDate', () => {
    it('should format date in default format', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toBe('January 15, 2024');
    });

    it('should handle custom format', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, 'MM/dd/yyyy');
      expect(result).toBe('01/15/2024');
    });

    it('should return empty string for invalid date', () => {
      const result = formatDate(null);
      expect(result).toBe('');
    });
  });

  describe('parseDate', () => {
    it('should parse valid date string', () => {
      const result = parseDate('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });

    it('should return null for invalid string', () => {
      const result = parseDate('invalid');
      expect(result).toBeNull();
    });
  });
});
```

**Note**: No need to import `describe`, `it`, `expect`, `vi` - globals are enabled in Vitest config.

## Validation Schema Testing Pattern

```typescript
import { describe, expect, it } from 'vitest';

import { createUserSchema, updateUserSchema } from '@/lib/validations/user.validation';

describe('user validation schemas', () => {
  describe('createUserSchema', () => {
    it('should validate correct input', () => {
      const validInput = {
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
      };

      const result = createUserSchema.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });

    it('should reject invalid email', () => {
      const invalidInput = {
        email: 'not-an-email',
        username: 'testuser',
        displayName: 'Test User',
      };

      const result = createUserSchema.safeParse(invalidInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject empty username', () => {
      const invalidInput = {
        email: 'test@example.com',
        username: '',
        displayName: 'Test User',
      };

      const result = createUserSchema.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });

    it('should handle optional fields', () => {
      const minimalInput = {
        email: 'test@example.com',
        username: 'testuser',
      };

      const result = createUserSchema.safeParse(minimalInput);

      expect(result.success).toBe(true);
    });
  });
});
```

## Mocking External Dependencies

```typescript
import { describe, expect, it, vi } from 'vitest';

// Mock external module BEFORE importing the module under test
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { processData } from '@/lib/utils/processor';
import { logger } from '@/lib/utils/logger';

describe('processData', () => {
  it('should log processing start', () => {
    processData({ id: '123' });

    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Processing'));
  });
});
```

## Arrange-Act-Assert Pattern

```typescript
describe('calculateTotal', () => {
  it('should calculate total with tax', () => {
    // Arrange
    const items = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 },
    ];
    const taxRate = 0.1;

    // Act
    const result = calculateTotal(items, taxRate);

    // Assert
    expect(result).toBe(275); // (200 + 50) * 1.1
  });
});
```

## Edge Case Testing

```typescript
describe('sanitizeInput', () => {
  // Standard cases
  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  // Edge cases
  it('should handle empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('should handle null', () => {
    expect(sanitizeInput(null)).toBe('');
  });

  it('should handle undefined', () => {
    expect(sanitizeInput(undefined)).toBe('');
  });

  it('should handle very long strings', () => {
    const longString = 'a'.repeat(10000);
    expect(sanitizeInput(longString)).toHaveLength(10000);
  });

  // Error cases
  it('should throw for invalid type', () => {
    expect(() => sanitizeInput(123 as unknown as string)).toThrow();
  });
});
```

## Testing Async Functions

```typescript
describe('fetchConfig', () => {
  it('should return config object', async () => {
    const result = await fetchConfig();

    expect(result).toHaveProperty('apiUrl');
    expect(result).toHaveProperty('timeout');
  });

  it('should throw on invalid environment', async () => {
    await expect(fetchConfig('invalid')).rejects.toThrow('Invalid environment');
  });
});
```

## Checklist

- [ ] Use `describe`/`it` blocks with clear descriptions
- [ ] Follow Arrange-Act-Assert pattern
- [ ] Mock ALL external dependencies with `vi.mock()`
- [ ] Test edge cases (null, undefined, empty, boundary values)
- [ ] Test error scenarios
- [ ] No database access
- [ ] No network calls
- [ ] No imports for `describe`/`it`/`expect` (globals enabled)
