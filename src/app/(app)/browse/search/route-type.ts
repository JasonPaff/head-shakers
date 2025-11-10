import type { DynamicRoute, InferPagePropsType } from 'next-typesafe-url';

import { z } from 'zod';

import { ENUMS } from '@/lib/constants';

export const Route = {
  searchParams: z.object({
    entityTypes: z
      .array(z.enum(['collection', 'subcollection', 'bobblehead']))
      .optional()
      .default(['collection', 'subcollection', 'bobblehead']),
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().positive().optional(),
    q: z.string().optional().default(''),
    sortBy: z
      .enum([...ENUMS.SEARCH.SORT_BY] as [string, ...Array<string>])
      .optional()
      .default('relevance'),
    sortOrder: z
      .enum([...ENUMS.SEARCH.SORT_ORDER] as [string, ...Array<string>])
      .optional()
      .default('desc'),
    tagIds: z.array(z.string()).optional().default([]),
  }),
} satisfies DynamicRoute;

export type PageProps = InferPagePropsType<RouteType>;
export type RouteType = typeof Route;
