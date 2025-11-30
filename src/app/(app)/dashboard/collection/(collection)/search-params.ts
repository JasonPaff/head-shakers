import { createSearchParamsCache, parseAsString, parseAsStringEnum } from 'nuqs/server';

import { ENUMS } from '@/lib/constants';

/**
 * Sort options for the bobblehead grid
 */
export const BOBBLEHEAD_SORT_OPTIONS = [
  'newest',
  'oldest',
  'name-asc',
  'name-desc',
  'value-high',
  'value-low',
] as const;

/**
 * Featured filter options
 */
export const FEATURED_FILTER_OPTIONS = ['all', 'featured', 'not-featured'] as const;

/**
 * Condition filter options (includes 'all' for no filter)
 */
export const CONDITION_FILTER_OPTIONS = ['all', ...ENUMS.BOBBLEHEAD.CONDITION] as const;

/**
 * Parser definitions for collection dashboard URL state.
 * Shared between server cache and client useQueryStates.
 */
export const collectionDashboardParsers = {
  collectionSlug: parseAsString,
  condition: parseAsStringEnum([...CONDITION_FILTER_OPTIONS]).withDefault('all'),
  featured: parseAsStringEnum([...FEATURED_FILTER_OPTIONS]).withDefault('all'),
  search: parseAsString.withDefault(''),
  sortBy: parseAsStringEnum([...BOBBLEHEAD_SORT_OPTIONS]).withDefault('newest'),
};

/**
 * Server-side cache for nested server components.
 * Parse once in page.tsx, read anywhere in the component tree.
 */
export const collectionDashboardSearchParamsCache = createSearchParamsCache(collectionDashboardParsers);

/**
 * Type for collection dashboard search params
 */
export type CollectionDashboardSearchParams = {
  collectionSlug: null | string;
  condition: (typeof CONDITION_FILTER_OPTIONS)[number];
  featured: (typeof FEATURED_FILTER_OPTIONS)[number];
  search: string;
  sortBy: (typeof BOBBLEHEAD_SORT_OPTIONS)[number];
};
