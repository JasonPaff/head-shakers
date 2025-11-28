ALTER TABLE "collections" DROP CONSTRAINT IF EXISTS "collections_total_value_non_negative";--> statement-breakpoint
DROP INDEX IF EXISTS  "collections_total_value_desc_idx";--> statement-breakpoint
ALTER TABLE "collections" DROP COLUMN IF EXISTS "total_value";