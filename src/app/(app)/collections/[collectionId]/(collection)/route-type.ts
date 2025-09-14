import type { DynamicRoute, InferPagePropsType } from 'next-typesafe-url';

import { z } from 'zod';

export const Route = {
  routeParams: z.object({
    collectionId: z.uuid('CollectionId is required'),
  }),
  searchParams: z.object({
    q: z.string().optional(),
    sort: z.enum(['newest', 'oldest', 'name_asc', 'name_desc']).optional(),
    view: z.enum(['all', 'collection']).optional(),
  }),
} satisfies DynamicRoute;

export type PageProps = InferPagePropsType<RouteType>;
export type RouteType = typeof Route;
