import { describe, expect, it } from 'vitest';

import { getPageNumbers } from '@/lib/utils/pagination.utils';

describe('pagination utils', () => {
  describe('getPageNumbers', () => {
    // Standard cases - small page counts
    it('should return all pages when totalPages is 1', () => {
      const result = getPageNumbers(1, 1);
      expect(result).toEqual([1]);
    });

    it('should return all pages when totalPages is 2', () => {
      const result = getPageNumbers(1, 2);
      expect(result).toEqual([1, 2]);
    });

    it('should return all pages when totalPages is 3', () => {
      const result = getPageNumbers(2, 3);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should return all pages when totalPages is 4', () => {
      const result = getPageNumbers(3, 4);
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('should return all pages when totalPages is exactly 5', () => {
      const result = getPageNumbers(3, 5);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    // Edge cases with currentPage at boundaries
    it('should show pages without starting ellipsis when currentPage is 1', () => {
      const result = getPageNumbers(1, 10);
      expect(result).toEqual([1, 2, -1, 10]);
    });

    it('should show pages without ending ellipsis when currentPage is at last page', () => {
      const result = getPageNumbers(10, 10);
      expect(result).toEqual([1, -1, 9, 10]);
    });

    it('should show pages without starting ellipsis when currentPage is 2', () => {
      const result = getPageNumbers(2, 10);
      expect(result).toEqual([1, 2, 3, -1, 10]);
    });

    it('should show pages without starting ellipsis when currentPage is 3', () => {
      const result = getPageNumbers(3, 10);
      expect(result).toEqual([1, 2, 3, 4, -1, 10]);
    });

    // Middle page scenarios with both ellipses
    it('should include both ellipses when currentPage is 5 of 10', () => {
      const result = getPageNumbers(5, 10);
      expect(result).toEqual([1, -1, 4, 5, 6, -1, 10]);
    });

    it('should include both ellipses when currentPage is 6 of 10', () => {
      const result = getPageNumbers(6, 10);
      expect(result).toEqual([1, -1, 5, 6, 7, -1, 10]);
    });

    // Near-end scenarios
    it('should show pages without ending ellipsis when currentPage is 8 of 10', () => {
      const result = getPageNumbers(8, 10);
      expect(result).toEqual([1, -1, 7, 8, 9, 10]);
    });

    it('should show pages without ending ellipsis when currentPage is 9 of 10', () => {
      const result = getPageNumbers(9, 10);
      expect(result).toEqual([1, -1, 8, 9, 10]);
    });

    // Large page count scenarios
    it('should handle very large totalPages with currentPage in middle', () => {
      const result = getPageNumbers(50, 100);
      expect(result).toEqual([1, -1, 49, 50, 51, -1, 100]);
    });

    it('should handle very large totalPages with currentPage near start', () => {
      const result = getPageNumbers(4, 100);
      expect(result).toEqual([1, -1, 3, 4, 5, -1, 100]);
    });

    // Ellipsis marker verification
    it('should use -1 as ellipsis marker for starting ellipsis', () => {
      const result = getPageNumbers(5, 10);
      expect(result[1]).toBe(-1);
    });

    it('should use -1 as ellipsis marker for ending ellipsis', () => {
      const result = getPageNumbers(5, 10);
      expect(result[5]).toBe(-1);
    });

    // Always show first and last page verification
    it('should always include first page in result', () => {
      const result = getPageNumbers(5, 10);
      expect(result[0]).toBe(1);
    });

    it('should always include last page in result', () => {
      const result = getPageNumbers(5, 10);
      expect(result[result.length - 1]).toBe(10);
    });

    // Pages around current page verification
    it('should show currentPage - 1, currentPage, and currentPage + 1 when in middle', () => {
      const result = getPageNumbers(5, 10);
      expect(result).toContain(4);
      expect(result).toContain(5);
      expect(result).toContain(6);
    });

    // Additional edge cases for complete coverage
    it('should handle currentPage at position 4 of 10', () => {
      const result = getPageNumbers(4, 10);
      expect(result).toEqual([1, -1, 3, 4, 5, -1, 10]);
    });

    it('should handle currentPage at position 7 of 10', () => {
      const result = getPageNumbers(7, 10);
      expect(result).toEqual([1, -1, 6, 7, 8, -1, 10]);
    });
  });
});
