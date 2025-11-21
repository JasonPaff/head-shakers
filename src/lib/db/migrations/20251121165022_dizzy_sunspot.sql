ALTER TABLE "bobbleheads" ADD COLUMN "slug" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "slug" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "sub_collections" ADD COLUMN "slug" varchar(100) NOT NULL;--> statement-breakpoint
CREATE INDEX "bobbleheads_slug_idx" ON "bobbleheads" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "collections_slug_idx" ON "collections" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "collections_user_slug_unique" ON "collections" USING btree ("user_id","slug");--> statement-breakpoint
CREATE INDEX "sub_collections_slug_idx" ON "sub_collections" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "sub_collections_collection_slug_unique" ON "sub_collections" USING btree ("collection_id","slug");--> statement-breakpoint
CREATE INDEX "comments_parent_created_idx" ON "comments" USING btree ("parent_comment_id","created_at");--> statement-breakpoint
ALTER TABLE "bobbleheads" ADD CONSTRAINT "bobbleheads_slug_unique" UNIQUE("slug");