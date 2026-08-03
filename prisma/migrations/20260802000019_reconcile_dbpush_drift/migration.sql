-- Reconcile the schema drift left behind by `prisma db push`.
--
-- WHY THIS EXISTS
-- ---------------
-- 20260724000012b recreated the ten tables that only ever existed via
-- `db push`. This migration closes the rest of the same gap: columns,
-- nullability, defaults, indexes and one foreign key that were also pushed
-- straight to production and never written down.
--
-- Without it, `prisma migrate deploy` on an empty database produces a schema
-- that Prisma Client rejects at runtime — the E2E seed failed with
-- P2022 "The column `sourceCurrency` does not exist in the current database"
-- even though every migration had reported success. Shop pricing
-- (priceAmount, discountPercent, sourceCurrency, sellerBenefitPercent),
-- article series, user moderation fields and comment edit tracking were all
-- in this category: live in production, absent from source.
--
-- WHAT IS DELIBERATELY NOT HERE
-- -----------------------------
-- `migrate diff` also wants to DROP these five indexes:
--
--     post_title_trgm, post_excerpt_trgm, post_content_trgm,
--     post_category_trgm, post_authorname_trgm
--
-- They are pg_trgm GIN indexes created on purpose by
-- 20260711000001_p3_search_indexes to make the ILIKE search queries fast.
-- Prisma cannot model a GIN/trgm index, so it sees them as foreign objects
-- and proposes removal on every diff. Dropping them would silently turn
-- site search into a sequential scan. They stay.
--
-- The drift workflow therefore compares against a baseline that tolerates
-- exactly those five indexes; anything else that appears is a real
-- regression and fails the build.
--
-- IDEMPOTENCE
-- -----------
-- Production already has all of this. Every statement is guarded so the file
-- is a no-op there and only does work on a database rebuilt from scratch.

-- DropForeignKey
ALTER TABLE "VerificationRequest" DROP CONSTRAINT IF EXISTS "VerificationRequest_userId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "VerificationRequest_status_idx";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "editedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "benefits" TEXT,
ADD COLUMN IF NOT EXISTS "faq" JSONB,
ADD COLUMN IF NOT EXISTS "positionDescription" TEXT,
ADD COLUMN IF NOT EXISTS "requirements" JSONB,
ADD COLUMN IF NOT EXISTS "salaryMax" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "salaryMin" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "discountEndsAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "discountPercent" INTEGER,
ADD COLUMN IF NOT EXISTS "priceAdjustmentPercent" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "priceAmount" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "sellerBenefitPercent" DOUBLE PRECISION DEFAULT 35,
ADD COLUMN IF NOT EXISTS "series" TEXT,
ADD COLUMN IF NOT EXISTS "seriesOrder" INTEGER,
ADD COLUMN IF NOT EXISTS "sourceCurrency" TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS "sourcePriceAmount" DOUBLE PRECISION,
ALTER COLUMN "gallery" DROP NOT NULL,
ALTER COLUMN "gallery" DROP DEFAULT,
ALTER COLUMN "tags" DROP NOT NULL,
ALTER COLUMN "tags" DROP DEFAULT,
ALTER COLUMN "specs" DROP NOT NULL,
ALTER COLUMN "specs" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TimelineEvent" ALTER COLUMN "tags" DROP NOT NULL,
ALTER COLUMN "tags" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "banReason" TEXT,
ADD COLUMN IF NOT EXISTS "bannedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "bio" TEXT,
ADD COLUMN IF NOT EXISTS "mutedUntil" TIMESTAMP(3),
ALTER COLUMN "modules" DROP NOT NULL,
ALTER COLUMN "modules" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UserNotificationState" ALTER COLUMN "lastReadAt" SET DEFAULT '1970-01-01 00:00:00'::timestamp;

-- AlterTable
ALTER TABLE "VerificationRequest" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VerificationRequest_status_createdAt_idx" ON "VerificationRequest"("status", "createdAt");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VerificationRequest_userId_fkey') THEN
    ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- RenameIndex
ALTER INDEX "fingerprint_commentId_key" RENAME TO "CommentVote_fingerprint_commentId_key";

-- RenameIndex
ALTER INDEX "fingerprint_module_slug_key" RENAME TO "Like_fingerprint_module_slug_key";

-- RenameIndex
ALTER INDEX "source_module_slug_key" RENAME TO "SlugRedirect_sourceModule_sourceSlug_key";

-- RenameIndex
ALTER INDEX "timeline_fingerprint_commentId_key" RENAME TO "TimelineCommentVote_fingerprint_commentId_key";

-- RenameIndex
ALTER INDEX "timeline_fingerprint_eventId_key" RENAME TO "TimelineLike_fingerprint_eventId_key";
