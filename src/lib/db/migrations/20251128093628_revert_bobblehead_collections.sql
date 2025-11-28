-- Revert bobblehead-collection relationship from one-to-many back to one-to-one
-- This migration restores the direct collectionId foreign key on bobbleheads

-- 1. Add the collection_id column back to bobbleheads (nullable initially)
-- Use DO block to make this idempotent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bobbleheads' AND column_name = 'collection_id'
  ) THEN
    ALTER TABLE "bobbleheads" ADD COLUMN "collection_id" uuid;
  END IF;
END $$;

-- 2. Migrate data from junction table (pick first collection for each bobblehead using DISTINCT ON)
UPDATE "bobbleheads" b
SET "collection_id" = sub."collection_id"
FROM (
  SELECT DISTINCT ON (bobblehead_id) bobblehead_id, collection_id
  FROM "bobblehead_collections"
  ORDER BY bobblehead_id, created_at ASC
) sub
WHERE sub."bobblehead_id" = b."id"
AND b."collection_id" IS NULL;

-- 3. Delete bobbleheads that have no collection assignment (orphaned data, no critical data to preserve)
DELETE FROM "bobbleheads" WHERE "collection_id" IS NULL;

-- 4. Add the foreign key constraint (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'bobbleheads_collection_id_collections_id_fk'
    AND table_name = 'bobbleheads'
  ) THEN
    ALTER TABLE "bobbleheads"
    ADD CONSTRAINT "bobbleheads_collection_id_collections_id_fk"
    FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE cascade;
  END IF;
END $$;

-- 5. Make collection_id NOT NULL (only if there are no null values)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "bobbleheads" WHERE "collection_id" IS NULL
  ) THEN
    ALTER TABLE "bobbleheads" ALTER COLUMN "collection_id" SET NOT NULL;
  END IF;
END $$;

-- 6. Restore the dropped indexes (if not exist)
CREATE INDEX IF NOT EXISTS "bobbleheads_collection_id_idx" ON "bobbleheads" USING btree ("collection_id");
CREATE INDEX IF NOT EXISTS "bobbleheads_category_browse_idx" ON "bobbleheads" USING btree ("category","deleted_at","collection_id");
CREATE INDEX IF NOT EXISTS "bobbleheads_collection_public_idx" ON "bobbleheads" USING btree ("collection_id","is_public");
CREATE INDEX IF NOT EXISTS "bobbleheads_collection_covering_idx" ON "bobbleheads" USING btree ("collection_id","is_public","id","name","created_at","deleted_at");

-- 7. Drop the junction table
DROP TABLE IF EXISTS "bobblehead_collections" CASCADE;
