-- Attribute comment likes to authenticated users so notification copy can
-- truthfully say who liked a comment. Existing fingerprints were already the
-- authenticated user id; backfill only rows that still resolve to a User.
ALTER TABLE "CommentVote"
  ADD COLUMN "userId" TEXT,
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "CommentVote" AS vote
SET "userId" = usr."id"
FROM "User" AS usr
WHERE vote."fingerprint" = usr."id";

CREATE INDEX "comment_vote_user_created_idx" ON "CommentVote"("userId", "createdAt");
CREATE INDEX "comment_vote_created_idx" ON "CommentVote"("createdAt");

ALTER TABLE "CommentVote"
  ADD CONSTRAINT "CommentVote_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
