import { z } from 'zod';

import { zodNullableUUID } from '@/lib/utils/zod.utils';

/**
 * Type exports for navigation schemas
 */
export type AdjacentBobbleheadSchema = z.infer<typeof adjacentBobbleheadSchema>;
export type BobbleheadNavigationDataSchema = z.infer<typeof bobbleheadNavigationDataSchema>;
export type GetBobbleheadNavigation = z.infer<typeof getBobbleheadNavigationSchema>;
export type NavigationContextSchema = z.infer<typeof navigationContextSchema>;

/**
 * Schema for an adjacent bobblehead in navigation context
 * Contains minimal data needed for rendering navigation links
 */
export const adjacentBobbleheadSchema = z.object({
  /** Unique identifier for the bobblehead */
  id: z.uuid({ message: 'Bobblehead ID must be a valid UUID' }),
  /** Display name of the bobblehead */
  name: z.string().min(1, { message: 'Name is required' }),
  /** Optional primary photo URL for preview */
  photoUrl: z.url().nullable(),
  /** URL-friendly slug for navigation */
  slug: z.string().min(1, { message: 'Slug is required' }),
});

/**
 * Schema for nullable adjacent bobblehead (used when no adjacent bobblehead exists)
 */
export const nullableAdjacentBobbleheadSchema = adjacentBobbleheadSchema.nullable();

/**
 * Schema for navigation context (collection or subcollection info)
 * Contains information about the collection/subcollection that bounds navigation
 */
export const navigationContextSchema = z.object({
  /** Unique identifier for the collection or subcollection */
  contextId: z.uuid({ message: 'Context ID must be a valid UUID' }),
  /** Display name of the collection or subcollection */
  contextName: z.string().min(1, { message: 'Context name is required' }),
  /** URL-friendly slug for the context */
  contextSlug: z.string().min(1, { message: 'Context slug is required' }),
  /** Whether this is a collection or subcollection */
  contextType: z.enum(['collection', 'subcollection'], {
    message: 'Context type must be either collection or subcollection',
  }),
  /** Parent collection slug (only present for subcollections) */
  parentCollectionSlug: z.string().min(1).optional(),
});

/**
 * Schema for nullable navigation context (used when no context exists)
 */
export const nullableNavigationContextSchema = navigationContextSchema.nullable();

/**
 * Schema for complete bobblehead navigation data
 * Contains references to both adjacent bobbleheads within a collection context
 * and position information for "X of Y" display
 */
export const bobbleheadNavigationDataSchema = z.object({
  /** Optional context information about the collection/subcollection being navigated */
  context: nullableNavigationContextSchema,
  /**
   * 1-indexed ordinal position of the current bobblehead within the filtered context.
   * Position 1 is the most recently created bobblehead (newest by createdAt).
   * Position increases as bobbleheads get older.
   */
  currentPosition: z
    .number({ message: 'Current position is required' })
    .int({ message: 'Current position must be a whole number' })
    .positive({ message: 'Current position must be at least 1' }),
  /** The next bobblehead in the collection (older by createdAt) */
  nextBobblehead: nullableAdjacentBobbleheadSchema,
  /** The previous bobblehead in the collection (newer by createdAt) */
  previousBobblehead: nullableAdjacentBobbleheadSchema,
  /**
   * Total count of bobbleheads in the filtered context.
   * When subcollectionId is provided, this is the count within that subcollection.
   * Otherwise, this is the count within the entire collection.
   */
  totalCount: z
    .number({ message: 'Total count is required' })
    .int({ message: 'Total count must be a whole number' })
    .nonnegative({ message: 'Total count cannot be negative' }),
});

/**
 * Schema for fetching bobblehead navigation data
 * Validates input parameters for the navigation facade/action
 */
export const getBobbleheadNavigationSchema = z.object({
  /** The ID of the current bobblehead */
  bobbleheadId: z.uuid({ message: 'Bobblehead ID is required' }),
  /** The ID of the collection containing the bobblehead */
  collectionId: z.uuid({ message: 'Collection ID is required' }),
  /** Optional subcollection ID for filtered navigation */
  subcollectionId: zodNullableUUID('Subcollection ID'),
});
