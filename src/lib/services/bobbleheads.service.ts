import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertBobblehead, InsertBobbleheadPhoto } from '@/lib/validations/bobbleheads.validation';

import { db } from '@/lib/db';
import { createBobbleheadAsync, createBobbleheadPhotoAsync } from '@/lib/queries/bobbleheads.queries';
import { BaseService } from '@/lib/services/base/base-service';

/**
 * bobblehead with computed metrics and status
 */
export interface BobbleheadMetrics {
  /** estimated current value based on condition and market factors */
  estimatedValue?: number;
  /** whether bobblehead has required photos */
  hasPhotos: boolean;
  /** whether bobblehead has all required metadata */
  isComplete: boolean;
  /** last updated timestamp */
  lastUpdated: Date;
  /** number of photos */
  photoCount: number;
  /** number of tags */
  tagCount: number;
}

/**
 * bobblehead with related data for business operations
 */
export interface BobbleheadWithRelations {
  acquisitionDate: Date | null;
  acquisitionMethod: null | string;
  bobbleheadId?: string;
  category: null | string;
  characterName: null | string;
  collectionId: string;
  collectionName: null | string;
  createdAt: Date;
  currentCondition: null | string;
  description: null | string;
  height: null | number;
  id: string;
  isFeatured: boolean;
  isPublic: boolean;
  manufacturer: null | string;
  name: null | string;
  photos: Array<{
    bobbleheadId: string;
    createdAt: Date;
    height: null | number;
    id: string;
    isPrimary: boolean;
    publicId: string;
    sortOrder: number;
    updatedAt: Date;
    uploadedAt: Date;
    url: string;
    width: null | number;
  }>;
  purchaseLocation: null | string;
  purchasePrice: null | number;
  series: null | string;
  status: null | string;
  subcollectionId: null | string;
  subcollectionName: null | string;
  tags: Array<{
    color: null | string;
    createdAt: Date;
    id: string;
    name: string;
    updatedAt: Date;
    userId: null | string;
  }>;
  updatedAt: Date;
  userId: string;
  weight: null | number;
  year: null | number;
}

/**
 * bobblehead domain service
 * handles business logic and validation for bobbleheads
 */
export class BobbleheadsService extends BaseService {
  // Legacy methods for backward compatibility
  static async addPhotoAsync(data: InsertBobbleheadPhoto, dbInstance: DatabaseExecutor = db) {
    const result = await createBobbleheadPhotoAsync(data, dbInstance);
    return result?.[0] || null;
  }

  /**
   * check if a user can view a bobblehead (public or owned)
   */
  static canUserViewBobblehead(
    bobblehead: { isPublic: boolean; userId: string },
    currentUserId?: string,
  ): boolean {
    return bobblehead.isPublic || Boolean(currentUserId && bobblehead.userId === currentUserId);
  }

  /**
   * compute business metrics for a bobblehead
   */
  static computeMetrics(bobblehead: BobbleheadWithRelations): BobbleheadMetrics {
    const photoCount = bobblehead.photos?.length || 0;
    const tagCount = bobblehead.tags?.length || 0;

    // Determine if bobblehead has all required metadata
    const requiredFields = [
      bobblehead.name,
      bobblehead.characterName,
      bobblehead.manufacturer,
      bobblehead.currentCondition,
    ];
    const isComplete = requiredFields.every((field) => Boolean(field)) && photoCount > 0;

    // Simple estimated value calculation based on condition and purchase price
    let estimatedValue: number | undefined;
    if (bobblehead.purchasePrice && bobblehead.currentCondition) {
      const conditionMultiplier = this.getConditionMultiplier(bobblehead.currentCondition);
      estimatedValue = Math.round(bobblehead.purchasePrice * conditionMultiplier);
    }

    return {
      estimatedValue,
      hasPhotos: photoCount > 0,
      isComplete,
      lastUpdated: bobblehead.updatedAt,
      photoCount,
      tagCount,
    };
  }

  static async createAsync(data: InsertBobblehead, userId: string, dbInstance: DatabaseExecutor = db) {
    const result = await createBobbleheadAsync(data, userId, dbInstance);
    return result?.[0] || null;
  }

  /**
   * validate bobblehead creation data
   */
  static validateBobbleheadCreation(
    data: {
      collectionId: string;
      name?: null | string;
      subcollectionId?: null | string;
    },
    userId: string,
  ): void {
    this.validateUserId(userId, 'create bobblehead');
    this.validateBobbleheadName(data.name);
    this.validateCollectionId(data.collectionId);
  }

  /**
   * validate bobblehead name
   */
  static validateBobbleheadName(name?: null | string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Bobblehead name is required');
    }

    if (name.trim().length > 200) {
      throw new Error('Bobblehead name must be 200 characters or less');
    }
  }

  /**
   * validate bobblehead ownership
   */
  static validateBobbleheadOwnership(bobblehead: { userId: string }, currentUserId: string): void {
    this.validateOwnership(bobblehead.userId, currentUserId, 'access this bobblehead');
  }

  /**
   * validate bobblehead update data
   */
  static validateBobbleheadUpdate(
    data: {
      [key: string]: unknown;
      name?: null | string;
    },
    currentBobblehead: { userId: string },
    userId: string,
  ): void {
    this.validateUserId(userId, 'update bobblehead');
    this.validateBobbleheadOwnership(currentBobblehead, userId);

    if (data.name !== undefined) {
      this.validateBobbleheadName(data.name);
    }
  }

  /**
   * get condition multiplier for value estimation
   */
  private static getConditionMultiplier(condition: string): number {
    const conditionMap: Record<string, number> = {
      'Excellent': 1.0,
      'Fair': 0.6,
      'Good': 0.8,
      'Mint': 1.2,
      'Near Mint': 1.1,
      'Poor': 0.4,
    };

    return conditionMap[condition] || 1.0;
  }

  /**
   * validate collection ID is provided
   */
  private static validateCollectionId(collectionId?: string): void {
    if (!collectionId || collectionId.trim().length === 0) {
      throw new Error('Collection ID is required');
    }
  }
}
