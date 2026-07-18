-- Add postId FK to Like so ownership is enforced by referential integrity, not
-- by fragile (module, slug) text matching. Backfilled from the existing
-- (module, slug) → Post mapping; old likes with no matching post stay NULL
-- (they simply don't appear in author-scoped notification queries).

ALTER TABLE "Like" ADD COLUMN "postId" TEXT;

ALTER TABLE "Like"
ADD CONSTRAINT "Like_postId_fkey"
FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: set postId for every like that still maps to an existing post.
UPDATE "Like" l
SET "postId" = p."id"
FROM "Post" p
WHERE l."module" = p."module" AND l."slug" = p."slug";

CREATE INDEX "like_post_idx" ON "Like"("postId");
