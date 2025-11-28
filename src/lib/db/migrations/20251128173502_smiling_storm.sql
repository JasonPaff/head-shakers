DROP INDEX IF EXISTS "collections_last_item_added_at_idx";--> statement-breakpoint
ALTER TABLE "collections" DROP COLUMN "last_item_added_at";