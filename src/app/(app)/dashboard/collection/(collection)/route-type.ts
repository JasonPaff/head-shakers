import type { DynamicRoute, InferPagePropsType } from 'next-typesafe-url';

import { z } from 'zod';

export const Route = {
  searchParams: z.object({
    tab: z.enum(['collections', 'subcollections', 'bobbleheads']).optional(),
  }),
} satisfies DynamicRoute;

export type PageProps = InferPagePropsType<RouteType>;
export type RouteType = typeof Route;