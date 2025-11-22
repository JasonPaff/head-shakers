import { describe, expect, it } from 'vitest';

import { SCHEMA_LIMITS } from '@/lib/constants';
import {
  checkUsernameAvailabilitySchema,
  insertUserSchema,
  updateUsernameSchema,
} from '@/lib/validations/users.validation';

describe('users validation schemas', () => {
  describe('checkUsernameAvailabilitySchema', () => {
    it('should validate a valid username', () => {
      const input = { username: 'valid_user123' };
      const result = checkUsernameAvailabilitySchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.username).toBe('valid_user123');
      }
    });

    it('should reject username shorter than minimum length', () => {
      const input = { username: 'ab' }; // min is 3
      const result = checkUsernameAvailabilitySchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          `Username must be at least ${SCHEMA_LIMITS.USER.USERNAME.MIN} characters`,
        );
      }
    });

    it('should reject username longer than maximum length', () => {
      const input = { username: 'a'.repeat(51) }; // max is 50
      const result = checkUsernameAvailabilitySchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          `Username must be at most ${SCHEMA_LIMITS.USER.USERNAME.MAX} characters`,
        );
      }
    });

    it('should reject username with special characters', () => {
      const input = { username: 'user@name!' };
      const result = checkUsernameAvailabilitySchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('letters, numbers, and underscores');
      }
    });

    it('should reject username with spaces', () => {
      const input = { username: 'user name' };
      const result = checkUsernameAvailabilitySchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should accept username with underscores', () => {
      const input = { username: 'user_name_123' };
      const result = checkUsernameAvailabilitySchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should reject reserved username', () => {
      const input = { username: 'admin' };
      const result = checkUsernameAvailabilitySchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('reserved');
      }
    });
  });

  describe('updateUsernameSchema', () => {
    it('should validate a valid username update', () => {
      const input = { username: 'new_username' };
      const result = updateUsernameSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.username).toBe('new_username');
      }
    });

    it('should reject invalid username format', () => {
      const input = { username: 'invalid-user' }; // hyphens not allowed
      const result = updateUsernameSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject reserved usernames', () => {
      const input = { username: 'support' };
      const result = updateUsernameSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('insertUserSchema', () => {
    it('should validate a valid user', () => {
      const input = {
        displayName: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
      };
      const result = insertUserSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.displayName).toBe('John Doe');
        expect(result.data.email).toBe('john@example.com');
        expect(result.data.username).toBe('johndoe');
      }
    });

    it('should reject invalid email format', () => {
      const input = {
        displayName: 'John Doe',
        email: 'not-an-email',
        username: 'johndoe',
      };
      const result = insertUserSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject empty display name', () => {
      const input = {
        displayName: '',
        email: 'john@example.com',
        username: 'johndoe',
      };
      const result = insertUserSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should accept optional bio field', () => {
      const input = {
        bio: 'Bobblehead collector since 2010',
        displayName: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
      };
      const result = insertUserSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bio).toBe('Bobblehead collector since 2010');
      }
    });

    it('should reject bio exceeding maximum length', () => {
      const input = {
        bio: 'a'.repeat(501), // max is 500
        displayName: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
      };
      const result = insertUserSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should accept optional location field', () => {
      const input = {
        displayName: 'John Doe',
        email: 'john@example.com',
        location: 'New York, NY',
        username: 'johndoe',
      };
      const result = insertUserSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.location).toBe('New York, NY');
      }
    });
  });
});
