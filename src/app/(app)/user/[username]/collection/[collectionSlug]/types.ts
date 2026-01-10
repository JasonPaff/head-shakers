/**
 * Type definitions for Collection View Page
 *
 * These interfaces define the data shapes used by components on the collection
 * view page. Types are designed to match facade return types and enable proper
 * TypeScript inference throughout the component tree.
 *
 * @see CollectionsFacade for collection and bobblehead data fetching
 * @see UsersFacade for collector profile data
 * @see SocialFacade for like status and counts
 */

/**
 * Props for the BobbleheadCard component
 *
 * @see BobbleheadCard
 */
export interface BobbleheadCardProps {
  /** Bobblehead data to display */
  bobblehead: BobbleheadViewData;
  /** Collection slug for routing context */
  collectionSlug: string;
  /** Owner username for routing context */
  ownerUsername: string;
}

/**
 * Props for the BobbleheadGrid component
 *
 * @see BobbleheadGrid
 */
export interface BobbleheadGridProps {
  /** Array of bobbleheads to display */
  bobbleheads: Array<BobbleheadViewData>;
  /** Collection slug for routing context */
  collectionSlug: string;
  /** Owner username for routing context */
  ownerUsername: string;
}

/**
 * Bobblehead data for grid display in collection view
 *
 * Data source: CollectionsFacade.getCollectionBobbleheadsWithPhotos()
 * Extended with likeData from SocialFacade.getLikesForMultipleContentItems()
 *
 * @see CollectionsFacade.getCollectionBobbleheadsWithPhotos
 * @see SocialFacade.getLikesForMultipleContentItems
 */
export interface BobbleheadViewData {
  /** Category classification (e.g., "Sports", "Movies") */
  category: null | string;
  /** Slug of the parent collection for routing */
  collectionSlug: string;
  /** Physical condition (e.g., "Mint", "Excellent") */
  condition: null | string;
  /** Optional description of the bobblehead */
  description: null | string;
  /** Primary photo URL (Cloudinary optimized) */
  featurePhoto: null | string;
  /** Unique identifier for the bobblehead */
  id: string;
  /** Whether the current viewer has liked this bobblehead */
  isLiked: boolean;
  /** Total number of likes on this bobblehead */
  likeCount: number;
  /** Manufacturer or brand name */
  manufacturer: null | string;
  /** Display name of the bobblehead */
  name: string;
  /** Username of the bobblehead owner for routing */
  ownerUsername: string;
  /** URL-safe slug for routing */
  slug: string;
  /** Year of manufacture or release */
  year: null | number;
}

/**
 * Props for the CollectionHeader component
 *
 * @see CollectionHeader
 */
export interface CollectionHeaderProps {
  /** Collection metadata */
  collection: CollectionViewData;
  /** Collector profile */
  collector: CollectorData;
}

/**
 * Combined data structure for the collection page
 *
 * Aggregates all data needed by the collection view page components.
 * Fetched in parallel for optimal loading performance.
 */
export interface CollectionPageData {
  /** Bobbleheads in the collection with photos and like data */
  bobbleheads: Array<BobbleheadViewData>;
  /** Collection metadata and statistics */
  collection: CollectionViewData;
  /** Collector profile information */
  collector: CollectorData;
}

/**
 * Collection view data for the public collection page
 *
 * Data source: CollectionsFacade.getCollectionForPublicView()
 * Includes computed fields like lastUpdatedAt and totalBobbleheadCount
 * which are derived from collection relations.
 *
 * @see CollectionsFacade.getCollectionForPublicView
 */
export interface CollectionViewData {
  /** Unique identifier for the collection */
  collectionId: string;
  /** URL for the collection's cover image (Cloudinary optimized) */
  coverImageUrl: null | string;
  /** Timestamp when the collection was created */
  createdAt: Date;
  /** Optional description of the collection */
  description: null | string;
  /** Whether the current viewer has liked this collection */
  isLiked: boolean;
  /** Timestamp of the most recent update to the collection or its bobbleheads */
  lastUpdatedAt: Date;
  /** Total number of likes on this collection */
  likeCount: number;
  /** Display name of the collection */
  name: string;
  /** URL-safe slug for routing */
  slug: string;
  /** Total count of bobbleheads in this collection */
  totalBobbleheadCount: number;
  /** Total number of views for this collection */
  viewCount: number;
}

/**
 * Collector profile data for display in collection header
 *
 * Data source: UsersFacade.getUserByUsername() or UsersFacade.getUserByIdAsync()
 * Contains minimal user info needed for public display.
 *
 * @see UsersFacade.getUserByUsername
 * @see UsersFacade.getUserByIdAsync
 */
export interface CollectorData {
  /** URL for the collector's avatar image (Cloudinary optimized) */
  avatarUrl: null | string;
  /** Optional display name (falls back to username if null) */
  displayName: null | string;
  /** Unique user identifier */
  userId: string;
  /** Unique username for routing and display */
  username: string;
}

/**
 * Like status data returned from SocialFacade
 *
 * Data source: SocialFacade.getContentLikeData()
 * Used for both collection and bobblehead like buttons.
 *
 * @see SocialFacade.getContentLikeData
 */
export interface LikeStatusData {
  /** Whether the current user has liked this content */
  isLiked: boolean;
  /** Total like count */
  likeCount: number;
  /** ID of the like record if user has liked (null otherwise) */
  likeId: null | string;
}
