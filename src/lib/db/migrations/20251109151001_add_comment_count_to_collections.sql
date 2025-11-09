-- Add comment_count field to collections table
ALTER TABLE "collections" ADD COLUMN "comment_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint

-- Add comment_count field to sub_collections table
ALTER TABLE "sub_collections" ADD COLUMN "comment_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint

-- Add check constraint for non-negative comment count on collections
ALTER TABLE "collections" ADD CONSTRAINT "collections_comment_count_non_negative" CHECK ("comment_count" >= 0);--> statement-breakpoint

-- Add check constraint for non-negative comment count on sub_collections
ALTER TABLE "sub_collections" ADD CONSTRAINT "sub_collections_comment_count_non_negative" CHECK ("comment_count" >= 0);
