-- Give timeline engagement the same authenticated-user identity guarantees as
-- ordinary Post comments/likes.
--
-- TimelineComment previously copied only authorName, so a comment could not be
-- tied back to the account that created it. TimelineLike already carried a
-- userId value but had no foreign key. Both links remain nullable so deleting
-- an account preserves aggregate history while removing the account binding.

ALTER TABLE "TimelineComment" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- Existing authenticated likes stored the user id in `fingerprint`. Backfill
-- that relationship when the referenced account still exists.
UPDATE "TimelineLike" tl
SET "userId" = u.id
FROM "User" u
WHERE tl."userId" IS NULL
  AND tl.fingerprint = u.id;

-- Defensive repair before introducing the FK: old imports may contain a
-- copied userId that no longer exists.
UPDATE "TimelineLike" tl
SET "userId" = NULL
WHERE tl."userId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = tl."userId");

-- Backfill historical timeline comments only where a display name maps to one
-- and only one account. Ambiguous names intentionally remain unlinked.
UPDATE "TimelineComment" tc
SET "userId" = u.id
FROM "User" u
WHERE tc."userId" IS NULL
  AND tc."authorName" = u.name
  AND (SELECT COUNT(*) FROM "User" u2 WHERE u2.name = tc."authorName") = 1;

CREATE INDEX IF NOT EXISTS "TimelineComment_userId_createdAt_idx"
  ON "TimelineComment"("userId", "createdAt");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TimelineComment_userId_fkey') THEN
    ALTER TABLE "TimelineComment"
      ADD CONSTRAINT "TimelineComment_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TimelineLike_userId_fkey') THEN
    ALTER TABLE "TimelineLike"
      ADD CONSTRAINT "TimelineLike_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
