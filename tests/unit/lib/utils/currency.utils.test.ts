import { describe, expect, it } from 'vitest';

import { formatCurrency } from '@/lib/utils/currency.utils';

describe('currency utilities', () => {
  describe('formatCurrency', () => {
    it('should format valid number as USD currency with thousand separators', () => {
      const result = formatCurrency(1234.56);

      expect(result).toBe('$1,234.56');
    });

    it('should format string numeric value as currency', () => {
      const result = formatCurrency('500');

      expect(result).toBe('$500.00');
    });

    it('should return $0.00 for null value', () => {
      const result = formatCurrency(null);

      expect(result).toBe('$0.00');
    });

    it('should return $0.00 for undefined value', () => {
      const result = formatCurrency(undefined);

      expect(result).toBe('$0.00');
    });

    it('should return $0.00 for NaN string value', () => {
      const result = formatCurrency('invalid');

      expect(result).toBe('$0.00');
    });
  });
});
