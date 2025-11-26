/**
 * Type definitions for bobblehead navigation within collections
 *
 * These types define the structure for navigating between bobbleheads
 * within a collection context.
 */

/**
 * Minimal bobblehead data needed for navigation display
 * Includes only the essential fields for rendering navigation links
 */
export type AdjacentBobblehead = {
  /** Unique identifier for the bobblehead */
  id: string;
  /** Display name of the bobblehead */
  name: string;
  /** Optional primary photo URL for preview */
  photoUrl: null | string;
  /** URL-friendly slug for navigation */
  slug: string;
};

/**
 * Complete navigation context for a bobblehead within a collection
 * Contains references to both adjacent bobbleheads (if they exist)
 * and position information for "X of Y" display
 */
export type BobbleheadNavigationData = {
  /** Optional context information about the collection being navigated */
  context: NavigationContext | null;
  /**
   * 1-indexed ordinal position of the current bobblehead within the collection.
   * Position 1 is the most recently created bobblehead (newest by createdAt).
   * Position increases as bobbleheads get older.
   */
  currentPosition: number;
  /** The next bobblehead in the collection (older by createdAt) */
  nextBobblehead: AdjacentBobblehead | null;
  /** The previous bobblehead in the collection (newer by createdAt) */
  previousBobblehead: AdjacentBobblehead | null;
  /**
   * Total count of bobbleheads in the collection.
   */
  totalCount: number;
};

/**
 * Input parameters for fetching bobblehead navigation data
 */
export type GetBobbleheadNavigationInput = {
  /** The ID of the current bobblehead */
  bobbleheadId: string;
  /** The ID of the collection containing the bobblehead */
  collectionId: string;
};

/**
 * Context information for the collection
 * that bounds the navigation scope
 */
export type NavigationContext = {
  /** Unique identifier for the collection */
  contextId: string;
  /** Display name of the collection */
  contextName: string;
  /** URL-friendly slug for the context */
  contextSlug: string;
  /** Type is always collection */
  contextType: 'collection';
};
