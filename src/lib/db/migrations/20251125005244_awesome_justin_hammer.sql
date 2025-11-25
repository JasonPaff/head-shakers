CREATE TABLE "newsletter_signups" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"email" varchar(255) NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" varchar(255),
	CONSTRAINT "newsletter_signups_email_not_empty" CHECK (length(trim("newsletter_signups"."email")) >= 5),
	CONSTRAINT "newsletter_signups_dates_logic" CHECK ("newsletter_signups"."created_at" <= "newsletter_signups"."updated_at"),
	CONSTRAINT "newsletter_signups_unsubscribed_after_subscribed" CHECK ("newsletter_signups"."unsubscribed_at" IS NULL OR "newsletter_signups"."unsubscribed_at" >= "newsletter_signups"."subscribed_at")
);
--> statement-breakpoint
CREATE INDEX "newsletter_signups_user_id_idx" ON "newsletter_signups" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "newsletter_signups_subscribed_at_idx" ON "newsletter_signups" USING btree ("subscribed_at");--> statement-breakpoint
CREATE INDEX "newsletter_signups_created_at_idx" ON "newsletter_signups" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_signups_email_unique" ON "newsletter_signups" USING btree ("email");