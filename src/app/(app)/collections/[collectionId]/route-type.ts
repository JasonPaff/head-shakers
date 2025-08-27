import type { DynamicRoute, InferPagePropsType } from 'next-typesafe-url';

import { z } from 'zod';

export const Route = {
  routeParams: z.object({
    collectionId: z.string().min(1, { message: 'CollectionId is required' }),
  }),
} satisfies DynamicRoute;

export type PageProps = InferPagePropsType<RouteType>;
export type RouteType = typeof Route;
