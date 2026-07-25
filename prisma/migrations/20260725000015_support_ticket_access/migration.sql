-- High-entropy guest capability for support-ticket reads and replies.
ALTER TABLE "ContactSubmission" ADD COLUMN IF NOT EXISTS "accessTokenHash" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "ContactSubmission_accessTokenHash_key"
  ON "ContactSubmission"("accessTokenHash");
