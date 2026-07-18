-- Add type + status to ContactSubmission so the same table can store
-- feedback and support tickets (filtered by type). Backfill existing rows as
-- 'contact' (the original use) with status 'new'.
ALTER TABLE "ContactSubmission" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'contact';
ALTER TABLE "ContactSubmission" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'new';

UPDATE "ContactSubmission" SET "type" = 'contact' WHERE "type" IS NULL OR "type" = '';
UPDATE "ContactSubmission" SET "status" = 'new' WHERE "status" IS NULL OR "status" = '';

CREATE INDEX "ContactSubmission_type_status_createdAt_idx" ON "ContactSubmission"("type", "status", "createdAt");
