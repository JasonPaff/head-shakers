ALTER TABLE "collections" DROP CONSTRAINT IF EXISTS "collections_comment_count_non_negative";--> statement-breakpoint
DROP INDEX IF EXISTS "collections_comment_count_desc_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "collections_public_comment_count_idx";--> statement-breakpoint
ALTER TABLE "collections" DROP COLUMN "comment_count";