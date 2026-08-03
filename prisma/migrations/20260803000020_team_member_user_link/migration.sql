-- Link TeamMember rows to real user accounts.
--
-- The About-page admin already accepted a `userId` when creating a member and
-- used it to copy name/job/avatar across, then discarded it. The result was a
-- table of loose text: no way to reach the person's profile, no post count, no
-- verification badge.
--
-- The homepage needs that link to satisfy "show only تیم تحریریه members" —
-- a card there has to resolve to an actual account, not a name string.
--
-- Nullable: not everyone listed on the About page has an account.
-- ON DELETE SET NULL rather than CASCADE, so removing a user leaves their
-- About-page entry in place instead of silently emptying a team section.

ALTER TABLE "TeamMember" ADD COLUMN IF NOT EXISTS "userId" TEXT;

CREATE INDEX IF NOT EXISTS "TeamMember_userId_idx" ON "TeamMember"("userId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TeamMember_userId_fkey') THEN
    ALTER TABLE "TeamMember"
      ADD CONSTRAINT "TeamMember_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Backfill by exact name match. Only unambiguous matches are linked: if two
-- accounts share a display name we cannot tell which was meant, so those stay
-- NULL for an admin to resolve by hand.
UPDATE "TeamMember" tm
SET "userId" = u.id
FROM "User" u
WHERE tm."userId" IS NULL
  AND tm.name = u.name
  AND (SELECT COUNT(*) FROM "User" u2 WHERE u2.name = tm.name) = 1;
