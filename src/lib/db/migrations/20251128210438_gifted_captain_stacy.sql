ALTER TABLE "collections" DROP CONSTRAINT "collections_like_count_non_negative";--> statement-breakpoint
DROP INDEX "collections_public_like_count_idx";--> statement-breakpoint
ALTER TABLE "collections" DROP COLUMN "like_count";