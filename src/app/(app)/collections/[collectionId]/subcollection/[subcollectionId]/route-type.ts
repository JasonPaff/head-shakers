import type { DynamicRoute, InferPagePropsType } from 'next-typesafe-url';

import { z } from 'zod';

export const Route = {
  routeParams: z.object({
    collectionId: z.uuid('CollectionId is required'),
    subcollectionId: z.uuid('SubcollectionId is required'),
  }),
} satisfies DynamicRoute;

export type PageProps = InferPagePropsType<RouteType>;
export type RouteType = typeof Route;
