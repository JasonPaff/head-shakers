import type { DynamicRoute, InferPagePropsType } from 'next-typesafe-url';

import { z } from 'zod';

import { BOBBLEHEAD_SORT_OPTIONS, CONDITION_FILTER_OPTIONS, FEATURED_FILTER_OPTIONS } from './search-params';

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

export type PageProps = InferPagePropsType<RouteType>;
export type RouteType = typeof Route;
