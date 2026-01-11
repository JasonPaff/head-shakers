import { describe, expect, it } from 'vitest';

import { Route } from '@/app/(app)/dashboard/collection/route-type';

describe('Route.searchParams Zod schema', () => {
  describe('sortBy parameter', () => {
    it('should validate "newest" sort option', () => {
      const input = { sortBy: 'newest' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.sortBy).toBe('newest');
    });

    it('should validate "oldest" sort option', () => {
      const input = { sortBy: 'oldest' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.sortBy).toBe('oldest');
    });

    it('should validate "name-asc" sort option', () => {
      const input = { sortBy: 'name-asc' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.sortBy).toBe('name-asc');
    });

    it('should validate "name-desc" sort option', () => {
      const input = { sortBy: 'name-desc' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.sortBy).toBe('name-desc');
    });

    it('should validate "value-high" sort option', () => {
      const input = { sortBy: 'value-high' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.sortBy).toBe('value-high');
    });

    it('should validate "value-low" sort option', () => {
      const input = { sortBy: 'value-low' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.sortBy).toBe('value-low');
    });

    it('should reject invalid sort option', () => {
      const input = { sortBy: 'invalid-sort' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should default to "newest" when sortBy is not provided', () => {
      const input = {};
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.sortBy).toBe('newest');
    });
  });

  describe('condition parameter', () => {
    it('should validate "all" condition', () => {
      const input = { condition: 'all' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.condition).toBe('all');
    });

    it('should validate "mint" condition', () => {
      const input = { condition: 'mint' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.condition).toBe('mint');
    });

    it('should validate "excellent" condition', () => {
      const input = { condition: 'excellent' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.condition).toBe('excellent');
    });

    it('should validate "good" condition', () => {
      const input = { condition: 'good' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.condition).toBe('good');
    });

    it('should validate "fair" condition', () => {
      const input = { condition: 'fair' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.condition).toBe('fair');
    });

    it('should validate "poor" condition', () => {
      const input = { condition: 'poor' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.condition).toBe('poor');
    });

    it('should reject invalid condition', () => {
      const input = { condition: 'invalid-condition' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should default to "all" when condition is not provided', () => {
      const input = {};
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.condition).toBe('all');
    });
  });

  describe('featured parameter', () => {
    it('should validate "all" featured filter', () => {
      const input = { featured: 'all' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.featured).toBe('all');
    });

    it('should validate "featured" filter', () => {
      const input = { featured: 'featured' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.featured).toBe('featured');
    });

    it('should validate "not-featured" filter', () => {
      const input = { featured: 'not-featured' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.featured).toBe('not-featured');
    });

    it('should reject invalid featured value', () => {
      const input = { featured: 'invalid-featured' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should default to "all" when featured is not provided', () => {
      const input = {};
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.featured).toBe('all');
    });
  });

  describe('page parameter', () => {
    it('should validate positive integer for page', () => {
      const input = { page: '5' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.page).toBe(5);
    });

    it('should validate page number 1', () => {
      const input = { page: '1' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.page).toBe(1);
    });

    it('should reject zero as page number', () => {
      const input = { page: '0' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject negative page number', () => {
      const input = { page: '-5' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should default to 1 when page is not provided', () => {
      const input = {};
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.page).toBe(1);
    });
  });

  describe('pageSize parameter', () => {
    it('should validate custom page size', () => {
      const input = { pageSize: '48' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.pageSize).toBe(48);
    });

    it('should default to 24 when pageSize is not provided', () => {
      const input = {};
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.pageSize).toBe(24);
    });

    it('should reject zero as pageSize', () => {
      const input = { pageSize: '0' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject negative pageSize', () => {
      const input = { pageSize: '-10' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('search parameter', () => {
    it('should validate empty search string', () => {
      const input = { search: '' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.search).toBe('');
    });

    it('should validate search query string', () => {
      const input = { search: 'baseball bobblehead' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.search).toBe('baseball bobblehead');
    });

    it('should default to empty string when search is not provided', () => {
      const input = {};
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.search).toBe('');
    });
  });

  describe('category parameter', () => {
    it('should validate category string', () => {
      const input = { category: 'sports' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.category).toBe('sports');
    });

    it('should default to "all" when category is not provided', () => {
      const input = {};
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.category).toBe('all');
    });
  });

  describe('add parameter', () => {
    it('should validate true boolean', () => {
      const input = { add: 'true' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.add).toBe(true);
    });

    it('should coerce non-truthy string to true', () => {
      const input = { add: 'false' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      // Zod's coerce.boolean treats any non-empty string as true
      expect(result.data?.add).toBe(true);
    });

    it('should default to false when add is not provided', () => {
      const input = {};
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.add).toBe(false);
    });
  });

  describe('edit parameter', () => {
    it('should validate edit ID string', () => {
      const input = { edit: '123e4567-e89b-12d3-a456-426614174000' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.edit).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should be undefined when edit is not provided', () => {
      const input = {};
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.edit).toBeUndefined();
    });
  });

  describe('collectionSlug parameter', () => {
    it('should validate collection slug string', () => {
      const input = { collectionSlug: 'my-collection' };
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.collectionSlug).toBe('my-collection');
    });

    it('should be undefined when collectionSlug is not provided', () => {
      const input = {};
      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.collectionSlug).toBeUndefined();
    });
  });

  describe('complete search params object', () => {
    it('should validate complete search params with all fields', () => {
      const input = {
        add: 'true',
        category: 'sports',
        collectionSlug: 'my-collection',
        condition: 'mint',
        edit: '123e4567-e89b-12d3-a456-426614174000',
        featured: 'featured',
        page: '2',
        pageSize: '48',
        search: 'baseball',
        sortBy: 'name-asc',
      };

      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.add).toBe(true);
      expect(result.data?.category).toBe('sports');
      expect(result.data?.collectionSlug).toBe('my-collection');
      expect(result.data?.condition).toBe('mint');
      expect(result.data?.edit).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.data?.featured).toBe('featured');
      expect(result.data?.page).toBe(2);
      expect(result.data?.pageSize).toBe(48);
      expect(result.data?.search).toBe('baseball');
      expect(result.data?.sortBy).toBe('name-asc');
    });

    it('should apply defaults for all optional fields when empty', () => {
      const input = {};

      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.add).toBe(false);
      expect(result.data?.category).toBe('all');
      expect(result.data?.condition).toBe('all');
      expect(result.data?.featured).toBe('all');
      expect(result.data?.page).toBe(1);
      expect(result.data?.pageSize).toBe(24);
      expect(result.data?.search).toBe('');
      expect(result.data?.sortBy).toBe('newest');
      expect(result.data?.collectionSlug).toBeUndefined();
      expect(result.data?.edit).toBeUndefined();
    });

    it('should validate partial search params with pagination', () => {
      const input = {
        page: '3',
        search: 'vintage',
        sortBy: 'oldest',
      };

      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.page).toBe(3);
      expect(result.data?.search).toBe('vintage');
      expect(result.data?.sortBy).toBe('oldest');
      expect(result.data?.add).toBe(false);
      expect(result.data?.category).toBe('all');
      expect(result.data?.condition).toBe('all');
    });

    it('should coerce string numbers to integers', () => {
      const input = {
        page: '10',
        pageSize: '100',
      };

      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.page).toBe(10);
      expect(result.data?.pageSize).toBe(100);
      expect(typeof result.data?.page).toBe('number');
      expect(typeof result.data?.pageSize).toBe('number');
    });

    it('should coerce string boolean to boolean', () => {
      const input = {
        add: 'true',
      };

      const result = Route.searchParams.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.add).toBe(true);
      expect(typeof result.data?.add).toBe('boolean');
    });
  });
});
