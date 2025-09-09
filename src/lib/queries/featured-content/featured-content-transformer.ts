/**
 * Featured Content Service
 * Handles business logic and data transformation for featured content
 */

export interface FeaturedContentRecord {
  comments?: number;
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
  likes?: number;
  // joined content data
  owner?: null | string;
  ownerDisplayName?: null | string;
  priority: number;
  startDate: Date | null;
  title: null | string;
  updatedAt: Date;
  viewCount: number;
}

export interface RawFeaturedContentData {
  bobbleheadLikes: null | number;
  bobbleheadOwner: null | string;
  collectionOwner: null | string;
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
  userDisplayName: null | string;
  userId: null | string;
  viewCount: number;
}

export class FeaturedContentService {
  /**
   * Filter featured content by type with business rules
   */
  static filterByType(
    content: Array<FeaturedContentRecord>,
    type: 'collection_of_week' | 'editor_pick' | 'homepage_banner' | 'trending',
    limit?: number,
  ): Array<FeaturedContentRecord> {
    let filtered = content.filter((item) => item.featureType === type);
    
    // Apply type-specific sorting
    if (type === 'trending') {
      filtered = filtered.sort((a, b) => b.viewCount - a.viewCount);
    }
    
    // Apply limits based on type
    if (limit !== undefined) {
      filtered = filtered.slice(0, limit);
    } else {
      // Default limits per type
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
   * Transform raw featured content data with business logic
   */
  static transformFeaturedContent(rawData: Array<RawFeaturedContentData>): Array<FeaturedContentRecord> {
    return rawData.map((row) => ({
      comments: 0, // TODO: implement comments count
      contentId: row.contentId,
      contentType: row.contentType,
      createdAt: row.createdAt,
      curatorNotes: row.curatorNotes,
      description: row.description,
      endDate: row.endDate,
      featureType: row.featureType,
      id: row.id,
      imageUrl: row.imageUrl,
      isActive: row.isActive,
      likes: row.bobbleheadLikes || 0,
      owner: this.determineContentOwner(row),
      ownerDisplayName: row.userDisplayName,
      priority: row.priority,
      startDate: row.startDate,
      title: row.title,
      updatedAt: row.updatedAt,
      viewCount: row.viewCount,
    }));
  }

  /**
   * Business logic for determining the owner of featured content
   */
  private static determineContentOwner(row: RawFeaturedContentData): null | string {
    // Priority: bobblehead owner > collection owner > user
    return row.bobbleheadOwner || row.collectionOwner || row.userId;
  }
}