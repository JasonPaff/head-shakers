CREATE TYPE "public"."confidence_level" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."estimated_scope" AS ENUM('small', 'medium', 'large');--> statement-breakpoint
CREATE TYPE "public"."technical_complexity" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
ALTER TABLE "feature_refinements" ADD COLUMN "agent_name" varchar(100);--> statement-breakpoint
ALTER TABLE "feature_refinements" ADD COLUMN "agent_role" varchar(100);--> statement-breakpoint
ALTER TABLE "feature_refinements" ADD COLUMN "assumptions" jsonb;--> statement-breakpoint
ALTER TABLE "feature_refinements" ADD COLUMN "confidence" "confidence_level";--> statement-breakpoint
ALTER TABLE "feature_refinements" ADD COLUMN "estimated_scope" "estimated_scope";--> statement-breakpoint
ALTER TABLE "feature_refinements" ADD COLUMN "focus" text;--> statement-breakpoint
ALTER TABLE "feature_refinements" ADD COLUMN "key_requirements" jsonb;--> statement-breakpoint
ALTER TABLE "feature_refinements" ADD COLUMN "risks" jsonb;--> statement-breakpoint
ALTER TABLE "feature_refinements" ADD COLUMN "technical_complexity" "technical_complexity";