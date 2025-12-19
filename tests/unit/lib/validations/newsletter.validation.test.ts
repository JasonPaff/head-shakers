import { describe, expect, it } from 'vitest';

import { SCHEMA_LIMITS } from '@/lib/constants';
import {
  insertNewsletterSignupSchema,
  unsubscribeFromNewsletterSchema,
} from '@/lib/validations/newsletter.validation';

describe('newsletter validation schemas', () => {
  describe('insertNewsletterSignupSchema', () => {
    it('should accept valid email address', () => {
      const input = { email: 'user@example.com' };
      const result = insertNewsletterSignupSchema.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('user@example.com');
    });

    it('should reject invalid email format (missing @)', () => {
      const input = { email: 'notanemail' };
      const result = insertNewsletterSignupSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain('Please enter a valid email address');
    });

    it('should reject email exceeding maximum length', () => {
      // Create email with 256 characters (max is 255)
      const longEmail = 'a'.repeat(247) + '@test.com'; // 256 chars total
      const input = { email: longEmail };
      const result = insertNewsletterSignupSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain(
        `Email must be at most ${SCHEMA_LIMITS.NEWSLETTER_SIGNUP.EMAIL.MAX} characters`,
      );
    });

    it('should reject email with leading/trailing whitespace', () => {
      // Note: .email() validation happens before .trim(), so whitespace causes email validation to fail
      const input = { email: '  user@example.com  ' };
      const result = insertNewsletterSignupSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain('Please enter a valid email address');
    });

    it('should reject empty email', () => {
      const input = { email: '' };
      const result = insertNewsletterSignupSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain('Please enter a valid email address');
    });

    it('should reject email with only whitespace', () => {
      const input = { email: '   ' };
      const result = insertNewsletterSignupSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain('Please enter a valid email address');
    });
  });

  describe('unsubscribeFromNewsletterSchema', () => {
    it('should accept valid email address', () => {
      const input = { email: 'user@example.com' };
      const result = unsubscribeFromNewsletterSchema.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('user@example.com');
    });

    it('should reject invalid email format', () => {
      const input = { email: 'invalid.email' };
      const result = unsubscribeFromNewsletterSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain('Please enter a valid email address');
    });

    it('should reject email exceeding maximum length (255 chars)', () => {
      // Create email with 256 characters (max is 255)
      const longEmail = 'a'.repeat(247) + '@test.com';
      const input = { email: longEmail };
      const result = unsubscribeFromNewsletterSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain(
        `Email must be at most ${SCHEMA_LIMITS.NEWSLETTER_SIGNUP.EMAIL.MAX} characters`,
      );
    });

    it('should reject email with leading/trailing whitespace', () => {
      // Note: .email() validation happens before .trim(), so whitespace causes email validation to fail
      const input = { email: '  unsubscribe@example.com  ' };
      const result = unsubscribeFromNewsletterSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain('Please enter a valid email address');
    });

    it('should reject missing email field', () => {
      const input = {};
      const result = unsubscribeFromNewsletterSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toContain('email');
    });

    it('should accept email at maximum allowed length', () => {
      // Create exactly 255 character email (246 + @ + 8 = 255)
      const maxEmail = `${'a'.repeat(246)}@test.com`; // 255 chars total
      const input = { email: maxEmail };
      const result = unsubscribeFromNewsletterSchema.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.email).toHaveLength(255);
    });
  });
});
