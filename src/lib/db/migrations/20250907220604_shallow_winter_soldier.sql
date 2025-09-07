CREATE TYPE "public"."content_metric_type" AS ENUM('view', 'like', 'comment', 'share');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'moderator', 'admin');--> statement-breakpoint
CREATE TABLE "content_metrics" (
	"content_id" uuid NOT NULL,
	"content_type" "featured_content_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"date" timestamp NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metric_type" "content_metric_type" NOT NULL,
	"metric_value" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "content_metrics_value_non_negative" CHECK ("content_metrics"."metric_value" >= 0)
);
--> statement-breakpoint
ALTER TABLE "featured_content" ADD COLUMN "curator_notes" text;--> statement-breakpoint
ALTER TABLE "featured_content" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "featured_content" ADD COLUMN "priority" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "featured_content" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
CREATE INDEX "content_metrics_content_type_idx" ON "content_metrics" USING btree ("content_type");--> statement-breakpoint
CREATE INDEX "content_metrics_content_id_idx" ON "content_metrics" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "content_metrics_metric_type_idx" ON "content_metrics" USING btree ("metric_type");--> statement-breakpoint
CREATE INDEX "content_metrics_date_idx" ON "content_metrics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "content_metrics_created_at_idx" ON "content_metrics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "content_metrics_content_idx" ON "content_metrics" USING btree ("content_type","content_id");--> statement-breakpoint
CREATE INDEX "content_metrics_content_date_idx" ON "content_metrics" USING btree ("content_type","content_id","date");--> statement-breakpoint
CREATE INDEX "content_metrics_type_date_idx" ON "content_metrics" USING btree ("metric_type","date");--> statement-breakpoint
CREATE INDEX "content_metrics_content_metric_idx" ON "content_metrics" USING btree ("content_type","content_id","metric_type");--> statement-breakpoint
CREATE INDEX "featured_content_priority_idx" ON "featured_content" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "featured_content_view_count_idx" ON "featured_content" USING btree ("view_count");--> statement-breakpoint
CREATE INDEX "featured_content_active_priority_idx" ON "featured_content" USING btree ("is_active","priority");--> statement-breakpoint
CREATE INDEX "featured_content_active_dates_idx" ON "featured_content" USING btree ("is_active","start_date","end_date");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
ALTER TABLE "featured_content" ADD CONSTRAINT "featured_content_priority_non_negative" CHECK ("featured_content"."priority" >= 0);--> statement-breakpoint
ALTER TABLE "featured_content" ADD CONSTRAINT "featured_content_view_count_non_negative" CHECK ("featured_content"."view_count" >= 0);