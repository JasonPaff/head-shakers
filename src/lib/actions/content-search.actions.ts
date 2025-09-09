'use server';

import 'server-only';
import { and, eq, ilike, inArray, or } from 'drizzle-orm';
import { z } from 'zod';

import type { AdminActionContext } from '@/lib/utils/next-safe-action';

import { ACTION_NAMES, CONFIG, DEFAULTS } from '@/lib/constants';
import { bobbleheadPhotos, bobbleheads, collections, users } from '@/lib/db/schema';
import { adminActionClient } from '@/lib/utils/next-safe-action';

const searchContentSchema = z.object({
  limit: z.number().int().min(1).max(CONFIG.PAGINATION.SEARCH_RESULTS.MAX).default(CONFIG.PAGINATION.SEARCH_RESULTS.DEFAULT),
  query: z.string().min(1).max(CONFIG.SEARCH.MAX_QUERY_LENGTH),
});

/**
 * Search collections for featuring (admin/moderator only)
 */
export const searchCollectionsForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.SEARCH_COLLECTIONS_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(searchContentSchema)
  .action(
    async ({
      ctx,
      parsedInput,
    }: {
      ctx: AdminActionContext;
      parsedInput: z.infer<typeof searchContentSchema>;
    }) => {
      const { limit, query } = parsedInput;

      const results = await ctx.db
        .select({
          coverImageUrl: collections.coverImageUrl,
          description: collections.description,
          id: collections.id,
          isPublic: collections.isPublic,
          name: collections.name,
          ownerName: users.displayName,
          ownerUsername: users.username,
          totalItems: collections.totalItems,
        })
        .from(collections)
        .innerJoin(users, eq(collections.userId, users.id))
        .where(
          and(
            eq(collections.isPublic, DEFAULTS.COLLECTION.IS_PUBLIC),
            eq(users.isDeleted, DEFAULTS.USER.IS_DELETED),
            or(
              ilike(collections.name, `%${query}%`),
              ilike(collections.description, `%${query}%`),
              ilike(users.displayName, `%${query}%`),
              ilike(users.username, `%${query}%`),
            ),
          ),
        )
        .limit(limit);

      return {
        collections: results,
        message: `Found ${results.length} collections matching "${query}"`,
      };
    },
  );

/**
 * Search bobbleheads for featuring (admin/moderator only)
 */
export const searchBobbleheadsForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.SEARCH_BOBBLEHEADS_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(searchContentSchema)
  .action(
    async ({
      ctx,
      parsedInput,
    }: {
      ctx: AdminActionContext;
      parsedInput: z.infer<typeof searchContentSchema>;
    }) => {
      const { limit, query } = parsedInput;

      const results = await ctx.db
        .select({
          category: bobbleheads.category,
          characterName: bobbleheads.characterName,
          collectionName: collections.name,
          description: bobbleheads.description,
          id: bobbleheads.id,
          isPublic: bobbleheads.isPublic,
          manufacturer: bobbleheads.manufacturer,
          name: bobbleheads.name,
          ownerName: users.displayName,
          ownerUsername: users.username,
          primaryPhotoUrl: bobbleheadPhotos.url,
          series: bobbleheads.series,
          year: bobbleheads.year,
        })
        .from(bobbleheads)
        .innerJoin(users, eq(bobbleheads.userId, users.id))
        .innerJoin(collections, eq(bobbleheads.collectionId, collections.id))
        .leftJoin(
          bobbleheadPhotos,
          and(eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true)),
        )
        .where(
          and(
            eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
            eq(bobbleheads.isDeleted, DEFAULTS.BOBBLEHEAD.IS_DELETED),
            eq(users.isDeleted, DEFAULTS.USER.IS_DELETED),
            or(
              ilike(bobbleheads.name, `%${query}%`),
              ilike(bobbleheads.description, `%${query}%`),
              ilike(bobbleheads.characterName, `%${query}%`),
              ilike(bobbleheads.manufacturer, `%${query}%`),
              ilike(bobbleheads.series, `%${query}%`),
              ilike(users.displayName, `%${query}%`),
              ilike(users.username, `%${query}%`),
              ilike(collections.name, `%${query}%`),
            ),
          ),
        )
        .limit(limit);

      // Get all photos for each bobblehead in a single query
      const bobbleheadIds = results.map((result) => result.id);
      const allPhotos = bobbleheadIds.length > 0 ? 
        await ctx.db
          .select({
            altText: bobbleheadPhotos.altText,
            bobbleheadId: bobbleheadPhotos.bobbleheadId,
            isPrimary: bobbleheadPhotos.isPrimary,
            sortOrder: bobbleheadPhotos.sortOrder,
            url: bobbleheadPhotos.url,
          })
          .from(bobbleheadPhotos)
          .where(inArray(bobbleheadPhotos.bobbleheadId, bobbleheadIds))
          .orderBy(bobbleheadPhotos.sortOrder) : [];

      // Group photos by bobblehead ID
      const photosByBobblehead = new Map<string, Array<typeof allPhotos[0]>>();
      allPhotos.forEach((photo) => {
        if (!photosByBobblehead.has(photo.bobbleheadId)) {
          photosByBobblehead.set(photo.bobbleheadId, []);
        }
        photosByBobblehead.get(photo.bobbleheadId)?.push(photo);
      });

      // Attach photos to results
      const enrichedResults = results.map((result) => ({
        ...result,
        photos: photosByBobblehead.get(result.id) || [],
      }));

      return {
        bobbleheads: enrichedResults,
        message: `Found ${enrichedResults.length} bobbleheads matching "${query}"`,
      };
    },
  );

