import { describe, expect, it } from 'vitest';

import { maskEmail, normalizeEmail } from '@/lib/utils/email-utils';

describe('email utilities', () => {
  describe('normalizeEmail', () => {
    it('should convert uppercase email to lowercase', () => {
      const result = normalizeEmail('TEST@EXAMPLE.COM');
      expect(result).toBe('test@example.com');
    });

    it('should trim leading and trailing whitespace', () => {
      const result = normalizeEmail('  user@example.com  ');
      expect(result).toBe('user@example.com');
    });

    it('should handle both uppercase and whitespace', () => {
      const result = normalizeEmail('  MIXED@CASE.COM  ');
      expect(result).toBe('mixed@case.com');
    });

    it('should handle already normalized email', () => {
      const result = normalizeEmail('normal@example.com');
      expect(result).toBe('normal@example.com');
    });
  });

  describe('maskEmail', () => {
    it('should mask email with standard length local part', () => {
      const result = maskEmail('john.doe@example.com');
      expect(result).toBe('joh***@example.com');
    });

    it('should mask short email (less than 3 characters in local part)', () => {
      const result = maskEmail('ab@example.com');
      expect(result).toBe('ab***@example.com');
    });

    it('should handle email with missing domain gracefully', () => {
      const result = maskEmail('testuser@');
      expect(result).toBe('tes***@');
    });
  });
});
