'use server';

import 'server-only';
import { and, eq, ilike, or } from 'drizzle-orm';
import { z } from 'zod';

import type { AdminActionContext } from '@/lib/utils/next-safe-action';

import { ACTION_NAMES } from '@/lib/constants';
import { bobbleheadPhotos, bobbleheads, collections, users } from '@/lib/db/schema';
import { adminActionClient } from '@/lib/utils/next-safe-action';

const searchContentSchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
  query: z.string().min(1).max(100),
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
            eq(collections.isPublic, true),
            eq(users.isDeleted, false),
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
            eq(bobbleheads.isPublic, true),
            eq(bobbleheads.isDeleted, false),
            eq(users.isDeleted, false),
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

      return {
        bobbleheads: results,
        message: `Found ${results.length} bobbleheads matching "${query}"`,
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
            eq(users.isDeleted, false),
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
