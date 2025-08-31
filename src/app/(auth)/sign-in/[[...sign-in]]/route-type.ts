import { type DynamicRoute } from 'next-typesafe-url';
import { z } from 'zod';

export const Route = {
  routeParams: z.object({
    'sign-in': z.string().nullish(),
  }),
} satisfies DynamicRoute;

export type RouteType = typeof Route;
