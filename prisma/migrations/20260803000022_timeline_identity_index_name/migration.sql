-- Align the physical index name with schema.prisma.
--
-- Migration 21 created the correct (userId, createdAt) index under Prisma's
-- default generated name. The schema deliberately uses the project's stable
-- snake-case map name, so migrate diff correctly reported a rename-only drift.
-- Guard both sides to keep this safe on databases where the final name already
-- exists.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relkind = 'i'
       AND c.relname = 'TimelineComment_userId_createdAt_idx'
  ) AND NOT EXISTS (
    SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relkind = 'i'
       AND c.relname = 'timeline_comment_user_created_idx'
  ) THEN
    ALTER INDEX "TimelineComment_userId_createdAt_idx"
      RENAME TO "timeline_comment_user_created_idx";
  END IF;
END $$;
