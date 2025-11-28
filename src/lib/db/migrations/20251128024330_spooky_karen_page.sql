CREATE TABLE "bobblehead_collections" (
	"bobblehead_id" uuid NOT NULL,
	"collection_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
-- Data migration: Preserve existing bobblehead-collection relationships
INSERT INTO "bobblehead_collections" ("id", "bobblehead_id", "collection_id", "created_at")
SELECT gen_random_uuid(), "id", "collection_id", NOW()
FROM "bobbleheads"
WHERE "collection_id" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "bobbleheads" DROP CONSTRAINT "bobbleheads_collection_id_collections_id_fk";
--> statement-breakpoint
DROP INDEX "bobbleheads_collection_id_idx";--> statement-breakpoint
DROP INDEX "bobbleheads_category_browse_idx";--> statement-breakpoint
DROP INDEX "bobbleheads_collection_public_idx";--> statement-breakpoint
DROP INDEX "bobbleheads_collection_covering_idx";--> statement-breakpoint
ALTER TABLE "bobblehead_collections" ADD CONSTRAINT "bobblehead_collections_bobblehead_id_bobbleheads_id_fk" FOREIGN KEY ("bobblehead_id") REFERENCES "public"."bobbleheads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bobblehead_collections" ADD CONSTRAINT "bobblehead_collections_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bobblehead_collections_bobblehead_id_idx" ON "bobblehead_collections" USING btree ("bobblehead_id");--> statement-breakpoint
CREATE INDEX "bobblehead_collections_collection_id_idx" ON "bobblehead_collections" USING btree ("collection_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bobblehead_collections_unique" ON "bobblehead_collections" USING btree ("bobblehead_id","collection_id");--> statement-breakpoint
ALTER TABLE "bobbleheads" DROP COLUMN "collection_id";