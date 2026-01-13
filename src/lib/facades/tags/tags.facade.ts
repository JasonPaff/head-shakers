import type { TagRecord } from '@/lib/queries/tags/tags.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertTag, UpdateTag } from '@/lib/validations/tags.validation';

import { CONFIG, OPERATIONS } from '@/lib/constants';
import { CACHE_KEYS } from '@/lib/constants/cache';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { TagsQuery } from '@/lib/queries/tags/tags.query';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CacheService } from '@/lib/services/cache.service';
import { CacheTagGenerators } from '@/lib/utils/cache-tags.utils';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';
import { captureFacadeWarning } from '@/lib/utils/sentry-server/breadcrumbs.server';

const facadeName = 'TagsFacade';

/**
 * Tag suggestion for autocomplete
 */
export interface TagSuggestion {
  color: string;
  id: string;
  isSystem: boolean;
  name: string;
  usageCount: number;
}

/**
 * Business logic validation result for tag operations
 */
export interface TagValidationResult {
  canCreate: boolean;
  errors: Array<string>;
  warnings: Array<string>;
}

/**
 * TagsFacade handles all business logic and orchestration for tags.
 * Provides methods for tag CRUD operations, bobblehead tagging, and tag suggestions.
 */
export class TagsFacade extends BaseFacade {
  /**
   * Attach tags to a bobblehead.
   *
   * Cache behavior: Invalidates bobblehead tag cache after successful attachment.
   *
   * @param bobbleheadId - ID of the bobblehead to attach tags to
   * @param tagIds - Array of tag IDs to attach
   * @param userId - User ID performing the operation
   * @param dbInstance - Optional database executor for transactions
   * @returns True if tags were attached successfully, false otherwise
   */
  static async attachToBobbleheadAsync(
    bobbleheadId: string,
    tagIds: Array<string>,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<boolean> {
    return executeFacadeOperation(
      {
        data: { bobbleheadId, tagCount: tagIds.length },
        facade: facadeName,
        method: 'attachToBobbleheadAsync',
        operation: OPERATIONS.TAGS.ATTACH_TO_BOBBLEHEAD,
        userId,
      },
      async () => {
        const context = this.getProtectedContext(userId, dbInstance);

        // Validate tags first
        const validation = await TagsFacade.validateTagsForBobbleheadAsync(
          bobbleheadId,
          tagIds,
          userId,
          dbInstance,
        );
        if (!validation.canCreate) {
          captureFacadeWarning(
            new Error(`Tag validation failed: ${validation.errors.join(', ')}`),
            facadeName,
            OPERATIONS.TAGS.ATTACH_TO_BOBBLEHEAD,
            { bobbleheadId, errors: validation.errors, tagIds },
          );
          return false;
        }

        // Attach tags using the query
        const result = await TagsQuery.attachToBobbleheadAsync(bobbleheadId, tagIds, context);

        if (result) {
          CacheRevalidationService.bobbleheads.onTagChange(bobbleheadId, userId, 'add');
        }

        return result;
      },
      {
        includeResultSummary: (result) => ({
          attached: result,
          tagCount: tagIds.length,
        }),
      },
    );
  }

  /**
   * Bulk delete multiple tags.
   *
   * Cache behavior: No caching for write operations. Search cache invalidation
   * relies on TTL expiration since there's no dedicated tags cache domain.
   *
   * @param tagIds - Array of tag IDs to delete
   * @param userId - User ID performing the operation
   * @param dbInstance - Optional database executor for transactions
   * @returns Object with deletion counts and any errors encountered
   */
  static async bulkDeleteAsync(
    tagIds: Array<string>,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<{
    deletedCount: number;
    errors: Array<string>;
    skippedCount: number;
  }> {
    return executeFacadeOperation(
      {
        data: { tagCount: tagIds.length },
        facade: facadeName,
        method: 'bulkDeleteAsync',
        operation: OPERATIONS.TAGS.BULK_DELETE,
        userId,
      },
      async () => {
        const context = this.getProtectedContext(userId, dbInstance);

        const errors: Array<string> = [];
        let deletedCount = 0;
        let skippedCount = 0;

        for (const tagId of tagIds) {
          // Verify ownership
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

          // Check if the tag is in use
          const isInUse = await TagsQuery.isTagInUseAsync(tagId, context);
          if (isInUse) {
            errors.push(`Cannot delete tag "${tag.name}" - it is currently in use.`);
            skippedCount++;
            continue;
          }

          // Delete the tag
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
      },
      {
        includeResultSummary: (result) => ({
          deletedCount: result.deletedCount,
          errorCount: result.errors.length,
          skippedCount: result.skippedCount,
        }),
      },
    );
  }

  /**
   * Create a new tag.
   *
   * Cache behavior: No caching for write operations.
   *
   * @param data - Tag data to create
   * @param userId - User ID creating the tag
   * @param dbInstance - Optional database executor for transactions
   * @returns The created tag record, or null if creation failed (limit reached or duplicate)
   */
  static async createTagAsync(
    data: InsertTag,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | TagRecord> {
    return executeFacadeOperation(
      {
        data: { name: data.name },
        facade: facadeName,
        method: 'createTagAsync',
        operation: OPERATIONS.TAGS.CREATE,
        userId,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance);

        // Check if the user has reached the limit
        const userTagCount = await TagsQuery.countUserTagsAsync(userId, context);
        if (userTagCount >= CONFIG.CONTENT.MAX_CUSTOM_TAGS_PER_USER) {
          return null;
        }

        // Check if the tag name already exists
        const existing = await TagsQuery.findByNameAsync(data.name, userId, context);
        if (existing) {
          return null;
        }

        return TagsQuery.createAsync(data, userId, context);
      },
      {
        includeResultSummary: (result) => ({
          created: result !== null,
          id: result?.id,
        }),
      },
    );
  }

  /**
   * Delete a tag.
   *
   * Cache behavior: No caching for write operations.
   *
   * @param tagId - ID of the tag to delete
   * @param userId - User ID performing the deletion
   * @param dbInstance - Optional database executor for transactions
   * @returns True if the tag was deleted successfully, false otherwise
   */
  static async deleteTagAsync(
    tagId: string,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<boolean> {
    return executeFacadeOperation(
      {
        data: { tagId },
        facade: facadeName,
        method: 'deleteTagAsync',
        operation: OPERATIONS.TAGS.DELETE,
        userId,
      },
      async () => {
        const context = this.getProtectedContext(userId, dbInstance);
        const deleted = await TagsQuery.deleteAsync(tagId, userId, context);
        return Boolean(deleted);
      },
      {
        includeResultSummary: (result) => ({
          deleted: result,
        }),
      },
    );
  }

  /**
   * Detach tags from a bobblehead.
   *
   * Cache behavior: Invalidates bobblehead tag cache after successful detachment.
   *
   * @param bobbleheadId - ID of the bobblehead to detach tags from
   * @param tagIds - Array of tag IDs to detach
   * @param userId - User ID performing the operation
   * @param dbInstance - Optional database executor for transactions
   * @returns True if tags were detached successfully, false otherwise
   */
  static async detachFromBobbleheadAsync(
    bobbleheadId: string,
    tagIds: Array<string>,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<boolean> {
    return executeFacadeOperation(
      {
        data: { bobbleheadId, tagCount: tagIds.length },
        facade: facadeName,
        method: 'detachFromBobbleheadAsync',
        operation: OPERATIONS.TAGS.DETACH_FROM_BOBBLEHEAD,
        userId,
      },
      async () => {
        const context = this.getProtectedContext(userId, dbInstance);
        const result = await TagsQuery.detachFromBobbleheadAsync(bobbleheadId, tagIds, context);

        if (result) {
          CacheRevalidationService.bobbleheads.onTagChange(bobbleheadId, userId, 'remove');
        }

        return result;
      },
      {
        includeResultSummary: (result) => ({
          detached: result,
          tagCount: tagIds.length,
        }),
      },
    );
  }

  /**
   * Get or create a tag by name with default color.
   *
   * Cache behavior: No caching for write operations.
   *
   * @param name - Tag name to find or create
   * @param userId - User ID for ownership
   * @param dbInstance - Optional database executor for transactions
   * @returns The found or created tag record, or null if creation failed
   */
  static async getOrCreateByNameAsync(
    name: string,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | TagRecord> {
    return TagsFacade.getOrCreateTagAsync(name, '#3B82F6', userId, dbInstance);
  }

  /**
   * Get or create a tag by name with specified color.
   *
   * Cache behavior: No caching for write operations.
   *
   * @param name - Tag name to find or create
   * @param color - Color for the tag if created
   * @param userId - User ID for ownership
   * @param dbInstance - Optional database executor for transactions
   * @returns The found or created tag record, or null if creation failed
   */
  static async getOrCreateTagAsync(
    name: string,
    color: string,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | TagRecord> {
    return executeFacadeOperation(
      {
        data: { color, name },
        facade: facadeName,
        method: 'getOrCreateTagAsync',
        operation: OPERATIONS.TAGS.GET_OR_CREATE,
        userId,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance);

        // Normalize tag name
        const normalizedName = name.trim();
        if (normalizedName.length < 2) {
          return null;
        }

        // Check if the tag already exists in the user's namespace or as a system tag
        const existingTag = await TagsQuery.findByNameAsync(normalizedName, userId, context);
        if (existingTag) {
          return existingTag;
        }

        // Verify the user hasn't exceeded the custom tag limit
        const userTagCount = await TagsQuery.countUserTagsAsync(userId, context);
        if (userTagCount >= CONFIG.CONTENT.MAX_CUSTOM_TAGS_PER_USER) {
          return null;
        }

        // Create new tag
        const tagData: InsertTag = {
          color: color || '#3B82F6',
          name: normalizedName,
          usageCount: 0,
        };

        return TagsQuery.createAsync(tagData, userId, context);
      },
      {
        includeResultSummary: (result) => ({
          created: result !== null && result.name === name.trim(),
          found: result !== null,
          id: result?.id,
        }),
      },
    );
  }

  /**
   * Get tag suggestions for autocomplete.
   *
   * Cache behavior: Uses CacheService.cached with search tags.
   * Invalidated by: tag creates, updates, deletes.
   *
   * @param query - Search query for tag names
   * @param userId - Optional user ID for user-specific tags
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of tag suggestions matching the query
   */
  static async getSuggestionsForUserAsync(
    query: string,
    userId: null | string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<TagSuggestion>> {
    return executeFacadeOperation(
      {
        data: { hasUserId: Boolean(userId), queryLength: query.length },
        facade: facadeName,
        method: 'getSuggestionsForUserAsync',
        operation: OPERATIONS.TAGS.SEARCH,
        userId: userId ?? undefined,
      },
      async () => {
        return CacheService.cached(
          async () => {
            const context = this.getViewerContext(userId ?? undefined, dbInstance);
            const tags = await TagsQuery.searchAsync(query, userId, 10, context);

            return tags.map((tag) => ({
              color: tag.color,
              id: tag.id,
              isSystem: tag.userId === null,
              name: tag.name,
              usageCount: tag.usageCount,
            }));
          },
          CACHE_KEYS.SEARCH.SUGGESTIONS(query, 'tags'),
          {
            context: {
              entityType: 'search',
              facade: facadeName,
              operation: 'getSuggestionsForUserAsync',
              userId: userId ?? undefined,
            },
            tags: CacheTagGenerators.search.results(query, 'tags'),
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Remove all tags from a bobblehead.
   *
   * Cache behavior: Invalidates bobblehead tag cache after successful removal.
   *
   * @param bobbleheadId - ID of the bobblehead to remove all tags from
   * @param userId - User ID performing the operation
   * @param dbInstance - Optional database executor for transactions
   * @returns True if all tags were removed successfully, false otherwise
   */
  static async removeAllFromBobbleheadAsync(
    bobbleheadId: string,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<boolean> {
    return executeFacadeOperation(
      {
        data: { bobbleheadId },
        facade: facadeName,
        method: 'removeAllFromBobbleheadAsync',
        operation: OPERATIONS.TAGS.REMOVE_ALL_FROM_BOBBLEHEAD,
        userId,
      },
      async () => {
        const context = this.getProtectedContext(userId, dbInstance);
        const result = await TagsQuery.removeAllFromBobbleheadAsync(bobbleheadId, context);

        if (result) {
          CacheRevalidationService.bobbleheads.onTagChange(bobbleheadId, userId, 'remove');
        }

        return result;
      },
      {
        includeResultSummary: (result) => ({
          removed: result,
        }),
      },
    );
  }

  /**
   * Update a tag.
   *
   * Cache behavior: No caching for write operations.
   *
   * @param tagId - ID of the tag to update
   * @param data - Update data for the tag
   * @param userId - User ID performing the update
   * @param dbInstance - Optional database executor for transactions
   * @returns The updated tag record, or null if update failed
   */
  static async updateTagAsync(
    tagId: string,
    data: UpdateTag,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | TagRecord> {
    return executeFacadeOperation(
      {
        data: { tagId },
        facade: facadeName,
        method: 'updateTagAsync',
        operation: OPERATIONS.TAGS.UPDATE,
        userId,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance);
        return TagsQuery.updateAsync(tagId, data, userId, context);
      },
      {
        includeResultSummary: (result) => ({
          id: result?.id,
          updated: result !== null,
        }),
      },
    );
  }

  /**
   * Validate tags for attachment to a bobblehead.
   *
   * Cache behavior: No caching for validation operations.
   *
   * @param bobbleheadId - ID of the bobblehead to validate tags for
   * @param newTagIds - Array of new tag IDs to validate
   * @param userId - User ID performing the validation
   * @param dbInstance - Optional database executor for transactions
   * @returns Validation result with canCreate flag, errors, and warnings
   */
  static async validateTagsForBobbleheadAsync(
    bobbleheadId: string,
    newTagIds: Array<string>,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<TagValidationResult> {
    return executeFacadeOperation(
      {
        data: { bobbleheadId, newTagCount: newTagIds.length },
        facade: facadeName,
        method: 'validateTagsForBobbleheadAsync',
        operation: OPERATIONS.TAGS.VALIDATE,
        userId,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance);

        const errors: Array<string> = [];
        const warnings: Array<string> = [];

        // Get current tags on bobblehead
        const currentTags = await TagsQuery.getByBobbleheadIdAsync(bobbleheadId, context);
        const totalTagsAfterAdd = currentTags.length + newTagIds.length;

        // Check tag limit
        if (totalTagsAfterAdd > CONFIG.CONTENT.MAX_TAGS_PER_BOBBLEHEAD) {
          errors.push(
            `Cannot add tags. Maximum ${CONFIG.CONTENT.MAX_TAGS_PER_BOBBLEHEAD} tags allowed per bobblehead.`,
          );
        }

        // Validate all tag IDs belong to user or are system tags
        for (const tagId of newTagIds) {
          const tag = await TagsQuery.findByIdAsync(tagId, userId, context);
          if (!tag) {
            errors.push(`Tag with ID ${tagId} not found or not accessible.`);
          } else if (tag.userId !== null && tag.userId !== userId) {
            errors.push(`Tag "${tag.name}" does not belong to you.`);
          }
        }

        // Check for duplicate tags
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
      },
      {
        includeResultSummary: (result) => ({
          canCreate: result.canCreate,
          errorCount: result.errors.length,
          warningCount: result.warnings.length,
        }),
      },
    );
  }
}
