import type { DynamicRoute, InferPagePropsType } from 'next-typesafe-url';

import { z } from 'zod';

const searchParamsSchema = z.object({
  search: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'name_asc', 'name_desc']).optional(),
});

export type SubcollectionSearchParams = z.infer<typeof searchParamsSchema>;

export const Route = {
  routeParams: z.object({
    collectionId: z.uuid('CollectionId is required'),
    subcollectionId: z.uuid('SubcollectionId is required'),
  }),
  searchParams: searchParamsSchema,
} satisfies DynamicRoute;

export type PageProps = InferPagePropsType<RouteType>;
export type RouteType = typeof Route;
