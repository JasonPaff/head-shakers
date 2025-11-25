CREATE TABLE "newsletter_sends" (
	"body_html" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"error_details" text,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_count" integer NOT NULL,
	"sent_at" timestamp NOT NULL,
	"sent_by" varchar(255) NOT NULL,
	"status" varchar(20) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"success_count" integer DEFAULT 0 NOT NULL,
	"template_id" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_sends_subject_not_empty" CHECK (length(trim("newsletter_sends"."subject")) > 0),
	CONSTRAINT "newsletter_sends_body_html_not_empty" CHECK (length(trim("newsletter_sends"."body_html")) > 0),
	CONSTRAINT "newsletter_sends_status_valid" CHECK ("newsletter_sends"."status" IN ('pending', 'sending', 'completed', 'failed')),
	CONSTRAINT "newsletter_sends_recipient_count_non_negative" CHECK ("newsletter_sends"."recipient_count" >= 0),
	CONSTRAINT "newsletter_sends_success_count_non_negative" CHECK ("newsletter_sends"."success_count" >= 0),
	CONSTRAINT "newsletter_sends_failure_count_non_negative" CHECK ("newsletter_sends"."failure_count" >= 0),
	CONSTRAINT "newsletter_sends_counts_sum_valid" CHECK ("newsletter_sends"."success_count" + "newsletter_sends"."failure_count" <= "newsletter_sends"."recipient_count"),
	CONSTRAINT "newsletter_sends_dates_logic" CHECK ("newsletter_sends"."created_at" <= "newsletter_sends"."updated_at"),
	CONSTRAINT "newsletter_sends_sent_after_created" CHECK ("newsletter_sends"."sent_at" >= "newsletter_sends"."created_at")
);
--> statement-breakpoint
CREATE TABLE "newsletter_templates" (
	"body_html" text NOT NULL,
	"body_markdown" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_templates_title_not_empty" CHECK (length(trim("newsletter_templates"."title")) > 0),
	CONSTRAINT "newsletter_templates_subject_not_empty" CHECK (length(trim("newsletter_templates"."subject")) > 0),
	CONSTRAINT "newsletter_templates_dates_logic" CHECK ("newsletter_templates"."created_at" <= "newsletter_templates"."updated_at")
);
--> statement-breakpoint
ALTER TABLE "newsletter_sends" ADD CONSTRAINT "newsletter_sends_template_id_newsletter_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."newsletter_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "newsletter_sends_sent_at_idx" ON "newsletter_sends" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "newsletter_sends_sent_by_idx" ON "newsletter_sends" USING btree ("sent_by");--> statement-breakpoint
CREATE INDEX "newsletter_sends_status_idx" ON "newsletter_sends" USING btree ("status");--> statement-breakpoint
CREATE INDEX "newsletter_sends_template_id_idx" ON "newsletter_sends" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "newsletter_sends_status_sent_at_idx" ON "newsletter_sends" USING btree ("status","sent_at");--> statement-breakpoint
CREATE INDEX "newsletter_sends_sent_by_sent_at_idx" ON "newsletter_sends" USING btree ("sent_by","sent_at");--> statement-breakpoint
CREATE INDEX "newsletter_templates_created_at_idx" ON "newsletter_templates" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "newsletter_templates_created_by_idx" ON "newsletter_templates" USING btree ("created_by");