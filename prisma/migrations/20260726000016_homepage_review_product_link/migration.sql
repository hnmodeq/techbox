-- Homepage upgrade — migrations B2 + B3
-- Docs: docs/homepage-upgrade/03-DATA-CONTRACTS.md §3

-- ─── B2: link a review Post to the shop Post it reviews ────────────────────
-- Nullable during backfill; promoted to NOT NULL once every review is linked.
ALTER TABLE "Post" ADD COLUMN "reviewedProductId" TEXT;

CREATE INDEX "post_reviewed_product_idx" ON "Post"("reviewedProductId");

ALTER TABLE "Post"
  ADD CONSTRAINT "Post_reviewedProductId_fkey"
  FOREIGN KEY ("reviewedProductId") REFERENCES "Post"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── B3: User.createdAt (needed by homepage §10 "عضو از ۱۳۹۸") ─────────────
ALTER TABLE "User" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "user_created_idx" ON "User"("createdAt");

-- Backfill: approximate each user's join date from their earliest published post
-- so existing members don't all read as "joined today".
UPDATE "User" u
SET "createdAt" = sub.first_post
FROM (
  SELECT "authorId" AS uid, MIN("date") AS first_post
  FROM "Post"
  WHERE "authorId" IS NOT NULL
  GROUP BY "authorId"
) AS sub
WHERE u.id = sub.uid
  AND sub.first_post < u."createdAt";
