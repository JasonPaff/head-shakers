CREATE TYPE "public"."content_views_target_type" AS ENUM('bobblehead', 'collection', 'profile');--> statement-breakpoint
CREATE TYPE "public"."result_type" AS ENUM('bobblehead', 'collection', 'user');--> statement-breakpoint
CREATE TYPE "public"."content_report_reason" AS ENUM('spam', 'harassment', 'inappropriate_content', 'copyright_violation', 'misinformation', 'hate_speech', 'violence', 'other');--> statement-breakpoint
CREATE TYPE "public"."content_report_status" AS ENUM('pending', 'reviewed', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."content_report_target_type" AS ENUM('bobblehead', 'comment', 'user', 'collection');--> statement-breakpoint
CREATE TYPE "public"."comment_target_type" AS ENUM('bobblehead', 'collection');--> statement-breakpoint
CREATE TYPE "public"."follow_type" AS ENUM('user', 'collection');--> statement-breakpoint
CREATE TYPE "public"."like_target_type" AS ENUM('bobblehead', 'collection', 'comment');--> statement-breakpoint
CREATE TYPE "public"."feature_type" AS ENUM('homepage_banner', 'collection_of_week', 'trending', 'editor_pick');--> statement-breakpoint
CREATE TYPE "public"."featured_content_type" AS ENUM('bobblehead', 'collection', 'user');--> statement-breakpoint
CREATE TYPE "public"."notification_related_type" AS ENUM('bobblehead', 'collection', 'comment', 'user');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('comment', 'like', 'follow', 'mention', 'system');--> statement-breakpoint
CREATE TYPE "public"."value_type" AS ENUM('string', 'number', 'boolean', 'json');--> statement-breakpoint
CREATE TYPE "public"."action_type" AS ENUM('create', 'update', 'delete', 'like', 'comment', 'follow', 'unfollow', 'view');--> statement-breakpoint
CREATE TYPE "public"."comment_permission" AS ENUM('anyone', 'followers', 'none');--> statement-breakpoint
CREATE TYPE "public"."digest_frequency" AS ENUM('daily', 'weekly', 'monthly', 'never');--> statement-breakpoint
CREATE TYPE "public"."dm_permission" AS ENUM('anyone', 'followers', 'mutual', 'none');--> statement-breakpoint
CREATE TYPE "public"."login_method" AS ENUM('email', 'facebook', 'github', 'gmail', 'google');--> statement-breakpoint
CREATE TYPE "public"."privacy_level" AS ENUM('public', 'followers', 'private');--> statement-breakpoint
CREATE TYPE "public"."user_activity_target_type" AS ENUM('bobblehead', 'collection', 'user', 'comment');--> statement-breakpoint
CREATE TABLE "content_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" varchar(45),
	"referrer_url" varchar(500),
	"target_id" uuid NOT NULL,
	"content_views_target_type" "content_views_target_type" NOT NULL,
	"user_agent" varchar(1000),
	"view_duration" integer,
	"viewed_at" timestamp DEFAULT now() NOT NULL,
	"viewer_id" uuid
);
--> statement-breakpoint
CREATE TABLE "search_queries" (
	"clicked_result_id" uuid,
	"clicked_result_type" "result_type",
	"filters" jsonb,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" varchar(50),
	"query" varchar(500) NOT NULL,
	"result_count" integer,
	"searched_at" timestamp DEFAULT now() NOT NULL,
	"session_id" uuid,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "bobblehead_photos" (
	"alt_text" varchar(255),
	"bobblehead_id" uuid NOT NULL,
	"caption" varchar(500),
	"file_size" integer,
	"height" integer,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"url" varchar(500) NOT NULL,
	"width" integer
);
--> statement-breakpoint
CREATE TABLE "bobblehead_tags" (
	"bobblehead_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bobbleheads" (
	"acquisition_date" timestamp,
	"acquisition_method" varchar(50),
	"category" varchar(50),
	"character_name" varchar(100),
	"collection_id" uuid NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"current_condition" varchar(20) DEFAULT 'excellent' NOT NULL,
	"custom_fields" jsonb,
	"deleted_at" timestamp,
	"description" varchar(1000),
	"height" numeric(5, 2),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"manufacturer" varchar(100),
	"material" varchar(100),
	"name" varchar(100) NOT NULL,
	"purchase_location" varchar(100),
	"purchase_price" numeric(10, 2),
	"series" varchar(100),
	"status" varchar(20) DEFAULT 'owned' NOT NULL,
	"sub_collection_id" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"weight" numeric(6, 2),
	"year" integer
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"cover_image_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" varchar(1000),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"last_item_added_at" timestamp,
	"name" varchar(100) NOT NULL,
	"total_items" integer DEFAULT 0 NOT NULL,
	"total_value" numeric(15, 2) DEFAULT '0.00',
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "collections_name_length" CHECK (length("collections"."name") <= 100),
	CONSTRAINT "collections_name_not_empty" CHECK (length("collections"."name") >= 1),
	CONSTRAINT "collections_total_items_non_negative" CHECK ("collections"."total_items" >= 0),
	CONSTRAINT "collections_total_value_non_negative" CHECK ("collections"."total_value" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sub_collections" (
	"collection_id" uuid NOT NULL,
	"cover_image_url" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" varchar,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"name" varchar(100) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sub_collections_item_count_non_negative" CHECK ("sub_collections"."item_count" >= 0),
	CONSTRAINT "sub_collections_name_length" CHECK (length("sub_collections"."name") <= 100),
	CONSTRAINT "sub_collections_name_not_empty" CHECK (length("sub_collections"."name") > 0),
	CONSTRAINT "sub_collections_sort_order_non_negative" CHECK ("sub_collections"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "content_reports" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" varchar(1000),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moderator_id" uuid,
	"moderator_notes" varchar,
	"reason" "content_report_reason" NOT NULL,
	"reporter_id" uuid NOT NULL,
	"resolved_at" timestamp,
	"status" "content_report_status" DEFAULT 'pending' NOT NULL,
	"target_id" uuid NOT NULL,
	"target_type" "content_report_target_type" NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"content" varchar(5000) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"edited_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"is_edited" boolean DEFAULT false NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"parent_comment_id" uuid,
	"target_id" uuid NOT NULL,
	"comment_target_type" "comment_target_type" NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "comments_content_not_empty" CHECK (length(trim("comments"."content")) > 0),
	CONSTRAINT "comments_like_count_non_negative" CHECK ("comments"."like_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"follow_type" "follow_type" DEFAULT 'user' NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_id" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "follows_no_self_follow" CHECK ("follows"."follower_id" != "follows"."following_id")
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_id" uuid NOT NULL,
	"like_target_type" "like_target_type" NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "featured_content" (
	"content_id" uuid NOT NULL,
	"featured_content_type" "featured_content_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"curator_id" uuid,
	"description" text,
	"end_date" timestamp,
	"feature_type" "feature_type" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp,
	"title" varchar(255),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "featured_content_title_length" CHECK ("featured_content"."title" IS NULL OR length("featured_content"."title") <= 255),
	CONSTRAINT "featured_content_sort_order_non_negative" CHECK ("featured_content"."sort_order" >= 0),
	CONSTRAINT "featured_content_date_logic" CHECK ("featured_content"."start_date" IS NULL OR "featured_content"."end_date" IS NULL OR "featured_content"."start_date" <= "featured_content"."end_date")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"action_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_email_sent" boolean DEFAULT false NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"message" text,
	"read_at" timestamp,
	"related_id" uuid,
	"notification_related_type" "notification_related_type",
	"related_user_id" uuid,
	"title" varchar(255) NOT NULL,
	"type" "notification_type" NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "notifications_title_not_empty" CHECK (length("notifications"."title") > 0),
	CONSTRAINT "notifications_title_length" CHECK (length("notifications"."title") <= 255),
	CONSTRAINT "notifications_read_at_logic" CHECK (("notifications"."is_read" = false AND "notifications"."read_at" IS NULL) OR ("notifications"."is_read" = true AND "notifications"."read_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"key" varchar(100) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"value" text,
	"value_type" "value_type" DEFAULT 'string' NOT NULL,
	CONSTRAINT "platform_settings_key_unique" UNIQUE("key"),
	CONSTRAINT "platform_settings_key_not_empty" CHECK (length("platform_settings"."key") > 0),
	CONSTRAINT "platform_settings_key_length" CHECK (length("platform_settings"."key") <= 100)
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"color" varchar(7) DEFAULT '#3B82F6' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_history" (
	"device_info" jsonb,
	"failure_reason" varchar(255),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" varchar(50),
	"is_successful" boolean NOT NULL,
	"login_at" timestamp DEFAULT now() NOT NULL,
	"login_method" "login_method" DEFAULT 'email' NOT NULL,
	"user_agent" varchar(1000),
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"digest_frequency" "digest_frequency" DEFAULT 'weekly' NOT NULL,
	"email_new_comments" boolean DEFAULT true NOT NULL,
	"email_new_followers" boolean DEFAULT true NOT NULL,
	"email_new_likes" boolean DEFAULT true NOT NULL,
	"email_platform_updates" boolean DEFAULT true NOT NULL,
	"email_weekly_digest" boolean DEFAULT true NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"in_app_following_updates" boolean DEFAULT true NOT NULL,
	"in_app_new_comments" boolean DEFAULT true NOT NULL,
	"in_app_new_followers" boolean DEFAULT true NOT NULL,
	"in_app_new_likes" boolean DEFAULT true NOT NULL,
	"push_new_comments" boolean DEFAULT true NOT NULL,
	"push_new_followers" boolean DEFAULT true NOT NULL,
	"push_new_likes" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "notification_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_activity" (
	"action_type" "action_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" varchar(45),
	"metadata" jsonb,
	"target_id" uuid,
	"user_activity_target_type" "user_activity_target_type",
	"user_agent" varchar(1000),
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_blocks" (
	"blocked_id" uuid NOT NULL,
	"blocker_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reason" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"device_info" jsonb,
	"expires_at" timestamp NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"user_agent" varchar(1000),
	"user_id" uuid NOT NULL,
	CONSTRAINT "user_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"allow_comments" "comment_permission" DEFAULT 'anyone' NOT NULL,
	"allow_direct_messages" "dm_permission" DEFAULT 'followers' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"default_item_privacy" varchar(20) DEFAULT 'public' NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"moderate_comments" boolean DEFAULT false NOT NULL,
	"profile_visibility" "privacy_level" DEFAULT 'public' NOT NULL,
	"show_collection_stats" boolean DEFAULT true NOT NULL,
	"show_collection_value" boolean DEFAULT false NOT NULL,
	"show_join_date" boolean DEFAULT true NOT NULL,
	"show_last_active" boolean DEFAULT false NOT NULL,
	"show_location" boolean DEFAULT false NOT NULL,
	"show_real_name" boolean DEFAULT false NOT NULL,
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"avatar_url" varchar(100),
	"bio" varchar(500),
	"clerk_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"display_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"last_active_at" timestamp,
	"last_failed_login_at" timestamp,
	"location" varchar(100),
	"locked_until" timestamp,
	"member_since" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" varchar(50) NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "content_views" ADD CONSTRAINT "content_views_viewer_id_users_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_queries" ADD CONSTRAINT "search_queries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bobblehead_photos" ADD CONSTRAINT "bobblehead_photos_bobblehead_id_bobbleheads_id_fk" FOREIGN KEY ("bobblehead_id") REFERENCES "public"."bobbleheads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bobblehead_tags" ADD CONSTRAINT "bobblehead_tags_bobblehead_id_bobbleheads_id_fk" FOREIGN KEY ("bobblehead_id") REFERENCES "public"."bobbleheads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bobblehead_tags" ADD CONSTRAINT "bobblehead_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bobbleheads" ADD CONSTRAINT "bobbleheads_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bobbleheads" ADD CONSTRAINT "bobbleheads_sub_collection_id_sub_collections_id_fk" FOREIGN KEY ("sub_collection_id") REFERENCES "public"."sub_collections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bobbleheads" ADD CONSTRAINT "bobbleheads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_collections" ADD CONSTRAINT "sub_collections_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "featured_content" ADD CONSTRAINT "featured_content_curator_id_users_id_fk" FOREIGN KEY ("curator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_user_id_users_id_fk" FOREIGN KEY ("related_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD CONSTRAINT "platform_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocked_id_users_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocker_id_users_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_views_viewed_at_idx" ON "content_views" USING btree ("viewed_at");--> statement-breakpoint
CREATE INDEX "content_views_viewer_id_idx" ON "content_views" USING btree ("viewer_id");--> statement-breakpoint
CREATE INDEX "content_views_target_id_idx" ON "content_views" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "content_views_target_type_id_idx" ON "content_views" USING btree ("content_views_target_type","target_id");--> statement-breakpoint
CREATE INDEX "content_views_viewer_viewed_idx" ON "content_views" USING btree ("viewer_id","viewed_at");--> statement-breakpoint
CREATE INDEX "search_queries_query_idx" ON "search_queries" USING btree ("query");--> statement-breakpoint
CREATE INDEX "search_queries_searched_at_idx" ON "search_queries" USING btree ("searched_at");--> statement-breakpoint
CREATE INDEX "search_queries_user_id_idx" ON "search_queries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "search_queries_session_id_idx" ON "search_queries" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "search_queries_user_searched_idx" ON "search_queries" USING btree ("user_id","searched_at");--> statement-breakpoint
CREATE INDEX "search_queries_session_searched_idx" ON "search_queries" USING btree ("session_id","searched_at");--> statement-breakpoint
CREATE INDEX "bobblehead_photos_bobblehead_id_idx" ON "bobblehead_photos" USING btree ("bobblehead_id");--> statement-breakpoint
CREATE INDEX "bobblehead_photos_is_primary_idx" ON "bobblehead_photos" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "bobblehead_photos_sort_order_idx" ON "bobblehead_photos" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "bobblehead_tags_bobblehead_id_idx" ON "bobblehead_tags" USING btree ("bobblehead_id");--> statement-breakpoint
CREATE INDEX "bobblehead_tags_tag_id_idx" ON "bobblehead_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bobblehead_tags_unique" ON "bobblehead_tags" USING btree ("bobblehead_id","tag_id");--> statement-breakpoint
CREATE INDEX "bobbleheads_category_idx" ON "bobbleheads" USING btree ("category");--> statement-breakpoint
CREATE INDEX "bobbleheads_collection_id_idx" ON "bobbleheads" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "bobbleheads_created_at_idx" ON "bobbleheads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "bobbleheads_is_featured_idx" ON "bobbleheads" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "bobbleheads_is_public_idx" ON "bobbleheads" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "bobbleheads_status_idx" ON "bobbleheads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bobbleheads_sub_collection_id_idx" ON "bobbleheads" USING btree ("sub_collection_id");--> statement-breakpoint
CREATE INDEX "bobbleheads_user_id_idx" ON "bobbleheads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bobbleheads_collection_public_idx" ON "bobbleheads" USING btree ("collection_id","is_public");--> statement-breakpoint
CREATE INDEX "bobbleheads_public_featured_idx" ON "bobbleheads" USING btree ("is_public","is_featured");--> statement-breakpoint
CREATE INDEX "bobbleheads_user_created_idx" ON "bobbleheads" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "bobbleheads_user_public_idx" ON "bobbleheads" USING btree ("user_id","is_public");--> statement-breakpoint
CREATE INDEX "collections_is_public_idx" ON "collections" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "collections_user_id_idx" ON "collections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "collections_last_item_added_at_idx" ON "collections" USING btree ("last_item_added_at");--> statement-breakpoint
CREATE INDEX "collections_public_updated_idx" ON "collections" USING btree ("is_public","updated_at");--> statement-breakpoint
CREATE INDEX "collections_user_public_idx" ON "collections" USING btree ("user_id","is_public");--> statement-breakpoint
CREATE INDEX "sub_collections_collection_id_idx" ON "sub_collections" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "sub_collections_sort_order_idx" ON "sub_collections" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "sub_collections_collection_public_idx" ON "sub_collections" USING btree ("collection_id","is_public");--> statement-breakpoint
CREATE INDEX "sub_collections_collection_sort_idx" ON "sub_collections" USING btree ("collection_id","sort_order");--> statement-breakpoint
CREATE INDEX "content_reports_created_at_idx" ON "content_reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "content_reports_moderator_id_idx" ON "content_reports" USING btree ("moderator_id");--> statement-breakpoint
CREATE INDEX "content_reports_reason_idx" ON "content_reports" USING btree ("reason");--> statement-breakpoint
CREATE INDEX "content_reports_reporter_id_idx" ON "content_reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "content_reports_status_idx" ON "content_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "content_reports_reporter_status_idx" ON "content_reports" USING btree ("reporter_id","status");--> statement-breakpoint
CREATE INDEX "content_reports_status_created_idx" ON "content_reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "content_reports_target_idx" ON "content_reports" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "comments_user_id_idx" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comments_created_at_idx" ON "comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "comments_parent_comment_id_idx" ON "comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE INDEX "comments_target_id_idx" ON "comments" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "comments_target_idx" ON "comments" USING btree ("comment_target_type","target_id");--> statement-breakpoint
CREATE INDEX "comments_user_created_idx" ON "comments" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "comments_deleted_created_idx" ON "comments" USING btree ("is_deleted","created_at");--> statement-breakpoint
CREATE INDEX "comments_target_deleted_idx" ON "comments" USING btree ("comment_target_type","target_id","is_deleted");--> statement-breakpoint
CREATE INDEX "follows_follower_id_idx" ON "follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "follows_following_id_idx" ON "follows" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "follows_target_id_idx" ON "follows" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "follows_created_at_idx" ON "follows" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "follows_follower_type_idx" ON "follows" USING btree ("follower_id","follow_type");--> statement-breakpoint
CREATE INDEX "follows_following_type_idx" ON "follows" USING btree ("following_id","follow_type");--> statement-breakpoint
CREATE UNIQUE INDEX "follows_unique" ON "follows" USING btree ("follower_id","following_id","follow_type","target_id");--> statement-breakpoint
CREATE INDEX "likes_user_id_idx" ON "likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "likes_target_id_idx" ON "likes" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "likes_created_at_idx" ON "likes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "likes_target_idx" ON "likes" USING btree ("like_target_type","target_id");--> statement-breakpoint
CREATE INDEX "likes_user_created_idx" ON "likes" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "likes_unique" ON "likes" USING btree ("user_id","like_target_type","target_id");--> statement-breakpoint
CREATE INDEX "featured_content_feature_type_idx" ON "featured_content" USING btree ("feature_type");--> statement-breakpoint
CREATE INDEX "featured_content_is_active_idx" ON "featured_content" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "featured_content_sort_order_idx" ON "featured_content" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "featured_content_curator_id_idx" ON "featured_content" USING btree ("curator_id");--> statement-breakpoint
CREATE INDEX "featured_content_start_date_idx" ON "featured_content" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "featured_content_end_date_idx" ON "featured_content" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "featured_content_content_idx" ON "featured_content" USING btree ("featured_content_type","content_id");--> statement-breakpoint
CREATE INDEX "featured_content_active_feature_idx" ON "featured_content" USING btree ("is_active","feature_type");--> statement-breakpoint
CREATE INDEX "featured_content_active_sort_idx" ON "featured_content" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE INDEX "featured_content_feature_dates_idx" ON "featured_content" USING btree ("feature_type","start_date","end_date");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_related_user_id_idx" ON "notifications" USING btree ("related_user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_unread_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notifications_user_type_idx" ON "notifications" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "notifications_related_content_idx" ON "notifications" USING btree ("notification_related_type","related_id");--> statement-breakpoint
CREATE INDEX "platform_settings_key_idx" ON "platform_settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "platform_settings_is_public_idx" ON "platform_settings" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "platform_settings_value_type_idx" ON "platform_settings" USING btree ("value_type");--> statement-breakpoint
CREATE INDEX "platform_settings_updated_by_idx" ON "platform_settings" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "platform_settings_public_key_idx" ON "platform_settings" USING btree ("is_public","key");--> statement-breakpoint
CREATE INDEX "tags_name_idx" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "tags_user_id_idx" ON "tags" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tags_usage_count_idx" ON "tags" USING btree ("usage_count");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_user_name_unique" ON "tags" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "login_history_login_at_idx" ON "login_history" USING btree ("login_at");--> statement-breakpoint
CREATE INDEX "login_history_method_time_idx" ON "login_history" USING btree ("login_method","login_at");--> statement-breakpoint
CREATE INDEX "login_history_user_success_idx" ON "login_history" USING btree ("user_id","is_successful");--> statement-breakpoint
CREATE INDEX "login_history_user_id_idx" ON "login_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_settings_user_id_idx" ON "notification_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_activity_action_type_idx" ON "user_activity" USING btree ("action_type");--> statement-breakpoint
CREATE INDEX "user_activity_created_at_idx" ON "user_activity" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_activity_user_id_idx" ON "user_activity" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_activity_target_idx" ON "user_activity" USING btree ("user_activity_target_type","target_id");--> statement-breakpoint
CREATE INDEX "user_blocks_blocked_id_idx" ON "user_blocks" USING btree ("blocked_id");--> statement-breakpoint
CREATE INDEX "user_blocks_blocker_id_idx" ON "user_blocks" USING btree ("blocker_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_blocks_unique" ON "user_blocks" USING btree ("blocker_id","blocked_id");--> statement-breakpoint
CREATE INDEX "user_sessions_active_expires_idx" ON "user_sessions" USING btree ("is_active","expires_at");--> statement-breakpoint
CREATE INDEX "user_sessions_token_idx" ON "user_sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX "user_sessions_user_active_idx" ON "user_sessions" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_settings_user_id_idx" ON "user_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_clerk_id_idx" ON "users" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "users_deleted_active_idx" ON "users" USING btree ("is_deleted","last_active_at");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_failed_attempts_idx" ON "users" USING btree ("failed_login_attempts","last_failed_login_at");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_verified_created_idx" ON "users" USING btree ("is_verified","created_at");