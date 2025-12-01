import type { DynamicRoute, InferPagePropsType } from 'next-typesafe-url';

import { createSearchParamsCache, parseAsString, parseAsStringEnum } from 'nuqs/server';
import { z } from 'zod';

import { ENUMS } from '@/lib/constants';

const BOBBLEHEAD_SORT_OPTIONS = [
  'newest',
  'oldest',
  'name-asc',
  'name-desc',
  'value-high',
  'value-low',
] as const;
const FEATURED_FILTER_OPTIONS = ['all', 'featured', 'not-featured'] as const;
const CONDITION_FILTER_OPTIONS = ['all', ...ENUMS.BOBBLEHEAD.CONDITION] as const;

export const Route = {
  searchParams: z.object({
    collectionSlug: z.string().optional(),
    condition: z
      .enum([...CONDITION_FILTER_OPTIONS] as [string, ...Array<string>])
      .optional()
      .default('all'),
    featured: z
      .enum([...FEATURED_FILTER_OPTIONS] as [string, ...Array<string>])
      .optional()
      .default('all'),
    search: z.string().optional().default(''),
    sortBy: z
      .enum([...BOBBLEHEAD_SORT_OPTIONS] as [string, ...Array<string>])
      .optional()
      .default('newest'),
  }),
} satisfies DynamicRoute;

export const collectionDashboardParsers = {
  collectionSlug: parseAsString,
  condition: parseAsStringEnum([...CONDITION_FILTER_OPTIONS]).withDefault('all'),
  featured: parseAsStringEnum([...FEATURED_FILTER_OPTIONS]).withDefault('all'),
  search: parseAsString.withDefault(''),
  sortBy: parseAsStringEnum([...BOBBLEHEAD_SORT_OPTIONS]).withDefault('newest'),
};

export const collectionDashboardSearchParamsCache = createSearchParamsCache(collectionDashboardParsers);

export type PageProps = InferPagePropsType<RouteType>;
export type RouteType = typeof Route;
