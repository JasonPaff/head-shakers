import { sql } from 'drizzle-orm';
import { check, index, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { bobbleheads } from '@/lib/db/schema/bobbleheads.schema';
import { collections } from '@/lib/db/schema/collections.schema';

export const bobbleheadCollections = pgTable(
  'bobblehead_collections',
  {
    bobbleheadId: uuid('bobblehead_id')
      .references(() => bobbleheads.id, { onDelete: 'cascade' })
      .notNull(),
    collectionId: uuid('collection_id')
      .references(() => collections.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // Check constraints
    check('bobblehead_collections_dates_logic', sql`${table.createdAt} <= ${table.updatedAt}`),

    // Single column indexes
    index('bobblehead_collections_bobblehead_id_idx').on(table.bobbleheadId),
    index('bobblehead_collections_collection_id_idx').on(table.collectionId),

    // Unique indexes
    uniqueIndex('bobblehead_collections_unique').on(table.bobbleheadId, table.collectionId),
  ],
);
