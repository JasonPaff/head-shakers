/**
 * featured Content Service
 * handles business logic and data transformation for featured content
 */

export interface FeaturedContentData {
  /** Parent collection slug for bobbleheads (used in URL routing) */
  collectionSlug?: null | string;
  comments?: number;
  contentId: string;
  /** the name of the content (bobblehead name, collection name, etc.) */
  contentName?: null | string;
  contentSlug?: null | string;
  contentType: 'bobblehead' | 'collection' | 'user';
  createdAt: Date;
  curatorNotes: null | string;
  description: null | string;
  endDate: Date | null;
  featureType: 'collection_of_week' | 'editor_pick' | 'homepage_banner' | 'trending';
  id: string;
  imageUrl: null | string;
  isActive: boolean;
  likes?: number;
  // joined content data
  owner?: null | string;
  ownerDisplayName?: null | string;
  /** Owner username for URL routing */
  ownerUsername?: null | string;
  priority: number;
  startDate: Date | null;
  title: null | string;
  updatedAt: Date;
  viewCount: number;
}

export interface RawFeaturedContentData {
  bobbleheadCollectionSlug: null | string;
  bobbleheadLikes: null | number;
  bobbleheadName: null | string;
  bobbleheadOwner: null | string;
  bobbleheadOwnerUsername: null | string;
  bobbleheadPrimaryPhotoUrl: null | string;
  bobbleheadSlug: null | string;
  collectionCoverImageUrl: null | string;
  collectionOwner: null | string;
  collectionOwnerUsername: null | string;
  collectionSlug: null | string;
  contentId: string;
  contentType: 'bobblehead' | 'collection' | 'user';
  createdAt: Date;
  curatorNotes: null | string;
  description: null | string;
  endDate: Date | null;
  featureType: 'collection_of_week' | 'editor_pick' | 'homepage_banner' | 'trending';
  id: string;
  imageUrl: null | string;
  isActive: boolean;
  priority: number;
  startDate: Date | null;
  title: null | string;
  updatedAt: Date;
  userId: null | string;
  userUsername: null | string;
  viewCount: number;
}

export class FeaturedContentTransformer {
  /**
   * filter featured content by type with business rules
   */
  static filterByType(
    content: Array<FeaturedContentData>,
    type: 'collection_of_week' | 'editor_pick' | 'homepage_banner' | 'trending',
    limit?: number,
  ): Array<FeaturedContentData> {
    let filtered = content.filter((item) => item.featureType === type);

    // apply type-specific sorting
    if (type === 'trending') {
      filtered = filtered.sort((a, b) => b.viewCount - a.viewCount);
    }

    // apply limits based on type
    if (limit !== undefined) {
      filtered = filtered.slice(0, limit);
    } else {
      // default limits per type
      switch (type) {
        case 'collection_of_week':
          filtered = filtered.slice(0, 1);
          break;
        case 'editor_pick':
          filtered = filtered.slice(0, 6);
          break;
        case 'homepage_banner':
          filtered = filtered.slice(0, 3);
          break;
        case 'trending':
          filtered = filtered.slice(0, 8);
          break;
      }
    }

    return filtered;
  }

  /**
   * transform the raw, featured content data with business logic
   */
  static transformFeaturedContent(rawData: Array<RawFeaturedContentData>): Array<FeaturedContentData> {
    return rawData.map((row) => ({
      collectionSlug: this.determineCollectionSlug(row),
      comments: 0, // TODO: implement comments count
      contentId: row.contentId,
      contentName: this.determineContentName(row),
      contentSlug: this.determineContentSlug(row),
      contentType: row.contentType,
      createdAt: row.createdAt,
      curatorNotes: row.curatorNotes,
      description: row.description,
      endDate: row.endDate,
      featureType: row.featureType,
      id: row.id,
      imageUrl: this.determineImageUrl(row),
      isActive: row.isActive,
      likes: row.bobbleheadLikes || 0,
      owner: this.determineContentOwner(row),
      ownerDisplayName: this.determineOwnerDisplayName(row),
      ownerUsername: this.determineOwnerUsername(row),
      priority: row.priority,
      startDate: row.startDate,
      title: row.title,
      updatedAt: row.updatedAt,
      viewCount: row.viewCount,
    }));
  }

  /**
   * business logic for determining the collection slug for URL routing
   * For bobbleheads, this returns the parent collection's slug
   * For collections, this returns null (collection slug is in contentSlug)
   */
  private static determineCollectionSlug(row: RawFeaturedContentData): null | string {
    if (row.contentType === 'bobblehead') {
      return row.bobbleheadCollectionSlug;
    }
    return null;
  }

  /**
   * business logic for determining the name of featured content
   */
  private static determineContentName(row: RawFeaturedContentData): null | string {
    // return the appropriate name based on content type
    if (row.contentType === 'bobblehead') {
      return row.bobbleheadName;
    }
    if (row.contentType === 'user') {
      return row.userUsername;
    }
    // for collections, we don't have the name joined yet - could be added if needed
    return null;
  }

  /**
   * business logic for determining the owner of featured content
   */
  private static determineContentOwner(row: RawFeaturedContentData): null | string {
    // priority: bobblehead owner > collection owner > user
    return row.bobbleheadOwner || row.collectionOwner || row.userId;
  }

  /**
   * business logic for determining the content slug
   */
  private static determineContentSlug(row: RawFeaturedContentData): null | string {
    // return the appropriate slug based on content type
    return row.bobbleheadSlug || row.collectionSlug || null;
  }

  /**
   * business logic for determining the image URL of featured content
   * priority: explicit imageUrl > bobblehead primary photo > collection cover image
   */
  private static determineImageUrl(row: RawFeaturedContentData): null | string {
    // first check if there's an explicit image URL set on the featured content
    if (row.imageUrl) {
      return row.imageUrl;
    }

    // for bobbleheads, use the primary photo
    if (row.contentType === 'bobblehead' && row.bobbleheadPrimaryPhotoUrl) {
      return row.bobbleheadPrimaryPhotoUrl;
    }

    // for collections, use the cover image
    if (row.contentType === 'collection' && row.collectionCoverImageUrl) {
      return row.collectionCoverImageUrl;
    }

    return null;
  }

  /**
   * business logic for determining the owner display name based on content type
   */
  private static determineOwnerDisplayName(row: RawFeaturedContentData): null | string {
    // return the appropriate owner username based on content type
    if (row.contentType === 'bobblehead') {
      return row.bobbleheadOwnerUsername;
    }
    if (row.contentType === 'collection') {
      return row.collectionOwnerUsername;
    }
    // for featured users, userUsername is the user's own username
    return row.userUsername;
  }

  /**
   * business logic for determining the owner username for URL routing
   */
  private static determineOwnerUsername(row: RawFeaturedContentData): null | string {
    if (row.contentType === 'bobblehead') {
      return row.bobbleheadOwnerUsername;
    }
    if (row.contentType === 'collection') {
      return row.collectionOwnerUsername;
    }
    return row.userUsername;
  }
}