/**
 * Search users for featuring (admin/moderator only)
 */
export const searchUsersForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.SEARCH_USERS_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(searchContentSchema)
  .action(
    async ({
      ctx,
      parsedInput,
    }: {
      ctx: AdminActionContext;
      parsedInput: z.infer<typeof searchContentSchema>;
    }) => {
      const { limit, query } = parsedInput;

      const results = await ctx.db
        .select({
          avatarUrl: users.avatarUrl,
          bio: users.bio,
          displayName: users.displayName,
          id: users.id,
          isVerified: users.isVerified,
          location: users.location,
          memberSince: users.memberSince,
          username: users.username,
        })
        .from(users)
        .where(
          and(
            eq(users.isDeleted, DEFAULTS.USER.IS_DELETED),
            or(
              ilike(users.displayName, `%${query}%`),
              ilike(users.username, `%${query}%`),
              ilike(users.bio, `%${query}%`),
              ilike(users.location, `%${query}%`),
            ),
          ),
        )
        .limit(limit);

      return {
        message: `Found ${results.length} users matching "${query}"`,
        users: results,
      };
    },
  );

/**
 * Get specific collection by ID for featuring (admin/moderator only)
 */
export const getCollectionForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.GET_COLLECTION_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(
    async ({
      ctx,
      parsedInput,
    }: {
      ctx: AdminActionContext;
      parsedInput: { id: string };
    }) => {
      const result = await ctx.db
        .select({
          coverImageUrl: collections.coverImageUrl,
          description: collections.description,
          id: collections.id,
          isPublic: collections.isPublic,
          name: collections.name,
          ownerName: users.displayName,
          ownerUsername: users.username,
          totalItems: collections.totalItems,
        })
        .from(collections)
        .innerJoin(users, eq(collections.userId, users.id))
        .where(
          and(
            eq(collections.id, parsedInput.id),
            eq(collections.isPublic, DEFAULTS.COLLECTION.IS_PUBLIC),
            eq(users.isDeleted, DEFAULTS.USER.IS_DELETED),
          ),
        )
        .limit(1);

      const collection = result[0];
      if (!collection) {
        throw new Error('Collection not found or not public');
      }

      return { collection };
    },
  );

/**
 * Get specific bobblehead by ID for featuring (admin/moderator only)
 */
export const getBobbleheadForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.GET_BOBBLEHEAD_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(
    async ({
      ctx,
      parsedInput,
    }: {
      ctx: AdminActionContext;
      parsedInput: { id: string };
    }) => {
      const result = await ctx.db
        .select({
          category: bobbleheads.category,
          characterName: bobbleheads.characterName,
          collectionName: collections.name,
          description: bobbleheads.description,
          id: bobbleheads.id,
          isPublic: bobbleheads.isPublic,
          manufacturer: bobbleheads.manufacturer,
          name: bobbleheads.name,
          ownerName: users.displayName,
          ownerUsername: users.username,
          primaryPhotoUrl: bobbleheadPhotos.url,
          series: bobbleheads.series,
          year: bobbleheads.year,
        })
        .from(bobbleheads)
        .innerJoin(users, eq(bobbleheads.userId, users.id))
        .innerJoin(collections, eq(bobbleheads.collectionId, collections.id))
        .leftJoin(
          bobbleheadPhotos,
          and(eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true)),
        )
        .where(
          and(
            eq(bobbleheads.id, parsedInput.id),
            eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
            eq(bobbleheads.isDeleted, DEFAULTS.BOBBLEHEAD.IS_DELETED),
            eq(users.isDeleted, DEFAULTS.USER.IS_DELETED),
          ),
        )
        .limit(1);

      const bobblehead = result[0];
      if (!bobblehead) {
        throw new Error('Bobblehead not found or not public');
      }

      // Get all photos for this bobblehead
      const photos = await ctx.db
        .select({
          altText: bobbleheadPhotos.altText,
          bobbleheadId: bobbleheadPhotos.bobbleheadId,
          isPrimary: bobbleheadPhotos.isPrimary,
          sortOrder: bobbleheadPhotos.sortOrder,
          url: bobbleheadPhotos.url,
        })
        .from(bobbleheadPhotos)
        .where(eq(bobbleheadPhotos.bobbleheadId, parsedInput.id))
        .orderBy(bobbleheadPhotos.sortOrder);

      return {
        bobblehead: {
          ...bobblehead,
          photos,
        },
      };
    },
  );

/**
 * Get specific user by ID for featuring (admin/moderator only)
 */
export const getUserForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.GET_USER_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(
    async ({
      ctx,
      parsedInput,
    }: {
      ctx: AdminActionContext;
      parsedInput: { id: string };
    }) => {
      const result = await ctx.db
        .select({
          avatarUrl: users.avatarUrl,
          bio: users.bio,
          displayName: users.displayName,
          id: users.id,
          isVerified: users.isVerified,
          location: users.location,
          memberSince: users.memberSince,
          username: users.username,
        })
        .from(users)
        .where(
          and(
            eq(users.id, parsedInput.id),
            eq(users.isDeleted, DEFAULTS.USER.IS_DELETED),
          ),
        )
        .limit(1);

      const user = result[0];
      if (!user) {
        throw new Error('User not found');
      }

      return { user };
    },
  );
