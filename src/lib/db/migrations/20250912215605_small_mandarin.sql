ALTER TABLE "collections" ADD COLUMN "like_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "sub_collections" ADD COLUMN "like_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_like_count_non_negative" CHECK ("collections"."like_count" >= 0);--> statement-breakpoint
ALTER TABLE "sub_collections" ADD CONSTRAINT "sub_collections_like_count_non_negative" CHECK ("sub_collections"."like_count" >= 0);