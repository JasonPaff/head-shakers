import { BaseService } from '@/lib/services/base/base-service';

/**
 * dashboard data for a collection
 */
export interface CollectionDashboardData {
  description: null | string;
  id: string;
  isPublic: boolean;
  metrics: CollectionMetrics;
  name: string;
  subCollections: Array<{
    bobbleheadCount: number;
    id: string;
    name: string;
  }>;
}

/**
 * business metrics computed from collection data
 */
export interface CollectionMetrics {
  /** number of direct bobbleheads (not in subcollections) */
  directBobbleheads: number;
  /** number of featured bobbleheads */
  featuredBobbleheads: number;
  /** whether the collection has subcollections */
  hasSubcollections: boolean;
  /** last updated timestamp (collection or any subcollection) */
  lastUpdated: Date;
  /** number of bobbleheads in subcollections */
  subcollectionBobbleheads: number;
  /** total number of bobbleheads across the collection and subcollections */
  totalBobbleheads: number;
}

/**
 * collection with related data for business operations
 */
export interface CollectionWithRelations {
  bobbleheads: Array<{
    id: string;
    isFeatured: boolean;
    subcollectionId: null | string;
    updatedAt: Date;
  }>;
  createdAt: Date;
  description: null | string;
  id: string;
  isPublic: boolean;
  name: string;
  subCollections: Array<{
    bobbleheads: Array<{
      id: string;
      isFeatured: boolean;
      updatedAt: Date;
    }>;
    id: string;
    name: string;
    updatedAt: Date;
  }>;
  updatedAt: Date;
  userId: string;
}

/**
 * collection domain service
 * handles business logic and computed metrics for collections
 */
export class CollectionsService extends BaseService {
  /**
   * check if a user can view a collection (public or owned)
   */
  static canUserViewCollection(
    collection: { isPublic: boolean; userId: string },
    currentUserId?: string,
  ): boolean {
    return collection.isPublic || Boolean(currentUserId && collection.userId === currentUserId);
  }

  /**
   * compute business metrics for a collection
   */
  static computeMetrics(collection: CollectionWithRelations): CollectionMetrics {
    // count direct bobbleheads (not in subcollections)
    const directBobbleheads = collection.bobbleheads.filter(
      (bobblehead) => bobblehead.subcollectionId === null,
    );

    // count bobbleheads in subcollections
    const subcollectionBobbleheads = collection.subCollections.reduce(
      (sum, subCollection) => sum + subCollection.bobbleheads.length,
      0,
    );

    // count featured bobbleheads across collection and subcollections
    const directFeatured = directBobbleheads.filter((b) => b.isFeatured).length;
    const subcollectionFeatured = collection.subCollections.reduce(
      (sum, sub) => sum + sub.bobbleheads.filter((b) => b.isFeatured).length,
      0,
    );

    // find the most recent update across a collection and subcollections
    const lastUpdated = [collection.updatedAt, ...collection.subCollections.map((sc) => sc.updatedAt)].reduce(
      (latest, date) => (date > latest ? date : latest),
      collection.updatedAt,
    );

    return {
      directBobbleheads: directBobbleheads.length,
      featuredBobbleheads: directFeatured + subcollectionFeatured,
      hasSubcollections: collection.subCollections.length > 0,
      lastUpdated,
      subcollectionBobbleheads,
      totalBobbleheads: directBobbleheads.length + subcollectionBobbleheads,
    };
  }

  /**
   * transform collection data for the dashboard display
   */
  static transformForDashboard(collection: CollectionWithRelations): CollectionDashboardData {
    const metrics = this.computeMetrics(collection);

    return {
      description: collection.description,
      id: collection.id,
      isPublic: collection.isPublic,
      metrics,
      name: collection.name,
      subCollections: collection.subCollections.map((sub) => ({
        bobbleheadCount: sub.bobbleheads.length,
        id: sub.id,
        name: sub.name,
      })),
    };
  }

  /**
   * business logic for creating a collection
   */
  static validateCollectionCreation(
    data: {
      description?: null | string;
      name: string;
    },
    userId: string,
  ): void {
    this.validateUserId(userId, 'create collection');
    this.validateCollectionName(data.name);
    this.validateCollectionDescription(data.description);
  }

  /**
   * validate collection description
   */
  static validateCollectionDescription(description?: null | string): void {
    if (description && description.length > 500) {
      throw new Error('Collection description must be 500 characters or less');
    }
  }

  /**
   * validate collection name
   */
  static validateCollectionName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Collection name is required');
    }

    if (name.trim().length > 100) {
      throw new Error('Collection name must be 100 characters or less');
    }
  }

  /**
   * validate collection ownership
   */
  static validateCollectionOwnership(collection: { userId: string }, currentUserId: string): void {
    this.validateOwnership(collection.userId, currentUserId, 'access this collection');
  }

  /**
   * business logic for updating a collection
   */
  static validateCollectionUpdate(
    data: {
      description?: null | string;
      name?: string;
    },
    currentCollection: { userId: string },
    userId: string,
  ): void {
    this.validateUserId(userId, 'update collection');
    this.validateCollectionOwnership(currentCollection, userId);

    if (data.name !== undefined) {
      this.validateCollectionName(data.name);
    }

    if (data.description !== undefined) {
      this.validateCollectionDescription(data.description);
    }
  }
}
