import type { TagRecord } from '@/lib/queries/tags/tags-query';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertTag, UpdateTag } from '@/lib/validations/tags.validation';

import { CONFIG, OPERATIONS } from '@/lib/constants';
import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { TagsQuery } from '@/lib/queries/tags/tags-query';
import { createFacadeError } from '@/lib/utils/error-builders';

/**
 * tag suggestion for autocomplete
 */
export interface TagSuggestion {
  color: string;
  id: string;
  isSystem: boolean;
  name: string;
  usageCount: number;
}

/**
 * business logic for tag operations
 */
export interface TagValidationResult {
  canCreate: boolean;
  errors: Array<string>;
  warnings: Array<string>;
}

/**
 * user tag statistics
 */
export interface UserTagStats {
  averageUsagePerTag: number;
  leastUsedTags: Array<TagRecord>;
  mostUsedTags: Array<TagRecord>;
  recentActivity: Array<{
    lastUsed: Date | null;
    tagId: string;
    tagName: string;
  }>;
  totalCustomTags: number;
}

/**
 * handles all business logic and orchestration for tags
 */
export class TagsFacade {
  static async attachToBobblehead(
    bobbleheadId: string,
    tagIds: Array<string>,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<boolean> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      // validate tags first
      const validation = await TagsFacade.validateTagsForBobblehead(bobbleheadId, tagIds, userId, dbInstance);
      if (!validation.canCreate) {
        console.warn('Tag validation failed:', validation.errors);
        return false;
      }

      // attach tags using the query
      return TagsQuery.attachToBobbleheadAsync(bobbleheadId, tagIds, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId, tagIds, userId },
        facade: 'TagsFacade',
        method: 'attachToBobblehead',
        operation: OPERATIONS.TAGS.ATTACH_TO_BOBBLEHEAD,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async bulkDelete(
    tagIds: Array<string>,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<{
    deletedCount: number;
    errors: Array<string>;
    skippedCount: number;
  }> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      const errors: Array<string> = [];
      let deletedCount = 0;
      let skippedCount = 0;

      for (const tagId of tagIds) {
        // verify ownership
        const tag = await TagsQuery.findByIdAsync(tagId, userId, context);
        if (!tag) {
          errors.push(`Tag ${tagId} not found.`);
          skippedCount++;
          continue;
        }

        if (tag.userId !== userId) {
          errors.push(`Cannot delete system tag "${tag.name}".`);
          skippedCount++;
          continue;
        }

        // check if the tag is in use
        const isInUse = await TagsQuery.isTagInUseAsync(tagId, context);
        if (isInUse) {
          errors.push(`Cannot delete tag "${tag.name}" - it is currently in use.`);
          skippedCount++;
          continue;
        }

        // delete the tag
        const deleted = await TagsQuery.deleteAsync(tagId, userId, context);
        if (deleted) {
          deletedCount++;
        } else {
          errors.push(`Failed to delete tag "${tag.name}".`);
          skippedCount++;
        }
      }

      return {
        deletedCount,
        errors,
        skippedCount,
      };
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { tagIds, userId },
        facade: 'TagsFacade',
        method: 'bulkDelete',
        operation: OPERATIONS.TAGS.BULK_DELETE,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async createTag(
    data: InsertTag,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | TagRecord> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      // check if the user has reached the limit
      const userTagCount = await TagsQuery.countUserTagsAsync(userId, context);
      if (userTagCount >= CONFIG.CONTENT.MAX_CUSTOM_TAGS_PER_USER) {
        return null;
      }

      // check if the tag name already exists
      const existing = await TagsQuery.findByNameAsync(data.name, userId, context);
      if (existing) {
        return null;
      }

      return TagsQuery.createAsync(data, userId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data,
        facade: 'TagsFacade',
        method: 'createTag',
        operation: OPERATIONS.TAGS.CREATE,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async deleteTag(tagId: string, userId: string, dbInstance?: DatabaseExecutor): Promise<boolean> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });
      const deleted = await TagsQuery.deleteAsync(tagId, userId, context);
      return Boolean(deleted);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { tagId },
        facade: 'TagsFacade',
        method: 'deleteTag',
        operation: OPERATIONS.TAGS.DELETE,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async detachFromBobblehead(
    bobbleheadId: string,
    tagIds: Array<string>,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<boolean> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });
      return TagsQuery.detachFromBobbleheadAsync(bobbleheadId, tagIds, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId, tagIds, userId },
        facade: 'TagsFacade',
        method: 'detachFromBobblehead',
        operation: OPERATIONS.TAGS.DETACH_FROM_BOBBLEHEAD,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getOrCreateByName(
    name: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | TagRecord> {
    return TagsFacade.getOrCreateTag(name, '#3B82F6', userId, dbInstance);
  }

  static async getOrCreateTag(
    name: string,
    color: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | TagRecord> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      // normalize tag name
      const normalizedName = name.trim();
      if (normalizedName.length < 2) {
        return null;
      }

      // check if the tag already exists in the user's namespace or as a system tag
      const existingTag = await TagsQuery.findByNameAsync(normalizedName, userId, context);
      if (existingTag) {
        return existingTag;
      }

      // verify the user hasn't exceeded the custom tag limit
      const userTagCount = await TagsQuery.countUserTagsAsync(userId, context);
      if (userTagCount >= CONFIG.CONTENT.MAX_CUSTOM_TAGS_PER_USER) {
        return null;
      }

      // create new tag
      const tagData: InsertTag = {
        color: color || '#3B82F6',
        name: normalizedName,
        usageCount: 0,
      };

      return TagsQuery.createAsync(tagData, userId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { color, name, userId },
        facade: 'TagsFacade',
        method: 'getOrCreateTag',
        operation: OPERATIONS.TAGS.GET_OR_CREATE,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getSuggestionsForUser(query: string, userId: null | string): Promise<Array<TagSuggestion>> {
    try {
      const context = userId ? createUserQueryContext(userId) : createPublicQueryContext();
      const tags = await TagsQuery.searchAsync(query, userId, 10, context);

      return tags.map((tag) => ({
        color: tag.color,
        id: tag.id,
        isSystem: tag.userId === null,
        name: tag.name,
        usageCount: tag.usageCount,
      }));
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { query, userId },
        facade: 'TagsFacade',
        method: 'getSuggestionsForUser',
        operation: OPERATIONS.TAGS.SEARCH,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getUserTagStats(userId: string, dbInstance?: DatabaseExecutor): Promise<UserTagStats> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      // get all user's custom tags
      const userTags = await TagsQuery.findAllAsync(userId, context);
      const customTags = userTags.filter((tag) => tag.userId === userId);

      // calculate statistics
      const totalUsage = customTags.reduce((sum, tag) => sum + tag.usageCount, 0);
      const averageUsagePerTag = customTags.length > 0 ? totalUsage / customTags.length : 0;

      // sort by usage for most/least used
      const sortedByUsage = [...customTags].sort((a, b) => b.usageCount - a.usageCount);
      const mostUsedTags = sortedByUsage.slice(0, 5);
      const leastUsedTags = sortedByUsage.slice(-5).reverse();

      // get recent activity (placeholder - would need junction table data)
      const recentActivity = customTags.slice(0, 10).map((tag) => ({
        lastUsed: null as Date | null, // TODO: implement with real last used data
        tagId: tag.id,
        tagName: tag.name,
      }));

      return {
        averageUsagePerTag: Math.round(averageUsagePerTag * 100) / 100,
        leastUsedTags,
        mostUsedTags,
        recentActivity,
        totalCustomTags: customTags.length,
      };
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { userId },
        facade: 'TagsFacade',
        method: 'getUserTagStats',
        operation: OPERATIONS.TAGS.GET_STATS,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async mergeTags(
    sourceTagId: string,
    targetTagId: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<boolean> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      // verify ownership of both tags
      const sourceTag = await TagsQuery.findByIdAsync(sourceTagId, userId, context);
      const targetTag = await TagsQuery.findByIdAsync(targetTagId, userId, context);

      if (!sourceTag || !targetTag) {
        return false;
      }

      if (sourceTag.userId !== userId || targetTag.userId !== userId) {
        return false; // cannot merge system tags
      }

      // TODO: Implement merge logic in a transaction
      // This would require updating all bobbleheadTags references
      // and combining usage counts, then deleting source tag

      return false; // not implemented yet
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { sourceTagId, targetTagId, userId },
        facade: 'TagsFacade',
        method: 'mergeTags',
        operation: OPERATIONS.TAGS.MERGE,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async removeAllFromBobblehead(
    bobbleheadId: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<boolean> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });
      return TagsQuery.removeAllFromBobbleheadAsync(bobbleheadId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId, userId },
        facade: 'TagsFacade',
        method: 'removeAllFromBobblehead',
        operation: OPERATIONS.TAGS.REMOVE_ALL_FROM_BOBBLEHEAD,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async updateTag(
    tagId: string,
    data: UpdateTag,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | TagRecord> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      return TagsQuery.updateAsync(tagId, data, userId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { ...data, tagId },
        facade: 'TagsFacade',
        method: 'updateTag',
        operation: OPERATIONS.TAGS.UPDATE,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async validateTagsForBobblehead(
    bobbleheadId: string,
    newTagIds: Array<string>,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<TagValidationResult> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      const errors: Array<string> = [];
      const warnings: Array<string> = [];

      // get current tags on bobblehead
      const currentTags = await TagsQuery.getByBobbleheadIdAsync(bobbleheadId, context);
      const totalTagsAfterAdd = currentTags.length + newTagIds.length;

      // check tag limit
      if (totalTagsAfterAdd > CONFIG.CONTENT.MAX_TAGS_PER_BOBBLEHEAD) {
        errors.push(
          `Cannot add tags. Maximum ${CONFIG.CONTENT.MAX_TAGS_PER_BOBBLEHEAD} tags allowed per bobblehead.`,
        );
      }

      // validate all tag IDs belong to user or are system tags
      for (const tagId of newTagIds) {
        const tag = await TagsQuery.findByIdAsync(tagId, userId, context);
        if (!tag) {
          errors.push(`Tag with ID ${tagId} not found or not accessible.`);
        } else if (tag.userId !== null && tag.userId !== userId) {
          errors.push(`Tag "${tag.name}" does not belong to you.`);
        }
      }

      // check for duplicate tags
      const currentTagIds = currentTags.map((tag) => tag.id);
      const duplicates = newTagIds.filter((tagId) => currentTagIds.includes(tagId));
      if (duplicates.length > 0) {
        warnings.push('Some tags are already attached to this bobblehead.');
      }

      return {
        canCreate: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId, newTagIds, userId },
        facade: 'TagsFacade',
        method: 'validateTagsForBobblehead',
        operation: OPERATIONS.TAGS.VALIDATE,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }
}
