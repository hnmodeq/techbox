-- P3-5: native Json columns instead of stringified JSON
-- Convert the existing text/"[]" (or "{}") values into jsonb; keep a jsonb default.

ALTER TABLE "User" ALTER COLUMN "modules" TYPE jsonb USING COALESCE("modules", '[]')::jsonb, ALTER COLUMN "modules" SET DEFAULT '[]'::jsonb;
ALTER TABLE "Post" ALTER COLUMN "gallery" TYPE jsonb USING COALESCE("gallery", '[]')::jsonb, ALTER COLUMN "gallery" SET DEFAULT '[]'::jsonb;
ALTER TABLE "Post" ALTER COLUMN "tags" TYPE jsonb USING COALESCE("tags", '[]')::jsonb, ALTER COLUMN "tags" SET DEFAULT '[]'::jsonb;
ALTER TABLE "Post" ALTER COLUMN "specs" TYPE jsonb USING COALESCE("specs", '{}')::jsonb, ALTER COLUMN "specs" SET DEFAULT '{}'::jsonb;
ALTER TABLE "TimelineEvent" ALTER COLUMN "tags" TYPE jsonb USING COALESCE("tags", '[]')::jsonb, ALTER COLUMN "tags" SET DEFAULT '[]'::jsonb;
