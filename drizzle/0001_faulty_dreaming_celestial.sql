-- SAFE ONLY ON EMPTY TABLE
-- These columns are NOT NULL with no DEFAULT.
-- PostgreSQL will reject this migration if the "messages" table already contains rows.
-- On a fresh database (new project from template) all three migrations run safely in sequence.
-- If you have existing rows in "messages", truncate the table before running this migration,
-- or add a DEFAULT '' temporarily and drop it after: see AGENTS.md § 7 for guidance.
ALTER TABLE "messages" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "email" text NOT NULL;
