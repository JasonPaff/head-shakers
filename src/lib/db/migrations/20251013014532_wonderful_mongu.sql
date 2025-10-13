CREATE SCHEMA "feature_planner";
--> statement-breakpoint
CREATE TYPE "feature_planner"."confidence_level" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "feature_planner"."estimated_scope" AS ENUM('small', 'medium', 'large');--> statement-breakpoint
CREATE TYPE "feature_planner"."execution_step" AS ENUM('refinement', 'discovery', 'planning');--> statement-breakpoint
CREATE TYPE "feature_planner"."file_discovery_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "feature_planner"."file_priority" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "feature_planner"."implementation_plan_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "feature_planner"."plan_status" AS ENUM('draft', 'refining', 'discovering', 'planning', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "feature_planner"."refinement_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "feature_planner"."risk_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "feature_planner"."technical_complexity" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
ALTER TYPE "public"."complexity" SET SCHEMA "feature_planner";--> statement-breakpoint
CREATE TABLE "feature_planner"."discovered_files" (
	"added_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text,
	"discovery_session_id" uuid NOT NULL,
	"file_exists" boolean DEFAULT true NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"file_type" varchar(50),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"integration_point" varchar(1000),
	"is_manually_added" boolean DEFAULT false NOT NULL,
	"is_selected" boolean DEFAULT false NOT NULL,
	"lines_of_code" integer,
	"priority" "feature_planner"."file_priority" NOT NULL,
	"reasoning" text,
	"relevance_score" integer DEFAULT 0 NOT NULL,
	"role" varchar(100),
	CONSTRAINT "discovered_files_lines_of_code_positive" CHECK ("feature_planner"."discovered_files"."lines_of_code" IS NULL OR "feature_planner"."discovered_files"."lines_of_code" > 0),
	CONSTRAINT "discovered_files_relevance_score_range" CHECK ("feature_planner"."discovered_files"."relevance_score" >= 0 AND "feature_planner"."discovered_files"."relevance_score" <= 100)
);
--> statement-breakpoint
CREATE TABLE "feature_planner"."feature_plans" (
	"completed_at" timestamp,
	"complexity" "feature_planner"."complexity",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"current_step" integer DEFAULT 0 NOT NULL,
	"discovered_files" jsonb,
	"estimated_duration" varchar(50),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"implementation_plan" text,
	"original_request" text NOT NULL,
	"parent_plan_id" uuid,
	"refined_request" text,
	"refinement_settings" jsonb,
	"risk_level" "feature_planner"."risk_level",
	"selected_discovery_session_id" uuid,
	"selected_files" jsonb,
	"selected_plan_generation_id" uuid,
	"selected_refinement_id" uuid,
	"session_id" varchar(255),
	"status" "feature_planner"."plan_status" DEFAULT 'draft' NOT NULL,
	"total_execution_time_ms" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "feature_plans_current_step_range" CHECK ("feature_planner"."feature_plans"."current_step" >= 0 AND "feature_planner"."feature_plans"."current_step" <= 3),
	CONSTRAINT "feature_plans_execution_time_non_negative" CHECK ("feature_planner"."feature_plans"."total_execution_time_ms" >= 0),
	CONSTRAINT "feature_plans_original_request_not_empty" CHECK (length(trim("feature_planner"."feature_plans"."original_request")) > 0),
	CONSTRAINT "feature_plans_version_positive" CHECK ("feature_planner"."feature_plans"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "feature_planner"."feature_refinements" (
	"agent_id" varchar(100) NOT NULL,
	"agent_model" varchar(50) DEFAULT 'sonnet' NOT NULL,
	"agent_name" varchar(100),
	"agent_role" varchar(100),
	"assumptions" jsonb,
	"character_count" integer,
	"completed_at" timestamp,
	"completion_tokens" integer,
	"confidence" "feature_planner"."confidence_level",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"error_message" text,
	"estimated_scope" "feature_planner"."estimated_scope",
	"execution_time_ms" integer,
	"expansion_ratio" integer,
	"focus" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"input_request" text NOT NULL,
	"is_valid_format" boolean DEFAULT false NOT NULL,
	"key_requirements" jsonb,
	"plan_id" uuid NOT NULL,
	"prompt_tokens" integer,
	"refined_request" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"risks" jsonb,
	"status" "feature_planner"."refinement_status" DEFAULT 'pending' NOT NULL,
	"technical_complexity" "feature_planner"."technical_complexity",
	"total_tokens" integer,
	"validation_errors" jsonb,
	"word_count" integer,
	CONSTRAINT "feature_refinements_character_count_non_negative" CHECK ("feature_planner"."feature_refinements"."character_count" IS NULL OR "feature_planner"."feature_refinements"."character_count" >= 0),
	CONSTRAINT "feature_refinements_execution_time_non_negative" CHECK ("feature_planner"."feature_refinements"."execution_time_ms" IS NULL OR "feature_planner"."feature_refinements"."execution_time_ms" >= 0),
	CONSTRAINT "feature_refinements_expansion_ratio_positive" CHECK ("feature_planner"."feature_refinements"."expansion_ratio" IS NULL OR "feature_planner"."feature_refinements"."expansion_ratio" > 0),
	CONSTRAINT "feature_refinements_retry_count_non_negative" CHECK ("feature_planner"."feature_refinements"."retry_count" >= 0),
	CONSTRAINT "feature_refinements_token_counts_non_negative" CHECK (("feature_planner"."feature_refinements"."prompt_tokens" IS NULL OR "feature_planner"."feature_refinements"."prompt_tokens" >= 0) AND ("feature_planner"."feature_refinements"."completion_tokens" IS NULL OR "feature_planner"."feature_refinements"."completion_tokens" >= 0)),
	CONSTRAINT "feature_refinements_word_count_non_negative" CHECK ("feature_planner"."feature_refinements"."word_count" IS NULL OR "feature_planner"."feature_refinements"."word_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "feature_planner"."file_discovery_sessions" (
	"agent_id" varchar(100) NOT NULL,
	"architecture_insights" text,
	"completed_at" timestamp,
	"completion_tokens" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"critical_priority_count" integer DEFAULT 0 NOT NULL,
	"discovered_files" jsonb,
	"error_message" text,
	"execution_time_ms" integer,
	"high_priority_count" integer DEFAULT 0 NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_selected" boolean DEFAULT false NOT NULL,
	"low_priority_count" integer DEFAULT 0 NOT NULL,
	"medium_priority_count" integer DEFAULT 0 NOT NULL,
	"plan_id" uuid NOT NULL,
	"prompt_tokens" integer,
	"refined_request" text NOT NULL,
	"status" "feature_planner"."file_discovery_status" DEFAULT 'pending' NOT NULL,
	"total_files_found" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer,
	CONSTRAINT "file_discovery_sessions_counts_non_negative" CHECK ("feature_planner"."file_discovery_sessions"."critical_priority_count" >= 0 AND "feature_planner"."file_discovery_sessions"."high_priority_count" >= 0 AND "feature_planner"."file_discovery_sessions"."medium_priority_count" >= 0 AND "feature_planner"."file_discovery_sessions"."low_priority_count" >= 0),
	CONSTRAINT "file_discovery_sessions_execution_time_non_negative" CHECK ("feature_planner"."file_discovery_sessions"."execution_time_ms" IS NULL OR "feature_planner"."file_discovery_sessions"."execution_time_ms" >= 0),
	CONSTRAINT "file_discovery_sessions_token_counts_non_negative" CHECK (("feature_planner"."file_discovery_sessions"."prompt_tokens" IS NULL OR "feature_planner"."file_discovery_sessions"."prompt_tokens" >= 0) AND ("feature_planner"."file_discovery_sessions"."completion_tokens" IS NULL OR "feature_planner"."file_discovery_sessions"."completion_tokens" >= 0)),
	CONSTRAINT "file_discovery_sessions_total_files_non_negative" CHECK ("feature_planner"."file_discovery_sessions"."total_files_found" >= 0)
);
--> statement-breakpoint
CREATE TABLE "feature_planner"."implementation_plan_generations" (
	"agent_id" varchar(100) NOT NULL,
	"completed_at" timestamp,
	"completion_tokens" integer,
	"complexity" "feature_planner"."complexity",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"discovered_files" jsonb,
	"error_message" text,
	"estimated_duration" varchar(50),
	"execution_time_ms" integer,
	"has_required_sections" boolean DEFAULT false NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"implementation_plan" text,
	"is_selected" boolean DEFAULT false NOT NULL,
	"is_valid_markdown" boolean DEFAULT false NOT NULL,
	"plan_id" uuid NOT NULL,
	"prerequisites_count" integer DEFAULT 0 NOT NULL,
	"prompt_tokens" integer,
	"quality_gates_count" integer DEFAULT 0 NOT NULL,
	"refined_request" text NOT NULL,
	"risk_level" "feature_planner"."risk_level",
	"status" "feature_planner"."implementation_plan_status" DEFAULT 'pending' NOT NULL,
	"total_steps" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer,
	"validation_errors" jsonb,
	CONSTRAINT "implementation_plan_generations_counts_non_negative" CHECK ("feature_planner"."implementation_plan_generations"."total_steps" >= 0 AND "feature_planner"."implementation_plan_generations"."prerequisites_count" >= 0 AND "feature_planner"."implementation_plan_generations"."quality_gates_count" >= 0),
	CONSTRAINT "implementation_plan_generations_execution_time_non_negative" CHECK ("feature_planner"."implementation_plan_generations"."execution_time_ms" IS NULL OR "feature_planner"."implementation_plan_generations"."execution_time_ms" >= 0),
	CONSTRAINT "implementation_plan_generations_token_counts_non_negative" CHECK (("feature_planner"."implementation_plan_generations"."prompt_tokens" IS NULL OR "feature_planner"."implementation_plan_generations"."prompt_tokens" >= 0) AND ("feature_planner"."implementation_plan_generations"."completion_tokens" IS NULL OR "feature_planner"."implementation_plan_generations"."completion_tokens" >= 0))
);
--> statement-breakpoint
CREATE TABLE "feature_planner"."plan_execution_logs" (
	"agent_level" integer DEFAULT 0 NOT NULL,
	"agent_model" varchar(50),
	"agent_response" text,
	"agent_type" varchar(100) NOT NULL,
	"cache_creation_tokens" integer,
	"cache_read_tokens" integer,
	"completion_tokens" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"duration_ms" integer,
	"end_time" timestamp,
	"error_message" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"input_prompt" text,
	"is_success" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"parent_log_id" uuid,
	"parent_tool_use_id" varchar(255),
	"plan_id" uuid NOT NULL,
	"prompt_tokens" integer,
	"retry_attempt" integer DEFAULT 0 NOT NULL,
	"session_id" varchar(255),
	"start_time" timestamp NOT NULL,
	"step" "feature_planner"."execution_step" NOT NULL,
	"step_number" integer NOT NULL,
	"total_tokens" integer,
	CONSTRAINT "plan_execution_logs_agent_level_non_negative" CHECK ("feature_planner"."plan_execution_logs"."agent_level" >= 0),
	CONSTRAINT "plan_execution_logs_duration_non_negative" CHECK ("feature_planner"."plan_execution_logs"."duration_ms" IS NULL OR "feature_planner"."plan_execution_logs"."duration_ms" >= 0),
	CONSTRAINT "plan_execution_logs_retry_attempt_non_negative" CHECK ("feature_planner"."plan_execution_logs"."retry_attempt" >= 0),
	CONSTRAINT "plan_execution_logs_step_number_range" CHECK ("feature_planner"."plan_execution_logs"."step_number" >= 1 AND "feature_planner"."plan_execution_logs"."step_number" <= 3),
	CONSTRAINT "plan_execution_logs_token_counts_non_negative" CHECK (("feature_planner"."plan_execution_logs"."prompt_tokens" IS NULL OR "feature_planner"."plan_execution_logs"."prompt_tokens" >= 0) AND ("feature_planner"."plan_execution_logs"."completion_tokens" IS NULL OR "feature_planner"."plan_execution_logs"."completion_tokens" >= 0))
);
--> statement-breakpoint
CREATE TABLE "feature_planner"."plan_step_templates" (
	"category" varchar(50) NOT NULL,
	"commands" jsonb,
	"confidence_level" varchar(20) DEFAULT 'high' NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" varchar(1000) NOT NULL,
	"estimated_duration" varchar(50),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"name" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"user_id" uuid NOT NULL,
	"validation_commands" jsonb,
	CONSTRAINT "plan_step_templates_usage_count_non_negative" CHECK ("feature_planner"."plan_step_templates"."usage_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "feature_planner"."plan_steps" (
	"category" varchar(50),
	"commands" jsonb,
	"confidence_level" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text NOT NULL,
	"display_order" integer NOT NULL,
	"estimated_duration" varchar(50),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_from_template" boolean DEFAULT false NOT NULL,
	"plan_generation_id" uuid NOT NULL,
	"step_number" integer NOT NULL,
	"template_id" uuid,
	"title" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"validation_commands" jsonb,
	CONSTRAINT "plan_steps_display_order_non_negative" CHECK ("feature_planner"."plan_steps"."display_order" >= 0),
	CONSTRAINT "plan_steps_step_number_positive" CHECK ("feature_planner"."plan_steps"."step_number" > 0)
);
--> statement-breakpoint
DROP TABLE "discovered_files" CASCADE;--> statement-breakpoint
DROP TABLE "feature_plans" CASCADE;--> statement-breakpoint
DROP TABLE "feature_refinements" CASCADE;--> statement-breakpoint
DROP TABLE "file_discovery_sessions" CASCADE;--> statement-breakpoint
DROP TABLE "implementation_plan_generations" CASCADE;--> statement-breakpoint
DROP TABLE "plan_execution_logs" CASCADE;--> statement-breakpoint
DROP TABLE "plan_step_templates" CASCADE;--> statement-breakpoint
DROP TABLE "plan_steps" CASCADE;--> statement-breakpoint
ALTER TABLE "feature_planner"."discovered_files" ADD CONSTRAINT "discovered_files_added_by_user_id_users_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_planner"."discovered_files" ADD CONSTRAINT "discovered_files_discovery_session_id_file_discovery_sessions_id_fk" FOREIGN KEY ("discovery_session_id") REFERENCES "feature_planner"."file_discovery_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_planner"."feature_plans" ADD CONSTRAINT "feature_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_planner"."feature_refinements" ADD CONSTRAINT "feature_refinements_plan_id_feature_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "feature_planner"."feature_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_planner"."file_discovery_sessions" ADD CONSTRAINT "file_discovery_sessions_plan_id_feature_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "feature_planner"."feature_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_planner"."implementation_plan_generations" ADD CONSTRAINT "implementation_plan_generations_plan_id_feature_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "feature_planner"."feature_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_planner"."plan_execution_logs" ADD CONSTRAINT "plan_execution_logs_plan_id_feature_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "feature_planner"."feature_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_planner"."plan_step_templates" ADD CONSTRAINT "plan_step_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_planner"."plan_steps" ADD CONSTRAINT "plan_steps_plan_generation_id_implementation_plan_generations_id_fk" FOREIGN KEY ("plan_generation_id") REFERENCES "feature_planner"."implementation_plan_generations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "discovered_files_discovery_session_id_idx" ON "feature_planner"."discovered_files" USING btree ("discovery_session_id");--> statement-breakpoint
CREATE INDEX "discovered_files_file_path_idx" ON "feature_planner"."discovered_files" USING btree ("file_path");--> statement-breakpoint
CREATE INDEX "discovered_files_is_manually_added_idx" ON "feature_planner"."discovered_files" USING btree ("is_manually_added");--> statement-breakpoint
CREATE INDEX "discovered_files_is_selected_idx" ON "feature_planner"."discovered_files" USING btree ("is_selected");--> statement-breakpoint
CREATE INDEX "discovered_files_priority_idx" ON "feature_planner"."discovered_files" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "discovered_files_session_priority_idx" ON "feature_planner"."discovered_files" USING btree ("discovery_session_id","priority");--> statement-breakpoint
CREATE INDEX "feature_plans_current_step_idx" ON "feature_planner"."feature_plans" USING btree ("current_step");--> statement-breakpoint
CREATE INDEX "feature_plans_status_idx" ON "feature_planner"."feature_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "feature_plans_user_id_idx" ON "feature_planner"."feature_plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feature_plans_parent_id_idx" ON "feature_planner"."feature_plans" USING btree ("parent_plan_id");--> statement-breakpoint
CREATE INDEX "feature_plans_parent_version_idx" ON "feature_planner"."feature_plans" USING btree ("parent_plan_id","version");--> statement-breakpoint
CREATE INDEX "feature_plans_user_created_idx" ON "feature_planner"."feature_plans" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "feature_plans_user_status_idx" ON "feature_planner"."feature_plans" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "feature_plans_user_created_desc_idx" ON "feature_planner"."feature_plans" USING btree ("user_id","created_at" DESC);--> statement-breakpoint
CREATE INDEX "feature_plans_original_request_search_idx" ON "feature_planner"."feature_plans" USING gin (to_tsvector('english', "original_request"));--> statement-breakpoint
CREATE INDEX "feature_plans_refined_request_search_idx" ON "feature_planner"."feature_plans" USING gin (to_tsvector('english', "refined_request"));--> statement-breakpoint
CREATE INDEX "feature_refinements_agent_id_idx" ON "feature_planner"."feature_refinements" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "feature_refinements_plan_id_idx" ON "feature_planner"."feature_refinements" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "feature_refinements_status_idx" ON "feature_planner"."feature_refinements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "feature_refinements_plan_status_idx" ON "feature_planner"."feature_refinements" USING btree ("plan_id","status");--> statement-breakpoint
CREATE INDEX "file_discovery_sessions_agent_id_idx" ON "feature_planner"."file_discovery_sessions" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "file_discovery_sessions_is_selected_idx" ON "feature_planner"."file_discovery_sessions" USING btree ("is_selected");--> statement-breakpoint
CREATE INDEX "file_discovery_sessions_plan_id_idx" ON "feature_planner"."file_discovery_sessions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "file_discovery_sessions_status_idx" ON "feature_planner"."file_discovery_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "implementation_plan_generations_agent_id_idx" ON "feature_planner"."implementation_plan_generations" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "implementation_plan_generations_is_selected_idx" ON "feature_planner"."implementation_plan_generations" USING btree ("is_selected");--> statement-breakpoint
CREATE INDEX "implementation_plan_generations_plan_id_idx" ON "feature_planner"."implementation_plan_generations" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "implementation_plan_generations_status_idx" ON "feature_planner"."implementation_plan_generations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "plan_execution_logs_agent_level_idx" ON "feature_planner"."plan_execution_logs" USING btree ("agent_level");--> statement-breakpoint
CREATE INDEX "plan_execution_logs_created_at_idx" ON "feature_planner"."plan_execution_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "plan_execution_logs_parent_log_id_idx" ON "feature_planner"."plan_execution_logs" USING btree ("parent_log_id");--> statement-breakpoint
CREATE INDEX "plan_execution_logs_plan_id_idx" ON "feature_planner"."plan_execution_logs" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "plan_execution_logs_session_id_idx" ON "feature_planner"."plan_execution_logs" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "plan_execution_logs_step_idx" ON "feature_planner"."plan_execution_logs" USING btree ("step");--> statement-breakpoint
CREATE INDEX "plan_execution_logs_plan_step_idx" ON "feature_planner"."plan_execution_logs" USING btree ("plan_id","step_number");--> statement-breakpoint
CREATE INDEX "plan_step_templates_category_idx" ON "feature_planner"."plan_step_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "plan_step_templates_is_public_idx" ON "feature_planner"."plan_step_templates" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "plan_step_templates_usage_count_idx" ON "feature_planner"."plan_step_templates" USING btree ("usage_count");--> statement-breakpoint
CREATE INDEX "plan_step_templates_user_id_idx" ON "feature_planner"."plan_step_templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "plan_steps_category_idx" ON "feature_planner"."plan_steps" USING btree ("category");--> statement-breakpoint
CREATE INDEX "plan_steps_display_order_idx" ON "feature_planner"."plan_steps" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "plan_steps_plan_generation_id_idx" ON "feature_planner"."plan_steps" USING btree ("plan_generation_id");--> statement-breakpoint
CREATE INDEX "plan_steps_template_id_idx" ON "feature_planner"."plan_steps" USING btree ("template_id");--> statement-breakpoint
DROP TYPE "public"."confidence_level";--> statement-breakpoint
DROP TYPE "public"."estimated_scope";--> statement-breakpoint
DROP TYPE "public"."execution_step";--> statement-breakpoint
DROP TYPE "public"."file_discovery_status";--> statement-breakpoint
DROP TYPE "public"."file_priority";--> statement-breakpoint
DROP TYPE "public"."implementation_plan_status";--> statement-breakpoint
DROP TYPE "public"."plan_status";--> statement-breakpoint
DROP TYPE "public"."refinement_status";--> statement-breakpoint
DROP TYPE "public"."risk_level";--> statement-breakpoint
DROP TYPE "public"."technical_complexity";